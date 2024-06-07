const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
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

const db = mongoose.connection;

// Definir o esquema do Mongoose para dados adicionais
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  nome: String,
  registro: String,
  email: String,
  curso: String,
  turno: String,
  solicitacao: String,
  fileUrl: String // Atualizado para armazenar o URL do arquivo
});

const User = mongoose.model('User', UserSchema);

const app = express();
app.use(bodyParser.json());

// Rota para receber os dados do Typebot com o link do arquivo
app.post('/submit', async (req, res) => {
  const { nome, registro, email, curso, turno, solicitacao, file } = req.body;

  const newUser = new User({
    nome,
    registro,
    email,
    curso,
    turno,
    solicitacao,
    fileUrl: file // Salvar o URL do arquivo
  });

  try {
    await newUser.save();
    res.status(201).send('Dados e link do arquivo salvos com sucesso');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao salvar os dados');
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
