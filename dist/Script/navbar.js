// Authentication Navbar Sync & Session Management

document.addEventListener('DOMContentLoaded', () => {
    syncNavbarState();
    handleSessionBoundaries();
});

// Update the Navbar UI based on Login Status
function syncNavbarState() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const username = localStorage.getItem('username') || 'Gamer';
    const userAvatar = localStorage.getItem('userAvatar');
    
    // Find the dropdown element in navbar
    const navDropdown = document.querySelector('.navbar-nav .dropdown');
    if (!navDropdown) return;
    
    if (isLoggedIn) {
        // Logged In: Ensure dropdown is shown and populated
        const profilePic = navDropdown.querySelector('.profile-pic');
        if (profilePic && userAvatar) {
            profilePic.src = userAvatar;
        }

        // Inject Admin Panel link if admin
        const dropdownMenu = navDropdown.querySelector('.dropdown-menu');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (dropdownMenu && isAdmin && !dropdownMenu.querySelector('.admin-link')) {
            const adminItem = document.createElement('li');
            adminItem.className = 'admin-link';
            adminItem.innerHTML = `<a class="dropdown-item text-warning fw-bold d-flex align-items-center" href="admin_choice.html">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-shield-lock-fill me-2" viewBox="0 0 16 16">
                    <path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.775 11.775 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24c.304-.143.662-.352 1.048-.625a11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.439 62.439 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.97.1l-.385-1.99A1.5 1.5 0 0 1 8 5z"/>
                </svg>
                <span>Admin Panel</span>
            </a>`;
            dropdownMenu.insertBefore(adminItem, dropdownMenu.firstChild);
            
            // Insert a divider after admin panel link
            const divider = document.createElement('li');
            divider.innerHTML = `<hr class="dropdown-divider">`;
            dropdownMenu.insertBefore(divider, adminItem.nextSibling);
        }
        
        // Update "My Account" label for small screens if exists
        const label = navDropdown.querySelector('.d-lg-none');
        if (label) {
            label.textContent = username;
        }

        // Setup Logout Button event handler
        const logoutBtn = navDropdown.querySelector('.dropdown-item.text-danger');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                performLogout();
            });
        }
    } else {
        // Logged Out: Replace profile dropdown with a sleek "Sign In" button
        const signInBtnHtml = `
            <li class="nav-item ms-lg-4 mt-3 mt-lg-0">
                <a class="nav-link btn-signin d-inline-flex align-items-center justify-content-center px-4 py-2" href="auth.html">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-in-right me-2" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0v-2z"/>
                        <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
                    </svg>
                    <span>Sign In</span>
                </a>
            </li>
        `;
        navDropdown.outerHTML = signInBtnHtml;
    }

    // Apply global styled signin button classes if not already styled
    injectSignInStyles();
}

// Access Boundaries logic for secure pages
function handleSessionBoundaries() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    
    // Secure pages requiring login
    const securePages = ['inventory.html', 'redeem.html'];
    // Secure pages requiring admin login
    const adminPages = ['admin.html', 'admin_choice.html'];
    
    if (adminPages.includes(currentPage) && (!isLoggedIn || !isAdmin)) {
        window.location.href = 'auth.html';
        return;
    }
    
    if (securePages.includes(currentPage) && !isLoggedIn) {
        localStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'auth.html';
        return;
    }

    // Populate data on inventory profile page if logged in
    if (currentPage === 'inventory.html' && isLoggedIn) {
        const username = localStorage.getItem('username');
        const email = localStorage.getItem('email');
        const userAvatar = localStorage.getItem('userAvatar');
        
        const profileName = document.querySelector('.profile-name');
        const profileEmail = document.querySelector('.profile-email');
        const profileAvatarImg = document.getElementById('profile-avatar-img');
        
        if (profileName && username) profileName.textContent = username;
        if (profileEmail && email) profileEmail.textContent = email;
        if (profileAvatarImg && userAvatar) profileAvatarImg.src = userAvatar;
    }
}

// Perform Logout
function performLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('isAdmin');
    // Keep avatar so they don't lose custom avatar upload, or delete it? We can keep it.
    
    // Redirect to landing
    window.location.href = 'index.html';
}

// Inject navbar Sign In styling dynamically
function injectSignInStyles() {
    if (document.getElementById('nav-signin-style')) return;
    
    const style = document.createElement('style');
    style.id = 'nav-signin-style';
    style.textContent = `
        :root {
          --bg-color: #0c1017;
          --bg-secondary: #161b22;
          --accent-color: #fea302;
          --accent-hover: #f5ba54;
          --text-primary: #f8fafc;
          --text-secondary: #94a3b8;
          --link-visited: #f5ba54;
          --glass-bg: rgba(22, 27, 34, 0.7);
          --glass-border: rgba(255, 255, 255, 0.1);
          --transition: all 0.3s ease;
        }
        .navbar-nav .nav-link.btn-signin {
            color: var(--text-secondary) !important;
            background: transparent !important;
            border: 2px solid var(--accent-color) !important;
            border-radius: 20px !important;
            font-weight: 600 !important;
            font-size: 0.85rem;
            transition: var(--transition) !important;
            text-decoration: none !important;
        }
        .navbar-nav .nav-link.btn-signin:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(254, 163, 2, 0.4) !important;
            color: #000 !important;
            background: linear-gradient(135deg, var(--accent-hover), #f5ba54) !important;
            border-color: var(--accent-hover) !important;
        }
        .btn-signin::after {
            display: none !important; /* Remove line under active nav elements */
        }
    `;
    document.head.appendChild(style);
}
