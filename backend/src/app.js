const express = require('express');
const cors = require('cors');
require('dotenv').config();

const transactionRoutes = require('./routes/transactions');
const goalRoutes = require('./routes/goals');
const reportRoutes = require('./routes/reports');
const recurringRoutes = require('./routes/recurring');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Permitir cualquier origen para desarrollo
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Rutas de la API
app.use('/api/transactions', transactionRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/recurring', recurringRoutes);

// Ruta de estado general del servidor
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Manejador global de rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no controlado:', err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor.' });
});

module.exports = app;
