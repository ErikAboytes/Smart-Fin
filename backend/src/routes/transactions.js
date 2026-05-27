const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionController');

// Obtener todas las transacciones
router.get('/', controller.getTransactions);

// Crear una nueva transacción
router.post('/', controller.createTransaction);

// Eliminar una transacción
router.delete('/:id', controller.deleteTransaction);

// Obtener categorías disponibles
router.get('/categories', controller.getCategories);

module.exports = router;
