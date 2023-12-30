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
    }
}

function showContents(contents, path) {
    fileList.innerHTML = '';
    const excludedFiles = ['index.html', 'styles.css', 'script.js'];

    contents.forEach(item => {
        if (!excludedFiles.includes(item.name)) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            if (item.type === 'file') {
                setupFileLink(link, item);
            } else if (item.type === 'dir') {
                setupFolderLink(link, item, path);
            }

            link.textContent = item.name;
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        }
    });

    updateNavButtonsDisplay(path);
}

function setupFileLink(link, item) {
    link.href = item.download_url;
    link.setAttribute('download', item.name);
}

function setupFolderLink(link, item, path) {
    link.classList.add('folder-icon');
    link.href = '#';
    link.addEventListener('click', (event) => {
        event.preventDefault();
        historyStack.push(path);
        updateUrl(item.path);
        getRepoContents(item.path);
    });
}

function handlePopState(event) {
    const path = event.state ? event.state.path : '';
    getRepoContents(path);
}

function goToHome() {
    const previousPath = historyStack.pop() || '';
    updateUrl(previousPath);
    getRepoContents(previousPath);
}

function updateUrl(path) {
    history.pushState({ path: path }, null, path ? `?path=${path}` : window.location.pathname);
}

function updateNavButtonsDisplay(path) {
    navButtons.style.display = path === '' ? 'none' : 'flex';
}

// Load initial contents
getRepoContents('');
