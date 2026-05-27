const db = require('../config/database');

// Obtener todas las metas de ahorro con su progreso calculado en tiempo real
const getGoals = async (req, res) => {
  try {
    const query = `
      SELECT *,
             ROUND((current_amount / target_amount) * 100, 2) as progress_percentage
      FROM savings_goals
      ORDER BY deadline ASC, id DESC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener metas de ahorro:', error);
    res.status(500).json({ error: 'Error al obtener las metas de ahorro.' });
  }
};

// Crear una nueva meta de ahorro
const createGoal = async (req, res) => {
  const { name, target_amount, deadline } = req.body;

  if (!name || !target_amount || !deadline) {
    return res.status(400).json({ error: 'Nombre, monto objetivo y fecha límite son requeridos.' });
  }

  try {
    const query = `
      INSERT INTO savings_goals (name, target_amount, current_amount, deadline)
      VALUES ($1, $2, 0.00, $3)
      RETURNING *, 0.00 as progress_percentage
    `;
    const { rows } = await db.query(query, [name, target_amount, deadline]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error al crear meta de ahorro:', error);
    res.status(500).json({ error: 'Error al registrar la meta de ahorro.' });
  }
};

// Registrar un aporte/depósito a una meta
const addDeposit = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'El monto del depósito debe ser mayor a cero.' });
  }

  // Usar una transacción SQL para asegurar consistencia
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verificar si la meta existe
    const goalResult = await client.query('SELECT * FROM savings_goals WHERE id = $1', [id]);
    if (goalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Meta de ahorro no encontrada.' });
    }
    const goal = goalResult.rows[0];

    // 2. Insertar en la tabla de depósitos
    await client.query(
      'INSERT INTO savings_deposits (goal_id, amount) VALUES ($1, $2)',
      [id, amount]
    );

    // 3. Actualizar el saldo actual de la meta
    const updateGoalResult = await client.query(
      `UPDATE savings_goals 
       SET current_amount = current_amount + $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *, ROUND(((current_amount + $1) / target_amount) * 100, 2) as progress_percentage`,
      [amount, id]
    );

    // 4. Buscar la categoría "Otros" o registrar la transacción de egreso para reflejar el débito en la cuenta
    const catResult = await client.query("SELECT id FROM categories WHERE name = 'Otros'");
    const categoryId = catResult.rows.length > 0 ? catResult.rows[0].id : null;

    await client.query(
      `INSERT INTO transactions (description, amount, type, category_id, date)
       VALUES ($1, $2, 'expense', $3, CURRENT_DATE)`,
      [`Aporte a meta: ${goal.name}`, amount, categoryId]
    );

    await client.query('COMMIT');
    res.json(updateGoalResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar depósito en la meta:', error);
    res.status(500).json({ error: 'Error al registrar el depósito en la meta de ahorro.' });
  } finally {
    client.release();
  }
};

// Eliminar una meta de ahorro
const deleteGoal = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM savings_goals WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Meta de ahorro no encontrada.' });
    }
    res.json({ message: 'Meta de ahorro eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar meta de ahorro:', error);
    res.status(500).json({ error: 'Error al eliminar la meta de ahorro.' });
  }
};

module.exports = {
  getGoals,
  createGoal,
  addDeposit,
  deleteGoal,
};
