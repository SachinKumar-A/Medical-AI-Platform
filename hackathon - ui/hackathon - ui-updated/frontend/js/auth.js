// Authentication handling
class Auth {
    constructor() {
        this.token = localStorage.getItem('auth_token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }

    async login(email, password) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = {
                    id: 1,
                    name: 'Dr. Sarah Chen',
                    email: email,
                    role: 'radiologist',
                    hospital: 'City General Hospital'
                };
                const token = 'jwt_token_' + Math.random().toString(36).substr(2, 9);
                
                localStorage.setItem('auth_token', token);
                localStorage.setItem('user', JSON.stringify(user));
                
                this.token = token;
                this.user = user;
                
                resolve({ success: true, user });
            }, 1000);
        });
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/index.html';
    }

    isAuthenticated() {
        return !!this.token;
    }

    getUser() {
        return this.user;
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const auth = new Auth();
            const result = await auth.login(email, password);
            
            if (result.success) {
                window.location.href = '../dashboard.html';
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        });
    }
});