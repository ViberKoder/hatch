// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Set theme colors - white theme
tg.setHeaderColor('#ffffff');
tg.setBackgroundColor('#ffffff');

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

// API endpoint
const API_URL = 'https://web-production-11ef2.up.railway.app/api/stats';

// Log for debugging
console.log('API URL:', API_URL);

// Load statistics and points
async function loadStats() {
    const hatchedCountEl = document.getElementById('hatched-count');
    const myEggsCountEl = document.getElementById('my-eggs-count');
    const eggPointsEl = document.getElementById('egg-points');
    
    const userId = getUserID();
    
    if (!userId) {
        console.warn('No user ID found');
        hatchedCountEl.textContent = '0';
        myEggsCountEl.textContent = '0';
        eggPointsEl.textContent = '0';
        return;
    }
    
    // Show loading
    hatchedCountEl.innerHTML = '<span class="loading"></span>';
    myEggsCountEl.innerHTML = '<span class="loading"></span>';
    eggPointsEl.innerHTML = '<span class="loading"></span>';
    
    try {
        console.log(`Fetching stats from: ${API_URL}?user_id=${userId}`);
        const response = await fetch(`${API_URL}?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Stats data:', data);
            animateValue(hatchedCountEl, 0, data.hatched_by_me || 0, 1000);
            animateValue(myEggsCountEl, 0, data.my_eggs_hatched || 0, 1000);
            animateValue(eggPointsEl, 0, data.egg_points || 0, 1000);
            
            // Update task status
            updateTaskStatus(data.tasks || {});
        } else {
            const errorText = await response.text();
            console.error('API error:', response.status, errorText);
            throw new Error(`Failed to load stats: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        hatchedCountEl.textContent = '0';
        myEggsCountEl.textContent = '0';
        eggPointsEl.textContent = '0';
    }
}

// Update task status
function updateTaskStatus(tasks) {
    const subscribeButton = document.getElementById('subscribe-button');
    const subscribeTask = document.getElementById('task-subscribe');
    
    if (tasks.subscribed_to_cocoin) {
        subscribeButton.textContent = 'Subscribed ✓';
        subscribeButton.classList.add('completed');
        subscribeButton.disabled = true;
        subscribeTask.style.opacity = '0.7';
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

// Handle Send Egg button
function setupSendEggButton() {
    const sendEggBtn = document.getElementById('send-egg-btn');
    if (sendEggBtn) {
        sendEggBtn.addEventListener('click', () => {
            // Open inline mode in Telegram
            tg.openTelegramLink('https://t.me/tohatchbot?start=egg');
        });
    }
}

// Setup subscribe button
function setupSubscribeButton() {
    const subscribeButton = document.getElementById('subscribe-button');
    if (subscribeButton) {
        subscribeButton.addEventListener('click', () => {
            // Open Cocoin channel
            tg.openTelegramLink('https://t.me/cocoin');
            
            // Check subscription after a delay
            setTimeout(() => {
                checkSubscription();
            }, 2000);
        });
    }
}

// Check subscription status
async function checkSubscription() {
    const userId = getUserID();
    if (!userId) return;
    
    try {
        const response = await fetch(`${API_URL.replace('/api/stats', '')}/api/stats/check_subscription?user_id=${userId}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.subscribed) {
                // Reload stats to update points
                loadStats();
                tg.showAlert('You earned 333 Egg points! 🎉');
            } else {
                tg.showAlert('Please subscribe to @cocoin channel first');
            }
        }
    } catch (error) {
        console.error('Error checking subscription:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    setupSendEggButton();
    setupSubscribeButton();
    
    // Handle back button
    tg.BackButton.onClick(() => {
        tg.close();
    });
    
    // Show back button if needed
    if (window.history.length > 1) {
        tg.BackButton.show();
    }
});
