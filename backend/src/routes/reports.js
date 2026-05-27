const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');

// Obtener gastos mensuales por categoría
router.get('/category-expenses', controller.getCategoryExpenses);

// Obtener ingresos vs egresos de los últimos 6 meses
router.get('/income-vs-expense', controller.getIncomeVsExpense);

// Obtener insights de patrones de consumo
router.get('/insights', controller.getConsumptionPatterns);

module.exports = router;
