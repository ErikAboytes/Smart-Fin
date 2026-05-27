const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración del Pool de conexiones de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'smart_fin',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Función para inicializar la base de datos automáticamente
const initDatabase = async () => {
  try {
    console.log('🔄 Intentando conectar a PostgreSQL e inicializar el esquema...');
    
    // Probar conexión básica
    const client = await pool.connect();
    console.log('✅ Conexión con PostgreSQL establecida correctamente.');
    
    // Leer el archivo de esquema
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // Ejecutar el script del esquema
    await client.query(schemaSql);
    console.log('✅ Esquema de base de datos inicializado / verificado con éxito.');
    
    client.release();
  } catch (error) {
    console.error('❌ Error crítico al inicializar la base de datos:');
    console.error(error.message);
    console.log('⚠️ Asegúrate de que el servidor PostgreSQL esté corriendo y que la base de datos "' + (process.env.DB_NAME || 'smart_fin') + '" exista.');
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  initDatabase,
};
