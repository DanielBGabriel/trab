// Importa o framework Express
const express = require('express');
// Cria um objeto router para definir rotas
const router = express.Router();
// Importa os controladores de autenticação
const authController = require('../controllers/authController');


// Define a rota POST /register que usará o método register do authController
router.post('/register', authController.register);


// Define a rota POST /login que usará o método login do authController
router.post('/login', authController.login);


// Exporta o router para ser usado no arquivo principal (server.js)
module.exports = router;