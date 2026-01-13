import { API, Storage } from './api.js';

// Check authentication
if (!Storage.isAuthenticated()) {
    window.location.href = 'index.html';
}

// DOM Elements
const welcomeMessage = document.getElementById('welcome-message') as HTMLSpanElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
const profileForm = document.getElementById('profile-form') as HTMLFormElement;
const securityForm = document.getElementById('security-form') as HTMLFormElement;
const firstNameInput = document.getElementById('first-name') as HTMLInputElement;
const lastNameInput = document.getElementById('last-name') as HTMLInputElement;
const emailInput = document.getElementById('email') as HTMLInputElement;
const phoneInput = document.getElementById('phone') as HTMLInputElement;
const addressInput = document.getElementById('address') as HTMLTextAreaElement;
const successMessage = document.getElementById('success-message') as HTMLDivElement;
const saveNotificationsButton = document.getElementById('save-notifications') as HTMLButtonElement;

// Initialize page
async function initializeProfilePage() {
    try {
        const profileResponse = await API.getProfile();
        
        welcomeMessage.textContent = `Welcome, ${profileResponse.firstName}`;
        firstNameInput.value = profileResponse.firstName;
        lastNameInput.value = profileResponse.lastName;
        emailInput.value = profileResponse.email;
        phoneInput.value = profileResponse.phone || '';
        addressInput.value = profileResponse.address || '';
    } catch (error: any) {
        console.error('Failed to load profile:', error);
        if (error.message.includes('Authentication')) {
            Storage.clearCurrentUser();
            window.location.href = 'index.html';
        }
    }
}

initializeProfilePage();

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

// Profile form submission - DISABLED
profileForm.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    // Profile editing is disabled
    showMessage('Profile editing is disabled. Contact support to update your information.', 'error');
});

// Security form submission - DISABLED
if (securityForm) {
    securityForm.addEventListener('submit', async (e: Event) => {
        e.preventDefault();
        // Password changes are disabled
        showMessage('Password changes are disabled. Contact support for assistance.', 'error');
    });
}

// Notification preferences button - DISABLED
if (saveNotificationsButton) {
    saveNotificationsButton.addEventListener('click', () => {
        showMessage('Notification settings are managed by your administrator.', 'error');
    });
}

function showSuccess(message: string): void {
    successMessage.textContent = message;
    successMessage.classList.remove('hidden');
    
    // Scroll to message
    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hide after 5 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 5000);
}

function showMessage(message: string, type: 'success' | 'error'): void {
    if (type === 'error') {
        alert(message);
    } else {
        showSuccess(message);
    }
}
