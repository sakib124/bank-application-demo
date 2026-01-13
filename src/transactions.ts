import { API, Storage } from './api.js';

// Check authentication
if (!Storage.isAuthenticated()) {
    window.location.href = 'index.html';
}

interface Transaction {
    id: number | string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    account: string;
    accountType: string;
    balance?: number;
    status?: string;
}

// DOM Elements
const welcomeMessage = document.getElementById('welcome-message') as HTMLSpanElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
const filterAccountSelect = document.getElementById('filter-account') as HTMLSelectElement;
const filterTypeSelect = document.getElementById('filter-type') as HTMLSelectElement;
const filterDateFrom = document.getElementById('filter-date-from') as HTMLInputElement;
const filterDateTo = document.getElementById('filter-date-to') as HTMLInputElement;
const applyFiltersButton = document.getElementById('apply-filters') as HTMLButtonElement;
const resetFiltersButton = document.getElementById('reset-filters') as HTMLButtonElement;
const transactionsBody = document.getElementById('full-transactions-body') as HTMLTableSectionElement;
const transactionsCount = document.getElementById('transactions-count') as HTMLHeadingElement;
const prevPageButton = document.getElementById('prev-page') as HTMLButtonElement;
const nextPageButton = document.getElementById('next-page') as HTMLButtonElement;
const pageInfo = document.getElementById('page-info') as HTMLSpanElement;
const exportButton = document.getElementById('export-transactions') as HTMLButtonElement;

// Pagination state
let currentPage = 1;
const itemsPerPage = 10;
let allTransactions: Transaction[] = [];
let filteredTransactions: Transaction[] = [];

// Initialize page
async function initializeTransactionsPage() {
    try {
        // Get user profile
        const profileResponse = await API.getProfile();
        welcomeMessage.textContent = `Welcome, ${profileResponse.firstName}`;
        
        // Get all transactions
        const transactionsResponse = await API.getTransactions();
        allTransactions = transactionsResponse.transactions;
        filteredTransactions = [...allTransactions];
        
        renderTransactions();
    } catch (error: any) {
        console.error('Failed to load transactions:', error);
        if (error.message.includes('Authentication')) {
            Storage.clearCurrentUser();
            window.location.href = 'index.html';
        }
    }
}

initializeTransactionsPage();

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

// Filter handlers
applyFiltersButton.addEventListener('click', applyFilters);
resetFiltersButton.addEventListener('click', resetFilters);

// Pagination handlers
prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderTransactions();
    }
});

nextPageButton.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTransactions();
    }
});

function applyFilters(): void {
    const accountFilter = filterAccountSelect.value;
    const typeFilter = filterTypeSelect.value;
    const dateFrom = filterDateFrom.value;
    const dateTo = filterDateTo.value;
    
    filteredTransactions = allTransactions.filter(txn => {
        // Account filter
        if (accountFilter !== 'all' && txn.accountType.toLowerCase() !== accountFilter) {
            return false;
        }
        
        // Type filter
        if (typeFilter !== 'all' && txn.type !== typeFilter) {
            return false;
        }
        
        // Date from filter
        if (dateFrom && txn.date < dateFrom) {
            return false;
        }
        
        // Date to filter
        if (dateTo && txn.date > dateTo) {
            return false;
        }
        
        return true;
    });
    
    currentPage = 1;
    renderTransactions();
}

function resetFilters(): void {
    filterAccountSelect.value = 'all';
    filterTypeSelect.value = 'all';
    filterDateFrom.value = '';
    filterDateTo.value = '';
    
    filteredTransactions = [...allTransactions];
    currentPage = 1;
    renderTransactions();
}

function renderTransactions(): void {
    // Clear existing rows
    transactionsBody.innerHTML = '';
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);
    
    // Update count
    transactionsCount.textContent = `Showing ${pageTransactions.length} of ${filteredTransactions.length} transactions`;
    
    // Render transactions
    pageTransactions.forEach(txn => {
        const row = document.createElement('tr');
        row.setAttribute('data-testid', `transaction-row-${txn.id}`);
        
        const amountClass = txn.amount >= 0 ? 'positive' : 'negative';
        const status = txn.status || 'completed';
        const statusClass = status === 'completed' ? 'status-completed' : 
                           status === 'pending' ? 'status-pending' : 'status-failed';
        
        row.innerHTML = `
            <td data-testid="txn-id-${txn.id}">${txn.id}</td>
            <td data-testid="txn-date-${txn.id}">${txn.date}</td>
            <td data-testid="txn-account-${txn.id}">${txn.account}</td>
            <td data-testid="txn-type-${txn.id}">${txn.type}</td>
            <td data-testid="txn-desc-${txn.id}">${txn.description}</td>
            <td class="${amountClass}" data-testid="txn-amount-${txn.id}">$${Math.abs(txn.amount).toFixed(2)}</td>
            <td data-testid="txn-balance-${txn.id}">$${(txn.balance || 0).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}" data-testid="txn-status-${txn.id}">${status}</span></td>
            <td>
                <button class="btn btn-small view-details" data-testid="view-details-${txn.id}" data-txn-id="${txn.id}">
                    View
                </button>
            </td>
        `;
        
        transactionsBody.appendChild(row);
    });
    
    // Add view details handlers
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement;
            const txnId = target.getAttribute('data-txn-id');
            if (txnId) {
                const txn = allTransactions.find((t: Transaction) => String(t.id) === txnId);
                if (txn) {
                    showTransactionDetails(txn);
                } else {
                    console.error('Transaction not found:', txnId);
                }
            }
        });
    });
    
    // Update pagination controls
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;
}

function showTransactionDetails(txn: Transaction): void {
    const details = `
Transaction Details:

ID: ${txn.id}
Date: ${txn.date}
Account: ${txn.account}
Type: ${txn.type}
Description: ${txn.description}
Amount: $${Math.abs(txn.amount).toFixed(2)}
Balance After: $${(txn.balance || 0).toFixed(2)}
Status: ${txn.status || 'completed'}
    `.trim();
    
    alert(details);
}

// Export to CSV
exportButton.addEventListener('click', () => {
    const csv = generateCSV(filteredTransactions);
    downloadCSV(csv, 'transactions.csv');
});

function generateCSV(transactions: Transaction[]): string {
    const headers = ['ID', 'Date', 'Account', 'Type', 'Description', 'Amount', 'Balance', 'Status'];
    const rows = transactions.map(txn => [
        txn.id,
        txn.date,
        txn.account,
        txn.type,
        `"${txn.description}"`,
        txn.amount.toFixed(2),
        (txn.balance || 0).toFixed(2),
        txn.status || 'completed'
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.setAttribute('data-testid', 'csv-download-link');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
