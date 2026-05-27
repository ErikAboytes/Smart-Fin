const db = require('../config/database');

// Obtener todas las transacciones recurrentes programadas
const getRecurring = async (req, res) => {
  try {
    const query = `
      SELECT r.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM recurring_transactions r
      LEFT JOIN categories c ON r.category_id = c.id
      ORDER BY r.day_of_month ASC, r.id DESC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener transacciones recurrentes:', error);
    res.status(500).json({ error: 'Error al obtener transacciones recurrentes.' });
  }
};

// Crear una nueva plantilla de transacción recurrente
const createRecurring = async (req, res) => {
  const { description, amount, type, category_id, day_of_month } = req.body;

  if (!description || !amount || !type || !day_of_month) {
    return res.status(400).json({ error: 'Descripción, monto, tipo y día del mes son requeridos.' });
  }

  const day = parseInt(day_of_month);
  if (day < 1 || day > 31) {
    return res.status(400).json({ error: 'El día del mes debe estar entre 1 y 31.' });
  }

  try {
    const query = `
      INSERT INTO recurring_transactions (description, amount, type, category_id, day_of_month)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await db.query(query, [description, amount, type, category_id || null, day]);
    
    const fetchCreatedQuery = `
      SELECT r.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM recurring_transactions r
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.id = $1
    `;
    const createdRec = await db.query(fetchCreatedQuery, [rows[0].id]);

    res.status(201).json(createdRec.rows[0]);
  } catch (error) {
    console.error('Error al crear transacción recurrente:', error);
    res.status(500).json({ error: 'Error al programar la transacción recurrente.' });
  }
};

// Activar o desactivar una transacción recurrente
const toggleRecurring = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (is_active === undefined) {
    return res.status(400).json({ error: 'El campo is_active es requerido.' });
  }

  try {
    const query = `
      UPDATE recurring_transactions 
      SET is_active = $1 
      WHERE id = $2 
      RETURNING *
    `;
    const { rows } = await db.query(query, [is_active, id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transacción recurrente no encontrada.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al actualizar transacción recurrente:', error);
    res.status(500).json({ error: 'Error al actualizar el estado de la transacción.' });
  }
};

// Eliminar una transacción recurrente
const deleteRecurring = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM recurring_transactions WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Transacción recurrente no encontrada.' });
    }
    res.json({ message: 'Transacción recurrente eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar transacción recurrente:', error);
    res.status(500).json({ error: 'Error al eliminar la transacción programada.' });
  }
};

// Obtener historial de ejecuciones (logs)
const getRecurringLogs = async (req, res) => {
  try {
    const query = `
      SELECT rl.*, r.description as recurring_description
      FROM recurring_logs rl
      JOIN recurring_transactions r ON rl.recurring_id = r.id
      ORDER BY rl.created_at DESC
      LIMIT 20
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener logs de recurrentes:', error);
    res.status(500).json({ error: 'Error al obtener el historial de ejecuciones.' });
  }
};

module.exports = {
  getRecurring,
  createRecurring,
  toggleRecurring,
  deleteRecurring,
  getRecurringLogs,
};
