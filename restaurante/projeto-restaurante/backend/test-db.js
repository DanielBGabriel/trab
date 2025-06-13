import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração do ambiente
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

// Pool de conexão otimizado
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'clientes_restaurante',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000
});

async function runTests() {
  let connection;
  try {
    console.log('\n🔍 Iniciando testes de banco de dados...');
    connection = await pool.getConnection();
    console.log('✅ Conexão estabelecida');

    // 1. Teste de saúde do servidor (usando consulta mais compatível)
    const [serverInfo] = await connection.query(`
      SELECT
        VERSION() AS version,
        DATABASE() AS current_db,
        @@hostname AS hostname,
        DATE_FORMAT(NOW(), '%d/%m/%Y %H:%i:%s') AS server_time,
        CONNECTION_ID() AS connection_id
    `);
   
    console.log('\n🖥️ Informações do servidor:');
    console.table([{
      'Versão MySQL': serverInfo[0].version,
      'Banco atual': serverInfo[0].current_db,
      'Servidor': serverInfo[0].hostname,
      'Data/hora': serverInfo[0].server_time,
      'ID Conexão': serverInfo[0].connection_id
    }]);

    // 2. Listagem de tabelas (versão compatível com MariaDB)
    const [tables] = await connection.query(`
      SELECT
        table_name AS nome_tabela,
        table_rows AS qtd_registros,
        ROUND(data_length/1024/1024, 2) AS tamanho_mb,
        DATE_FORMAT(create_time, '%d/%m/%Y') AS criacao
      FROM information_schema.tables
      WHERE table_schema = ?
    `, [process.env.DB_DATABASE || 'clientes_restaurante']);
   
    console.log('\n📊 Tabelas existentes:');
    console.table(tables);

    // 3. Análise da tabela clientes (se existir)
    if (tables.some(t => t.nome_tabela === 'cadastro_clientes')) {
      await analyzeTable(connection, 'cadastro_clientes');
    } else {
      console.log('\n⚠️ Tabela "cadastro_clientes" não encontrada no banco de dados');
    }

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error.message);
  } finally {
    if (connection) connection.release();
    console.log('\n🏁 Conexão encerrada');
  }
}

async function analyzeTable(conn, tableName) {
  try {
    console.log(`\n🔎 Analisando tabela "${tableName}"...`);

    // Estrutura (usando SHOW COLUMNS que é mais compatível)
    const [structure] = await conn.query(`SHOW COLUMNS FROM ${tableName}`);
    console.log('\n📐 Estrutura:');
    console.table(structure);

    // Estatísticas básicas
    const [stats] = await conn.query(`
      SELECT
        COUNT(*) AS total,
        IFNULL(DATE_FORMAT(MIN(criado_em), '%d/%m/%Y'), 'N/A') AS primeiro,
        IFNULL(DATE_FORMAT(MAX(criado_em), '%d/%m/%Y'), 'N/A') AS ultimo
      FROM ${tableName}
    `);
   
    console.log('\n📈 Estatísticas:');
    console.table(stats[0]);

    // Dados de exemplo (com tratamento para tabelas vazias)
    const [sample] = await conn.query(`
      SELECT
        id,
        nome_completo,
        email,
        DATE_FORMAT(data_nascimento, '%d/%m/%Y') AS data_nascimento
      FROM ${tableName}
      LIMIT 1
    `);
   
    if (sample.length > 0) {
      console.log('\n👤 Registro de exemplo:');
      console.table(sample[0]);
    } else {
      console.log('\nℹ️ Tabela vazia');
    }

  } catch (error) {
    console.error(`\n❌ Erro ao analisar tabela "${tableName}":`, error.message);
  }
}

// Execução
(async () => {
  await runTests();
  process.exit();
})();