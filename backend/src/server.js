const app = require('./app');
const { initDatabase } = require('./config/database');
const { startCronJob } = require('./services/cronService');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Inicializar y verificar base de datos
    await initDatabase();

    // 2. Iniciar el servicio de Cron Jobs para transacciones recurrentes
    startCronJob();

    // 3. Levantar el servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 Servidor backend de Smart Fin corriendo en http://localhost:${PORT}`);
      console.log(`🩺 Endpoint de salud disponible en http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Falló el arranque del servidor:', error);
    process.exit(1);
  }
};

startServer();
