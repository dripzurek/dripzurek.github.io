const repoUrl = 'https://api.github.com/repos/DirectoryLister/DirectoryLister/contents/';
const navButtons = document.getElementById('nav-buttons');
const fileList = document.getElementById('file-list');
const historyStack = [];

window.addEventListener('popstate', handlePopState);

async function getRepoContents(path) {
    try {
        const response = await fetch(`${repoUrl}${path}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        
        const data = await response.json();
        showContents(data, path);
    } catch (error) {
        console.error('Error al obtener la lista de archivos:', error.message);
    }
}

function showContents(contents, path) {
    clearFileList();
    
    contents.forEach(item => {
        if (isExcludedFile(item.name)) return;

        const listItem = createListItem(item);
        fileList.appendChild(listItem);
    });

    updateNavButtonsVisibility(path);
}

function createListItem(item) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');

    if (item.type === 'file') {
        setupFileLink(link, item);
    } else if (item.type === 'dir') {
        setupFolderLink(link, item);
    }

    link.textContent = item.name;
    listItem.appendChild(link);
    return listItem;
}

function setupFileLink(link, item) {
    link.href = item.download_url;
    link.setAttribute('download', item.name);
}

function setupFolderLink(link, item) {
    link.classList.add('folder-icon');
    link.href = '#';
    link.addEventListener('click', (event) => {
        event.preventDefault();
        handleFolderClick(item.path);
    });
}

function handleFolderClick(path) {
    historyStack.push(history.state ? history.state.path : '');
    updateUrl(path);
    getRepoContents(path);
}

function isExcludedFile(fileName) {
    return ['index.html', 'styles.css', 'script.js'].includes(fileName);
}

function updateNavButtonsVisibility(path) {
    navButtons.style.display = path === '' ? 'none' : 'flex';
}

function clearFileList() {
    fileList.innerHTML = '';
}

function handlePopState(event) {
    const path = event.state ? event.state.path : '';
    getRepoContents(path);
}

function updateUrl(path) {
    const newPath = path ? `?path=${path}` : window.location.pathname;
    history.pushState({ path: path }, null, newPath);
}

// Cargar contenido inicial
getRepoContents('');
