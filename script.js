const navButtons = document.getElementById('nav-buttons');
const fileList = document.getElementById('file-list');
const historyStack = [];

window.addEventListener('popstate', handlePopstate);

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

    contents
        .filter(item => item.name !== 'index.html')
        .forEach(item => fileList.appendChild(createListItem(item)));
    
    navButtons.style.display = path === '' ? 'none' : 'flex';
}

function createListItem(item) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');

    setLinkProperties(link, item.type === 'file' ? item.download_url : '#', item.type === 'file' ? 'download' : 'click', (event) => handleLinkClick(event, item));

    link.textContent = item.name;
    listItem.appendChild(link);
    return listItem;
}

function setLinkProperties(link, href, attribute, callback) {
    link.href = href;
    link.addEventListener(attribute, callback);
    if (attribute === 'click') {
        link.classList.add('folder-icon');
    }
}

function handleLinkClick(event, item) {
    event.preventDefault();
    const path = item.path;
    historyStack.push(path);
    updateUrl(path);
    getRepoContents(path);
}

function goToHome() {
    const previousPath = historyStack.pop() || '';
    updateUrl(previousPath);
    getRepoContents(previousPath);
}

function updateUrl(path) {
    const newPath = path ? `?path=${path}` : window.location.pathname;
    history.pushState({ path: path }, null, newPath);
}

function handlePopstate(event) {
    const path = (event.state && event.state.path) || '';
    getRepoContents(path);
}

// Load initial contents
getRepoContents('');
