# Banking Web Application Demo

A simple but effective banking web application designed specifically for Selenium automation testing in Java. This application features a complete frontend built with TypeScript and a **backend API with MySQL database persistence**.

## 🎯 Features

- **User Authentication**: Secure login/logout with session management
- **Dashboard**: Overview of accounts and recent transactions
- **Money Transfer**: Internal transfers between checking and savings accounts (saves to database!)
- **Transaction History**: Full transaction history with filtering and pagination
- **Real Database**: All data persists in MySQL database

## 🛠 Tech Stack

### Frontend
- TypeScript (ES2020)
- HTML5 / CSS3
- Vanilla JavaScript (no frameworks)
- HTTP Server for development

### Backend
- Node.js with Express.js
- MySQL 8.0 database
- bcrypt for password hashing
- Session-based authentication

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL 8.0
- npm (comes with Node.js)

## 🗄️ Database Setup

1. Install MySQL 8.0 and start the MySQL service

2. Open MySQL Workbench

3. Create a new connection to `localhost:3306` with your root credentials

4. Execute the schema file:
   - Open `backend/database/schema.sql` in MySQL Workbench
   - Run all statements to create the `bankapp_db` database and tables

5. Execute the seed file:
   - Open `backend/database/seed.sql` in MySQL Workbench
   - Run all statements to insert test data


## ⚙️ Installation

1. **Copy environment variables template and fill in your credentials:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and set your MySQL username, password, and other settings
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Hash the passwords in the database:**
   ```bash
   cd backend
   node utils/hashPasswords.js
   cd ..
   ```

## 🚀 Running the Application

You need **TWO terminal windows** - one for backend, one for frontend:

### Terminal 1: Start Backend API
```bash
cd backend
node server.js
```
✅ Backend will run on: **http://localhost:3000**

### Terminal 2: Start Frontend
```bash
npm run serve
```
✅ Frontend will run on: **http://localhost:8080**


## 🛡️ REST API Endpoints (for Postman)

All endpoints are under `http://localhost:3000/api/`.

**Authentication:**
- `POST /auth/login` — Login (JSON: `{ "username": "john.doe", "password": "welcome_123" }`)
- `POST /auth/logout` — Logout
- `GET /auth/status` — Check session

**User:**
- `GET /users/profile` — Get profile (requires login)
- `PUT /users/profile` — Update profile (JSON: `{ "firstName": "John", ... }`)
- `PUT /users/password` — Change password (JSON: `{ "currentPassword": "welcome_123", "newPassword": "newpass" }`)

**Accounts:**
- `GET /accounts` — List accounts
- `GET /accounts/{accountId}` — Account details

**Transactions:**
- `GET /transactions` — List transactions (query params: accountType, transactionType, dateFrom, dateTo)
- `POST /transactions/transfer` — Transfer money (JSON: `{ "fromAccountId": 1, "toAccountId": 2, "amount": 100, "description": "Transfer to savings" }`)

**Note:**
- Use the session cookie from login for all authenticated requests.

2. **Navigation Testing**
   - Sidebar navigation
   - Quick action buttons
   - Breadcrumb navigation

3. **Form Interactions**
   - Text inputs
   - Dropdowns/Selects
   - Checkboxes
   - Textareas
   - Date inputs

4. **Dynamic Content**
   - Modal dialogs
   - Success/Error messages
   - Loading states
   - Table pagination

5. **Data Validation**
   - Form validation messages
   - Balance verification
   - Transaction filtering
   - Export functionality

## 📁 Project Structure

```
bankapp-demo/
├── src/
│   ├── data.ts           # Mock data and storage utilities
│   ├── login.ts          # Login page logic
│   ├── dashboard.ts      # Dashboard page logic
│   ├── transfer.ts       # Transfer page logic
│   ├── transactions.ts   # Transaction history logic
│   └── profile.ts        # Profile page logic
├── styles/
│   └── main.css          # Application styles
├── dist/                 # Compiled JavaScript (generated)
├── index.html            # Login page
├── dashboard.html        # Dashboard page
├── transfer.html         # Transfer money page
├── transactions.html     # Transaction history page
├── profile.html          # Profile settings page
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development

### Build Commands

```bash
# Build once
npm run build

# Watch mode (auto-rebuild on changes)
npm run watch

# Start development server
npm run serve
```

### Technology Stack

- **TypeScript** - Type-safe JavaScript
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS Grid and Flexbox
- **LocalStorage** - Client-side data persistence


## 🤝 Contributing

This is a demo application designed for testing purposes. Feel free to fork and modify for your testing needs.

---

**Happy Testing! 🚀**
