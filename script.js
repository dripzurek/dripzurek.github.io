const navButtons = document.getElementById('nav-buttons');
const fileList = document.getElementById('file-list');
const historyStack = [];

window.addEventListener('popstate', (event) => {
    const path = event.state ? event.state.path : '';
    getRepoContents(path);
});

async function getRepoContents(path) {
    try {
        const response = await fetch(`https://api.github.com/repos/dripzurek/dripzurek.github.io/contents/${path}`);
        const data = await response.json();
        console.log('Respuesta de la API:', data);
        showContents(data, path);
    } catch (error) {
        console.error('Error al obtener la lista de archivos:', error);
    }
}

function showContents(contents, path) {
    fileList.innerHTML = '';

    contents.forEach(item => {
        // Convertir el nombre del archivo a minúsculas para evitar problemas de mayúsculas/minúsculas
        const itemNameLowerCase = item.name.toLowerCase();

        // Omitir archivos específicos
        if (itemNameLowerCase === 'index.html' || itemNameLowerCase === 'script.js' || itemNameLowerCase === 'styles.css') {
            const listItem = document.createElement('li');
            const link = document.createElement('a');

            if (item.type === 'file') {
                link.href = item.download_url;
                link.setAttribute('download', item.name);
            } else if (item.type === 'dir') {
                link.classList.add('folder-icon');
                link.href = '#';
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    historyStack.push(path);
                    updateUrl(item.path);
                    getRepoContents(item.path);
                });
            }

            link.textContent = item.name;
            listItem.appendChild(link);
            fileList.appendChild(listItem);
        }
    });

    // Mostrar u ocultar el botón "Inicio" según si estás en el inicio o dentro de una carpeta
    navButtons.style.display = historyStack.length > 0 ? 'flex' : 'none';
}

function goToHome() {
    if (historyStack.length > 0) {
        const previousPath = historyStack.pop();
        updateUrl(previousPath);
        getRepoContents(previousPath);
    } else {
        const currentPath = location.search.replace('?path=', '');
        if (currentPath !== '') {
            historyStack.push(currentPath);
        }
        updateUrl('');
        getRepoContents('');
    }
}

function updateUrl(path) {
    history.pushState({ path: path }, null, path ? `?path=${path}` : window.location.pathname);
}

// Cargar contenidos iniciales
getRepoContents('');
