const db = require('../config/database');

// Obtener gastos mensuales por categoría
const getCategoryExpenses = async (req, res) => {
  const { month, year } = req.query;
  const targetMonth = month ? parseInt(month) : new Date().getMonth() + 1;
  const targetYear = year ? parseInt(year) : new Date().getFullYear();

  try {
    const query = `
      SELECT c.name as category, c.color, SUM(t.amount) as amount
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
        AND EXTRACT(MONTH FROM t.date) = $1
        AND EXTRACT(YEAR FROM t.date) = $2
      GROUP BY c.name, c.color
      ORDER BY amount DESC
    `;
    const { rows } = await db.query(query, [targetMonth, targetYear]);
    
    // Convertir el monto a número flotante
    const formattedRows = rows.map(r => ({
      ...r,
      amount: parseFloat(r.amount)
    }));
    
    res.json(formattedRows);
  } catch (error) {
    console.error('Error al obtener gastos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener reporte de categorías.' });
  }
};

// Obtener ingresos vs egresos de los últimos 6 meses
const getIncomeVsExpense = async (req, res) => {
  try {
    // Consulta para obtener la suma de ingresos y egresos de los últimos 6 meses, agrupado por mes
    const query = `
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month_key,
        TO_CHAR(date, 'Mon') as month_name,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(date, 'YYYY-MM'), TO_CHAR(date, 'Mon')
      ORDER BY month_key ASC
    `;
    const { rows } = await db.query(query);
    
    const formattedRows = rows.map(r => ({
      name: r.month_name,
      income: parseFloat(r.income || 0),
      expense: parseFloat(r.expense || 0),
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error('Error al obtener ingresos vs egresos:', error);
    res.status(500).json({ error: 'Error al obtener reporte comparativo.' });
  }
};

// Identificación de patrones de consumo (Insights Inteligentes)
const getConsumptionPatterns = async (req, res) => {
  try {
    const insights = [];

    // 1. Obtener balance general de transacciones del mes actual
    const currentMonthQuery = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `;
    const balanceResult = await db.query(currentMonthQuery);
    const totalIncome = parseFloat(balanceResult.rows[0].total_income || 0);
    const totalExpense = parseFloat(balanceResult.rows[0].total_expense || 0);

    // Insight de tasa de ahorro
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (savingsRate > 25) {
        insights.push({
          type: 'success',
          title: '¡Excelente tasa de ahorro!',
          description: `Este mes has ahorrado el ${savingsRate.toFixed(1)}% de tus ingresos. Estás muy por encima de la recomendación general del 20%.`
        });
      } else if (savingsRate >= 10 && savingsRate <= 25) {
        insights.push({
          type: 'info',
          title: 'Buen ritmo de ahorro',
          description: `Tu tasa de ahorro mensual es del ${savingsRate.toFixed(1)}%. Vas por buen camino, intenta llegar al 20% para acelerar tus metas.`
        });
      } else if (savingsRate > 0 && savingsRate < 10) {
        insights.push({
          type: 'warning',
          title: 'Tasa de ahorro baja',
          description: `Has ahorrado solo el ${savingsRate.toFixed(1)}% de tus ingresos. Considera recortar algunos gastos hormiga o suscripciones inactivas.`
        });
      } else {
        insights.push({
          type: 'danger',
          title: 'Alerta de sobregiro',
          description: `Tus egresos de este mes superan tus ingresos en un ${Math.abs(savingsRate).toFixed(1)}%. Es fundamental revisar el presupuesto urgente.`
        });
      }
    } else if (totalExpense > 0) {
      insights.push({
        type: 'warning',
        title: 'Sin ingresos registrados',
        description: 'Has registrado gastos este mes pero ningún ingreso aún. Añade tus ingresos para ver un análisis completo.'
      });
    }

    // 2. Mayor categoría de gastos de este mes
    const topCategoryQuery = `
      SELECT c.name, SUM(t.amount) as total
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.type = 'expense'
        AND EXTRACT(MONTH FROM t.date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(YEAR FROM t.date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY c.name
      ORDER BY total DESC
      LIMIT 1
    `;
    const topCategoryResult = await db.query(topCategoryQuery);
    if (topCategoryResult.rows.length > 0) {
      const topCategory = topCategoryResult.rows[0].name;
      const topCategoryTotal = parseFloat(topCategoryResult.rows[0].total);
      const pctOfExpenses = totalExpense > 0 ? (topCategoryTotal / totalExpense) * 100 : 0;

      if (pctOfExpenses > 35 && topCategory !== 'Vivienda' && topCategory !== 'Otros') {
        insights.push({
          type: 'warning',
          title: `Gasto elevado en ${topCategory}`,
          description: `La categoría ${topCategory} representa el ${pctOfExpenses.toFixed(1)}% de todos tus egresos del mes ($${topCategoryTotal.toFixed(2)}). Intenta presupuestar un límite para esta categoría.`
        });
      } else {
        insights.push({
          type: 'info',
          title: `Categoría líder: ${topCategory}`,
          description: `Tu mayor egreso de este mes ha sido en ${topCategory} con un total de $${topCategoryTotal.toFixed(2)} (${pctOfExpenses.toFixed(1)}% del total).`
        });
      }
    }

    // 3. Análisis de transacciones recurrentes activas
    const recurringQuery = `
      SELECT COUNT(*) as count, SUM(amount) as total
      FROM recurring_transactions
      WHERE is_active = true
    `;
    const recurringResult = await db.query(recurringQuery);
    const recurringCount = parseInt(recurringResult.rows[0].count || 0);
    const recurringTotal = parseFloat(recurringResult.rows[0].total || 0);

    if (recurringCount > 0) {
      insights.push({
        type: 'info',
        title: 'Gastos fijos/recurrentes programados',
        description: `Tienes ${recurringCount} transacciones recurrentes programadas que representan un débito automático estimado de $${recurringTotal.toFixed(2)} mensuales.`
      });
    } else {
      insights.push({
        type: 'info',
        title: 'Programa tus facturas fijas',
        description: 'No tienes transacciones recurrentes programadas. Añadir tus facturas fijas (agua, luz, suscripciones) te ayudará a predecir tus egresos del mes.'
      });
    }

    // 4. Progreso de metas de ahorro activas
    const activeGoalsQuery = `
      SELECT COUNT(*) as count, 
             SUM(CASE WHEN current_amount >= target_amount THEN 1 ELSE 0 END) as completed
      FROM savings_goals
    `;
    const goalsResult = await db.query(activeGoalsQuery);
    const goalsCount = parseInt(goalsResult.rows[0].count || 0);
    const completedGoals = parseInt(goalsResult.rows[0].completed || 0);

    if (goalsCount > 0) {
      if (completedGoals > 0) {
        insights.push({
          type: 'success',
          title: '¡Meta de ahorro cumplida!',
          description: `¡Felicidades! Has completado ${completedGoals} de tus ${goalsCount} metas de ahorro programadas.`
        });
      } else {
        insights.push({
          type: 'info',
          title: 'Metas en progreso',
          description: `Estás trabajando activamente en ${goalsCount} metas de ahorro. Mantén el hábito de aportar regularmente para completarlas a tiempo.`
        });
      }
    }

    res.json(insights);
  } catch (error) {
    console.error('Error al obtener patrones de consumo:', error);
    res.status(500).json({ error: 'Error al procesar el análisis de patrones.' });
  }
};

module.exports = {
  getCategoryExpenses,
  getIncomeVsExpense,
  getConsumptionPatterns,
};
