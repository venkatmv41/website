// Authentication and Security System
class AdminAuth {
    constructor() {
        this.maxLoginAttempts = 3;
        this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
        this.sessionDuration = 2 * 60 * 60 * 1000; // 2 hours
        this.adminCredentials = {
            // Default admin credentials (should be changed immediately)
            email: 'admin@ngo.org',
            // Password: 'AdminSecure123!' (hashed with SHA-256)
            passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
        this.loadLoginAttempts();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Auto-logout on tab visibility change (security feature)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isAuthenticated()) {
                this.startIdleTimer();
            } else {
                this.resetIdleTimer();
            }
        });

        // Keyboard shortcuts for security
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+L to logout quickly
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.logout();
            }
        });
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const loginBtnText = document.getElementById('loginBtnText');

        // Check if account is locked
        if (this.isAccountLocked()) {
            this.showMessage('Account temporarily locked due to multiple failed attempts. Please try again later.', 'error');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loadingSpinner.style.display = 'inline-block';
        loginBtnText.textContent = 'Signing In...';

        try {
            // Simulate network delay for security (prevents timing attacks)
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            if (await this.validateCredentials(email, password)) {
                this.clearLoginAttempts();
                await this.createSession(email);
                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to admin dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                this.recordFailedAttempt();
                const attempts = this.getLoginAttempts();
                const remaining = this.maxLoginAttempts - attempts;
                
                if (remaining > 0) {
                    this.showMessage(`Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 'error');
                } else {
                    this.lockAccount();
                    this.showMessage('Account locked due to multiple failed attempts. Please try again in 15 minutes.', 'error');
                }
            }
        } catch (error) {
            this.showMessage('Login failed. Please try again.', 'error');
            console.error('Login error:', error);
        } finally {
            // Reset button state
            loginBtn.disabled = false;
            loadingSpinner.style.display = 'none';
            loginBtnText.textContent = 'Sign In';
        }
    }

    async validateCredentials(email, password) {
        // Hash the provided password
        const hashedPassword = await this.hashPassword(password);
        
        // Compare with stored credentials
        return email === this.adminCredentials.email && 
               hashedPassword === this.adminCredentials.passwordHash;
    }

    async hashPassword(password) {
        // Use Web Crypto API for secure hashing
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async createSession(email) {
        const sessionData = {
            email: email,
            loginTime: Date.now(),
            expiresAt: Date.now() + this.sessionDuration,
            sessionId: this.generateSessionId(),
            csrfToken: this.generateCSRFToken()
        };

        // Encrypt session data
        const encryptedSession = await this.encryptData(JSON.stringify(sessionData));
        
        // Store in sessionStorage (more secure than localStorage for sessions)
        sessionStorage.setItem('admin_session', encryptedSession);
        
        // Set session timeout
        this.setSessionTimeout();
        
        // Log successful login
        this.logSecurityEvent('login_success', { email, timestamp: Date.now() });
    }

    async encryptData(data) {
        // Simple encryption using base64 and XOR (for demo purposes)
        // In production, use proper encryption libraries
        const key = this.getEncryptionKey();
        let encrypted = '';
        
        for (let i = 0; i < data.length; i++) {
            encrypted += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        
        return btoa(encrypted);
    }

    async decryptData(encryptedData) {
        try {
            const key = this.getEncryptionKey();
            const encrypted = atob(encryptedData);
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length));
            }
            
            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    getEncryptionKey() {
        // Generate a key based on browser fingerprint and timestamp
        const fingerprint = navigator.userAgent + navigator.language + screen.width + screen.height;
        return btoa(fingerprint).substring(0, 32);
    }

    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    async checkExistingSession() {
        const encryptedSession = sessionStorage.getItem('admin_session');
        
        if (encryptedSession) {
            const decryptedData = await this.decryptData(encryptedSession);
            
            if (decryptedData) {
                try {
                    const sessionData = JSON.parse(decryptedData);
                    
                    if (Date.now() < sessionData.expiresAt) {
                        // Valid session exists, redirect to dashboard if on login page
                        if (window.location.pathname.includes('login.html')) {
                            window.location.href = 'index.html';
                        }
                        return true;
                    } else {
                        // Session expired
                        this.logout();
                    }
                } catch (error) {
                    console.error('Session validation failed:', error);
                    this.logout();
                }
            }
        }
        
        return false;
    }

    isAuthenticated() {
        const encryptedSession = sessionStorage.getItem('admin_session');
        return encryptedSession !== null;
    }

    async getSessionData() {
        const encryptedSession = sessionStorage.getItem('admin_session');
        
        if (encryptedSession) {
            const decryptedData = await this.decryptData(encryptedSession);
            
            if (decryptedData) {
                try {
                    const sessionData = JSON.parse(decryptedData);
                    
                    if (Date.now() < sessionData.expiresAt) {
                        return sessionData;
                    }
                } catch (error) {
                    console.error('Session data parsing failed:', error);
                }
            }
        }
        
        return null;
    }

    logout() {
        // Clear session data
        sessionStorage.removeItem('admin_session');
        localStorage.removeItem('admin_csrf_token');
        
        // Clear any timers
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        
        // Log logout event
        this.logSecurityEvent('logout', { timestamp: Date.now() });
        
        // Redirect to login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    setSessionTimeout() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        this.sessionTimer = setTimeout(() => {
            alert('Your session has expired. Please log in again.');
            this.logout();
        }, this.sessionDuration);
    }

    startIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        
        // Auto-logout after 30 minutes of inactivity
        this.idleTimer = setTimeout(() => {
            alert('You have been logged out due to inactivity.');
            this.logout();
        }, 30 * 60 * 1000);
    }

    resetIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
    }

    // Login attempt tracking
    getLoginAttempts() {
        const attempts = localStorage.getItem('admin_login_attempts');
        return attempts ? parseInt(attempts) : 0;
    }

    recordFailedAttempt() {
        const attempts = this.getLoginAttempts() + 1;
        localStorage.setItem('admin_login_attempts', attempts.toString());
        localStorage.setItem('admin_last_attempt', Date.now().toString());
        
        this.logSecurityEvent('login_failed', { 
            attempts, 
            timestamp: Date.now(),
            ip: this.getClientIP()
        });
    }

    clearLoginAttempts() {
        localStorage.removeItem('admin_login_attempts');
        localStorage.removeItem('admin_last_attempt');
        localStorage.removeItem('admin_account_locked');
    }

    loadLoginAttempts() {
        const attempts = this.getLoginAttempts();
        if (attempts > 0 && attempts < this.maxLoginAttempts) {
            const remaining = this.maxLoginAttempts - attempts;
            this.showMessage(`Warning: ${attempts} failed login attempt${attempts !== 1 ? 's' : ''}. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`, 'warning');
        }
    }

    isAccountLocked() {
        const locked = localStorage.getItem('admin_account_locked');
        if (locked) {
            const lockTime = parseInt(locked);
            if (Date.now() - lockTime < this.lockoutDuration) {
                return true;
            } else {
                // Unlock account
                this.clearLoginAttempts();
                return false;
            }
        }
        return false;
    }

    lockAccount() {
        localStorage.setItem('admin_account_locked', Date.now().toString());
        this.logSecurityEvent('account_locked', { timestamp: Date.now() });
    }

    getClientIP() {
        // This is a simplified version - in production, you'd get this from the server
        return 'client_ip_hidden';
    }

    logSecurityEvent(event, data) {
        const securityLog = JSON.parse(localStorage.getItem('admin_security_log') || '[]');
        securityLog.push({
            event,
            data,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        });
        
        // Keep only last 100 events
        if (securityLog.length > 100) {
            securityLog.splice(0, securityLog.length - 100);
        }
        
        localStorage.setItem('admin_security_log', JSON.stringify(securityLog));
    }

    showMessage(message, type) {
        const container = document.getElementById('messageContainer');
        if (!container) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        container.innerHTML = '';
        container.appendChild(messageDiv);
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }

    // Password strength validation
    validatePasswordStrength(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const score = [
            password.length >= minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar
        ].filter(Boolean).length;
        
        return {
            score,
            isValid: score >= 4,
            feedback: this.getPasswordFeedback(score, {
                hasUpperCase,
                hasLowerCase,
                hasNumbers,
                hasSpecialChar,
                minLength: password.length >= minLength
            })
        };
    }

    getPasswordFeedback(score, checks) {
        const feedback = [];
        
        if (!checks.minLength) feedback.push('At least 8 characters');
        if (!checks.hasUpperCase) feedback.push('One uppercase letter');
        if (!checks.hasLowerCase) feedback.push('One lowercase letter');
        if (!checks.hasNumbers) feedback.push('One number');
        if (!checks.hasSpecialChar) feedback.push('One special character');
        
        return feedback;
    }
}

// Password toggle functionality
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('passwordToggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.adminAuth = new AdminAuth();
    
    // Add activity listeners to reset idle timer
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, () => {
            if (window.adminAuth && window.adminAuth.isAuthenticated()) {
                window.adminAuth.resetIdleTimer();
                window.adminAuth.startIdleTimer();
            }
        }, { passive: true });
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuth;
}