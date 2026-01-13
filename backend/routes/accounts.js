const express = require('express');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get all accounts for current user
router.get('/', requireAuth, async (req, res) => {
    try {
        const [accounts] = await db.query(
            'SELECT account_id, account_type, account_number, balance FROM accounts WHERE user_id = ? AND is_active = TRUE',
            [req.session.userId]
        );

        res.json({
            accounts: accounts.map(acc => ({
                id: acc.account_id.toString(),
                type: acc.account_type,
                accountNumber: acc.account_number,
                balance: parseFloat(acc.balance)
            }))
        });
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

// Get specific account
router.get('/:accountId', requireAuth, async (req, res) => {
    try {
        const [accounts] = await db.query(
            'SELECT account_id, account_type, account_number, balance FROM accounts WHERE account_id = ? AND user_id = ?',
            [req.params.accountId, req.session.userId]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ error: 'Account not found' });
        }

        const acc = accounts[0];
        res.json({
            id: acc.account_id.toString(),
            type: acc.account_type,
            accountNumber: acc.account_number,
            balance: parseFloat(acc.balance)
        });
    } catch (error) {
        console.error('Get account error:', error);
        res.status(500).json({ error: 'Failed to fetch account' });
    }
});

module.exports = router;
