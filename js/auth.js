document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('php/auth.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.success) {
            localStorage.setItem('user', JSON.stringify(result.user));
            if (result.user.role === 'admin') {
                window.location.href = 'admin/dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Login failed. Please try again.');
    }
});

document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;
    
    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }
    
    const formData = new FormData(e.target);
    
    try {
        const response = await fetch('php/auth.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (result.success) {
            alert('Account created successfully! Please login.');
            window.location.href = 'login.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Signup failed. Please try again.');
    }
});

// Check if user is logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    const authPages = ['login.html', 'signup.html'];
    const isAuthPage = authPages.some(page => window.location.pathname.includes(page));
    
    if (user && isAuthPage) {
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);