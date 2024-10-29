import express from 'express';
import multer from 'multer';
import WebTorrent from 'webtorrent';
import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';

const app = express();
const upload = multer({ dest: 'uploads/' });
const client = new WebTorrent();

const BOT_TOKEN = 'SEU_BOT_TOKEN';
const CHAT_ID = 'SEU_CHAT_ID';

app.use(express.static('public')); // Para servir arquivos estáticos

// Endpoint de upload
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.json({ success: false, message: 'Nenhum arquivo enviado.' });
    }

    const filePath = path.join(process.cwd(), file.path);

    // Criar o torrent usando WebTorrent
    client.seed(filePath, { name: file.originalname }, (torrent) => {
        console.log('Seeding iniciado para', torrent.infoHash);

        // Salvar o .torrent gerado no sistema
        const torrentBuffer = torrent.torrentFile;
        const torrentFilePath = `uploads/${file.originalname}.torrent`;
        
        fs.writeFile(torrentFilePath, torrentBuffer, async (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo .torrent:', err);
                return res.json({ success: false, message: 'Erro ao salvar o arquivo .torrent' });
            }

            // Enviar o arquivo .torrent ao Telegram
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('document', fs.createReadStream(torrentFilePath));

            try {
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();

                if (result.ok) {
                    res.json({ success: true, torrentFileName: `${file.originalname}.torrent`, torrentFilePath });
                } else {
                    console.error('Erro ao enviar o arquivo .torrent ao Telegram:', result);
                    res.json({ success: false, message: 'Erro ao enviar o arquivo .torrent ao Telegram' });
                }
            } catch (error) {
                console.error('Erro ao conectar ao Telegram:', error);
                res.json({ success: false, message: 'Erro ao conectar ao Telegram' });
            }
        });
    });
});

app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});
