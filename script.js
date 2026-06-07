let clickCount = 0;
let cookiesPerClick = 1;
let hasPassiveIncome = false;
let hasTripleClick = false;
let hasMultiplier = false;
let multiplierActive = false;
let multiplierInterval = null;

const cookieElement = document.getElementById('cookie');
const clickCountDisplay = document.getElementById('click-count');
const perSecondDisplay = document.getElementById('per-second');
const resetBtn = document.getElementById('reset-btn');

const buyTripleBtn = document.getElementById('buy-triple');
const buyMultiplierBtn = document.getElementById('buy-multiplier');
const buyPassiveBtn = document.getElementById('buy-passive');

const ownedTripleSpan = document.getElementById('owned-triple');
const ownedMultiplierSpan = document.getElementById('owned-multiplier');
const ownedPassiveSpan = document.getElementById('owned-passive');

const SAVE_KEY = 'cookieClickerData';

function createCrumb(x, y) {
    const crumb = document.createElement('div');
    crumb.className = 'crumb';
    
    const size = Math.random() * 8 + 4;
    crumb.style.width = size + 'px';
    crumb.style.height = size + 'px';
    crumb.style.left = x + 'px';
    crumb.style.top = y + 'px';
    crumb.style.background = `hsl(${Math.random() * 20 + 30}, 80%, ${Math.random() * 20 + 60}%)`;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 100 + 50;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance + 150;
    
    crumb.style.setProperty('--tx', tx + 'px');
    crumb.style.setProperty('--ty', ty + 'px');
    
    document.body.appendChild(crumb);
    
    const duration = Math.random() * 1000 + 800;
    const delay = Math.random() * 100;
    
    crumb.style.animation = `fallCrumb ${duration}ms ease-in ${delay}ms forwards`;
    
    setTimeout(() => {
        crumb.remove();
    }, duration + delay);
}

function spawnCrumbs(centerX, centerY) {
    const crumbCount = 8;
    const cookieRadius = 100;
    
    for (let i = 0; i < crumbCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * cookieRadius;
        const spawnX = centerX + Math.cos(angle) * distance;
        const spawnY = centerY + Math.sin(angle) * distance;
        
        createCrumb(spawnX, spawnY);
    }
}

function saveData() {
    const data = {
        clickCount,
        cookiesPerClick,
        hasPassiveIncome,
        hasTripleClick,
        hasMultiplier,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadData() {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
        const parsed = JSON.parse(data);
        clickCount = parsed.clickCount;
        cookiesPerClick = parsed.cookiesPerClick;
        hasPassiveIncome = parsed.hasPassiveIncome;
        hasTripleClick = parsed.hasTripleClick;
        hasMultiplier = parsed.hasMultiplier;
        
        clickCountDisplay.textContent = clickCount;
        updateUI();
        
        if (hasTripleClick) {
            ownedTripleSpan.textContent = '✓';
            ownedTripleSpan.style.display = 'block';
        }
        if (hasMultiplier) {
            ownedMultiplierSpan.textContent = 'Active';
            ownedMultiplierSpan.style.display = 'block';
        }
        if (hasPassiveIncome) {
            ownedPassiveSpan.textContent = '✓';
            ownedPassiveSpan.style.display = 'block';
        }
    }
}

function updateUI() {
    clickCountDisplay.textContent = clickCount;
    updateButtonStates();
    if (hasPassiveIncome) {
        perSecondDisplay.textContent = multiplierActive ? '+2/s' : '+1/s';
    } else {
        perSecondDisplay.textContent = '';
    }
}

function updateButtonStates() {
    buyTripleBtn.disabled = clickCount < 50 || hasTripleClick;
    buyMultiplierBtn.disabled = clickCount < 100 || hasMultiplier;
    buyPassiveBtn.disabled = clickCount < 50 || hasPassiveIncome;
}

function spendCookies(amount) {
    if (clickCount >= amount) {
        clickCount -= amount;
        updateUI();
        saveData();
        return true;
    }
    return false;
}

function addCookies(amount) {
    clickCount += amount;
    updateUI();
    saveData();
}

function startMultiplierCycle() {
    activateMultiplier();
    
    multiplierInterval = setInterval(() => {
        activateMultiplier();
    }, 10000);
}

function activateMultiplier() {
    multiplierActive = true;
    updateUI();
    
    setTimeout(() => {
        multiplierActive = false;
        updateUI();
    }, 10000);
}

cookieElement.addEventListener('click', () => {
    let gain = cookiesPerClick;
    if (multiplierActive) {
        gain *= 2;
    }
    addCookies(gain);
    
    cookieElement.classList.remove('clicked');
    void cookieElement.offsetWidth;
    cookieElement.classList.add('clicked');
    
    const rect = cookieElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    spawnCrumbs(centerX, centerY);
});

buyTripleBtn.addEventListener('click', () => {
    if (spendCookies(50)) {
        hasTripleClick = true;
        cookiesPerClick = 3;
        buyTripleBtn.disabled = true;
        ownedTripleSpan.textContent = '✓';
        ownedTripleSpan.style.display = 'block';
        saveData();
    }
});

buyMultiplierBtn.addEventListener('click', () => {
    if (spendCookies(100)) {
        hasMultiplier = true;
        ownedMultiplierSpan.textContent = 'Active';
        ownedMultiplierSpan.style.display = 'block';
        buyMultiplierBtn.disabled = true;
        saveData();
        
        startMultiplierCycle();
    }
});

buyPassiveBtn.addEventListener('click', () => {
    if (spendCookies(50)) {
        hasPassiveIncome = true;
        ownedPassiveSpan.textContent = '✓';
        ownedPassiveSpan.style.display = 'block';
        buyPassiveBtn.disabled = true;
        updateUI();
        saveData();
        
        startPassiveIncome();
    }
});

function startPassiveIncome() {
    setInterval(() => {
        if (hasPassiveIncome) {
            let gain = 1;
            if (multiplierActive) {
                gain = 2;
            }
            addCookies(gain);
        }
    }, 1000);
}

resetBtn.addEventListener('click', () => {
    if (confirm('Reset all progress?')) {
        localStorage.removeItem(SAVE_KEY);
        clickCount = 0;
        cookiesPerClick = 1;
        hasPassiveIncome = false;
        hasTripleClick = false;
        hasMultiplier = false;
        multiplierActive = false;
        
        if (multiplierInterval) {
            clearInterval(multiplierInterval);
        }
        
        clickCountDisplay.textContent = '0';
        perSecondDisplay.textContent = '';
        ownedTripleSpan.textContent = '';
        ownedTripleSpan.style.display = 'none';
        ownedMultiplierSpan.textContent = '';
        ownedMultiplierSpan.style.display = 'none';
        ownedPassiveSpan.textContent = '';
        ownedPassiveSpan.style.display = 'none';
        
        updateUI();
    }
});

loadData();
if (hasPassiveIncome) {
    startPassiveIncome();
}
if (hasMultiplier) {
    startMultiplierCycle();
}
