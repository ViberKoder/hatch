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
const BOT_API_URL = API_URL.replace('/api/stats', '');

// Log for debugging
console.log('API URL:', API_URL);

// TON Connect
let tonConnectUI = null;
let walletAddress = null;

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
            
            // Update task status and progress
            updateTaskStatus(data.tasks || {}, data);
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
function updateTaskStatus(tasks, data) {
    // Subscribe task
    const subscribeButton = document.getElementById('subscribe-button');
    const subscribeTask = document.getElementById('task-subscribe');
    
    if (subscribeButton && subscribeTask) {
        if (tasks.subscribed_to_cocoin) {
            subscribeButton.textContent = 'Subscribed ✓';
            subscribeButton.classList.add('completed');
            subscribeButton.disabled = true;
            subscribeTask.style.opacity = '0.7';
        }
    }
    
    // Hatch 100 egg task
    const hatch100Button = document.getElementById('hatch-100-button');
    const hatch100Task = document.getElementById('task-hatch-100');
    const hatchProgress = document.getElementById('hatch-progress');
    const hatchedCount = data.hatched_by_me || 0;
    
    if (hatchProgress) {
        hatchProgress.textContent = `${Math.min(hatchedCount, 100)} / 100`;
    }
    
    if (hatch100Button && hatch100Task) {
        if (tasks.hatch_100_eggs) {
            hatch100Button.textContent = 'Completed ✓';
            hatch100Button.classList.add('completed');
            hatch100Button.disabled = true;
            hatch100Task.style.opacity = '0.7';
        } else {
            hatch100Button.textContent = 'In Progress';
            hatch100Button.disabled = true;
        }
    }
    
    // Send 100 egg task
    const send100Button = document.getElementById('send-100-button');
    const send100Task = document.getElementById('task-send-100');
    const sendProgress = document.getElementById('send-progress');
    const sentCount = data.eggs_sent || 0;
    
    if (sendProgress) {
        sendProgress.textContent = `${Math.min(sentCount, 100)} / 100`;
    }
    
    if (send100Button && send100Task) {
        if (tasks.send_100_eggs) {
            send100Button.textContent = 'Completed ✓';
            send100Button.classList.add('completed');
            send100Button.disabled = true;
            send100Task.style.opacity = '0.7';
        } else {
            send100Button.textContent = 'In Progress';
            send100Button.disabled = true;
        }
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

// Handle Send Egg image button
function setupSendEggButton() {
    const sendEggImageBtn = document.getElementById('send-egg-image-btn');
    if (sendEggImageBtn) {
        sendEggImageBtn.addEventListener('click', () => {
            // Open inline mode to forward "@tohatchbot egg" to chats
            tg.switchInlineQuery('@tohatchbot egg', ['users', 'bots', 'groups', 'channels']);
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
        const response = await fetch(`${BOT_API_URL}/api/stats/check_subscription?user_id=${userId}`, {
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

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.getAttribute('data-page');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `page-${targetPage}`) {
                    page.classList.add('active');
                }
            });
        });
    });
}

// TON Connect Setup
function setupTONConnect() {
    const tonConnectManualBtn = document.getElementById('ton-connect-manual-btn');
    const tonConnectBtn = document.getElementById('ton-connect-btn');
    const walletStatus = document.getElementById('wallet-status');
    const walletAddressEl = document.getElementById('wallet-address');
    
    // Check if TON Connect UI is loaded
    if (typeof TON_CONNECT_UI === 'undefined' && typeof window.TON_CONNECT_UI === 'undefined') {
        console.error('TON Connect UI not loaded');
        if (tonConnectManualBtn) {
            tonConnectManualBtn.addEventListener('click', () => {
                tg.showAlert('TON Connect is loading... Please wait and refresh the page.');
            });
        }
        return;
    }
    
    // Use correct namespace for TON Connect UI
    const TonConnectUI = window.TON_CONNECT_UI?.TonConnectUI || TON_CONNECT_UI?.TonConnectUI;
    
    if (!TonConnectUI) {
        console.error('TonConnectUI constructor not found');
        return;
    }
    
    // Initialize TON Connect UI (hidden button for automatic connection)
    try {
        tonConnectUI = new TonConnectUI({
            manifestUrl: window.location.origin + '/tonconnect-manifest.json',
            buttonRootId: 'ton-connect-btn'
        });
        
        // Handle connection
        tonConnectUI.onStatusChange((wallet) => {
            if (wallet) {
                walletAddress = wallet.account.address;
                console.log('TON Wallet connected:', walletAddress);
                
                // Update manual button
                if (tonConnectManualBtn) {
                    tonConnectManualBtn.textContent = 'Connected ✓';
                    tonConnectManualBtn.style.background = '#00d4aa';
                    tonConnectManualBtn.disabled = true;
                }
                
                // Show wallet status
                if (walletStatus && walletAddressEl) {
                    walletStatus.style.display = 'block';
                    walletAddressEl.textContent = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
                }
            } else {
                walletAddress = null;
                console.log('TON Wallet disconnected');
                
                // Update manual button
                if (tonConnectManualBtn) {
                    tonConnectManualBtn.textContent = 'Connect TON Wallet';
                    tonConnectManualBtn.style.background = '#0088cc';
                    tonConnectManualBtn.disabled = false;
                }
                
                // Hide wallet status
                if (walletStatus) {
                    walletStatus.style.display = 'none';
                }
            }
        });
        
        // Check if already connected
        tonConnectUI.connectionRestored.then(() => {
            if (tonConnectUI.wallet?.account) {
                walletAddress = tonConnectUI.wallet.account.address;
                if (tonConnectManualBtn) {
                    tonConnectManualBtn.textContent = 'Connected ✓';
                    tonConnectManualBtn.style.background = '#00d4aa';
                    tonConnectManualBtn.disabled = true;
                }
                if (walletStatus && walletAddressEl) {
                    walletStatus.style.display = 'block';
                    walletAddressEl.textContent = walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4);
                }
            }
        });
        
        // Manual button click - open TON Connect modal
        if (tonConnectManualBtn) {
            tonConnectManualBtn.addEventListener('click', () => {
                if (!walletAddress && tonConnectUI) {
                    // Open TON Connect modal
                    tonConnectUI.openModal();
                }
            });
        }
    } catch (error) {
        console.error('TON Connect initialization error:', error);
        if (tonConnectManualBtn) {
            tonConnectManualBtn.addEventListener('click', () => {
                tg.showAlert('TON Connect initialization error: ' + error.message);
            });
        }
    }
}

