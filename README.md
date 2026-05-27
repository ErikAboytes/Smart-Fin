# 💎 Smart Fin - Personal Finance Tracker Premium

**Smart Fin** es una plataforma premium y moderna para el control inteligente de finanzas personales. Diseñada bajo un enfoque minimalista, interactivo y responsivo, permite a los usuarios gestionar sus balances, visualizar reportes en tiempo real, programar egresos o ingresos recurrentes mediante un sistema de tareas programadas (Cron Jobs) y cumplir metas de ahorro con barras de progreso interactivas.

---

## 🚀 Características Críticas Implementadas

1. **📊 Reportes Visuales Interactivos (Recharts):**
   - **Gráfico de Pastel (Donut):** Muestra el desglose porcentual y monetario de gastos por categoría del mes actual.
   - **Gráfico de Barras Histórico:** Comparativa de Ingresos vs. Egresos agrupada por mes (últimos 6 meses).
   - **💡 Insights Inteligentes de Consumo:** Análisis automatizado en base a tu actividad financiera que te notifica sobre tu tasa de ahorro, gastos fijos, categorías sobregiradas y metas completadas.

2. **🎯 Gestión de Metas de Ahorro:**
   - Creación de objetivos financieros con nombre, monto y fecha límite.
   - Barra de progreso visual con transiciones dinámicas que calcula el porcentaje acumulado en tiempo real.
   - **Aportaciones Directas (Depósitos):** Inyección de fondos directa que incrementa el saldo de la meta y registra la contabilidad como egreso especial automático en el monedero principal para un control exacto.

3. **📅 Transacciones Recurrentes Automatizadas (Node-Cron):**
   - Plantillas de transacciones programadas (agua, luz, arriendo, salarios, suscripciones de streaming).
   - Un **Cron Job en segundo plano** que se ejecuta diariamente a la medianoche (`0 0 * * *`) buscando las plantillas activas del día, registrando el movimiento contable y guardando una bitácora técnica de ejecuciones exitosas o fallidas.
   - **Simulador de Cron Integrado:** Panel para desarrollador que permite forzar la ejecución del cron en una fecha simulada específica para pruebas instantáneas.

---

## 🛠️ Stack Tecnológico

- **Frontend:** React.js, Tailwind CSS (Aesthetics Premium & Responsive), Recharts (Visual Analytics), Lucide React (Icons), Vite.
- **Backend:** Node.js, Express.js (Rest API), Node-Cron (Background scheduler).
- **Base de Datos:** PostgreSQL (Relational Database) usando `pg` pool.

---

## 📂 Estructura del Proyecto

```
Smart Fin/
├── backend/                  # Servidor de API y Cron Jobs
│   ├── src/
│   │   ├── config/           # Conexión PG y bootstraper de base de datos
│   │   ├── controllers/      # Controladores REST
│   │   ├── database/         # Script de definición SQL (schema.sql)
│   │   ├── routes/           # Mapeo de rutas HTTP
│   │   └── services/         # Servicio del Cron Job de recurrentes
│   ├── .env.example          # Plantilla de variables de entorno
│   ├── package.json          # Script y dependencias del backend
│   └── server.js             # Entrada del backend
├── frontend/                 # Interfaz de Usuario
│   ├── src/
│   │   ├── components/       # Componentes React (Dashboard, Reports, Goals, Recurring)
│   │   ├── context/          # Estado global y notificaciones (FinanceContext)
│   │   ├── services/         # Cliente HTTP API
│   │   ├── App.jsx           # Ruteador y maquetación visual
│   │   └── index.css         # Estilos Tailwind y efectos de vidrio
│   ├── index.html
│   ├── tailwind.config.js    # Configuración de colores y animaciones
│   └── package.json          # Script y dependencias del cliente React
└── README.md                 # Documentación General (Este archivo)
```

---

## ⚙️ Instrucciones de Instalación y Configuración

### 1. Requisitos Previos
- **Node.js** v18 o superior.
- **PostgreSQL** corriendo localmente o en la nube.

---

### 2. Configurar la Base de Datos
1. Abre tu terminal de PostgreSQL (`psql` o mediante pgAdmin).
2. Crea una base de datos nueva llamada `smart_fin`:
   ```sql
   CREATE DATABASE smart_fin;
   ```
> 💡 *Nota: No es necesario ejecutar tablas manualmente. El servidor backend de Smart Fin leerá automáticamente el archivo `schema.sql` al arrancar e inicializará las tablas y categorías base de manera automática.*

---

### 3. Instalación e Inicio del Backend
1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno creando un archivo `.env` basado en el `.env.example`:
   ```env
   PORT=5000
   DB_USER=tu_usuario_postgres
   DB_HOST=localhost
   DB_NAME=smart_fin
   DB_PASSWORD=tu_contraseña_postgres
   DB_PORT=5432
   ```
4. Arranca el backend en modo de desarrollo:
   ```bash
   npm run dev
   ```
   *(El servidor correrá en `http://localhost:5000`)*

---

### 4. Instalación e Inicio del Frontend
1. Navega a la carpeta del frontend (desde la raíz del proyecto):
   ```bash
   cd frontend
   ```
2. Instala las dependencias de React:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   *(La aplicación web estará disponible en `http://localhost:3000`)*

---

## 🔬 ¿Cómo verificar y probar las funcionalidades?

1. **Registrar movimientos:** Rellena el formulario "Registrar Transacción" en el panel principal para ingresar ingresos o gastos. Al instante verás que el saldo disponible, ingresos y egresos de las tarjetas superiores se actualizan reactivamente.
2. **Consultar Reportes:** Navega a la pestaña **"Reportes y Gráficos"**. Verás el desglose de gastos en un gráfico de donut interactivo, la evolución temporal en barras y un listado de **Insights** inteligentes que te alertarán sobre tu comportamiento.
3. **Metas de Ahorro:** Crea una meta de ahorro en **"Metas de Ahorro"**, por ejemplo, "Vacaciones" con objetivo de $5,000. Presiona el botón "Hacer Aporte" en su tarjeta, inyecta $1,500 y observa cómo la barra de progreso se llena con una animación. Revisa el historial de transacciones en la primera pestaña y notarás un gasto de egreso contable de tipo *Aporte a meta: Vacaciones*.
4. **Cron Job e Historial Recurrente:**
   - Ve a **"Pagos Recurrentes"**, agenda una suscripción (Ej: "Netflix", monto $200, categoría "Suscripciones" y asigna el día del mes correspondiente a **hoy**).
   - En el banner superior **"Panel de Verificación Técnica"**, selecciona la fecha de hoy y presiona **"Simular"**.
   - El sistema ejecutará el cron en segundo plano de inmediato.
   - En el lado derecho aparecerá un log en verde indicando `ÉXITO` y la transacción se registrará automáticamente en tu historial de movimientos principales.
