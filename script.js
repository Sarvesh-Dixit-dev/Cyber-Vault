// ===== Password Strength Analyzer & Generator =====
// Client-side only - no data transmission

class PasswordAnalyzer {
    constructor() {
        this.lastGeneratedPassword = '';
        this.initializeElements();
        this.attachEventListeners();
        this.initializeTheme();
    }

    initializeElements() {
        // Input elements
        this.passwordInput = document.getElementById('passwordInput');
        this.toggleVisibility = document.getElementById('toggleVisibility');
        this.copyButton = document.getElementById('copyButton');
        this.createPassButton = document.getElementById('createPassButton');
        
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        
        // Strength meter
        this.strengthText = document.getElementById('strengthText');
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthGlow = document.getElementById('strengthGlow');
        
        // Analysis results
        this.analysisResults = document.getElementById('analysisResults');
        this.lengthMetric = document.getElementById('lengthMetric');
        this.entropyMetric = document.getElementById('entropyMetric');
        this.crackTimeMetric = document.getElementById('crackTimeMetric');
        
        // Character type checks
        this.uppercaseCheck = document.getElementById('uppercaseCheck');
        this.lowercaseCheck = document.getElementById('lowercaseCheck');
        this.numbersCheck = document.getElementById('numbersCheck');
        this.symbolsCheck = document.getElementById('symbolsCheck');
        
        // Warnings container
        this.warnings = document.getElementById('warnings');
        
        // Toast
        this.toast = document.getElementById('toast');
        this.toastMessage = document.getElementById('toastMessage');
    }

    attachEventListeners() {
        // Password input analysis
        this.passwordInput.addEventListener('input', () => this.analyzePassword());
        
        // Toggle visibility
        this.toggleVisibility.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Copy password
        this.copyButton.addEventListener('click', () => this.copyPassword());
        
        // Generate password
        this.createPassButton.addEventListener('click', () => this.generateStrongPassword());
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Copy button animation
        this.copyButton.addEventListener('animationend', () => {
            this.copyButton.classList.remove('copied');
        });
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }

    togglePasswordVisibility() {
        const type = this.passwordInput.type === 'password' ? 'text' : 'password';
        this.passwordInput.type = type;
        
        const icon = this.toggleVisibility.querySelector('.visibility-icon');
        icon.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    }

    analyzePassword() {
        const password = this.passwordInput.value;
        
        if (password.length === 0) {
            this.hideAnalysis();
            return;
        }

        this.showAnalysis();
        
        // Calculate strength
        const strength = this.calculateStrength(password);
        this.updateStrengthMeter(strength);
        
        // Update metrics
        this.updateMetrics(password);
        
        // Update character type checks
        this.updateCharacterTypes(password);
        
        // Show warnings
        this.updateWarnings(password);
    }

