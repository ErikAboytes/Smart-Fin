const express = require('express');
const router = express.Router();
const controller = require('../controllers/goalController');

// Obtener todas las metas
router.get('/', controller.getGoals);

// Crear una nueva meta de ahorro
router.post('/', controller.createGoal);

// Agregar un depósito a una meta
router.post('/:id/deposits', controller.addDeposit);

// Eliminar una meta
router.delete('/:id', controller.deleteGoal);

module.exports = router;
