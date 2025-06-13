import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

// Configuração de caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregamento do .env
const envPath = path.join(__dirname, '.env');
const { config } = await import('dotenv');
config({ path: envPath });

// Configuração do banco de dados
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'clientes_restaurante',
  port: process.env.DB_PORT || 3306
};

console.log('⚙️ Configuração do Banco:', {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port
});

// Conexão com MySQL
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

try {
  const conn = await pool.getConnection();
  console.log('✅ Conexão com DB estabelecida - Banco:', conn.config.database);
  
  // Verifica se a tabela existe
  const [tables] = await conn.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = ? AND table_name = 'cadastro_clientes'
  `, [dbConfig.database]);
  
  if (tables.length === 0) {
    console.error('❌ Tabela cadastro_clientes não encontrada no banco de dados');
    process.exit(1);
  }
  
  conn.release();
} catch (err) {
  console.error('❌ ERRO FATAL na conexão com DB:', err.message);
  process.exit(1);
}

// Configuração do Express
const app = express();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Rota de cadastro
app.post('/api/auth/cadastro', async (req, res) => {
  try {
    const { nome_completo, email, senha, confirmar_senha, data_nascimento } = req.body;

    // Validação dos campos obrigatórios
    if (!nome_completo || !email || !senha || !confirmar_senha || !data_nascimento) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Validação da senha
    if (senha !== confirmar_senha) {
      return res.status(400).json({
        success: false,
        message: 'As senhas não coincidem'
      });
    }

    // Verifica se e-mail já existe
    const [existing] = await pool.query(
      'SELECT id FROM cadastro_clientes WHERE email = ?', // Corrigido para cadastro_clientes
      [email]
    );
   
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'E-mail já cadastrado'
      });
    }

    // Insere no banco de dados
    const [result] = await pool.query(
      'INSERT INTO cadastro_clientes (nome_completo, email, senha, data_nascimento) VALUES (?, ?, ?, ?)', // Corrigido para cadastro_clientes
      [nome_completo, email, senha, data_nascimento]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Usuário cadastrado com sucesso'
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({
      success: false,
      message: error.sqlMessage || 'Erro interno no servidor'
    });
  }
});

// Rota de teste
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nome_completo, email FROM cadastro_clientes LIMIT 1'); // Corrigido para cadastro_clientes
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// Rota de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validação dos campos obrigatórios
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'E-mail e senha são obrigatórios'
      });
    }

    // Busca usuário no banco de dados
    const [users] = await pool.query(
      'SELECT id, nome_completo FROM cadastro_clientes WHERE email = ? AND senha = ?', // Corrigido para cadastro_clientes
      [email, senha]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'E-mail ou senha incorretos'
      });
    }

    // Login bem-sucedido
    const user = users[0];
   
    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome_completo,
        email: email
      },
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno no servidor'
    });
  }
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Endpoint de cadastro: http://localhost:${PORT}/api/auth/cadastro`);
  console.log(`🔗 Endpoint de login: http://localhost:${PORT}/api/auth/login`);
});