require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const usersRoutes = require('./routes/users.routes');

const app = express();

// ── Middlewares ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Rutas API
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'API funcionando' });
});

app.use('/api/sales', usersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, message: 'Endpoint no encontrado' });
});

// Servir Angular compilado cuando exista frontend/dist.
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist', 'frontend', 'browser');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'API Ejercicio 5 - Ventas y Descuentos' });
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;

if (!MONGODB_URI) {
  console.error('Falta MONGODB_URI en backend/.env');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
