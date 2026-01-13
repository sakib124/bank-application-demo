import { API, Storage } from './api.js';

// Check authentication
if (!Storage.isAuthenticated()) {
    window.location.href = 'index.html';
}

// DOM Elements
const welcomeMessage = document.getElementById('welcome-message') as HTMLSpanElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
const transferForm = document.getElementById('transfer-form') as HTMLFormElement;
const fromAccountSelect = document.getElementById('from-account') as HTMLSelectElement;
const toAccountSelect = document.getElementById('to-account') as HTMLSelectElement;
const externalAccountGroup = document.getElementById('external-account-group') as HTMLDivElement;
const externalAccountInput = document.getElementById('external-account-number') as HTMLInputElement;
const amountInput = document.getElementById('amount') as HTMLInputElement;
const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
const errorMessage = document.getElementById('error-message') as HTMLDivElement;
const successMessage = document.getElementById('success-message') as HTMLDivElement;
const confirmationModal = document.getElementById('confirmation-modal') as HTMLDivElement;

let accounts: any[] = [];

// Initialize page
async function initializeTransferPage() {
    try {
        // Get user profile
        const profileResponse = await API.getProfile();
        welcomeMessage.textContent = `Welcome, ${profileResponse.firstName}`;
        
        // Get accounts
        const accountsResponse = await API.getAccounts();
        accounts = accountsResponse.accounts;
        
        // Update account dropdowns with current balances
        const checking = accounts.find((acc: any) => acc.type === 'checking');
        const savings = accounts.find((acc: any) => acc.type === 'savings');
        
        if (checking) {
            const checkingOption = fromAccountSelect.querySelector('[value="checking"]') as HTMLOptionElement;
            if (checkingOption) {
                checkingOption.textContent = `Checking ${checking.accountNumber} - $${checking.balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                checkingOption.setAttribute('data-account-id', checking.id);
            }
        }
        
        if (savings) {
            const savingsOption = fromAccountSelect.querySelector('[value="savings"]') as HTMLOptionElement;
            if (savingsOption) {
                savingsOption.textContent = `Savings ${savings.accountNumber} - $${savings.balance.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
                savingsOption.setAttribute('data-account-id', savings.id);
            }
        }
        
        // Update to-account options with IDs
        const toCheckingOption = toAccountSelect.querySelector('[value="checking"]') as HTMLOptionElement;
        const toSavingsOption = toAccountSelect.querySelector('[value="savings"]') as HTMLOptionElement;
        if (toCheckingOption && checking) toCheckingOption.setAttribute('data-account-id', checking.id);
        if (toSavingsOption && savings) toSavingsOption.setAttribute('data-account-id', savings.id);
        
    } catch (error: any) {
        console.error('Failed to load transfer page:', error);
        if (error.message.includes('Authentication')) {
            Storage.clearCurrentUser();
            window.location.href = 'index.html';
        }
    }
}

initializeTransferPage();

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

// Show/hide external account input
toAccountSelect.addEventListener('change', () => {
    if (toAccountSelect.value === 'external') {
        externalAccountGroup.style.display = 'block';
        externalAccountInput.required = true;
    } else {
        externalAccountGroup.style.display = 'none';
        externalAccountInput.required = false;
    }
});

// Form submission handler
let pendingTransferData: any = null;

transferForm.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    
    // Clear previous messages
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    
    const fromAccount = fromAccountSelect.value;
    const toAccount = toAccountSelect.value;
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value;
    
    // Validation
    if (!fromAccount) {
        showError('Please select a from account');
        return;
    }
    
    if (!toAccount) {
        showError('Please select a to account');
        return;
    }
    
    if (fromAccount === toAccount && toAccount !== 'external') {
        showError('Cannot transfer to the same account');
        return;
    }
    
    if (toAccount === 'external' && !externalAccountInput.value) {
        showError('Please enter external account number');
        return;
    }
    
    if (amount <= 0) {
        showError('Amount must be greater than 0');
        return;
    }
    
    // Check sufficient balance
    const fromAccountData = accounts.find(acc => acc.type === fromAccount);
    if (fromAccountData && amount > fromAccountData.balance) {
        showError('Insufficient funds');
        return;
    }
    
    // Store transfer data and show confirmation modal
    pendingTransferData = {
        fromAccount,
        toAccount,
        amount,
        description
    };
    
    showConfirmationModal();
});

function showConfirmationModal(): void {
    const confirmFrom = document.getElementById('confirm-from') as HTMLSpanElement;
    const confirmTo = document.getElementById('confirm-to') as HTMLSpanElement;
    const confirmAmount = document.getElementById('confirm-amount') as HTMLSpanElement;
    
    confirmFrom.textContent = getAccountDisplayName(pendingTransferData.fromAccount);
    confirmTo.textContent = pendingTransferData.toAccount === 'external' 
        ? `External Account (${externalAccountInput.value})`
        : getAccountDisplayName(pendingTransferData.toAccount);
    confirmAmount.textContent = `$${pendingTransferData.amount.toFixed(2)}`;
    
    confirmationModal.classList.remove('hidden');
}

function getAccountDisplayName(accountType: string): string {
    const account = accounts.find(acc => acc.type === accountType);
    if (account) {
        return `${accountType.charAt(0).toUpperCase() + accountType.slice(1)} ${account.accountNumber}`;
    }
    return accountType;
}

// Confirmation modal handlers
document.getElementById('confirm-transfer')?.addEventListener('click', async () => {
    confirmationModal.classList.add('hidden');
    
    const submitButton = document.getElementById('submit-transfer') as HTMLButtonElement;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    try {
        // Get account IDs from the select options
        const fromOption = fromAccountSelect.selectedOptions[0];
        const toOption = toAccountSelect.selectedOptions[0];
        
        const fromAccountId = fromOption?.getAttribute('data-account-id');
        const toAccountId = pendingTransferData.toAccount === 'external' ? null : toOption?.getAttribute('data-account-id');
        
        console.log('Transfer details:', { fromAccountId, toAccountId, amount: pendingTransferData.amount });
        
        if (!fromAccountId) {
            throw new Error('From account not found. Please refresh the page and try again.');
        }
        
        if (!toAccountId && pendingTransferData.toAccount !== 'external') {
            throw new Error('To account not found. Please refresh the page and try again.');
        }
        
        // Create transfer via API (send IDs as numbers)
        await API.createTransfer({
            fromAccountId: parseInt(fromAccountId, 10),
            toAccountId: toAccountId ? parseInt(toAccountId, 10) : undefined,
            amount: pendingTransferData.amount,
            description: pendingTransferData.description || 'Transfer',
            externalAccount: pendingTransferData.toAccount === 'external' ? externalAccountInput.value : undefined
        });
        
        // Reset form
        transferForm.reset();
        externalAccountGroup.style.display = 'none';
        submitButton.textContent = 'Transfer';
        submitButton.disabled = false;
        
        // Show success and redirect
        successMessage.textContent = `Transfer of $${pendingTransferData.amount.toFixed(2)} completed successfully!`;
        successMessage.classList.remove('hidden');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html?success=true';
        }, 2000);
        
    } catch (error: any) {
        submitButton.textContent = 'Transfer';
        submitButton.disabled = false;
        showError(error.message || 'Transfer failed. Please try again.');
    }
});

document.getElementById('cancel-transfer')?.addEventListener('click', () => {
    confirmationModal.classList.add('hidden');
    pendingTransferData = null;
});

function showError(message: string): void {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    
    // Scroll to error
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Reset button handler
document.getElementById('reset-form')?.addEventListener('click', () => {
    externalAccountGroup.style.display = 'none';
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
});
