// User data type definitions
export interface User {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    accounts: Account[];
}

export interface Account {
    id: string;
    type: 'checking' | 'savings' | 'credit';
    accountNumber: string;
    balance: number;
}

export interface Transaction {
    id: string;
    date: string;
    account: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
    description: string;
    amount: number;
    balance: number;
    status: 'completed' | 'pending' | 'failed';
}

// Mock user database
export const USERS: Record<string, { password: string; data: User }> = {
    'john.doe': {
        password: 'welcome_123',
        data: {
            username: 'john.doe',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            phone: '555-123-4567',
            address: '123 Main Street, Anytown, ST 12345',
            accounts: [
                { id: '1', type: 'checking', accountNumber: '****1234', balance: 5250.00 },
                { id: '2', type: 'savings', accountNumber: '****5678', balance: 12890.50 },
                { id: '3', type: 'credit', accountNumber: '****9012', balance: -1450.25 }
            ]
        }
    },
    'jane.smith': {
        password: 'welcome_456',
        data: {
            username: 'jane.smith',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@email.com',
            phone: '555-987-6543',
            address: '456 Oak Avenue, Somewhere, ST 67890',
            accounts: [
                { id: '1', type: 'checking', accountNumber: '****3456', balance: 8750.25 },
                { id: '2', type: 'savings', accountNumber: '****7890', balance: 25000.00 },
                { id: '3', type: 'credit', accountNumber: '****1122', balance: -2890.75 }
            ]
        }
    }
};

// Mock transactions
export const TRANSACTIONS: Transaction[] = [
    {
        id: 'TXN001',
        date: '2026-01-10',
        account: 'Checking',
        type: 'deposit',
        description: 'Salary Deposit',
        amount: 3500.00,
        balance: 5250.00,
        status: 'completed'
    },
    {
        id: 'TXN002',
        date: '2026-01-09',
        account: 'Checking',
        type: 'withdrawal',
        description: 'ATM Withdrawal',
        amount: -200.00,
        balance: 1750.00,
        status: 'completed'
    },
    {
        id: 'TXN003',
        date: '2026-01-08',
        account: 'Checking',
        type: 'payment',
        description: 'Electric Bill Payment',
        amount: -125.50,
        balance: 1950.00,
        status: 'completed'
    },
    {
        id: 'TXN004',
        date: '2026-01-07',
        account: 'Savings',
        type: 'deposit',
        description: 'Transfer from Checking',
        amount: 500.00,
        balance: 12890.50,
        status: 'completed'
    },
    {
        id: 'TXN005',
        date: '2026-01-07',
        account: 'Checking',
        type: 'transfer',
        description: 'Transfer to Savings',
        amount: -500.00,
        balance: 2075.50,
        status: 'completed'
    },
    {
        id: 'TXN006',
        date: '2026-01-06',
        account: 'Credit',
        type: 'payment',
        description: 'Online Purchase - Amazon',
        amount: -89.99,
        balance: -1450.25,
        status: 'completed'
    },
    {
        id: 'TXN007',
        date: '2026-01-05',
        account: 'Checking',
        type: 'payment',
        description: 'Restaurant',
        amount: -65.00,
        balance: 2575.50,
        status: 'completed'
    },
    {
        id: 'TXN008',
        date: '2026-01-04',
        account: 'Checking',
        type: 'payment',
        description: 'Gas Station',
        amount: -45.20,
        balance: 2640.50,
        status: 'completed'
    },
    {
        id: 'TXN009',
        date: '2026-01-03',
        account: 'Savings',
        type: 'deposit',
        description: 'Interest Credit',
        amount: 15.25,
        balance: 12390.50,
        status: 'completed'
    },
    {
        id: 'TXN010',
        date: '2026-01-02',
        account: 'Checking',
        type: 'payment',
        description: 'Grocery Store',
        amount: -156.78,
        balance: 2685.70,
        status: 'completed'
    }
];

// Storage helpers
export class Storage {
    static setCurrentUser(username: string): void {
        localStorage.setItem('currentUser', username);
    }

    static getCurrentUser(): string | null {
        return localStorage.getItem('currentUser');
    }

    static getUserData(username: string): User | null {
        const user = USERS[username];
        return user ? user.data : null;
    }

    static clearCurrentUser(): void {
        localStorage.removeItem('currentUser');
    }

    static isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    }
}
