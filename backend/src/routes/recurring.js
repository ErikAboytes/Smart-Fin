const express = require('express');
const router = express.Router();
const controller = require('../controllers/recurringController');
const { processRecurringForDate } = require('../services/cronService');

// Obtener todas las transacciones recurrentes programadas
router.get('/', controller.getRecurring);

// Crear una nueva plantilla de transacción recurrente
router.post('/', controller.createRecurring);

// Activar o desactivar una transacción recurrente
router.patch('/:id/toggle', controller.toggleRecurring);

// Eliminar una transacción recurrente
router.delete('/:id', controller.deleteRecurring);

// Obtener el historial de logs del cron
router.get('/logs', controller.getRecurringLogs);

// RUTA DE DESARROLLO/TEST: Forzar ejecución del cron job inmediatamente
router.post('/trigger-cron', async (req, res) => {
  const { date } = req.body;
  try {
    const targetDate = date ? new Date(date) : new Date();
    const result = await processRecurringForDate(targetDate);
    res.json({
      message: 'Cron job ejecutado manualmente con éxito.',
      dateProcessed: targetDate.toISOString().split('T')[0],
      ...result
    });
  } catch (error) {
    console.error('Error al disparar cron manual:', error);
    res.status(500).json({ error: 'Error al forzar la ejecución del cron job: ' + error.message });
  }
});

module.exports = router;
