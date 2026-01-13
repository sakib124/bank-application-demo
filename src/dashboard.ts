import { API, Storage } from './api.js';

// Check authentication
if (!Storage.isAuthenticated()) {
    window.location.href = 'index.html';
}

// DOM Elements
const welcomeMessage = document.getElementById('welcome-message') as HTMLSpanElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
const checkingBalance = document.getElementById('checking-balance') as HTMLParagraphElement;
const savingsBalance = document.getElementById('savings-balance') as HTMLParagraphElement;
const creditBalance = document.getElementById('credit-balance') as HTMLParagraphElement;
const transactionsBody = document.getElementById('transactions-body') as HTMLTableSectionElement;
const successMessage = document.getElementById('success-message') as HTMLDivElement;

// Initialize page
async function initializeDashboard() {
    try {
        // Get user profile
        const profileResponse = await API.getProfile();
        const userData = profileResponse;
        
        welcomeMessage.textContent = `Welcome, ${userData.firstName}`;
        
        // Get accounts
        const accountsResponse = await API.getAccounts();
        const accounts = accountsResponse.accounts;
        
        // Update balances
        const checking = accounts.find((acc: any) => acc.type === 'checking');
        const savings = accounts.find((acc: any) => acc.type === 'savings');
        const credit = accounts.find((acc: any) => acc.type === 'credit');
        
        if (checking) checkingBalance.textContent = `$${checking.balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        if (savings) savingsBalance.textContent = `$${savings.balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        if (credit) creditBalance.textContent = `-$${Math.abs(credit.balance).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
        
        // Load recent transactions
        const transactionsResponse = await API.getTransactions();
        const recentTransactions = transactionsResponse.transactions.slice(0, 5);
        
        recentTransactions.forEach((txn: any) => {
            const row = document.createElement('tr');
            row.setAttribute('data-testid', `transaction-row-${txn.id}`);
            
            const amountClass = txn.amount >= 0 ? 'positive' : 'negative';
            const statusClass = txn.status === 'completed' ? 'status-completed' : 
                               txn.status === 'pending' ? 'status-pending' : 'status-failed';
            
            row.innerHTML = `
                <td data-testid="txn-date-${txn.id}">${txn.date}</td>
                <td data-testid="txn-desc-${txn.id}">${txn.description}</td>
                <td class="${amountClass}" data-testid="txn-amount-${txn.id}">$${Math.abs(txn.amount).toFixed(2)}</td>
                <td><span class="status-badge ${statusClass}" data-testid="txn-status-${txn.id}">${txn.status}</span></td>
            `;
            
            transactionsBody.appendChild(row);
        });
        
    } catch (error: any) {
        console.error('Failed to load dashboard:', error);
        // If unauthorized, redirect to login
        if (error.message.includes('Authentication')) {
            Storage.clearCurrentUser();
            window.location.href = 'index.html';
        }
    }
}

// Initialize dashboard
initializeDashboard();

// Logout handler
logoutButton.addEventListener('click', async () => {
    try {
        await API.logout();
    } catch (error) {
        console.error('Logout error:', error);
    }
    Storage.clearCurrentUser();
    window.location.href = 'index.html';
});

// Quick actions
document.getElementById('quick-transfer')?.addEventListener('click', () => {
    window.location.href = 'transfer.html';
});

document.getElementById('quick-pay-bill')?.addEventListener('click', () => {
    alert('Pay Bill feature would redirect to bill payment page');
});

document.getElementById('quick-deposit')?.addEventListener('click', () => {
    alert('Deposit Check feature would open mobile deposit interface');
});

// Account detail buttons
document.getElementById('view-checking-details')?.addEventListener('click', () => {
    alert('Checking Account Details:\n\nAccount Number: ****1234\nType: Checking\nBalance: ' + checkingBalance.textContent);
});

document.getElementById('view-savings-details')?.addEventListener('click', () => {
    alert('Savings Account Details:\n\nAccount Number: ****5678\nType: Savings\nBalance: ' + savingsBalance.textContent);
});

document.getElementById('view-credit-details')?.addEventListener('click', () => {
    alert('Credit Card Details:\n\nCard Number: ****9012\nType: Visa\nBalance: ' + creditBalance.textContent);
});

// Check for success message from transfer
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true') {
    successMessage.textContent = 'Transfer completed successfully!';
    successMessage.classList.remove('hidden');
    
    // Clear the URL parameter
    window.history.replaceState({}, document.title, window.location.pathname);
    
    // Hide after 5 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 5000);
}
