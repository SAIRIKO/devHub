document.addEventListener('DOMContentLoaded', () => {
  console.log("DevHub Home Page carregada");

  // Exemplo de comportamento JS simples
  const botaoCadastro = document.querySelector('.btn');
  if (botaoCadastro) {
    botaoCadastro.addEventListener('click', (e) => {
      e.preventDefault();
      alert("Funcionalidade de cadastro em desenvolvimento. Aguarde!");
    });
  }
});