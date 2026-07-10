// State Management
let currentStep = 'auth'; // 'auth', '2fa', 'success'
let activeTab = 'login'; // 'login', 'signup'
let generatedCode = '';
let countdownInterval = null;
let userData = {
    username: '',
    email: '',
    password: ''
};

// DOM Elements
const stepAuth = document.getElementById('step-auth');
const step2FA = document.getElementById('step-2fa');
const stepSuccess = document.getElementById('step-success');

const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

const displayEmail = document.getElementById('display-email');
const otpContainer = document.getElementById('otp-container');
const otpBoxes = document.querySelectorAll('.otp-box');
const otpError = document.getElementById('otp-error');
const btnResend = document.getElementById('btn-resend');

const successUsername = document.getElementById('success-username');
const successMessage = document.getElementById('success-message');

const toastElement = document.getElementById('mock-toast');
const toastCode = document.getElementById('toast-code');

// Tab Switching
function switchTab(tab) {
    activeTab = tab;
    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        tabLogin.classList.remove('active');
        tabSignup.classList.add('active');
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    }
    // Clear validation error when switching
    otpError.classList.add('d-none');
}

// Password Strength Checker
function checkPasswordStrength(password) {
    const fill = document.getElementById('strength-fill');
    const text = document.getElementById('strength-text');
    
    fill.className = 'strength-fill'; // reset
    
    if (password.length === 0) {
        text.textContent = 'Password strength: Empty';
        return;
    }
    
    // Evaluate criteria
    let score = 0;
    if (password.length >= 6) score++;
    if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (password.length >= 8 && /[^a-zA-Z0-9]/.test(password)) score++;

    if (score === 1) {
        fill.classList.add('weak');
        text.textContent = 'Password strength: Weak';
        text.style.color = '#ef4444';
    } else if (score === 2) {
        fill.classList.add('medium');
        text.textContent = 'Password strength: Medium';
        text.style.color = '#f59e0b';
    } else if (score === 3) {
        fill.classList.add('strong');
        text.textContent = 'Password strength: Strong';
        text.style.color = '#10b981';
    }
}

// Transitions
function transitionToStep(step) {
    // Hide active step
    document.querySelectorAll('.auth-step').forEach(el => {
        el.classList.remove('active');
    });

    // Show target step after brief delay for animation smooth transition
    setTimeout(() => {
        if (step === 'auth') {
            stepAuth.classList.add('active');
        } else if (step === '2fa') {
            step2FA.classList.add('active');
            otpBoxes[0].focus();
        } else if (step === 'success') {
            stepSuccess.classList.add('active');
        }
        currentStep = step;
    }, 150);
}

// Resend Countdown Timer
function startResendTimer() {
    let secondsLeft = 60;
    btnResend.disabled = true;
    btnResend.textContent = `Resend in ${secondsLeft}s`;

    if (countdownInterval) clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            btnResend.disabled = false;
            btnResend.textContent = 'Resend Code';
        } else {
            btnResend.textContent = `Resend in ${secondsLeft}s`;
        }
    }, 1000);
}

// Generate & Toast Mock 2FA Code
function sendMock2FACode(email) {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    generatedCode = code;
    
    // Display in toast
    toastCode.textContent = code;
    const toast = new bootstrap.Toast(toastElement, { delay: 10000 });
    toast.show();
    
    console.log(`[MOCK 2FA] Code for ${email} is ${code}`);
}

// Resend Action
function resendCode() {
    sendMock2FACode(userData.email);
    startResendTimer();
    
    // Clear inputs and error
    otpBoxes.forEach(box => {
        box.value = '';
        box.classList.remove('is-invalid');
    });
    otpError.classList.add('d-none');
    otpBoxes[0].focus();
}

// Login Submit
function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    
    // Set mock user data (extracting username from email prefix for display)
    userData.email = email;
    userData.username = email.split('@')[0];
    
    // Setup 2FA Screen
    displayEmail.textContent = email;
    sendMock2FACode(email);
    startResendTimer();
    
    transitionToStep('2fa');
}

// Sign Up Submit
function handleSignupSubmit(event) {
    event.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    userData.username = username;
    userData.email = email;
    
    // Setup 2FA Screen
    displayEmail.textContent = email;
    sendMock2FACode(email);
    startResendTimer();
    
    transitionToStep('2fa');
}

// Go Back
function goBackToForms() {
    if (countdownInterval) clearInterval(countdownInterval);
    transitionToStep('auth');
}

// 2FA Key/Input Behavior
otpBoxes.forEach((box, index) => {
    // Handling character input
    box.addEventListener('input', (e) => {
        const value = e.target.value;
        // Make sure it is numeric
        if (value && !/^[0-9]$/.test(value)) {
            box.value = '';
            return;
        }
        
        // Auto focus next box
        if (value && index < otpBoxes.length - 1) {
            otpBoxes[index + 1].focus();
        }
    });

    // Handling Backspace/Navigation keys
    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            if (!box.value && index > 0) {
                // Focus previous and clear
                otpBoxes[index - 1].focus();
                otpBoxes[index - 1].value = '';
            } else {
                box.value = '';
            }
            otpError.classList.add('d-none');
            otpBoxes.forEach(b => b.classList.remove('is-invalid'));
        }
    });

    // Handle pasting 6 digit code
    box.addEventListener('paste', (e) => {
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        const pastedData = clipboardData.getData('Text').trim();

        if (/^[0-9]{6}$/.test(pastedData)) {
            for (let i = 0; i < otpBoxes.length; i++) {
                otpBoxes[i].value = pastedData[i];
            }
            otpBoxes[otpBoxes.length - 1].focus();
        }
    });
});

// Verification Submit
function handle2FASubmit(event) {
    event.preventDefault();
    
    // Retrieve code
    let enteredCode = '';
    otpBoxes.forEach(box => {
        enteredCode += box.value;
    });
    
    if (enteredCode === generatedCode || enteredCode === '123456') { // Allow 123456 as a backup bypass code
        // Success Logic
        otpError.classList.add('d-none');
        otpBoxes.forEach(b => {
            b.classList.remove('is-invalid');
            b.style.borderColor = '#10b981';
        });

        // Set session
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', userData.username);
        localStorage.setItem('email', userData.email);

        // Admin verification
        const isAdmin = userData.email.toLowerCase().includes('admin');
        if (isAdmin) {
            localStorage.setItem('isAdmin', 'true');
        } else {
            localStorage.setItem('isAdmin', 'false');
        }

        // Customize Success Screen
        successUsername.textContent = userData.username;
        successMessage.innerHTML = `Authentication successful. Logged in as <span class="text-primary fw-semibold">${userData.username}</span>.`;
        
        transitionToStep('success');

        // Redirect after delay
        setTimeout(() => {
            if (isAdmin) {
                window.location.href = 'admin_choice.html';
            } else {
                // Check where to redirect (default: index.html)
                const redirectUrl = localStorage.getItem('redirectAfterLogin') || 'index.html';
                localStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
            }
        }, 3000);
    } else {
        // Error Shake Logic
        otpContainer.classList.add('shake');
        otpError.classList.remove('d-none');
        otpBoxes.forEach(b => {
            b.classList.add('is-invalid');
            b.value = ''; // clear out
        });
        otpBoxes[0].focus();

        setTimeout(() => {
            otpContainer.classList.remove('shake');
        }, 500);
    }
}
