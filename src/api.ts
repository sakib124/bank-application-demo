// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Helper Functions
export class API {
    static async request(endpoint: string, options: RequestInit = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config: RequestInit = {
            ...options,
            credentials: 'include', // Include cookies for sessions
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    static async login(username: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });
    }

    static async logout() {
        return this.request('/auth/logout', {
            method: 'POST',
        });
    }

    static async checkAuthStatus() {
        return this.request('/auth/status');
    }

    // User endpoints
    static async getProfile() {
        return this.request('/users/profile');
    }

    // Account endpoints
    static async getAccounts() {
        return this.request('/accounts');
    }

    static async getAccount(accountId: string) {
        return this.request(`/accounts/${accountId}`);
    }

    // Transaction endpoints
    static async getTransactions(filters: any = {}) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
        const queryString = params.toString();
        return this.request(`/transactions${queryString ? '?' + queryString : ''}`);
    }

    static async createTransfer(transferData: any) {
        return this.request('/transactions/transfer', {
            method: 'POST',
            body: JSON.stringify(transferData),
        });
    }
}

// Storage helpers (keep for compatibility)
export class Storage {
    static setCurrentUser(username: string): void {
        localStorage.setItem('currentUser', username);
    }

    static getCurrentUser(): string | null {
        return localStorage.getItem('currentUser');
    }

    static clearCurrentUser(): void {
        localStorage.removeItem('currentUser');
    }

    static isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    }
}
