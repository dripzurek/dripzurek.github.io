const navButtons = document.getElementById('nav-buttons');
const fileList = document.getElementById('file-list');
const historyStack = [];

window.addEventListener('popstate', handlePopState);

async function getRepoContents(path) {
    try {
        const response = await fetch(`https://api.github.com/repos/DirectoryLister/DirectoryLister/contents/${path}`);
        const data = await response.json();
        showContents(data, path);
    } catch (error) {
        console.error('Error al obtener la lista de archivos:', error);
        // Puedes manejar el error de manera más específica aquí
    }
}

function handlePopState(event) {
    const { path = '' } = event.state || {};
    getRepoContents(path);
}

function showContents(contents, path) {
    fileList.innerHTML = '';
    const excludedFiles = ['index.html', 'styles.css', 'script.js'];

    contents.forEach(item => {
        if (!excludedFiles.includes(item.name)) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            if (item.type === 'file') {
                setFileLinkAttributes(link, item);
            } else if (item.type === 'dir') {
                setDirectoryLinkAttributes(link, item, path);
            }

            link.textContent = item.name;
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        }
    });

    navButtons.style.display = path === '' ? 'none' : 'flex';
}

function setFileLinkAttributes(link, { download_url, name }) {
    link.href = download_url;
    link.setAttribute('download', name);
}

function setDirectoryLinkAttributes(link, item, path) {
    link.classList.add('folder-icon');
    link.href = '#';
    link.addEventListener('click', (event) => {
        event.preventDefault();
        historyStack.push(path);
        updateUrl(item.path);
        getRepoContents(item.path);
    });
}

function goToHome() {
    const previousPath = historyStack.pop() || '';
    updateUrl(previousPath);
    getRepoContents(previousPath);
}

function updateUrl(path) {
    const newPath = path ? `?path=${path}` : window.location.pathname;
    history.pushState({ path }, null, newPath);
}

// Cargar contenido inicial
getRepoContents('');
