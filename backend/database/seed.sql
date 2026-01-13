USE bankapp_db;
SET SQL_SAFE_UPDATES = 0;

-- Ensure required tables exist
CREATE TABLE IF NOT EXISTS users (
	user_id INT PRIMARY KEY AUTO_INCREMENT,
	username VARCHAR(50) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL,
	first_name VARCHAR(50) NOT NULL,
	last_name VARCHAR(50) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	phone VARCHAR(20),
	address TEXT,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	is_active BOOLEAN DEFAULT TRUE,
	INDEX idx_username (username),
	INDEX idx_email (email)
);

CREATE TABLE IF NOT EXISTS accounts (
	account_id INT PRIMARY KEY AUTO_INCREMENT,
	user_id INT NOT NULL,
	account_type ENUM('checking', 'savings', 'credit') NOT NULL,
	account_number VARCHAR(20) NOT NULL UNIQUE,
	balance DECIMAL(12, 2) DEFAULT 0.00,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	is_active BOOLEAN DEFAULT TRUE,
	FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
	INDEX idx_user_id (user_id),
	INDEX idx_account_number (account_number)
);

CREATE TABLE IF NOT EXISTS transactions (
	transaction_id VARCHAR(20) PRIMARY KEY,
	account_id INT NOT NULL,
	transaction_date DATE NOT NULL,
	transaction_type ENUM('deposit', 'withdrawal', 'transfer', 'payment') NOT NULL,
	description VARCHAR(255) NOT NULL,
	amount DECIMAL(12, 2) NOT NULL,
	balance_after DECIMAL(12, 2) NOT NULL,
	status ENUM('completed', 'pending', 'failed') DEFAULT 'completed',
	related_account_id INT NULL,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
	FOREIGN KEY (related_account_id) REFERENCES accounts(account_id) ON DELETE SET NULL,
	INDEX idx_account_id (account_id),
	INDEX idx_transaction_date (transaction_date),
	INDEX idx_transaction_type (transaction_type),
	INDEX idx_status (status)
);

DELETE FROM transactions WHERE transaction_id LIKE 'TXN%';

-- Reset account balances to match seeded transactions
UPDATE accounts SET balance = 5250.00 WHERE account_id = 1; -- john.doe checking
UPDATE accounts SET balance = 12890.50 WHERE account_id = 2; -- john.doe savings
UPDATE accounts SET balance = -1450.25 WHERE account_id = 3; -- john.doe credit
UPDATE accounts SET balance = 8750.25 WHERE account_id = 4; -- jane.smith checking
UPDATE accounts SET balance = 25000.00 WHERE account_id = 5; -- jane.smith savings
UPDATE accounts SET balance = -2890.75 WHERE account_id = 6; -- jane.smith credit

INSERT INTO transactions (transaction_id, account_id, transaction_date, transaction_type, description, amount, balance_after, status) VALUES
('TXN001', 1, '2026-01-10', 'deposit', 'Salary Deposit', 3500.00, 5250.00, 'completed'),
('TXN002', 1, '2026-01-09', 'withdrawal', 'ATM Withdrawal', -200.00, 1750.00, 'completed'),
('TXN003', 1, '2026-01-08', 'payment', 'Electric Bill Payment', -125.50, 1950.00, 'completed'),
('TXN005', 1, '2026-01-07', 'transfer', 'Transfer to Savings', -500.00, 2075.50, 'completed'),
('TXN007', 1, '2026-01-05', 'payment', 'Restaurant', -65.00, 2575.50, 'completed'),
('TXN008', 1, '2026-01-04', 'payment', 'Gas Station', -45.20, 2640.50, 'completed'),
('TXN010', 1, '2026-01-02', 'payment', 'Grocery Store', -156.78, 2685.70, 'completed');

-- Insert transactions for john.doe's savings account (account_id=2)
INSERT INTO transactions (transaction_id, account_id, transaction_date, transaction_type, description, amount, balance_after, status) VALUES
('TXN004', 2, '2026-01-07', 'deposit', 'Transfer from Checking', 500.00, 12890.50, 'completed'),
('TXN009', 2, '2026-01-03', 'deposit', 'Interest Credit', 15.25, 12390.50, 'completed');

-- Insert transactions for john.doe's credit account (account_id=3)
INSERT INTO transactions (transaction_id, account_id, transaction_date, transaction_type, description, amount, balance_after, status) VALUES
('TXN006', 3, '2026-01-06', 'payment', 'Online Purchase - Amazon', -89.99, -1450.25, 'completed');

-- Insert transactions for jane.smith's checking account (account_id=4)
INSERT INTO transactions (transaction_id, account_id, transaction_date, transaction_type, description, amount, balance_after, status) VALUES
('TXN101', 4, '2026-01-11', 'deposit', 'Payroll Direct Deposit', 4200.00, 8750.25, 'completed'),
('TXN102', 4, '2026-01-09', 'payment', 'Rent Payment', -1500.00, 4550.25, 'completed'),
('TXN103', 4, '2026-01-08', 'withdrawal', 'ATM Cash', -100.00, 6050.25, 'completed'),
('TXN104', 4, '2026-01-07', 'payment', 'Utilities', -250.75, 6150.25, 'completed'),
('TXN105', 4, '2026-01-05', 'transfer', 'Transfer to Savings', -1000.00, 6401.00, 'completed');

-- Insert transactions for jane.smith's savings account (account_id=5)
INSERT INTO transactions (transaction_id, account_id, transaction_date, transaction_type, description, amount, balance_after, status) VALUES
('TXN106', 5, '2026-01-10', 'deposit', 'Interest', 25.00, 25000.00, 'completed'),
('TXN107', 5, '2026-01-05', 'deposit', 'Transfer from Checking', 1000.00, 24975.00, 'completed');

-- Insert transactions for jane.smith's credit account (account_id=6)
INSERT INTO transactions (transaction_id, account_id, transaction_date, transaction_type, description, amount, balance_after, status) VALUES
('TXN108', 6, '2026-01-10', 'payment', 'Shopping - Mall', -150.50, -2890.75, 'completed'),
('TXN109', 6, '2026-01-08', 'payment', 'Restaurant', -89.25, -2740.25, 'completed'),
('TXN110', 6, '2026-01-06', 'payment', 'Gas Station', -45.00, -2651.00, 'completed');

SELECT 'Transactions table reset to default demo data.' as next_step;