const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'sua_chave_secreta_segura';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Limite de tentativas de login (Brute Force Protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas
  standardHeaders: true, // Retorna informações de limite nos headers
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

// Banco de Dados SQLite
const db = new sqlite3.Database('./usuarios.db');
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT UNIQUE,
  senha TEXT
)`);

// Função para validar e-mail
function emailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Cadastro de Usuário
app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }
  if (!emailValido(email)) {
    return res.status(400).json({ erro: "E-mail inválido." });
  }
  try {
    const hash = await bcrypt.hash(senha, 10);
    db.run("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)", [nome, email, hash], function (err) {
      if (err) return res.status(400).json({ erro: "E-mail já cadastrado.", detalhe: err.message });
      res.json({ sucesso: true });
    });
  } catch (e) {
    res.status(500).json({ erro: "Erro interno ao cadastrar." });
  }
});

// Login com proteção e JWT
app.post('/api/login', loginLimiter, (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }
  if (!emailValido(email)) {
    return res.status(400).json({ erro: "E-mail inválido." });
  }
  db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ erro: "Erro ao acessar o banco de dados." });
    if (!row) return res.status(401).json({ erro: "Usuário não encontrado." });
    const valido = await bcrypt.compare(senha, row.senha);
    if (valido) {
      const token = jwt.sign({ id: row.id, nome: row.nome }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ sucesso: true, token, nome: row.nome });
    } else {
      res.status(401).json({ erro: "Senha incorreta." });
    }
  });
});


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
