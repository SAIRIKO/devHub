require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_segura';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Limite de 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
});

// Rate limiting para API DeepSeek
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Limite de 50 requisições por IP
  message: 'Muitas requisições à API. Tente novamente mais tarde.'
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

// Middleware de autenticação JWT
function autenticarToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ erro: "Token não fornecido." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ erro: "Token inválido ou expirado." });
    req.user = user;
    next();
  });
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

// Rota para chamar a API da DeepSeek (protegida por JWT e rate limiting)
app.post('/api/ask-deepseek', async (req, res) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'DevHub',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1:free",
        messages: [{ role: 'user', content: req.body.prompt }]
      })
    });

    const data = await response.json();
    res.json({ resposta: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor rodando! Use POST /api/deepseek para chamar a API.');
});

module.exports = app;

// Inicia o servidor
if (require.main === module) {
  app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
  });
}

module.exports = { app, emailValido, autenticarToken };
