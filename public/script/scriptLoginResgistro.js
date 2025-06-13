let modoCadastro = false;

    function alternarFormulario() {
      modoCadastro = !modoCadastro;
      document.getElementById("form-title").textContent = modoCadastro ? "Cadastro" : "Login";
      document.querySelector(".button").textContent = modoCadastro ? "Cadastrar" : "Entrar";
      document.getElementById("extra-field").style.display = modoCadastro ? "block" : "none";
      document.getElementById("switch-text").innerHTML = modoCadastro
        ? "Já tem uma conta? <a onclick=\"alternarFormulario()\">Faça login</a>"
        : "Não tem uma conta? <a onclick=\"alternarFormulario()\">Cadastre-se</a>";
      document.getElementById("email").value = "";
      document.getElementById("senha").value = "";
      document.getElementById("nome").value = "";
      limparErros();
    }

    function validarEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    }

    function validarSenha(senha) {
      const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return re.test(senha);
    }

    function limparErros() {
      document.getElementById("email-erro").textContent = "";
      document.getElementById("senha-erro").textContent = "";
      document.getElementById("email").classList.remove("error-input");
      document.getElementById("senha").classList.remove("error-input");
    }

    function enviarFormulario() {

      console.log("Modo cadastro:", modoCadastro);
      const emailInput = document.getElementById("email");
      const senhaInput = document.getElementById("senha");
      const nome = document.getElementById("nome").value.trim();
      const email = emailInput.value.trim();
      const senha = senhaInput.value;
        
      limparErros();
        
      let valido = true;
        
      if (!validarEmail(email)) {
        document.getElementById("email-erro").textContent = "E-mail inválido.";
        emailInput.classList.add("error-input");
        valido = false;
      }
    
      if (!validarSenha(senha)) {
        document.getElementById("senha-erro").textContent = "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.";
        senhaInput.classList.add("error-input");
        valido = false;
      }
    
      if (!valido) return;
    
      if (modoCadastro) {
        fetch('/api/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome, email, senha })
        })
        .then(res => res.json())
        .then(data => {
          if (data.sucesso) {
            alert(`Usuário cadastrado com sucesso!\nNome: ${nome}`);
            alternarFormulario();
          } else {
            alert(data.erro || 'Erro ao cadastrar.');
          }
        });
      } else {
        fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha })
        })
        .then(res => res.json())
        .then(data => {
          if (data.sucesso) {
            alert(`Bem-vindo de volta, ${data.nome}!`);
            localStorage.setItem('token', data.token);
            localStorage.setItem('nomeUsuario', data.nome || '');
            window.location.href = 'index.html';
          } else {
            alert(data.erro || 'Erro ao fazer login.');
            senhaInput.classList.add("error-input");
          }
        });
      }
      emailInput.value = "";
      senhaInput.value = "";
      };
