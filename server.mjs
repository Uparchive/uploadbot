import express from 'express';
import multer from 'multer';
import WebTorrent from 'webtorrent';
import path from 'path';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });
const client = new WebTorrent();

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.json({ success: false, message: 'Nenhum arquivo enviado.' });
    }

    const filePath = path.join(process.cwd(), file.path);

    // Adicionar seed usando WebTorrent e criar o .torrent automaticamente
    client.seed(filePath, { name: file.originalname }, (torrent) => {
        console.log('Seeding iniciado para', torrent.infoHash);

        // Salvar o .torrent gerado no sistema
        const torrentBuffer = torrent.torrentFile;
        const torrentFilePath = `${filePath}.torrent`;
        
        fs.writeFile(torrentFilePath, torrentBuffer, (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo .torrent:', err);
                return res.json({ success: false, message: 'Erro ao salvar o arquivo .torrent' });
            }

            // Enviar de volta a resposta com informações sobre o torrent
            res.json({ success: true, torrentFileName: `${file.originalname}.torrent`, torrentFilePath });
        });
    });
});

app.listen(3001, () => {
    console.log('Servidor rodando na porta 3001');
});