// Setup Buy Eggs
function setupBuyEggs() {
    const eggsInput = document.getElementById('eggs-input');
    const selectedPrice = document.getElementById('selected-price');
    const buyButton = document.getElementById('buy-eggs-button');
    
    if (!eggsInput || !selectedPrice || !buyButton) return;
    
    // Validate input
    function validateEggs(value) {
        const eggs = parseInt(value);
        if (isNaN(eggs) || eggs < 10) return 10;
        if (eggs > 1000) return 1000;
        // Round to nearest 10
        return Math.round(eggs / 10) * 10;
    }
    
    // Update price when input changes
    eggsInput.addEventListener('input', (e) => {
        const eggs = validateEggs(e.target.value);
        e.target.value = eggs;
        const price = (eggs / 10) * 0.1; // 10 eggs = 0.1 TON
        selectedPrice.textContent = price.toFixed(1);
    });
    
    // Validate on blur
    eggsInput.addEventListener('blur', (e) => {
        const eggs = validateEggs(e.target.value);
        e.target.value = eggs;
        const price = (eggs / 10) * 0.1;
        selectedPrice.textContent = price.toFixed(1);
    });
    
    // Handle buy button
    buyButton.addEventListener('click', async () => {
        if (!walletAddress) {
            tg.showAlert('Please connect your TON wallet first in Profile page');
            return;
        }
        
        const eggs = validateEggs(eggsInput.value);
        if (eggs < 10 || eggs > 1000) {
            tg.showAlert('Please enter a number between 10 and 1000');
            return;
        }
        
        const amount = (eggs / 10) * 0.1; // 10 eggs = 0.1 TON
        const wallet = 'UQCHdlQ2TLpa6Kpu5Pu8HeJd1xe3EL1Kx2wFekeuOnSpFcP0';
        
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360,
            messages: [
                {
                    address: wallet,
                    amount: (amount * 1000000000).toString(), // Convert to nanotons
                }
            ]
        };
        
        try {
            buyButton.disabled = true;
            buyButton.textContent = 'Processing...';
            
            const result = await tonConnectUI.sendTransaction(transaction);
            console.log('Transaction result:', result);
            
            // Verify payment
            const userId = getUserID();
            const verifyResponse = await fetch(`${BOT_API_URL}/api/ton/verify_payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    tx_hash: result.boc,
                    amount: amount
                })
            });
            
            const verifyData = await verifyResponse.json();
            
            if (verifyResponse.ok && verifyData.success) {
                tg.showAlert(`✅ Payment successful! You can now send ${verifyData.eggs_added} more eggs.`);
                loadStats();
            } else {
                tg.showAlert(`❌ Payment verification failed: ${verifyData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            tg.showAlert(`❌ Payment failed: ${error.message}`);
        } finally {
            buyButton.disabled = false;
            buyButton.textContent = 'Buy Eggs';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    setupSendEggButton();
    setupSubscribeButton();
    setupNavigation();
    setupTONConnect();
    setupBuyEggs();
    
    // Handle back button
    tg.BackButton.onClick(() => {
        tg.close();
    });
    
    // Show back button if needed
    if (window.history.length > 1) {
        tg.BackButton.show();
    }
});
