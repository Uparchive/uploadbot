// Configuração do Bot do Telegram
const BOT_TOKEN = '7279799450:AAGnJRv0zNAbweCwpcTbHsgCo3Bo_9N8fiY'; // Substitua pelo token do bot do Telegram
const CHAT_ID = '1277559138'; // Substitua pelo chat ID onde os arquivos serão enviados
// Elementos do DOM
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const uploadStatus = document.getElementById('upload-status');

// Carregar a lista de arquivos do `localStorage` ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadFilesFromLocalStorage();
});

// Função para iniciar o upload dos arquivos
uploadButton.addEventListener('click', (e) => {
    e.preventDefault(); // Impedir o envio padrão do formulário
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Por favor, selecione pelo menos um arquivo para fazer o upload.');
        return;
    }

    // Iteração sobre os arquivos selecionados e realiza o upload
    Array.from(files).forEach((file) => {
        uploadFileToServer(file);
    });
});

// Função para fazer o upload de um arquivo para o servidor
function uploadFileToServer(file) {
    const formData = new FormData();
    formData.append('file', file);

    // Enviar o arquivo para o servidor
    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const torrentFileName = data.torrentFileName;
                const torrentFilePath = data.torrentFilePath;
                uploadStatus.innerHTML += `<p>Arquivo "${file.name}" enviado e convertido para torrent com sucesso!</p>`;
                
                // Agora envie o arquivo .torrent para o Telegram
                uploadTorrentToTelegram(torrentFileName, torrentFilePath);
            } else {
                uploadStatus.innerHTML += `<p>Erro ao converter "${file.name}" para torrent. Tente novamente.</p>`;
            }
        })
        .catch(error => {
            console.error('Erro ao enviar o arquivo para o servidor:', error);
            uploadStatus.innerHTML += `<p>Erro ao enviar o arquivo "${file.name}" para o servidor. Verifique sua conexão.</p>`;
        });
}

// Função para enviar o arquivo .torrent para o Telegram
function uploadTorrentToTelegram(torrentFileName, torrentFilePath) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('document', new Blob([torrentFilePath]), torrentFileName);

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            uploadStatus.innerHTML += `<p>Arquivo .torrent "${torrentFileName}" enviado ao Telegram com sucesso!</p>`;
        } else {
            console.error('Erro ao enviar o arquivo .torrent ao Telegram:', data);
            uploadStatus.innerHTML += `<p>Erro ao enviar o arquivo .torrent "${torrentFileName}" ao Telegram.</p>`;
        }
    })
    .catch(error => {
        console.error('Erro ao conectar ao Telegram:', error);
        uploadStatus.innerHTML += `<p>Erro ao conectar ao Telegram para o arquivo .torrent "${torrentFileName}".</p>`;
    });
}
