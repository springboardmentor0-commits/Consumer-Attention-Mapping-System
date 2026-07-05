-- backend/app/models/migration.sql

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Users Table with Explicit Foreign Key Definition
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
   
    CONSTRAINT fk_user_role 
        FOREIGN KEY (role_id) 
        REFERENCES roles(id) 
        ON DELETE SET NULL
);

-- 3. Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Shelves Table with Explicit Foreign Key Definition
CREATE TABLE IF NOT EXISTS shelves (
    id SERIAL PRIMARY KEY,
    store_id UUID NOT NULL,
    shelf_name VARCHAR(100) NOT NULL,
    zone_coordinates INT[][] NOT NULL,
    
    CONSTRAINT fk_shelf_store 
        FOREIGN KEY (store_id) 
        REFERENCES stores(id) 
        ON DELETE CASCADE
);