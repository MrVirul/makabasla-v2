-- PostgreSQL Database Setup for Microservices
-- Run this script to create all required databases

-- Connect to PostgreSQL as superuser
-- psql -U postgres

-- Create databases for microservices
CREATE DATABASE userdb;
CREATE DATABASE orderdb;
CREATE DATABASE billingdb;
CREATE DATABASE iamdb;

-- Grant privileges (optional, adjust username as needed)
-- GRANT ALL PRIVILEGES ON DATABASE userdb TO your_username;
-- GRANT ALL PRIVILEGES ON DATABASE orderdb TO your_username;
-- GRANT ALL PRIVILEGES ON DATABASE billingdb TO your_username;
-- GRANT ALL PRIVILEGES ON DATABASE iamdb TO your_username;

-- List databases to verify
\l

-- Info
SELECT 'Databases created successfully!' as status;
SELECT 'Run the following commands to verify:' as info;
SELECT '\c userdb' as command UNION ALL
SELECT '\dt' UNION ALL
SELECT '\c orderdb' UNION ALL
SELECT '\dt';
