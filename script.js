// Configuração do Bot do Telegram
const BOT_TOKEN = '7279799450:AAGnJRv0zNAbweCwpcTbHsgCo3Bo_9N8fiY'; // Substitua pelo token do bot do Telegram
const CHAT_ID = '1277559138'; // Substitua pelo chat ID onde os arquivos serão enviados
// Elementos do DOM
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const uploadStatus = document.getElementById('upload-status');
const fileList = document.getElementById('file-list');

// Função para iniciar o upload dos arquivos
uploadButton.addEventListener('click', (e) => {
    e.preventDefault();
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Por favor, selecione pelo menos um arquivo para fazer o upload.');
        return;
    }

    Array.from(files).forEach((file) => {
        uploadFileToServer(file);
    });
});

// Função para fazer o upload de um arquivo para o servidor
function uploadFileToServer(file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const torrentFileName = data.torrentFileName;
                const torrentFilePath = data.torrentFilePath;

                // Adicionar o arquivo à lista de arquivos
                addFileToList(torrentFileName, torrentFilePath);
            } else {
                uploadStatus.innerHTML += `<p>Erro ao converter "${file.name}" para torrent. Tente novamente.</p>`;
            }
        })
        .catch(error => {
            console.error('Erro ao enviar o arquivo para o servidor:', error);
            uploadStatus.innerHTML += `<p>Erro ao enviar o arquivo "${file.name}" para o servidor. Verifique sua conexão.</p>`;
        });
}

// Função para adicionar um arquivo à lista de arquivos
function addFileToList(torrentFileName, torrentFilePath) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        ${torrentFileName}
        <button onclick="downloadFile('${torrentFilePath}')"><i class="fas fa-download"></i></button>
        <button onclick="copyLink('${torrentFilePath}')"><i class="fas fa-link"></i></button>
        <button onclick="removeFile(this)"><i class="fas fa-trash"></i></button>
    `;
    fileList.appendChild(listItem);
}

// Funções auxiliares
function downloadFile(torrentFilePath) {
    window.location.href = torrentFilePath;
}

function copyLink(torrentFilePath) {
    navigator.clipboard.writeText(window.location.origin + '/' + torrentFilePath)
        .then(() => {
            alert('Link copiado para a área de transferência.');
        })
        .catch(err => {
            console.error('Erro ao copiar o link:', err);
        });
}

function removeFile(element) {
    element.parentElement.remove();
}
