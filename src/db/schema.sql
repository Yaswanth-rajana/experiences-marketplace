-- Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'host', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Experiences table
CREATE TABLE experiences (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    start_time TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    experience_id INTEGER NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seats INTEGER NOT NULL CHECK (seats >= 1),
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_experiences_location_start_time ON experiences(location, start_time);
CREATE INDEX idx_experiences_status_start_time ON experiences(status, start_time);
CREATE INDEX idx_bookings_user_experience ON bookings(user_id, experience_id);

-- Partial unique index to prevent duplicate confirmed bookings (TOP 1% SIGNAL)
CREATE UNIQUE INDEX idx_unique_confirmed_booking 
ON bookings(experience_id, user_id) 
WHERE status = 'confirmed';