import { API, Storage } from './api.js';

// DOM Elements
const loginForm = document.getElementById('login-form') as HTMLFormElement;
const usernameInput = document.getElementById('username') as HTMLInputElement;
const passwordInput = document.getElementById('password') as HTMLInputElement;
const errorMessage = document.getElementById('error-message') as HTMLDivElement;
const loginButton = document.getElementById('login-button') as HTMLButtonElement;

// Check if user is already logged in
if (Storage.isAuthenticated()) {
    window.location.href = 'dashboard.html';
}

// Form submission handler
loginForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Clear previous error
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
    
    // Validate credentials
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    // Show loading state
    loginButton.textContent = 'Signing in...';
    loginButton.disabled = true;
    
    try {
        // Call API to login
        const response = await API.login(username, password);
        
        // Store user in localStorage
        Storage.setCurrentUser(username);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } catch (error: any) {
        loginButton.textContent = 'Sign In';
        loginButton.disabled = false;
        showError(error.message || 'Invalid username or password');
    }
});

function showError(message: string): void {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

