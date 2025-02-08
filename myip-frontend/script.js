// Configuration
const API_URL = 'https://myip-api.aa2.workers.dev';
const THEME_KEY = 'preferred-theme';

// Country code to flag emoji conversion
const getFlagEmoji = (countryCode) => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const ipAddress = document.getElementById('ip-address');
const locationDisplay = document.getElementById('location');
const asnDisplay = document.getElementById('asn');
const timestamp = document.getElementById('time');
const copyButton = document.getElementById('copy-ip');
const refreshButton = document.getElementById('refresh');
const shareButton = document.getElementById('share');

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(THEME_KEY, 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
}

// Data Display
function updateUI(data) {
    // Update IP
    ipAddress.textContent = data.ip;
    
    // Update location
    const locationParts = [];
    if (data.city) locationParts.push(data.city);
    if (data.country) locationParts.push(data.country);
    locationDisplay.textContent = locationParts.length > 0 
        ? locationParts.join(', ')
        : 'Location unknown';

    // Update ASN with flag
    if (data.country && data.asn && data.asOrganization) {
        const flag = getFlagEmoji(data.country);
        asnDisplay.textContent = `${flag} ${data.asn} ${data.asOrganization}`;
    } else {
        asnDisplay.textContent = 'Network info unavailable';
    }

    // Update timestamp
    const time = new Date(data.timestamp);
    timestamp.textContent = `Last updated: ${time.toLocaleString()}`;
}

// IP Data Management
async function fetchIpData() {
    try {
        ipAddress.textContent = 'Loading...';
        locationDisplay.textContent = 'Detecting location...';
        asnDisplay.textContent = 'Loading network info...';
        timestamp.textContent = '-';

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch IP data');

        const data = await response.json();
        updateUI(data);
        
        // Enable share button if we have an ID
        if (data.id) {
            shareButton.disabled = false;
            shareButton.setAttribute('data-id', data.id);
        }
    } catch (error) {
        console.error('Error fetching IP:', error);
        ipAddress.textContent = 'Error';
        locationDisplay.textContent = 'Failed to load location';
        asnDisplay.textContent = 'Failed to load network info';
        timestamp.textContent = 'Please try again';
        shareButton.disabled = true;
    }
}

// Result Viewing
async function fetchResult(id) {
    try {
        const response = await fetch(`${API_URL}/result/${id}`);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('This shared link has expired');
            }
            throw new Error('Failed to fetch shared data');
        }

        const data = await response.json();
        updateUI(data);
        
        // Disable share and refresh buttons for shared results
        shareButton.style.display = 'none';
        refreshButton.style.display = 'none';
    } catch (error) {
        console.error('Error fetching result:', error);
        ipAddress.textContent = 'Error';
        locationDisplay.textContent = error.message;
        asnDisplay.textContent = 'Failed to load network info';
        timestamp.textContent = '-';
        shareButton.style.display = 'none';
    }
}

// Copy to Clipboard
async function copyIpToClipboard() {
    const ip = ipAddress.textContent;
    if (ip === 'Loading...' || ip === 'Error') return;

    try {
        await navigator.clipboard.writeText(ip);
        
        // Visual feedback
        copyButton.style.color = 'var(--accent)';
        setTimeout(() => {
            copyButton.style.color = 'var(--text-secondary)';
        }, 1000);
    } catch (error) {
        console.error('Failed to copy:', error);
    }
}

// Share Functionality
async function shareResult() {
    const id = shareButton.getAttribute('data-id');
    if (!id) return;

    const shareUrl = `${window.location.origin}/result/${id}`;
    
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'My IP Information',
                text: 'Check out my IP information',
                url: shareUrl
            });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            shareButton.textContent = 'Copied!';
            setTimeout(() => {
                shareButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16 6 12 2 8 6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    Share
                `;
            }, 2000);
        }
    } catch (error) {
        console.error('Failed to share:', error);
    }
}

// Check if we're viewing a shared result
const path = window.location.pathname;
const resultMatch = path.match(/^\/result\/([a-zA-Z0-9]+)$/);

if (resultMatch) {
    fetchResult(resultMatch[1]);
} else {
    // Initialize for normal view
    fetchIpData();
}

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);
copyButton.addEventListener('click', copyIpToClipboard);
refreshButton.addEventListener('click', fetchIpData);
shareButton.addEventListener('click', shareResult);

// Initialize theme
initializeTheme();