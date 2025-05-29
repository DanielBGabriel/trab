    // Importa o pool de conexões do banco de dados
    const pool = require('../config/db');


    // Define a classe User que contém métodos para interagir com a tabela cadastro_clientes
    class User {
      // Método estático para criar um novo usuário no banco de dados
      static async create({ nome, email, senha, telefone, endereco }) {
        // Executa a query SQL para inserir um novo registro
        const [result] = await pool.execute(
          'INSERT INTO cadastro_clientes (nome, email, senha, telefone, endereco) VALUES (?, ?, ?, ?, ?)',
          [nome, email, senha, telefone, endereco]  // Valores a serem inseridos (proteção contra SQL injection)
        );
        return result;  // Retorna o resultado da operação
      }
    
    
      // Método estático para buscar um usuário pelo email
      static async findByEmail(email) {
        // Executa a query SQL para buscar um usuário pelo email
        const [rows] = await pool.execute(
          'SELECT * FROM cadastro_clientes WHERE email = ?',
          [email]  // Valor do email para busca
        );
        return rows[0];  // Retorna o primeiro usuário encontrado (ou undefined)
      }
    
    
      // Outros métodos podem ser adicionados aqui conforme necessidade
    }
    
    
    // Exporta a classe User para ser usada em outros arquivos
    module.exports = User;