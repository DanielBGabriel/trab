// Obtém o formulário de login pelo ID e adiciona um listener para o evento submit
document.getElementById('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault(); // Previne o comportamento padrão de submit do formulário
 
  // Cria um objeto com os dados do formulário
  const formData = {
    email: document.getElementById('email').value,
    senha: document.getElementById('senha').value
  };


  try {
    // Faz uma requisição POST para a rota de login na API
    const response = await fetch('http://localhost:3000/api/auth/login', {
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
      // Mostra mensagem de sucesso e redireciona para a página principal
      alert('Login bem-sucedido!');
      window.location.href = '/';
    } else {
      // Mostra mensagem de erro retornada pela API
      alert(data.message);
    }
  } catch (error) {
    // Captura e trata erros de rede ou outros erros não tratados
    console.error('Erro:', error);
    alert('Erro ao fazer login');
  }
});