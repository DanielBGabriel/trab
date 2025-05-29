
// Obtém o formulário de cadastro pelo ID e adiciona um listener para o evento submit
document.getElementById('formCadastro').addEventListener('submit', async (e) => {
    e.preventDefault(); // Previne o comportamento padrão de submit do formulário
   
    // Cria um objeto com os dados do formulário
    const formData = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      senha: document.getElementById('senha').value,
      telefone: document.getElementById('telefone').value,
      endereco: document.getElementById('endereco').value
    };
 
 
    try {
      // Faz uma requisição POST para a rota de registro na API
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON
        },
        body: JSON.stringify(formData) // Converte o objeto para JSON
      });
 
 
      // Converte a resposta para JSON
      const data = await response.json();
     
      // Verifica se a resposta foi bem-sucedida (status 2xx)
      if (response.ok) {
        // Mostra mensagem de sucesso e redireciona para a página de login
        alert(data.message);
        window.location.href = '/login';
      } else {
        // Mostra mensagem de erro retornada pela API
        alert(data.message);
      }
    } catch (error) {
      // Captura e trata erros de rede ou outros erros não tratados
      console.error('Erro:', error);
      alert('Erro ao cadastrar usuário');
    }
  });