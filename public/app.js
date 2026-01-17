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

// API endpoint - get from environment or use default
// For Vercel, this should be set as environment variable
// Default to Railway URL
const API_URL = process.env.API_URL || window.API_URL || 'https://web-production-11ef2.up.railway.app/api/stats';
// Extract base URL - if API_URL ends with /api/stats, remove it
const BOT_API_URL = API_URL.endsWith('/api/stats') ? API_URL.replace('/api/stats', '') : API_URL.replace('/stats', '');

// TON Connect
let tonConnectUI = null;
let walletAddress = null;

// Initialize TON Connect
function initTONConnect() {
    if (typeof TonConnectUI !== 'undefined') {
        tonConnectUI = new TonConnectUI({
            manifestUrl: `${window.location.origin}/tonconnect-manifest.json`,
            buttonRootId: 'ton-connect-btn'
        });
        
        // Check if wallet is already connected
        tonConnectUI.connectionRestored.then(() => {
            const account = tonConnectUI.wallet?.account;
            if (account) {
                walletAddress = account.address;
                console.log('TON wallet connected:', walletAddress);
                updateUI();
            }
        });
        
        // Handle wallet connection
        tonConnectUI.onStatusChange((wallet) => {
            if (wallet) {
                walletAddress = wallet.account.address;
                console.log('TON wallet connected:', walletAddress);
                updateUI();
            } else {
                walletAddress = null;
                console.log('TON wallet disconnected');
                updateUI();
            }
        });
    } else {
        console.error('TON Connect UI not loaded');
    }
}

// Check payment status
async function checkPaymentStatus() {
    const userId = getUserID();
    if (!userId) return;
    
    try {
        const response = await fetch(`${BOT_API_URL}/api/ton/payment_info?user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Payment info:', data);
            
            // Show payment section if needed
            const paymentSection = document.getElementById('payment-section');
            const tonConnectSection = document.getElementById('ton-connect-section');
            
            if (data.needs_payment) {
                // Update payment info
                document.getElementById('ton-price').textContent = data.ton_price;
                document.getElementById('eggs-pack-size').textContent = data.eggs_per_pack;
                document.getElementById('pay-amount').textContent = data.ton_price;
                
                // Show payment section if wallet is connected
                if (walletAddress) {
                    paymentSection.style.display = 'block';
                    tonConnectSection.style.display = 'none';
                } else {
                    tonConnectSection.style.display = 'block';
                    paymentSection.style.display = 'none';
                }
            } else {
                paymentSection.style.display = 'none';
                tonConnectSection.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error checking payment status:', error);
    }
}

// Handle TON payment
async function handleTONPayment() {
    const userId = getUserID();
    if (!userId || !walletAddress) {
        alert('Please connect your TON wallet first');
        return;
    }
    
    try {
        // Get payment info
        const response = await fetch(`${BOT_API_URL}/api/ton/payment_info?user_id=${userId}`);
        const paymentInfo = await response.json();
        
        if (!paymentInfo.needs_payment) {
            alert('You don\'t need to pay right now');
            return;
        }
        
        const amount = paymentInfo.ton_price; // 0.1 TON
        const wallet = paymentInfo.ton_wallet; // Recipient wallet
        
        // Create transaction
        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 360, // 5 minutes
            messages: [
                {
                    address: wallet,
                    amount: (amount * 1000000000).toString(), // Convert to nanotons
                }
            ]
        };
        
        // Send transaction
        const result = await tonConnectUI.sendTransaction(transaction);
        console.log('Transaction result:', result);
        
        // Verify payment with backend
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
            alert(`✅ Payment successful! You can now send ${verifyData.eggs_added} more eggs.`);
            // Reload payment status
            checkPaymentStatus();
        } else {
            alert(`❌ Payment verification failed: ${verifyData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        alert(`❌ Payment failed: ${error.message}`);
    }
}

// Update UI based on wallet connection
function updateUI() {
    checkPaymentStatus();
}

// Load statistics
async function loadStats() {
    const hatchedCountEl = document.getElementById('hatched-count');
    const myEggsCountEl = document.getElementById('my-eggs-count');
    
    const userId = getUserID();
    
    if (!userId) {
        console.warn('No user ID found');
        hatchedCountEl.textContent = '0';
        myEggsCountEl.textContent = '0';
        return;
    }
    
    // Show loading
    hatchedCountEl.innerHTML = '<span class="loading"></span>';
    myEggsCountEl.innerHTML = '<span class="loading"></span>';
    
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
        } else {
            const errorText = await response.text();
            console.error('API error:', response.status, errorText);
            throw new Error(`Failed to load stats: ${response.status}`);
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

// Handle Send Egg button
function setupSendEggButton() {
    const sendEggBtn = document.getElementById('send-egg-btn');
    if (sendEggBtn) {
        sendEggBtn.addEventListener('click', () => {
            // Open inline mode in Telegram
            tg.openLink('https://t.me/tohatchbot?start=egg', { try_instant_view: false });
        });
    }
}

// Setup payment button
function setupPaymentButton() {
    const payBtn = document.getElementById('pay-ton-btn');
    if (payBtn) {
        payBtn.addEventListener('click', handleTONPayment);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    setupSendEggButton();
    setupPaymentButton();
    
    // Initialize TON Connect
    initTONConnect();
    
    // Check payment status after a delay to ensure TON Connect is initialized
    setTimeout(() => {
        checkPaymentStatus();
    }, 1000);
    
    // Handle back button
    tg.BackButton.onClick(() => {
        tg.close();
    });
    
    // Show back button if needed
    if (window.history.length > 1) {
        tg.BackButton.show();
    }
    
    // Check if we need to show payment UI from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('pay') === 'true') {
        // Show payment section
        setTimeout(() => {
            checkPaymentStatus();
        }, 1500);
    }
});
