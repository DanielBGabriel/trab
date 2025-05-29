
// Importa os módulos necessários
const express = require('express');       // Framework web
const cors = require('cors');             // Middleware para CORS
const path = require('path');             // Para trabalhar com caminhos de arquivos
const authRoutes = require('./routes/auth'); // Importa as rotas de autenticação


// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();


// Cria uma instância do Express
const app = express();


// Middlewares
app.use(cors());                          // Habilita CORS para todas as rotas
app.use(express.json());                  // Permite parsing de JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Permite parsing de formulários HTML


// Configura o Express para servir arquivos estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname, '../frontend/public')));


// Configura as rotas da API
app.use('/api/auth', authRoutes);         // Todas as rotas em auth.js terão prefixo /api/auth


// Rota para servir o formulário de cadastro
app.get('/cadastro', (req, res) => {
  // Envia o arquivo HTML de cadastro
  res.sendFile(path.join(__dirname, '../frontend/cadastro.html'));
});


// Rota para servir o formulário de login
app.get('/login', (req, res) => {
  // Envia o arquivo HTML de login
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});


// Define a porta do servidor (usando a variável de ambiente ou 3000 como padrão)
const PORT = process.env.PORT || 3000;


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});