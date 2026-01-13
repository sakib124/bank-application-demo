const express = require('express');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all transactions for current user
router.get('/', requireAuth, async (req, res) => {
    try {
        const { accountType, transactionType, dateFrom, dateTo } = req.query;

        let query = `
            SELECT t.transaction_id, t.transaction_date, t.transaction_type, 
                   t.description, t.amount, t.balance_after, t.status,
                   a.account_type
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            WHERE a.user_id = ?
        `;
        const params = [req.session.userId];

        if (accountType && accountType !== 'all') {
            query += ' AND a.account_type = ?';
            params.push(accountType);
        }

        if (transactionType && transactionType !== 'all') {
            query += ' AND t.transaction_type = ?';
            params.push(transactionType);
        }

        if (dateFrom) {
            query += ' AND t.transaction_date >= ?';
            params.push(dateFrom);
        }

        if (dateTo) {
            query += ' AND t.transaction_date <= ?';
            params.push(dateTo);
        }

        query += ' ORDER BY t.transaction_date DESC, t.created_at DESC';

        const [transactions] = await db.query(query, params);

        res.json({
            transactions: transactions.map(txn => ({
                id: txn.transaction_id,
                date: txn.transaction_date.toISOString().split('T')[0],
                account: txn.account_type.charAt(0).toUpperCase() + txn.account_type.slice(1),
                accountType: txn.account_type,
                type: txn.transaction_type,
                description: txn.description,
                amount: parseFloat(txn.amount),
                balance: parseFloat(txn.balance_after),
                status: txn.status || 'completed'
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Create transfer
router.post('/transfer', requireAuth, async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { fromAccountId, toAccountId, amount, description } = req.body;

        console.log('Transfer request:', { fromAccountId, toAccountId, amount, description, userId: req.session.userId });

        if (!fromAccountId || !toAccountId || !amount || amount <= 0) {
            await connection.rollback();
            const missingFields = [];
            if (!fromAccountId) missingFields.push('fromAccountId');
            if (!toAccountId) missingFields.push('toAccountId');
            if (!amount || amount <= 0) missingFields.push('amount');
            console.error('Invalid transfer data:', { fromAccountId, toAccountId, amount, missingFields });
            return res.status(400).json({ error: `Invalid transfer data. Missing or invalid: ${missingFields.join(', ')}` });
        }

        // Verify from account belongs to user
        const [fromAccounts] = await connection.query(
            'SELECT account_id, balance, account_type FROM accounts WHERE account_id = ? AND user_id = ?',
            [fromAccountId, req.session.userId]
        );

        if (fromAccounts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'From account not found' });
        }

        const fromAccount = fromAccounts[0];

        // Check sufficient balance
        if (fromAccount.balance < amount) {
            await connection.rollback();
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Verify to account (either belongs to user or is external)
        const [toAccounts] = await connection.query(
            'SELECT account_id, balance, account_type, user_id FROM accounts WHERE account_id = ?',
            [toAccountId]
        );

        if (toAccounts.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'To account not found' });
        }

        const toAccount = toAccounts[0];

        // Calculate new balances
        const newFromBalance = parseFloat(fromAccount.balance) - parseFloat(amount);
        const newToBalance = parseFloat(toAccount.balance) + parseFloat(amount);

        console.log('Processing transfer:', {
            fromAccount: { id: fromAccountId, oldBalance: fromAccount.balance, newBalance: newFromBalance },
            toAccount: { id: toAccountId, oldBalance: toAccount.balance, newBalance: newToBalance },
            amount: amount
        });

        // Update balances in database
        await connection.query(
            'UPDATE accounts SET balance = ? WHERE account_id = ?',
            [newFromBalance, fromAccountId]
        );

        await connection.query(
            'UPDATE accounts SET balance = ? WHERE account_id = ?',
            [newToBalance, toAccountId]
        );
        
        console.log('Balances updated in database');

        // Get the next transaction ID number
        const [maxIdResult] = await connection.query(
            `SELECT transaction_id FROM transactions 
             WHERE transaction_id REGEXP '^TXN[0-9]+$' 
             ORDER BY CAST(SUBSTRING(transaction_id, 4) AS UNSIGNED) DESC LIMIT 1`
        );
        
        let nextIdNumber = 1;
        if (maxIdResult.length > 0) {
            const maxId = maxIdResult[0].transaction_id;
            const currentNumber = parseInt(maxId.replace('TXN', ''));
            nextIdNumber = currentNumber + 1;
        }
        
        const transactionId1 = `TXN${String(nextIdNumber).padStart(3, '0')}`;
        const transactionId2 = `TXN${String(nextIdNumber + 1).padStart(3, '0')}`;
        
        const transactionDate = new Date().toISOString().split('T')[0];

        // Create transaction records
        // Debit transaction for sender
        await connection.query(
            `INSERT INTO transactions (transaction_id, account_id, transaction_date, transaction_type, 
             description, amount, balance_after, status, related_account_id) 
             VALUES (?, ?, ?, 'transfer', ?, ?, ?, 'completed', ?)`,
            [transactionId1, fromAccountId, transactionDate, 
             description || `Transfer to ${toAccount.account_type}`, 
             -amount, newFromBalance, toAccountId]
        );

        // Credit transaction for recipient
        await connection.query(
            `INSERT INTO transactions (transaction_id, account_id, transaction_date, transaction_type, 
             description, amount, balance_after, status, related_account_id) 
             VALUES (?, ?, ?, 'transfer', ?, ?, ?, 'completed', ?)`,
            [transactionId2, toAccountId, transactionDate,
             description || `Transfer from ${fromAccount.account_type}`, 
             amount, newToBalance, fromAccountId]
        );

        await connection.commit();

        res.json({
            message: 'Transfer completed successfully',
            transaction: {
                id: transactionId1,
                from: fromAccountId,
                to: toAccountId,
                amount: parseFloat(amount),
                newBalance: parseFloat(newFromBalance)
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Transfer error:', error);
        res.status(500).json({ error: 'Transfer failed' });
    } finally {
        connection.release();
    }
});

// (Removed process-pending endpoint and unused helper functions)

module.exports = router;
