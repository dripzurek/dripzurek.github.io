// Elementos del DOM
const navButtons = document.getElementById('nav-buttons');
const fileList = document.getElementById('file-list');
const historyStack = [];

// Evento para manejar el cambio de historial del navegador
window.addEventListener('popstate', handlePopState);

// Función principal para obtener y mostrar el contenido del repositorio
async function getRepoContents(path) {
    try {
        // Obtener datos del repositorio mediante la API de GitHub
        const response = await fetch(`https://api.github.com/repos/DirectoryLister/DirectoryLister/contents/${path}`);
        const data = await response.json();
        // Mostrar los contenidos obtenidos
        showContents(data, path);
    } catch (error) {
        console.error('Error al obtener la lista de archivos:', error);
    }
}

// Función para mostrar los contenidos en la interfaz
function showContents(contents, path) {
    // Limpiar la lista de archivos en la interfaz
    fileList.innerHTML = '';
    // Archivos que se excluirán de la lista
    const excludedFiles = ['index.html', 'styles.css', 'script.js'];

    // Iterar sobre los elementos del repositorio
    contents.forEach(item => {
        // Si el archivo no está excluido, crear un elemento de lista y un enlace
        if (!excludedFiles.includes(item.name)) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            // Configurar el enlace según el tipo de archivo
            if (item.type === 'file') {
                setupFileLink(link, item);
            } else if (item.type === 'dir') {
                setupFolderLink(link, item, path);
            }

            // Establecer el texto del enlace y añadirlo a la lista
            link.textContent = item.name;
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        }
    });

    // Actualizar la visualización de los botones de navegación
    updateNavButtonsDisplay(path);
}

// Configurar el enlace para archivos
function setupFileLink(link, item) {
    link.href = item.download_url;
    link.setAttribute('download', item.name);
}

// Configurar el enlace para carpetas
function setupFolderLink(link, item, path) {
    link.classList.add('folder-icon');
    link.href = '#';
    link.addEventListener('click', (event) => {
        // Evitar la acción predeterminada, agregar al historial y obtener el contenido de la carpeta
        event.preventDefault();
        historyStack.push(path);
        updateUrl(item.path);
        getRepoContents(item.path);
    });
}

// Manejar el evento de cambio en el historial del navegador
function handlePopState(event) {
    const path = event.state ? event.state.path : '';
    // Obtener y mostrar el contenido correspondiente al estado del historial
    getRepoContents(path);
}

// Ir a la ubicación principal (home) según el historial
function goToHome() {
    // Obtener la ubicación anterior del historial o establecerla como vacía
    const previousPath = historyStack.pop() || '';
    // Actualizar la URL y obtener el contenido correspondiente
    updateUrl(previousPath);
    getRepoContents(previousPath);
}

// Actualizar la URL del navegador
function updateUrl(path) {
    history.pushState({ path: path }, null, path ? `?path=${path}` : window.location.pathname);
}

// Actualizar la visualización de los botones de navegación
function updateNavButtonsDisplay(path) {
    navButtons.style.display = path === '' ? 'none' : 'flex';
}

// Cargar el contenido inicial del repositorio
getRepoContents('');
