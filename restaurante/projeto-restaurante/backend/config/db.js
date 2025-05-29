// Importa o módulo mysql2/promise para trabalhar com MySQL usando promises
const mysql = require('mysql2/promise');
// Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();


// Cria um pool de conexões com o banco de dados MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,        // Endereço do servidor MySQL (do .env)
  user: process.env.DB_USER,        // Usuário do banco de dados (do .env)
  password: process.env.DB_PASSWORD, // Senha do banco de dados (do .env)
  database: process.env.DB_NAME,    // Nome do banco de dados (do .env)
  waitForConnections: true,         // Esperar por conexões se não houver disponíveis
  connectionLimit: 10,              // Número máximo de conexões no pool
  queueLimit: 0                     // Número máximo de solicitações na fila (0 = ilimitado)
});