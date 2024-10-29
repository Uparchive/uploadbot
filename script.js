// Este script JavaScript fornece funcionalidades para um site de upload de arquivos que usa a API do Telegram para armazenar os arquivos.

// Configuração do Bot do Telegram
const BOT_TOKEN = 'SEU_BOT_TOKEN_AQUI'; // Substitua pelo token do bot do Telegram
const CHAT_ID = 'SEU_CHAT_ID_AQUI'; // Substitua pelo chat ID onde os arquivos serão enviados

// Elementos do DOM
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const uploadStatus = document.getElementById('upload-status');

// Função para iniciar o upload dos arquivos
uploadButton.addEventListener('click', () => {
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Por favor, selecione pelo menos um arquivo para fazer o upload.');
        return;
    }

    // Iteração sobre os arquivos selecionados e realiza o upload
    Array.from(files).forEach((file) => {
        uploadFileToTelegram(file);
    });
});

// Função para fazer o upload de um arquivo para o Telegram
async function uploadFileToTelegram(file) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('document', file);

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        if (result.ok) {
            uploadStatus.innerHTML += `<p>Upload do arquivo "${file.name}" realizado com sucesso!</p>`;
        } else {
            uploadStatus.innerHTML += `<p>Erro ao enviar o arquivo "${file.name}". Tente novamente.</p>`;
        }
    } catch (error) {
        uploadStatus.innerHTML += `<p>Erro ao conectar-se ao Telegram para o arquivo "${file.name}". Verifique sua conexão.</p>`;
    }
}
