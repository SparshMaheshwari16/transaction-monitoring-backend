-- Step 1: Create the database
CREATE DATABASE transactions_db;

-- Connect to the new database
\c transactions_db;

-- Step 2: Create ENUM types
CREATE TYPE sex_enum AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE flag_enum AS ENUM ('Low', 'Medium', 'High');

CREATE TYPE origination_enum AS ENUM (
    'Online', 'Mobile', 'ATM', 'Branch', 'POS',
    'Call Center', 'SWIFT', 'ACH', 'International', 'Domestic',
    'System Generated', 'Crypto Wallet'
);

-- Step 3: Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    name VARCHAR(100) NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    risk_score NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (risk_score >= 0.00 AND risk_score <= 99.99)
);
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    condition TEXT NOT NULL, -- SQL-style WHERE clause (e.g., "trans_amt > 500000 AND age < 25")
    flag_level flag_enum NOT NULL, -- Enum: 'Low', 'Medium', 'High'
    risk_increment NUMERIC(4,2) NOT NULL CHECK (risk_increment >= 0 AND risk_increment <= 99.99),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create the transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    age SMALLINT NOT NULL CHECK (age > 0),
    trans_amt INTEGER NOT NULL CHECK (trans_amt > 0),
    new_trans BOOLEAN NOT NULL DEFAULT TRUE,
    sex sex_enum NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    -- type VARCHAR(100) NOT NULL,
    receiver_id UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    occupation VARCHAR(100),
    balance INTEGER NOT NULL DEFAULT 0,
    origination origination_enum NOT NULL,
    cross_border BOOLEAN NOT NULL DEFAULT FALSE,
    transaction_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- risk_score NUMERIC(4,2) NOT NULL DEFAULT 0.00 CHECK (risk_score >= 0.00 AND risk_score <= 99.99),
    pep_status BOOLEAN NOT NULL DEFAULT FALSE,
    flag flag_enum DEFAULT NULL,

    flagged_by_rule UUID REFERENCES rules(id) ON DELETE SET NULL ON UPDATE CASCADE,
);


CREATE TABLE user_transaction_summary (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    
    sum_15d NUMERIC(12,2) NOT NULL DEFAULT 0,
    sum_30d NUMERIC(12,2) NOT NULL DEFAULT 0,
    sum_60d NUMERIC(12,2) NOT NULL DEFAULT 0,
    sum_90d NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    avg_15d NUMERIC(12,2) NOT NULL DEFAULT 0,
    avg_30d NUMERIC(12,2) NOT NULL DEFAULT 0,
    avg_60d NUMERIC(12,2) NOT NULL DEFAULT 0,
    avg_90d NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    trans_count_15d INT NOT NULL DEFAULT 0,
    trans_count_30d INT NOT NULL DEFAULT 0,
    trans_count_60d INT NOT NULL DEFAULT 0,
    trans_count_90d INT NOT NULL DEFAULT 0,
    
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
