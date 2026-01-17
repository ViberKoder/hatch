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

// Load user info from Telegram
function loadUserInfo() {
    const user = tg.initDataUnsafe?.user;
    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar-img');
    const userAvatarInitialEl = document.getElementById('user-avatar-initial');
    const userAvatarFallback = document.querySelector('.user-avatar-fallback');
    
    if (user) {
        // Set user name
        if (userNameEl) {
            const displayName = user.first_name || user.username || 'User';
            userNameEl.textContent = displayName;
        }
        
        // Set user avatar
        if (user.photo_url && userAvatarEl) {
            userAvatarEl.src = user.photo_url;
            userAvatarEl.style.display = 'block';
            if (userAvatarFallback) userAvatarFallback.style.display = 'none';
        } else {
            // Use initial
            if (userAvatarEl) userAvatarEl.style.display = 'none';
            if (userAvatarFallback) userAvatarFallback.style.display = 'flex';
            if (userAvatarInitialEl) {
                const initial = (user.first_name || user.username || 'U')[0].toUpperCase();
                userAvatarInitialEl.textContent = initial;
            }
        }
    }
}

// Load statistics and points
async function loadStats() {
    const hatchedCountEl = document.getElementById('hatched-count');
    const myEggsCountEl = document.getElementById('my-eggs-count');
    const hatchPointsEl = document.getElementById('hatch-points');
    const referralsCountEl = document.getElementById('referrals-count');
    const referralEarningsEl = document.getElementById('referral-earnings');
    const availableEggsEl = document.getElementById('available-eggs');
    
    const userId = getUserID();
    
    if (!userId) {
        console.warn('No user ID found');
        if (hatchedCountEl) hatchedCountEl.textContent = '0';
        if (myEggsCountEl) myEggsCountEl.textContent = '0';
        if (hatchPointsEl) hatchPointsEl.textContent = '0';
        if (referralsCountEl) referralsCountEl.textContent = '0';
        if (referralEarningsEl) referralEarningsEl.textContent = '0';
        if (availableEggsEl) availableEggsEl.textContent = '10';
        return;
    }
    
    // Show loading
    if (hatchedCountEl) hatchedCountEl.innerHTML = '<span class="loading"></span>';
    if (myEggsCountEl) myEggsCountEl.innerHTML = '<span class="loading"></span>';
    if (hatchPointsEl) hatchPointsEl.innerHTML = '<span class="loading"></span>';
    if (referralsCountEl) referralsCountEl.innerHTML = '<span class="loading"></span>';
    if (referralEarningsEl) referralEarningsEl.innerHTML = '<span class="loading"></span>';
    if (availableEggsEl) availableEggsEl.innerHTML = '<span class="loading"></span>';
    
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
            
            // Hatch points = вылупленные яйца (hatched_by_me)
            const hatchPoints = data.hatched_by_me || 0;
            if (hatchPointsEl) {
                const currentValue = parseInt(hatchPointsEl.textContent) || 0;
                if (currentValue !== hatchPoints) {
                    animateValue(hatchPointsEl, currentValue, hatchPoints, 500);
                }
            }
            
            // Статистика
            if (hatchedCountEl) {
                const currentValue = parseInt(hatchedCountEl.textContent) || 0;
                const newValue = data.hatched_by_me || 0;
                if (currentValue !== newValue) {
                    animateValue(hatchedCountEl, currentValue, newValue, 500);
                }
            }
            if (myEggsCountEl) {
                const currentValue = parseInt(myEggsCountEl.textContent) || 0;
                const newValue = data.my_eggs_hatched || 0;
                if (currentValue !== newValue) {
                    animateValue(myEggsCountEl, currentValue, newValue, 500);
                }
            }
            
            // Доступные яйца
            const availableEggs = data.available_eggs !== undefined ? data.available_eggs : 10;
            if (availableEggsEl) {
                const currentValue = parseInt(availableEggsEl.textContent) || 10;
                if (currentValue !== availableEggs) {
                    animateValue(availableEggsEl, currentValue, availableEggs, 500);
                }
            }
            
            // Рефералы
            const referralsCount = data.referrals_count || 0;
            const referralEarnings = data.referral_earnings || 0;
            if (referralsCountEl) {
                const currentValue = parseInt(referralsCountEl.textContent) || 0;
                if (currentValue !== referralsCount) {
                    animateValue(referralsCountEl, currentValue, referralsCount, 500);
                }
            }
            if (referralEarningsEl) {
                const currentValue = parseInt(referralEarningsEl.textContent) || 0;
                if (currentValue !== referralEarnings) {
                    animateValue(referralEarningsEl, currentValue, referralEarnings, 500);
                }
            }
            
            // Update task status and progress
            updateTaskStatus(data.tasks || {}, data);
        } else {
            const errorText = await response.text();
            console.error('API error:', response.status, errorText);
            throw new Error(`Failed to load stats: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
        if (hatchedCountEl) hatchedCountEl.textContent = '0';
        if (myEggsCountEl) myEggsCountEl.textContent = '0';
        if (hatchPointsEl) hatchPointsEl.textContent = '0';
        if (referralsCountEl) referralsCountEl.textContent = '0';
        if (referralEarningsEl) referralEarningsEl.textContent = '0';
        if (availableEggsEl) availableEggsEl.textContent = '10';
    }
}

// Update task status
function updateTaskStatus(tasks, data) {
    // Subscribe task
    const subscribeButton = document.getElementById('subscribe-button');
    const subscribeTask = document.getElementById('task-subscribe');
    
    if (subscribeButton && subscribeTask) {
        if (tasks.subscribed_to_cocoin) {
            subscribeButton.textContent = 'Completed';
            subscribeButton.classList.add('completed');
            subscribeButton.disabled = true;
            subscribeTask.style.opacity = '0.7';
        }
    }
    
    // Hatch 333 task
    const hatch100Button = document.getElementById('hatch-100-button');
    const hatch100Task = document.getElementById('task-hatch-100');
    const hatchedCount = data.hatched_by_me || 0;
    
    if (hatch100Button && hatch100Task) {
        if (tasks.hatch_333_eggs) {
            hatch100Button.textContent = 'Completed';
            hatch100Button.classList.add('completed');
            hatch100Button.disabled = true;
            hatch100Task.style.opacity = '0.7';
        } else {
            hatch100Button.textContent = 'Complete';
            hatch100Button.disabled = false;
            // Remove old event listeners by cloning
            const newButton = hatch100Button.cloneNode(true);
            hatch100Button.parentNode.replaceChild(newButton, hatch100Button);
            
            // Add click handler
            const updatedButton = document.getElementById('hatch-100-button');
            updatedButton.addEventListener('click', async () => {
                if (hatchedCount >= 333) {
                    const userId = getUserID();
                    try {
                        // Task is auto-completed when user reaches 333 hatches
                        // Just reload stats
                        loadStats();
                        tg.showAlert('Task completed! You earned 100 Egg points! 🎉');
                    } catch (error) {
                        console.error('Error completing task:', error);
                    }
                } else {
                    tg.showAlert(`You need to hatch ${333 - hatchedCount} more eggs to complete this task.`);
                }
            });
        }
    }
}

// Animate value counter
function animateValue(element, start, end, duration) {
    if (!element) return;
    
    const startTime = performance.now();
    const isInteger = Number.isInteger(start) && Number.isInteger(end);
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = start + (end - start) * easeOut;
        
        element.textContent = isInteger ? Math.floor(current) : current.toFixed(1);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = isInteger ? end : end.toFixed(1);
        }
    }
    
    requestAnimationFrame(update);
}

// Setup send egg button
function setupSendEggButton() {
    const sendEggBtn = document.getElementById('send-egg-image-btn');
    if (sendEggBtn) {
        sendEggBtn.addEventListener('click', () => {
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
                tg.showAlert('You earned 100 Egg points! 🎉');
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
    
    // Check for deep link in URL
    const urlParams = new URLSearchParams(window.location.search);
    const pageParam = urlParams.get('page');
    if (pageParam) {
        // Map page names
        const pageMap = {
            'more-egg': 'more-egg',
            'more': 'more-egg',
            'profile': 'profile',
            'home': 'home'
        };
        const targetPage = pageMap[pageParam] || 'home';
        
        // Update nav
        navItems.forEach(nav => {
            if (nav.getAttribute('data-page') === targetPage) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });
        
        // Show page
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === `page-${targetPage}`) {
                page.classList.add('active');
            }
        });
    }
}

// TON Connect Setup
function setupTONConnect() {
    const tonConnectManualBtn = document.getElementById('ton-connect-manual-btn');
    const tonConnectBtn = document.getElementById('ton-connect-btn');
    const walletStatus = document.getElementById('wallet-status');
    const walletAddressEl = document.getElementById('wallet-address');
    
    // Wait for TON Connect UI to load
    function initTONConnect() {
        // Check if TON Connect UI is loaded (according to docs: TON_CONNECT_UI.TonConnectUI)
        if (typeof window.TON_CONNECT_UI === 'undefined' || !window.TON_CONNECT_UI.TonConnectUI) {
            console.error('TON Connect UI not loaded, retrying...');
            setTimeout(initTONConnect, 500);
            return;
        }
        
        // Initialize TON Connect UI (hidden button for automatic connection)
        try {
            tonConnectUI = new window.TON_CONNECT_UI.TonConnectUI({
                manifestUrl: window.location.origin + '/tonconnect-manifest.json',
                buttonRootId: 'ton-connect-btn'
            });
            
            console.log('TON Connect UI initialized');
            
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
                        tonConnectManualBtn.textContent = 'TON Connect';
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
            }).catch(err => {
                console.log('No existing connection:', err);
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
                    tg.showAlert('TON Connect error: ' + error.message);
                });
            }
        }
    }
    
    // Start initialization
    initTONConnect();
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
        const amount = (eggs / 10) * 0.1; // 10 eggs = 0.1 TON
        selectedPrice.textContent = amount.toFixed(1);
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
            // Use boc (bag of cells) as transaction hash, or the result itself
            const txHash = result.boc || (typeof result === 'string' ? result : JSON.stringify(result));
            const verifyResponse = await fetch(`${BOT_API_URL}/api/ton/verify_payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    tx_hash: txHash,
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
            buyButton.textContent = 'Buy';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
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
    
    // Reload stats periodically to update available eggs
    setInterval(() => {
        loadStats();
    }, 30000); // Every 30 seconds
});
