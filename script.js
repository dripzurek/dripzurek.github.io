// URL del repositorio en GitHub
const repoUrl = 'https://api.github.com/repos/DirectoryLister/DirectoryLister/contents/';

// Elemento del botón de navegación
const navButtons = document.getElementById('nav-buttons');

// Elemento de la lista de archivos
const fileList = document.getElementById('file-list');

// Pila de historial para gestionar la navegación
const historyStack = [];

// Manejar el evento 'popstate' (cambio en el historial)
window.addEventListener('popstate', handlePopState);

// Función asincrónica para obtener el contenido del repositorio
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

// Mostrar el contenido en la interfaz
function showContents(contents, path) {
    clearFileList();
    
    contents.forEach(item => {
        if (isExcludedFile(item.name)) return;

        const listItem = createListItem(item);
        fileList.appendChild(listItem);
    });

    updateNavButtonsVisibility(path);
}

// Crear un elemento de lista para un archivo o carpeta
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

// Configurar un enlace para un archivo
function setupFileLink(link, item) {
    link.href = item.download_url;
    link.setAttribute('download', item.name);
}

// Configurar un enlace para una carpeta
function setupFolderLink(link, item) {
    link.classList.add('folder-icon');
    link.href = '#';
    link.addEventListener('click', (event) => {
        event.preventDefault();
        handleFolderClick(item.path);
    });
}

// Manejar el clic en una carpeta
function handleFolderClick(path) {
    historyStack.push(history.state ? history.state.path : '');
    updateUrl(path);
    getRepoContents(path);
}

// Verificar si un archivo debe excluirse de la lista
function isExcludedFile(fileName) {
    return ['index.html', 'styles.css', 'script.js'].includes(fileName);
}

// Actualizar la visibilidad de los botones de navegación
function updateNavButtonsVisibility(path) {
    navButtons.style.display = path === '' ? 'none' : 'flex';
}

// Limpiar la lista de archivos
function clearFileList() {
    fileList.innerHTML = '';
}

// Manejar cambios en el historial de navegación
function handlePopState(event) {
    const path = event.state ? event.state.path : '';
    getRepoContents(path);
}

// Actualizar la URL y el historial de navegación
function updateUrl(path) {
    const newPath = path ? `?path=${path}` : window.location.pathname;
    history.pushState({ path: path }, null, newPath);
}

// Cargar contenido inicial
getRepoContents('');
