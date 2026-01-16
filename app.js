// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Get user ID from Telegram
const userId = tg.initDataUnsafe?.user?.id || tg.initDataUnsafe?.user?.id;

// API endpoint
// Для локальной разработки: http://localhost:8080/api/stats
// Для продакшена: настройте ваш сервер с ботом
// Можно использовать CORS proxy или настроить свой сервер
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8080/api/stats'
    : 'https://your-bot-server.com/api/stats'; // TODO: Замените на ваш API endpoint

// Load statistics
async function loadStats() {
    const hatchedCountEl = document.getElementById('hatched-count');
    const myEggsCountEl = document.getElementById('my-eggs-count');
    
    // Show loading
    hatchedCountEl.innerHTML = '<span class="loading"></span>';
    myEggsCountEl.innerHTML = '<span class="loading"></span>';
    
    try {
        // Try to get user ID from Telegram
        if (userId) {
            const response = await fetch(`${API_URL}?user_id=${userId}`);
            if (response.ok) {
                const data = await response.json();
                animateValue(hatchedCountEl, 0, data.hatched_by_me || 0, 1000);
                animateValue(myEggsCountEl, 0, data.my_eggs_hatched || 0, 1000);
                return;
            }
        }
        
        // Fallback: try to get from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const storedUserId = urlParams.get('user_id') || localStorage.getItem('hatch_user_id');
        
        if (storedUserId) {
            const response = await fetch(`${API_URL}?user_id=${storedUserId}`);
            if (response.ok) {
                const data = await response.json();
                animateValue(hatchedCountEl, 0, data.hatched_by_me || 0, 1000);
                animateValue(myEggsCountEl, 0, data.my_eggs_hatched || 0, 1000);
                return;
            }
        }
        
        // If no user ID, show 0
        hatchedCountEl.textContent = '0';
        myEggsCountEl.textContent = '0';
        
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
        const current = Math.floor(progress * (end - start) + start);
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Load stats on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    
    // Set Telegram theme
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Handle back button
    tg.BackButton.onClick(() => {
        tg.close();
    });
});
