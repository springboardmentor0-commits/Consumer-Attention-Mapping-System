-- ==========================================================
-- Consumer Attention Mapping System
-- Milestone 1 Database Schema
-- ==========================================================

-- ==========================================================
-- 1. Roles Table
-- ==========================================================

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed Default Roles
INSERT INTO roles (role_name)
VALUES
('Admin'),
('Store Manager'),
('Retail Analyst'),
('Marketing Manager')
ON CONFLICT (role_name) DO NOTHING;

-- ==========================================================
-- 2. Users Table
-- ==========================================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash VARCHAR(255) NOT NULL,

    role_id INTEGER,

    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL
);

-- ==========================================================
-- 3. Stores Table
-- ==========================================================

CREATE TABLE stores (
    id SERIAL PRIMARY KEY,

    store_name VARCHAR(150) NOT NULL,

    location VARCHAR(255) NOT NULL
);

-- ==========================================================
-- 4. Shelves Table
-- ==========================================================
CREATE TABLE shelves (
    id SERIAL PRIMARY KEY,

    store_id INTEGER NOT NULL,

    shelf_name VARCHAR(100) NOT NULL,

    zone_coordinates VARCHAR(50) NOT NULL,

    CONSTRAINT fk_shelf_store
        FOREIGN KEY (store_id)
        REFERENCES stores(id)
        ON DELETE CASCADE
);