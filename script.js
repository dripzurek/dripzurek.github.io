const navButtons = document.getElementById('nav-buttons');
const fileList = document.getElementById('file-list');
const historyStack = [];

window.addEventListener('popstate', (event) => {
    const path = event.state ? event.state.path : '';
    getRepoContents(path);
});

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

    contents
        .filter(item => !excludedFiles.includes(item.name))
        .forEach(item => {
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
        });

    navButtons.style.display = path === '' ? 'none' : 'flex';
}

// Resto del código de los botones sin modificaciones

// Load initial contents
getRepoContents('');
