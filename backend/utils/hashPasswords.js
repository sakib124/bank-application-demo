const bcrypt = require('bcrypt');
const db = require('../config/database');

async function hashPasswords() {
    try {
        // Hash passwords
        const hash1 = await bcrypt.hash('welcome_123', 10);
        const hash2 = await bcrypt.hash('welcome_456', 10);

        console.log('Hashed password for john.doe:', hash1);
        console.log('Hashed password for jane.smith:', hash2);

        // Update users
        await db.query('UPDATE users SET password = ? WHERE username = ?', [hash1, 'john.doe']);
        await db.query('UPDATE users SET password = ? WHERE username = ?', [hash2, 'jane.smith']);

        console.log('✓ Passwords updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

hashPasswords();
