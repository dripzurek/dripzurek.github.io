// URL del repositorio en GitHub
const repoUrl = 'https://api.github.com/repos/DirectoryLister/DirectoryLister/contents/';

// Elementos del DOM
const navButtons = document.getElementById('nav-buttons');
const fileList = document.getElementById('file-list');

// Pila de historial para navegación
const historyStack = [];

// Evento que se dispara al retroceder/avanzar en la historia del navegador
window.addEventListener('popstate', handlePopState);

// Función principal para obtener el contenido del repositorio
async function getRepoContents(path) {
    try {
        // Obtener datos del servidor y manejar errores
        const response = await fetch(`${repoUrl}${path}`);
        response.ok || throw new Error(`Error: ${response.statusText}`);
        
        // Mostrar el contenido en el DOM
        const data = await response.json();
        showContents(data, path);
    } catch (error) {
        // Manejar errores al obtener la lista de archivos
        console.error('Error al obtener la lista de archivos:', error.message);
    }
}

// Mostrar el contenido en el DOM
function showContents(contents, path) {
    // Limpiar la lista de archivos en el DOM
    clearFileList();
    
    // Iterar sobre los elementos y agregarlos al DOM
    contents.forEach(item => {
        if (isExcludedFile(item.name)) return;

        const listItem = createListItem(item);
        fileList.appendChild(listItem);
    });

    // Actualizar la visibilidad de los botones de navegación
    updateNavButtonsVisibility(path);
}

// Crear un elemento de lista para un archivo o carpeta
function createListItem(item) {
    const listItem = document.createElement('li');
    const link = document.createElement('a');

    // Configurar el enlace según el tipo de elemento (archivo o carpeta)
    if (item.type === 'file') {
        setupFileLink(link, item);
    } else if (item.type === 'dir') {
        setupFolderLink(link, item);
    }

    // Establecer el texto del enlace
    link.textContent = item.name;
    listItem.appendChild(link);
    return listItem;
}

// Configurar el enlace para archivos
function setupFileLink(link, item) {
    link.href = item.download_url;
    link.setAttribute('download', item.name);
}

// Configurar el enlace para carpetas
function setupFolderLink(link, item) {
    link.classList.add('folder-icon');
    // Enlace interno para manejar clics en carpetas
    link.href = '#';
    link.dataset.path = item.path; // Almacenar la ruta en el atributo de datos
}

// Delegar eventos de clic en carpetas al contenedor de la lista
fileList.addEventListener('click', (event) => {
    if (event.target.tagName === 'A' && event.target.classList.contains('folder-icon')) {
        event.preventDefault();
        handleFolderClick(event.target.dataset.path);
    }
});

// Manejar clics en carpetas
function handleFolderClick(path) {
    // Agregar la ruta actual al historial y actualizar la URL
    historyStack.push(history.state ? history.state.path : '');
    updateUrl(path);
    // Obtener y mostrar el contenido de la carpeta
    getRepoContents(path);
}

// Verificar si un archivo está excluido de la lista
function isExcludedFile(fileName) {
    return ['index.html', 'styles.css', 'script.js'].includes(fileName);
}

// Actualizar la visibilidad de los botones de navegación
function updateNavButtonsVisibility(path) {
    navButtons.style.display = path === '' ? 'none' : 'flex';
}

// Limpiar la lista de archivos en el DOM
function clearFileList() {
    fileList.innerHTML = '';
}

// Manejar cambios en la historia del navegador (retroceder/avanzar)
function handlePopState(event) {
    const path = event.state ? event.state.path : '';
    // Obtener y mostrar el contenido de la carpeta
    getRepoContents(path);
}

// Actualizar la URL y el historial del navegador
function updateUrl(path) {
    // Construir la nueva URL y agregarla al historial del navegador
    const newPath = path ? `?path=${path}` : window.location.pathname;
    history.pushState({ path: path }, null, newPath);
}

// Cargar el contenido inicial del repositorio
getRepoContents('');
