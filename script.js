// Elementos del DOM
const navButtons = document.getElementById('nav-buttons');
const fileList = document.getElementById('file-list');

// Historial de navegación
const historyStack = [];

// Manejador de eventos para el botón "Atrás" del navegador
window.addEventListener('popstate', handlePopState);

// Función para obtener el contenido del repositorio
async function getRepoContents(path) {
    try {
        // Realiza una solicitud a la API de GitHub para obtener el contenido del repositorio
        const response = await fetch(`https://api.github.com/repos/DirectoryLister/DirectoryLister/contents/${path}`);
        const data = await response.json();

        // Muestra el contenido obtenido
        showContents(data, path);
    } catch (error) {
        // Maneja errores en la obtención de la lista de archivos
        console.error('Error al obtener la lista de archivos:', error);
        // Puedes agregar lógica adicional de manejo de errores aquí
    }
}

// Manejador de eventos para el cambio en el historial de navegación
function handlePopState(event) {
    // Obtiene la ruta del estado actual o establece una cadena vacía si no hay estado
    const { path = '' } = event.state || {};

    // Obtiene el contenido del repositorio para la ruta actual
    getRepoContents(path);
}

// Función para mostrar el contenido del repositorio en la interfaz de usuario
function showContents(contents, path) {
    // Limpia la lista de archivos antes de mostrar nuevos elementos
    fileList.innerHTML = '';

    // Archivos que se excluirán de la visualización
    const excludedFiles = ['index.html', 'styles.css', 'script.js'];

    // Itera sobre cada elemento del contenido del repositorio
    contents.forEach(item => {
        // Omite archivos excluidos
        if (!excludedFiles.includes(item.name)) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            // Configura los atributos del enlace según el tipo de elemento (archivo o directorio)
            if (item.type === 'file') {
                setFileLinkAttributes(link, item);
            } else if (item.type === 'dir') {
                setDirectoryLinkAttributes(link, item, path);
            }

            // Establece el texto del enlace como el nombre del elemento
            link.textContent = item.name;

            // Agrega el enlace al elemento de la lista
            listItem.appendChild(link);

            // Agrega el elemento de la lista a la lista de archivos
            fileList.appendChild(listItem);
        }
    });

    // Muestra u oculta los botones de navegación según si la ruta es una cadena vacía
    navButtons.style.display = path === '' ? 'none' : 'flex';
}

// Función para configurar los atributos del enlace de un archivo
function setFileLinkAttributes(link, { download_url, name }) {
    link.href = download_url;
    link.setAttribute('download', name);
}

// Función para configurar los atributos del enlace de un directorio
function setDirectoryLinkAttributes(link, item, path) {
    // Agrega una clase para indicar que el enlace representa un directorio
    link.classList.add('folder-icon');
    // Establece la URL del enlace como un marcador de posición (puede ser personalizado según la lógica de tu aplicación)
    link.href = '#';
    // Agrega un evento click para manejar la navegación al hacer clic en un directorio
    link.addEventListener('click', (event) => {
        event.preventDefault();
        // Almacena la ruta actual en el historial antes de navegar al nuevo directorio
        historyStack.push(path);
        // Actualiza la URL y obtiene el contenido del nuevo directorio
        updateUrl(item.path);
        getRepoContents(item.path);
    });
}

// Función para retroceder a la ruta anterior en el historial de navegación
function goToHome() {
    // Obtiene la ruta anterior del historial, si existe
    const previousPath = historyStack.pop() || '';
    // Actualiza la URL y obtiene el contenido del directorio anterior
    updateUrl(previousPath);
    getRepoContents(previousPath);
}

// Función para actualizar la URL del navegador
function updateUrl(path) {
    // Construye la nueva URL con la ruta proporcionada
    const newPath = path ? `?path=${path}` : window.location.pathname;
    // Actualiza el historial de navegación y la URL en el navegador
    history.pushState({ path }, null, newPath);
}

// Carga el contenido inicial del repositorio al cargar la página
getRepoContents('');
