-- Configuración de la base de datos de Smart Fin

-- 1. Crear tipo enumerado para tipo de transacción
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('income', 'expense');
    END IF;
END
$$;

-- 2. Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL, -- Hexadecimal color
    icon VARCHAR(30) NOT NULL  -- Icon name for UI (Lucide icon)
);

-- 3. Tabla de Transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type transaction_type NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Metas de Ahorro
CREATE TABLE IF NOT EXISTS savings_goals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    deadline DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Historial de Depósitos a Metas de Ahorro
CREATE TABLE IF NOT EXISTS savings_deposits (
    id SERIAL PRIMARY KEY,
    goal_id INTEGER REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Plantillas de Transacciones Recurrentes
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type transaction_type NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    day_of_month INTEGER NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
    last_processed_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Historial del Cron Job de transacciones recurrentes
CREATE TABLE IF NOT EXISTS recurring_logs (
    id SERIAL PRIMARY KEY,
    recurring_id INTEGER REFERENCES recurring_transactions(id) ON DELETE CASCADE,
    processed_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'success', 'failed'
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SEEDERS: Insertar categorías base por defecto
INSERT INTO categories (name, color, icon) VALUES
('Salario', '#10b981', 'Briefcase'),       -- Verde Esmeralda (Ingreso)
('Inversiones', '#3b82f6', 'TrendingUp'),  -- Azul (Ingreso)
('Vivienda', '#6366f1', 'Home'),           -- Indigo (Egreso)
('Comida', '#f59e0b', 'Utensils'),         -- Ambar (Egreso)
('Transporte', '#14b8a6', 'Car'),          -- Turquesa (Egreso)
('Servicios', '#ef4444', 'Zap'),            -- Rojo (Egreso)
('Suscripciones', '#ec4899', 'Tv'),        -- Rosa (Egreso)
('Entretenimiento', '#8b5cf6', 'Gamepad2'),-- Violeta (Egreso)
('Salud', '#06b6d4', 'HeartPulse'),        -- Cian (Egreso)
('Educación', '#a855f7', 'GraduationCap'), -- Purpura (Egreso)
('Otros', '#64748b', 'HelpCircle')         -- Pizarra (Egreso)
ON CONFLICT (name) DO NOTHING;
