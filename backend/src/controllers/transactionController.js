const db = require('../config/database');

// Obtener todas las transacciones ordenadas por fecha descendente
const getTransactions = async (req, res) => {
  try {
    const query = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.date DESC, t.id DESC
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error al obtener las transacciones.' });
  }
};

// Crear una nueva transacción
const createTransaction = async (req, res) => {
  const { description, amount, type, category_id, date } = req.body;

  if (!description || !amount || !type) {
    return res.status(400).json({ error: 'Descripción, monto y tipo son requeridos.' });
  }

  if (type !== 'income' && type !== 'expense') {
    return res.status(400).json({ error: 'El tipo debe ser income (ingreso) o expense (egreso).' });
  }

  try {
    const query = `
      INSERT INTO transactions (description, amount, type, category_id, date)
      VALUES ($1, $2, $3, $4, COALESCE($5, CURRENT_DATE))
      RETURNING *
    `;
    const params = [description, amount, type, category_id || null, date || null];
    const { rows } = await db.query(query);
    
    // Obtener la transacción recién creada con los datos de su categoría para la UI
    const fetchCreatedQuery = `
      SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1
    `;
    const createdTx = await db.query(fetchCreatedQuery, [rows[0].id]);
    
    res.status(201).json(createdTx.rows[0]);
  } catch (error) {
    console.error('Error al crear transacción:', error);
    res.status(500).json({ error: 'Error al registrar la transacción.' });
  }
};

// Eliminar una transacción
const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM transactions WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada.' });
    }
    res.json({ message: 'Transacción eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar transacción:', error);
    res.status(500).json({ error: 'Error al eliminar la transacción.' });
  }
};

// Obtener todas las categorías disponibles
const getCategories = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener las categorías.' });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  deleteTransaction,
  getCategories,
};
