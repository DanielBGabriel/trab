// Importa o modelo User para interagir com o banco de dados
const User = require('../models/User');


// Controlador para registro de novos usuários
exports.register = async (req, res) => {
  try {
    // Extrai os dados do corpo da requisição
    const { nome, email, senha, telefone, endereco } = req.body;
   
    // Verifica se já existe um usuário com o mesmo email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      // Retorna erro 400 se o email já estiver cadastrado
      return res.status(400).json({ message: 'Email já cadastrado' });
    }


    // Cria um novo usuário no banco de dados
    await User.create({ nome, email, senha, telefone, endereco });
   
    // Retorna sucesso 201 (Created) com mensagem de confirmação
    res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    // Loga o erro no console para debug
    console.error(error);
    // Retorna erro 500 (Internal Server Error) genérico
    res.status(500).json({ message: 'Erro no servidor' });
  }
};


// Controlador para login de usuários
exports.login = async (req, res) => {
  try {
    // Extrai email e senha do corpo da requisição
    const { email, senha } = req.body;
   
    // Busca o usuário pelo email
    const user = await User.findByEmail(email);
   
    // Verifica se o usuário existe e se a senha está correta
    // ATENÇÃO: Em produção, nunca compare senhas em texto puro!
    if (!user || user.senha !== senha) {
      // Retorna erro 401 (Unauthorized) se credenciais forem inválidas
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }
   
    // Em produção, aqui seria gerado um token JWT para autenticação
    // Retorna sucesso com mensagem e dados básicos do usuário
    res.json({
      message: 'Login bem-sucedido',
      user: {
        nome: user.nome,
        email: user.email
      }
    });
  } catch (error) {
    // Loga o erro no console para debug
    console.error(error);
    // Retorna erro 500 (Internal Server Error) genérico
    res.status(500).json({ message: 'Erro no servidor' });
  }
};