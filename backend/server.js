const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

// Registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ error: 'Usuário já existe' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, password: hashedPassword }
  });

  res.json({ message: 'Usuário registrado com sucesso' });
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ token });
});

// Conversão de moeda
app.post('/convert', authenticateToken, async (req, res) => {
  const { crypto, amount } = req.body;

  if (!crypto || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Quantidade inválida ou criptomoeda não especificada' });
  }

  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${crypto}&vs_currencies=brl,usd`);
    const price = response.data[crypto];

    if (!price) {
      return res.status(404).json({ error: `Criptomoeda ${crypto} não encontrada` });
    }

    const result = await prisma.conversion.create({
      data: {
        currency: crypto,
        amount,
        brlValue: amount * price.brl,
        usdValue: amount * price.usd,
        userId: req.user.id
      }
    });

    res.json({
      brlValue: result.brlValue,
      usdValue: result.usdValue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro na conversão' });
  }
});

// Histórico por usuário
app.get('/history', authenticateToken, async (req, res) => {
  try {
    const history = await prisma.conversion.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar histórico' });
  }
});

// Obter favoritos do usuário
app.get('/favorites', authenticateToken, async (req, res) => {
  try {
    const favs = await prisma.favorite.findMany({
      where: { userId: req.user.id }
    });
    res.json(favs);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar favoritos' });
  }
});

// Adicionar ou remover favorito
app.post('/favorites', authenticateToken, async (req, res) => {
  const { crypto } = req.body;

  if (!crypto) {
    return res.status(400).json({ error: 'Criptomoeda não especificada' });
  }

  try {
    const exists = await prisma.favorite.findFirst({
      where: { currency: crypto, userId: req.user.id }
    });

    if (exists) {
      await prisma.favorite.delete({ where: { id: exists.id } });
      res.json({ message: 'Removido dos favoritos' });
    } else {
      const fav = await prisma.favorite.create({
        data: { currency: crypto, userId: req.user.id }
      });
      res.json(fav);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar/remover favorito' });
  }
});

// Inicia o servidor
app.listen(3001, () => {
  console.log('Servidor rodando em http://localhost:3001');
});
