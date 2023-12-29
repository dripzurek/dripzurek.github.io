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
        showContents(data, path);
    } catch (error) {
        console.error('Error al obtener la lista de archivos:', error);
    }
}

function showContents(contents, path) {
    fileList.innerHTML = '';

    contents.forEach(item => {
        if (item.name === 'index.html' || item.name === 'script.js' || item.name === 'styles.css') {
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

    navButtons.style.display = path === '' ? 'none' : 'flex';
}

function goToHome() {
    if (historyStack.length > 0) {
        const previousPath = historyStack.pop();
        updateUrl(previousPath);
        getRepoContents(previousPath);
    } else {
        updateUrl('');
        getRepoContents('');
    }
}

function updateUrl(path) {
    history.pushState({ path: path }, null, path ? `?path=${path}` : window.location.pathname);
}

// Load initial contents
getRepoContents('');