    calculateStrength(password) {
        let score = 0;
        let feedback = [];

        // Length scoring
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 20;
        if (password.length >= 16) score += 20;
        if (password.length >= 20) score += 20;

        // Character variety
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^a-zA-Z0-9]/.test(password)) score += 10;

        // Penalty for common patterns
        if (this.hasCommonPatterns(password)) score -= 30;
        if (this.hasRepeatingChars(password)) score -= 20;
        if (this.hasSequentialChars(password)) score -= 20;

        // Ensure score is within bounds
        score = Math.max(0, Math.min(100, score));

        return {
            score,
            level: this.getStrengthLevel(score),
            color: this.getStrengthColor(score)
        };
    }

    getStrengthLevel(score) {
        if (score < 20) return 'Very Weak';
        if (score < 40) return 'Weak';
        if (score < 60) return 'Medium';
        if (score < 80) return 'Strong';
        return 'Unbreakable';
    }

    getStrengthColor(score) {
        if (score < 20) return '#ff3366';
        if (score < 40) return '#ffaa00';
        if (score < 60) return '#ffdd00';
        if (score < 80) return '#00ff88';
        return '#9966ff';
    }

    updateStrengthMeter(strength) {
        // Update text
        this.strengthText.textContent = strength.level;
        this.strengthText.style.color = strength.color;

        // Update fill bar
        this.strengthFill.style.width = `${strength.score}%`;
        this.strengthFill.style.background = `linear-gradient(90deg, ${strength.color}, ${this.adjustColor(strength.color, 20)})`;

        // Update glow
        this.strengthGlow.style.background = strength.color;
        this.strengthGlow.style.opacity = strength.score > 0 ? '0.3' : '0';
        this.strengthGlow.style.boxShadow = `0 0 20px ${strength.color}`;
    }

    adjustColor(color, amount) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, ((num >> 16) & 255) + amount);
        const g = Math.min(255, ((num >> 8) & 255) + amount);
        const b = Math.min(255, (num & 255) + amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }

    updateMetrics(password) {
        // Length
        this.lengthMetric.textContent = password.length;

        // Entropy calculation
        const entropy = this.calculateEntropy(password);
        this.entropyMetric.textContent = `${entropy} bits`;

        // Crack time estimation
        const crackTime = this.estimateCrackTime(entropy);
        this.crackTimeMetric.textContent = crackTime;
    }

    calculateEntropy(password) {
        let charsetSize = 0;
        
        if (/[a-z]/.test(password)) charsetSize += 26;
        if (/[A-Z]/.test(password)) charsetSize += 26;
        if (/[0-9]/.test(password)) charsetSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // Approximate symbol count

        if (charsetSize === 0) return 0;

        return Math.floor(password.length * Math.log2(charsetSize));
    }

    estimateCrackTime(entropy) {
        if (entropy === 0) return 'Instant';
        
        // Assume 1 trillion guesses per second (modern hardware)
        const guessesPerSecond = 1e12;
        const combinations = Math.pow(2, entropy);
        const seconds = combinations / (2 * guessesPerSecond); // Average case

        if (seconds < 1) return 'Instant';
        if (seconds < 60) return '< 1 minute';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours`;
        if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days`;
        if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months`;
        if (seconds < 3153600000) return `${Math.floor(seconds / 31536000)} years`;
        
        return 'Centuries';
    }

    updateCharacterTypes(password) {
        this.uppercaseCheck.classList.toggle('active', /[A-Z]/.test(password));
        this.lowercaseCheck.classList.toggle('active', /[a-z]/.test(password));
        this.numbersCheck.classList.toggle('active', /[0-9]/.test(password));
        this.symbolsCheck.classList.toggle('active', /[^a-zA-Z0-9]/.test(password));
    }

    hasCommonPatterns(password) {
        const commonPatterns = [
            '123', 'abc', 'qwerty', 'password', 'admin', 'user',
            'login', 'welcome', 'letmein', 'master', 'super',
            'iloveyou', '123456', '123456789', 'qwertyuiop',
            'asdfghjkl', 'zxcvbnm', '111111', '000000'
        ];

        const lowerPassword = password.toLowerCase();
        return commonPatterns.some(pattern => lowerPassword.includes(pattern));
    }

    hasRepeatingChars(password) {
        const maxRepeats = 3;
        let currentCount = 1;
        
        for (let i = 1; i < password.length; i++) {
            if (password[i] === password[i - 1]) {
                currentCount++;
                if (currentCount >= maxRepeats) return true;
            } else {
                currentCount = 1;
            }
        }
        return false;
    }

    hasSequentialChars(password) {
        const sequences = [
            'abcdefghijklmnopqrstuvwxyz',
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            '0123456789',
            'qwertyuiop',
            'asdfghjkl',
            'zxcvbnm'
        ];

        for (const seq of sequences) {
            for (let i = 0; i <= seq.length - 3; i++) {
                const substring = seq.substring(i, i + 3);
                if (password.toLowerCase().includes(substring)) {
                    return true;
                }
            }
        }
        return false;
    }

    updateWarnings(password) {
        this.warnings.innerHTML = '';
        const warningMessages = [];

        if (password.length < 12) {
            warningMessages.push('Password should be at least 12 characters long');
        }

        if (!/[A-Z]/.test(password)) {
            warningMessages.push('Add uppercase letters for better security');
        }

        if (!/[a-z]/.test(password)) {
            warningMessages.push('Add lowercase letters for better security');
        }

        if (!/[0-9]/.test(password)) {
            warningMessages.push('Include numbers to increase strength');
        }

        if (!/[^a-zA-Z0-9]/.test(password)) {
            warningMessages.push('Add special characters for maximum security');
        }

        if (this.hasCommonPatterns(password)) {
            warningMessages.push('Avoid common patterns and dictionary words');
        }

        if (this.hasRepeatingChars(password)) {
            warningMessages.push('Avoid repeating characters');
        }

        if (this.hasSequentialChars(password)) {
            warningMessages.push('Avoid sequential characters');
        }

        warningMessages.forEach(message => {
            const warning = document.createElement('div');
            warning.className = 'warning';
            warning.innerHTML = `<span>⚠️</span><span>${message}</span>`;
            this.warnings.appendChild(warning);
        });
    }

    generateStrongPassword() {
        const length = Math.floor(Math.random() * 9) + 16; // 16-24 characters
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = uppercase + lowercase + numbers + symbols;

        let password = '';
        
        // Ensure at least one of each character type
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];

        // Fill the rest with random characters
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle the password to avoid predictable patterns
        password = this.shuffleString(password);

        // Ensure we don't generate the same password consecutively
        if (password === this.lastGeneratedPassword) {
            return this.generateStrongPassword(); // Recursive call with new password
        }

        this.lastGeneratedPassword = password;
        
        // Set the password and analyze it
        this.passwordInput.value = password;
        this.analyzePassword();
        
        // Add animation effect
        this.createPassButton.classList.add('generated');
        setTimeout(() => {
            this.createPassButton.classList.remove('generated');
        }, 300);

        // Show success message
        this.showToast('Strong password generated successfully!');
    }

    shuffleString(str) {
        const arr = str.split('');
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join('');
    }

    async copyPassword() {
        const password = this.passwordInput.value;
        
        if (!password) {
            this.showToast('No password to copy', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(password);
            this.copyButton.classList.add('copied');
            this.showToast('Password copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(password);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.copyButton.classList.add('copied');
            this.showToast('Password copied to clipboard!');
        } catch (err) {
            this.showToast('Failed to copy password', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    showToast(message, type = 'success') {
        this.toastMessage.textContent = message;
        
        // Set toast color based on type
        if (type === 'warning') {
            this.toast.style.background = 'var(--warning)';
        } else if (type === 'error') {
            this.toast.style.background = 'var(--danger)';
        } else {
            this.toast.style.background = 'var(--success)';
        }
        
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    showAnalysis() {
        this.analysisResults.style.display = 'block';
    }

    hideAnalysis() {
        this.analysisResults.style.display = 'none';
        this.strengthText.textContent = 'Not Analyzed';
        this.strengthText.style.color = 'var(--text-secondary)';
        this.strengthFill.style.width = '0%';
        this.strengthGlow.style.opacity = '0';
    }
}

// Add custom CSS animations
const style = document.createElement('style');
style.textContent = `
    .create-pass-button.generated {
        animation: pulse 0.3s ease;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(0.95); }
        100% { transform: scale(1); }
    }
    
    .copy-button.copied {
        animation: copySuccess 0.5s ease;
    }
    
    @keyframes copySuccess {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.2) rotate(-10deg); }
        50% { transform: scale(1.3) rotate(10deg); }
        75% { transform: scale(1.2) rotate(-5deg); }
        100% { transform: scale(1) rotate(0deg); }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new PasswordAnalyzer();
});

// Security: Clear password from memory on page unload
window.addEventListener('beforeunload', () => {
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.value = '';
    }
});

// Prevent form submission
document.addEventListener('submit', (e) => {
    e.preventDefault();
});
