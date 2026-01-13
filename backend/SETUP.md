# Backend API Setup Guide

## Prerequisites

1. **MySQL** installed and running
2. **Node.js** (v16 or higher)
3. **npm**

## Step-by-Step Setup

### 1. Install MySQL (if not installed)

**Windows:**
- Download from: https://dev.mysql.com/downloads/installer/
- Install MySQL Server
- Remember the root password you set during installation

### 2. Create Database and Tables

Open MySQL command line or MySQL Workbench:

```bash
mysql -u root -p
```

Then run the schema file:

```sql
source c:/Users/Sakib/OneDrive/Documents/bankapp-demo/backend/database/schema.sql
```

Or copy-paste the contents of `backend/database/schema.sql` into MySQL Workbench and execute.

### 3. Insert Test Data

```sql
source c:/Users/Sakib/OneDrive/Documents/bankapp-demo/backend/database/seed.sql
```

Or copy-paste contents of `backend/database/seed.sql`

### 4. Configure Environment

Create `.env` file in backend directory:

```bash
cd backend
copy .env.example .env
```

Edit `.env` with your MySQL credentials:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=bankapp_db
DB_PORT=3306

PORT=3000
SESSION_SECRET=change_this_to_random_string
```

### 5. Install Backend Dependencies

```bash
cd backend
npm install
```

### 6. Hash Passwords

Run the password hashing utility:

```bash
node utils/hashPasswords.js
```

This will hash the passwords in the database.

### 7. Start Backend Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

You should see:
```
🚀 Banking API server running on http://localhost:3000
📊 Health check: http://localhost:3000/api/health
```

### 8. Test the API

Open browser or use curl:

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"OK","message":"Banking API is running"}`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Update password

### Accounts
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get specific account

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `POST /api/transactions/transfer` - Create transfer

## Testing with Postman/curl

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"john.doe\",\"password\":\"welcome_123\"}"
```

### Get Accounts (requires login session)
```bash
curl http://localhost:3000/api/accounts \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

## Troubleshooting

### Database Connection Error
- Check MySQL is running: `net start MySQL80` (Windows)
- Verify credentials in `.env`
- Check port 3306 is not blocked

### Session/CORS Issues
- Make sure frontend runs on `http://localhost:8080`
- Backend runs on `http://localhost:3000`
- Clear browser cookies if needed

### Module Not Found
```bash
cd backend
npm install
```

## Next Steps

After backend is running:
1. Update frontend TypeScript files to call API instead of mock data
2. Test login flow
3. Test transfers
4. Run Selenium tests

## Database Verification

Check if data was inserted correctly:

```sql
USE bankapp_db;

-- Check users
SELECT * FROM users;

-- Check accounts
SELECT * FROM accounts;

-- Check transactions
SELECT * FROM transactions;
```

You should see 2 users, 6 accounts (3 per user), and 10 transactions.
