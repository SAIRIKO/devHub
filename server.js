const express = require('express');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Banco de Dados SQLite
const db = new sqlite3.Database('./usuarios.db');
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  email TEXT UNIQUE,
  senha TEXT
)`);

// Cadastro de Usuário
app.post('/api/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
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

// Login
app.post('/api/login', (req, res) => {
  const { email, senha } = req.body;
  db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ erro: "Erro ao acessar o banco de dados." });
    if (!row) return res.status(401).json({ erro: "Usuário não encontrado." });
    const valido = await bcrypt.compare(senha, row.senha);
    if (valido) res.json({ sucesso: true, nome: row.nome });
    else res.status(401).json({ erro: "Senha incorreta." });
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
