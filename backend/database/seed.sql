USE bankapp_db;
SET SQL_SAFE_UPDATES = 0;



-- Insert demo users if not exist
INSERT IGNORE INTO users (user_id, username, password, first_name, last_name, email, phone, address) VALUES
	(1, 'john.doe', '$2b$10$placeholder', 'John', 'Doe', 'john.doe@email.com', '555-123-4567', '123 Main Street, Anytown, ST 12345'),
	(2, 'jane.smith', '$2b$10$placeholder', 'Jane', 'Smith', 'jane.smith@email.com', '555-987-6543', '456 Oak Avenue, Somewhere, ST 67890');

-- Insert demo accounts if not exist
INSERT IGNORE INTO accounts (account_id, user_id, account_type, account_number, balance) VALUES
	(1, 1, 'checking', '****1234', 5250.00),
	(2, 1, 'savings', '****5678', 12890.50),
	(3, 1, 'credit', '****9012', -1450.25),
	(4, 2, 'checking', '****3456', 8750.25),
	(5, 2, 'savings', '****7890', 25000.00),
	(6, 2, 'credit', '****1122', -2890.75);

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