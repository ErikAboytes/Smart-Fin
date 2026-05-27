const cron = require('node-cron');
const db = require('../config/database');

// Lógica para procesar las transacciones recurrentes de un día específico
const processRecurringForDate = async (dateToProcess = new Date()) => {
  const year = dateToProcess.getFullYear();
  const month = dateToProcess.getMonth() + 1; // 1-indexed
  const day = dateToProcess.getDate();
  
  // Formato YYYY-MM-DD para base de datos
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  console.log(`🕒 [Cron Job] Iniciando procesamiento de transacciones recurrentes para la fecha: ${dateStr}...`);
  
  // Determinar los días del mes actual para manejar meses cortos (ej. Febrero, Abril...)
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  
  // Si es el último día del mes, también procesamos los días "imposibles" del mes
  // Ej: En Febrero 28, procesamos las facturas programadas para los días 28, 29, 30 y 31
  let daysToQuery = [day];
  if (day === lastDayOfMonth) {
    for (let d = day + 1; d <= 31; d++) {
      daysToQuery.push(d);
    }
  }

  try {
    // 1. Obtener todas las plantillas recurrentes activas programadas para estos días
    const selectQuery = `
      SELECT * FROM recurring_transactions 
      WHERE is_active = true 
        AND day_of_month = ANY($1::int[])
    `;
    const { rows: templates } = await db.query(selectQuery, [daysToQuery]);
    
    if (templates.length === 0) {
      console.log(`ℹ️ [Cron Job] No hay transacciones recurrentes programadas para hoy (días buscados: ${daysToQuery.join(', ')}).`);
      return { processed: 0, templatesChecked: 0 };
    }

    let processedCount = 0;
    console.log(`⚙️ [Cron Job] Se encontraron ${templates.length} plantillas activas. Validando procesamiento mensual...`);

    // 2. Iterar y procesar cada plantilla
    for (const template of templates) {
      // Verificar si ya fue procesada en este mes
      if (template.last_processed_date) {
        const lastProcessed = new Date(template.last_processed_date);
        if (
          lastProcessed.getFullYear() === year &&
          lastProcessed.getMonth() + 1 === month
        ) {
          console.log(`⏭️ [Cron Job] La transacción "${template.description}" ya fue procesada este mes (${lastProcessed.toISOString().split('T')[0]}). Omitiendo.`);
          continue;
        }
      }

      // Procesar transacción individual bajo SQL Transaction
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');

        // A. Insertar en transacciones reales
        const insertTxQuery = `
          INSERT INTO transactions (description, amount, type, category_id, date)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `;
        await client.query(insertTxQuery, [
          `[Recurrente] ${template.description}`,
          template.amount,
          template.type,
          template.category_id,
          dateStr
        ]);

        // B. Actualizar fecha de último procesamiento en la plantilla
        const updateTemplateQuery = `
          UPDATE recurring_transactions 
          SET last_processed_date = $1 
          WHERE id = $2
        `;
        await client.query(updateTemplateQuery, [dateStr, template.id]);

        // C. Registrar log de éxito
        const insertLogQuery = `
          INSERT INTO recurring_logs (recurring_id, processed_date, status, details)
          VALUES ($1, $2, 'success', 'Procesado automáticamente por el sistema de Cron Jobs.')
        `;
        await client.query(insertLogQuery, [template.id, dateStr]);

        await client.query('COMMIT');
        processedCount++;
        console.log(`✅ [Cron Job] Procesada con éxito: "${template.description}" ($${template.amount})`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ [Cron Job] Error al procesar plantilla ID ${template.id}:`, err.message);
        
        // Registrar log de error
        try {
          await db.query(`
            INSERT INTO recurring_logs (recurring_id, processed_date, status, details)
            VALUES ($1, $2, 'failed', $3)
          `, [template.id, dateStr, `Error: ${err.message}`]);
        } catch (logErr) {
          console.error(`❌ [Cron Job] No se pudo escribir log de falla en DB:`, logErr.message);
        }
      } finally {
        client.release();
      }
    }

    console.log(`🏁 [Cron Job] Proceso diario finalizado. Se registraron ${processedCount} transacciones.`);
    return { processed: processedCount, templatesChecked: templates.length };
  } catch (error) {
    console.error('❌ [Cron Job] Error crítico en el servicio de procesamiento:', error);
    throw error;
  }
};

// Configurar y arrancar el Cron Job
const startCronJob = () => {
  // Ejecutar a las 12:00 AM (medianoche) todos los días
  cron.schedule('0 0 * * *', async () => {
    try {
      await processRecurringForDate();
    } catch (err) {
      console.error('[Cron Job] Error crítico en la tarea automatizada diaria:', err);
    }
  });
  
  console.log('🤖 [Cron Job] Servicio de transacciones recurrentes programado para ejecutarse a la medianoche (0 0 * * *).');
  
  // Ejecutar inmediatamente al arrancar el servidor en segundo plano
  // para verificar si hay transacciones pendientes de hoy que no se hayan corrido por caídas del servidor.
  setTimeout(async () => {
    console.log('⚡ [Cron Job] Ejecución inicial de verificación tras arranque de servidor...');
    try {
      await processRecurringForDate();
    } catch (err) {
      console.error('[Cron Job] Error en verificación inicial tras arranque:', err);
    }
  }, 5000);
};

module.exports = {
  startCronJob,
  processRecurringForDate,
};
