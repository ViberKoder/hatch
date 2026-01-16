// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Set theme colors
tg.setHeaderColor('#0a0e27');
tg.setBackgroundColor('#0a0e27');

// Get user ID from Telegram or URL
function getUserID() {
    // Try Telegram WebApp first
    if (tg.initDataUnsafe?.user?.id) {
        return tg.initDataUnsafe.user.id;
    }
    
    // Fallback to URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user_id');
    if (userId) {
        return parseInt(userId);
    }
    
    return null;
}

// API endpoint - update this to your backend
const API_URL = process.env.API_URL || 'https://your-api-server.com/api/stats';

// Load statistics
async function loadStats() {
    const hatchedCountEl = document.getElementById('hatched-count');
    const myEggsCountEl = document.getElementById('my-eggs-count');
    
    const userId = getUserID();
    
    if (!userId) {
        hatchedCountEl.textContent = '0';
        myEggsCountEl.textContent = '0';
        return;
    }
    
    // Show loading
    hatchedCountEl.innerHTML = '<span class="loading"></span>';
    myEggsCountEl.innerHTML = '<span class="loading"></span>';
    
    try {
        const response = await fetch(`${API_URL}?user_id=${userId}`);
        
        if (response.ok) {
            const data = await response.json();
            animateValue(hatchedCountEl, 0, data.hatched_by_me || 0, 1000);
            animateValue(myEggsCountEl, 0, data.my_eggs_hatched || 0, 1000);
        } else {
            throw new Error('Failed to load stats');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        hatchedCountEl.textContent = '0';
        myEggsCountEl.textContent = '0';
    }
}

// Animate number counting
function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * (end - start) + start);
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    
    // Handle back button
    tg.BackButton.onClick(() => {
        tg.close();
    });
    
    // Show back button if needed
    if (window.history.length > 1) {
        tg.BackButton.show();
    }
});
