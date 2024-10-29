// Este script JavaScript fornece funcionalidades para um site de upload de arquivos que usa a API do Telegram para armazenar os arquivos.

// Configuração do Bot do Telegram
const BOT_TOKEN = '7279799450:AAGnJRv0zNAbweCwpcTbHsgCo3Bo_9N8fiY'; // Substitua pelo token do bot do Telegram
const CHAT_ID = '1277559138'; // Substitua pelo chat ID onde os arquivos serão enviados

// Elementos do DOM
const fileInput = document.getElementById('file-input');
const uploadButton = document.getElementById('upload-button');
const uploadStatus = document.getElementById('upload-status');
const progressBar = document.getElementById('file-progress');
const fileList = document.getElementById('file-list');

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
        uploadFileToTelegram(file);
    });
});

// Função para fazer o upload de um arquivo para o Telegram
function uploadFileToTelegram(file) {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('document', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, true);

    // Exibir a barra de progresso
    progressBar.style.display = 'block';

    // Evento de progresso do upload
    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            progressBar.value = percentComplete;
        }
    });

    // Evento de finalização do upload
    xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            const fileLink = response.result.document.file_id;
            uploadStatus.innerHTML += `<p>Upload do arquivo "${file.name}" realizado com sucesso!</p>`;
            addFileToList(file.name, fileLink); // Adicionar o arquivo à lista de arquivos
            saveFileToLocalStorage(file.name, fileLink); // Salvar no localStorage
        } else {
            uploadStatus.innerHTML += `<p>Erro ao enviar o arquivo "${file.name}". Tente novamente.</p>`;
        }
        progressBar.style.display = 'none'; // Ocultar a barra de progresso ao finalizar
        progressBar.value = 0; // Reiniciar valor
    });

    // Evento de erro
    xhr.addEventListener('error', () => {
        uploadStatus.innerHTML += `<p>Erro ao conectar-se ao Telegram para o arquivo "${file.name}". Verifique sua conexão.</p>`;
        progressBar.style.display = 'none';
        progressBar.value = 0;
    });

    // Enviar os dados do formulário
    xhr.send(formData);
}

// Função para adicionar um arquivo à lista de arquivos
function addFileToList(fileName, fileLink) {
    const listItem = document.createElement('li');
    listItem.classList.add('file-list-item');

    // Nome do Arquivo
    const fileNameElement = document.createElement('span');
    fileNameElement.textContent = fileName;
    listItem.appendChild(fileNameElement);

    // Container dos botões
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    // Botão de Download
    const downloadButton = document.createElement('button');
    downloadButton.innerHTML = '<i class="fas fa-download"></i>';
    downloadButton.classList.add('action-button');
    downloadButton.addEventListener('click', () => {
        alert('Função de download a ser implementada'); // Substitua por funcionalidade real
    });
    buttonContainer.appendChild(downloadButton);

    // Botão de Copiar Link
    const copyLinkButton = document.createElement('button');
    copyLinkButton.innerHTML = '<i class="fas fa-link"></i>';
    copyLinkButton.classList.add('action-button');
    copyLinkButton.addEventListener('click', () => {
        navigator.clipboard.writeText(fileLink);
        alert('Link copiado para a área de transferência');
    });
    buttonContainer.appendChild(copyLinkButton);

    // Botão de Excluir
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.classList.add('action-button');
    deleteButton.addEventListener('click', () => {
        listItem.remove();
        removeFileFromLocalStorage(fileName);
    });
    buttonContainer.appendChild(deleteButton);

    listItem.appendChild(buttonContainer);
    fileList.appendChild(listItem);
}

// Função para salvar um arquivo no `localStorage`
function saveFileToLocalStorage(fileName, fileLink) {
    let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    files.push({ name: fileName, link: fileLink });
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
}

// Função para carregar arquivos do `localStorage` e exibi-los
function loadFilesFromLocalStorage() {
    let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    files.forEach(file => {
        addFileToList(file.name, file.link);
    });
}

// Função para remover um arquivo do `localStorage`
function removeFileFromLocalStorage(fileName) {
    let files = JSON.parse(localStorage.getItem('uploadedFiles')) || [];
    files = files.filter(file => file.name !== fileName);
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
}
