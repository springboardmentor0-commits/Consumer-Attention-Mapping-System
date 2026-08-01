-- app/models/schema.sql

-- =====================================================
-- 1. Extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- =====================================================
-- 2. ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL CHECK (
        role_name IN ('SuperAdmin', 'StoreManager', 'Analyst')
    ),
    description TEXT
);

-- Seed roles
INSERT INTO roles (id, role_name, description) VALUES 
    (1, 'SuperAdmin', 'Full system access'),
    (2, 'StoreManager', 'Store-level access'),
    (3, 'Analyst', 'Read-only analytics')
ON CONFLICT (id) DO NOTHING;


-- =====================================================
-- 3. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- 4. STORES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- 5. SHELVES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS shelves (
    id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    shelf_name VARCHAR(100) NOT NULL,

    -- Keep JSONB for CV geometry (don’t downgrade this)
    zone_coordinates JSONB NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- 6. ATTENTION SESSIONS (Transactional Layer)
-- =====================================================
CREATE TABLE IF NOT EXISTS attention_sessions (
    id SERIAL PRIMARY KEY,
    tracker_id INT NOT NULL,
    store_id INT NOT NULL REFERENCES stores(id) ON DELETE SET NULL,
    shelf_id INT REFERENCES shelves(id) ON DELETE SET NULL,

    entry_time TIMESTAMPTZ NOT NULL,
    exit_time TIMESTAMPTZ NOT NULL,

    dwell_time_seconds DOUBLE PRECISION NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- 7. TIMESERIES (Analytics Layer)
-- =====================================================
CREATE TABLE IF NOT EXISTS shopper_dwell_analytics (
    time TIMESTAMPTZ NOT NULL,

    store_id INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    shelf_id INT REFERENCES shelves(id) ON DELETE SET NULL,

    shopper_id INT NOT NULL,
    dwell_seconds DOUBLE PRECISION NOT NULL
);

-- Convert to hypertable
SELECT create_hypertable(
    'shopper_dwell_analytics',
    'time',
    if_not_exists => TRUE
);

-- =====================================================
-- 8. INDEXES (Because performance matters, shocking)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_shelves_store_id 
ON shelves(store_id);

CREATE INDEX IF NOT EXISTS idx_attention_store_time 
ON attention_sessions(store_id, entry_time DESC);

CREATE INDEX IF NOT EXISTS idx_dwell_store_time 
ON shopper_dwell_analytics(store_id, time DESC);

CREATE INDEX IF NOT EXISTS idx_dwell_shelf 
ON shopper_dwell_analytics(shelf_id);