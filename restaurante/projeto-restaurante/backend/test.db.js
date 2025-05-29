import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração do ambiente
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

// Pool de conexão otimizado
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  timezone: 'local' // Alterado para 'local' para melhor formatação
});

// Formatação de datas
function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('pt-BR');
}

async function runTests() {
  let connection;
  try {
    console.log('\n🔍 Iniciando testes de banco de dados...');
    connection = await pool.getConnection();
    console.log('✅ Conexão estabelecida');

    // 1. Teste de saúde do servidor
    const [serverInfo] = await connection.query(`
      SELECT 
        VERSION() AS version,
        DATABASE() AS db,
        DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i:%s') AS server_time,
        CONNECTION_ID() AS conn_id
    `);
    
    console.log('\n🖥️ Informações do servidor:');
    console.table([{
      'Versão MySQL': serverInfo[0].version,
      'Banco atual': serverInfo[0].db,
      'Data/hora': serverInfo[0].server_time,
      'ID Conexão': serverInfo[0].conn_id
    }]);

    // 2. Listagem de tabelas
    const [tables] = await connection.query(`
      SELECT 
        table_name AS nome,
        table_rows AS registros,
        ROUND(data_length/1024, 2) AS tamanho_kb,
        DATE_FORMAT(create_time, '%d/%m/%Y') AS criacao
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [process.env.DB_NAME]);
    
    console.log('\n📊 Tabelas existentes:');
    console.table(tables);

    // 3. Análise da tabela clientes
    await analyzeTable(connection, 'clientes');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error.message);
  } finally {
    if (connection) await connection.release();
    await pool.end();
    console.log('\n🏁 Conexão encerrada');
  }
}

async function analyzeTable(conn, tableName) {
  try {
    console.log(`\n🔎 Analisando tabela "${tableName}"...`);

    // Verifica existência
    const [exists] = await conn.query(`
      SELECT COUNT(*) AS existe 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name = ?
    `, [process.env.DB_NAME, tableName]);

    if (exists[0].existe === 0) {
      console.warn(`⚠️ Tabela "${tableName}" não encontrada`);
      return;
    }

    // Estrutura
    const [structure] = await conn.query(`DESCRIBE ${tableName}`);
    console.log('\n📐 Estrutura:');
    console.table(structure);

    // Estatísticas
    const [stats] = await conn.query(`
      SELECT
        COUNT(*) AS total,
        DATE_FORMAT(MIN(data_cadastro), '%d/%m/%Y') AS primeiro,
        DATE_FORMAT(MAX(data_cadastro), '%d/%m/%Y') AS ultimo
      FROM ${tableName}
    `);
    
    console.log('\n📈 Estatísticas:');
    console.table(stats[0]);

    // Dados de exemplo (excluindo senhas)
    const [sample] = await conn.query(`
      SELECT 
        id,
        nome_completo,
        email,
        DATE_FORMAT(data_nascimento, '%d/%m/%Y') AS data_nascimento,
        DATE_FORMAT(data_cadastro, '%d/%m/%Y %H:%i') AS cadastro
      FROM ${tableName}
      LIMIT 1
    `);
    
    console.log('\n👤 Registro de exemplo:');
    console.table(sample[0]);

  } catch (error) {
    console.error(`\n❌ Erro ao analisar tabela "${tableName}":`, error.message);
  }
}

// Execução
(async () => {
  await runTests();
})();