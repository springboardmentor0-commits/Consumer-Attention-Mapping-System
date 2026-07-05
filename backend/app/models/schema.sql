-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- Seed the exact roles requested
INSERT INTO roles (role_name) VALUES 
('Admin'), 
('Store Manager'), 
('Retail Analyst'), 
('Marketing Manager')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Users Table with Foreign Key linking to role_id
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER,
    
    CONSTRAINT fk_user_role 
        FOREIGN KEY (role_id) 
        REFERENCES roles(id) 
        ON DELETE SET NULL
);

-- 3. Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL
);

-- 4. Shelves Table with Foreign Key linking to store_id
CREATE TABLE IF NOT EXISTS shelves (
    id SERIAL PRIMARY KEY,
    store_id INTEGER NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    
    CONSTRAINT fk_shelf_store 
        FOREIGN KEY (store_id) 
        REFERENCES stores(id) 
        ON DELETE CASCADE
);