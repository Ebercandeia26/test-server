const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();

// Configurar a conexão com o MongoDB Atlas
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('A variável MONGO_URI não está definida no ambiente');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado ao MongoDB Atlas');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB Atlas:', err);
});

// Configurar armazenamento do multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const app = express();

// Definir o esquema do Mongoose para dados adicionais
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  nome: String,
  registro: String,
  email: String,
  curso: String,
  turno: String,
  solicitacao: String,
  file: {
    data: Buffer,
    contentType: String,
    filename: String
  }
});

const User = mongoose.model('User', UserSchema);

// Rota para receber os dados do Typebot com arquivo
app.post('/submit', upload.single('file'), async (req, res) => {
  try {
    // Parse JSON data from `jsonData`
    const jsonData = JSON.parse(req.body.jsonData);

    const newUser = new User({
      nome: jsonData.nome,
      registro: jsonData.registro,
      email: jsonData.email,
      curso: jsonData.curso,
      turno: jsonData.turno,
      solicitacao: jsonData.solicitacao,
      file: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname
      } : null
    });

    await newUser.save();
    res.status(201).send('Dados e arquivo salvos com sucesso');
  } catch (error) {
    console.error('Erro ao salvar os dados:', error);
    res.status(500).send('Erro ao salvar os dados');
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
