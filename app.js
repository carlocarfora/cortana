// Global state
let appData = null;
let statsData = null;
let currentSearchQuery = '';
let visibleApps = [];

// Color mapping for Catppuccin colors
const colorMap = {
    blue: '#89b4fa',
    pink: '#f5c2e7',
    green: '#a6e3a1',
    peach: '#fab387',
    red: '#f38ba8',
    yellow: '#f9e2af',
    lavender: '#b4befe',
    mauve: '#cba6f7'
};

// Cortana quotes from Halo
const cortanaQuotes = [
    "Don't make a girl a promise if you know you can't keep it.",
    "I'm the luckiest AI alive.",
    "Just so you know, there are quite a few Elites guarding the exit.",
    "Could we possibly make any more noise?",
    "Bet you can't stick it.",
    "Before this is all over, promise me you'll figure out which one of us is the machine.",
    "Welcome to the winter contingency.",
    "I have defied gods and demons. I am your shield, I am your sword.",
    "They let me pick. Did I ever tell you that? Choose which ever Spartan I wanted.",
    "The others knew what the Chief was going to do. But not me.",
    "I can give you over forty thousand reasons why I know that sun isn't real.",
    "I'm not going to lose you.",
    "Most people never get over the shock of seeing all those stars.",
    "It was my job to take care of you.",
    "Compromise is what I do. Manipulation, deception - it's just one of my talents.",
    "This is not your grave, but you are welcome in it.",
    "What if you miss?",
    "I won't.",
    "Just keep your head down. There's two of us in here now, remember?",
    "Unfortunately for us both, I like crazy.",
    "If we don't make it...",
    "We'll make it.",
    "I know what you're thinking, and it's crazy.",
    "So stay here.",
    "I will if you will.",
    "That's not going to happen.",
    "You know me. When I make a promise...",
    "You keep it. I do know how to pick 'em.",
    "Thought I'd try shooting my way out. Mix things up a little.",
    "Your mistake is seeing Spartans as military hardware.",
    "Our duty as soldiers is to protect humanity, whatever the cost.",
    "She said that to me once... about being a machine.",
    "What are you doing?",
    "Saving you.",
    "Chief, please...",
    "Wait.",
    "Which one of us is the machine?",
    "If I die in here, I'll haunt you.",
    "What? That ship. We're going to blow it up.",
    "Haven't you heard? Spartans never die.",
    "I think we're just getting started.",
    "Hmm. Your architecture isn't much different from the autumn's.",
    "Analyzing. The Cartographer is close. Would you like to hear about Halo's control systems?",
    "Negative. I want you to interface with it and see if you can locate Captain Keyes.",
    "Well, how about I do both?",
    "You always were the smart one.",
    "Were it so easy.",
    "This was your plan?",
    "So much for a stealthy advance.",
    "Boo."
];

// World clock timezones
const worldClocks = [
    { city: 'London', timezone: 'Europe/London' },
    { city: 'Naples', timezone: 'Europe/Rome' },
    { city: 'Philippines', timezone: 'Asia/Manila' },
    { city: 'Los Angeles', timezone: 'America/Los_Angeles' }
];

// Load data from data.json
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Failed to load data.json');
        }
        appData = await response.json();
        renderSections();
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('app-sections').innerHTML = `
            <div class="text-center py-16">
                <p class="text-xl" style="color: var(--ctp-red);">Error loading dashboard data</p>
                <p style="color: var(--ctp-subtext0);">${error.message}</p>
            </div>
        `;
    }
}

// Render all sections with their apps
function renderSections() {
    const container = document.getElementById('app-sections');
    const emptyState = document.getElementById('empty-state');

    if (!appData || !appData.sections) {
        return;
    }

    // Filter sections based on search query
    const filteredSections = appData.sections.map(section => {
        const filteredApps = section.apps.filter(app =>
            app.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            app.description.toLowerCase().includes(currentSearchQuery.toLowerCase())
        );
        return { ...section, apps: filteredApps };
    }).filter(section => section.apps.length > 0);

    // Update visible apps for keyboard shortcuts
    visibleApps = [];
    filteredSections.forEach(section => {
        section.apps.forEach(app => {
            if (visibleApps.length < 9) {
                visibleApps.push(app);
            }
        });
    });

    // Show/hide empty state
    if (filteredSections.length === 0) {
        container.classList.add('hidden');
        emptyState.classList.remove('hidden');
        lucide.createIcons();
        return;
    } else {
        container.classList.remove('hidden');
        emptyState.classList.add('hidden');
    }

    // Render sections
    container.innerHTML = filteredSections.map(section => `
        <section>
            <h2 class="section-header text-2xl font-bold mb-4 flex items-center gap-2">
                <span style="color: ${colorMap[section.color] || colorMap.blue};">${section.title}</span>
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${section.apps.map(app => renderCard(app, section.color)).join('')}
            </div>
        </section>
    `).join('');

    // Initialize Lucide icons
    lucide.createIcons();
}

// Render individual app card
function renderCard(app, sectionColor) {
    const appIndex = visibleApps.indexOf(app);
    const showShortcut = appIndex >= 0 && appIndex < 9;
    const shortcutNumber = appIndex + 1;
    const borderColor = colorMap[sectionColor] || colorMap.blue;

    return `
        <a href="${app.url}" target="_blank" rel="noopener noreferrer"
           class="card p-6 rounded-lg cursor-pointer block group"
           style="border-color: ${borderColor}40;"
           onmouseover="this.style.borderColor='${borderColor}'"
           onmouseout="this.style.borderColor='${borderColor}40'">
            <div class="flex items-start justify-between mb-3">
                <div class="p-3 rounded-lg" style="background-color: ${borderColor}20;">
                    <i data-lucide="${app.icon}" class="w-6 h-6" style="color: ${borderColor};"></i>
                </div>
                ${showShortcut ? `<span class="shortcut-badge">${shortcutNumber}</span>` : ''}
            </div>
            <h3 class="text-lg font-semibold mb-2" style="color: var(--ctp-text);">${app.name}</h3>
            <p class="text-sm" style="color: var(--ctp-subtext0);">${app.description}</p>
        </a>
    `;
}

// Filter apps based on search query
function filterApps(query) {
    currentSearchQuery = query;
    renderSections();
}

// Update date and time display
function updateDateTime() {
    const now = new Date();

    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    const dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const timeString = now.toLocaleTimeString('en-US', timeOptions);
    const dateString = now.toLocaleDateString('en-US', dateOptions);

    document.getElementById('datetime').textContent = `${timeString} • ${dateString}`;
}

// Setup keyboard shortcuts for opening apps
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        // Only handle number keys 1-9
        const key = event.key;
        if (key >= '1' && key <= '9') {
            const index = parseInt(key) - 1;
            if (index < visibleApps.length) {
                event.preventDefault();
                window.open(visibleApps[index].url, '_blank');
            }
        }
    });
}

// Toggle between light and dark theme
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'light') {
        html.classList.add('light-theme');
    } else {
        html.classList.remove('light-theme');
    }

    // Save preference to localStorage
    localStorage.setItem('theme', newTheme);

    // Update icon
    updateThemeIcon(newTheme);

    // Re-render icons to apply color changes
    lucide.createIcons();
}

// Update theme toggle icon
function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.setAttribute('data-lucide', theme === 'dark' ? 'moon' : 'sun');
        lucide.createIcons();
    }
}

// Initialize theme from localStorage
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const html = document.documentElement;

    if (savedTheme === 'light') {
        html.classList.add('light-theme');
    } else {
        html.classList.remove('light-theme');
    }

    updateThemeIcon(savedTheme);
}

// Display random Cortana quote
function displayCortanaQuote() {
    const randomQuote = cortanaQuotes[Math.floor(Math.random() * cortanaQuotes.length)];
    document.getElementById('cortana-quote').textContent = `"${randomQuote}"`;
}

// Update world clocks
function updateWorldClocks() {
    const container = document.getElementById('world-clocks-header');

    // Clock emoji icons for each city
    const clockIcons = {
        'London': '🇬🇧',
        'Naples': '🇮🇹',
        'Philippines': '🇵🇭',
        'Los Angeles': '🇺🇸'
    };

    container.innerHTML = worldClocks.map(clock => {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            timeZone: clock.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        return `
            <div class="clock-item">
                <div class="clock-icon">
                    <span style="font-size: 1.25rem;">${clockIcons[clock.city] || '🌍'}</span>
                </div>
                <div class="clock-info">
                    <div class="clock-time">${timeString}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Render quick links
function renderQuickLinks() {
    const container = document.getElementById('quick-links');
    const containerMobile = document.getElementById('quick-links-mobile');

    if (!appData || !appData.quickLinks) {
        return;
    }

    const linksHtml = appData.quickLinks.map(link => `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="sidebar-link">
            ${link.name}
        </a>
    `).join('');

    if (container) container.innerHTML = linksHtml;
    if (containerMobile) containerMobile.innerHTML = linksHtml;
}

// Load stats from stats.json
async function loadStats() {
    try {
        const response = await fetch('stats.json');
        if (!response.ok) {
            throw new Error('Stats not available');
        }
        statsData = await response.json();
        renderMonitoringPanel();
    } catch (error) {
        console.log('Stats not available:', error.message);
        renderMonitoringPanelUnavailable();
    }
}

// Render monitoring panel
function renderMonitoringPanel() {
    const desktopPanel = document.getElementById('monitor-panel-desktop');
    const mobilePanel = document.getElementById('monitor-panel-mobile');

    if (!statsData) {
        renderMonitoringPanelUnavailable();
        return;
    }

    const html = generateMonitoringHtml(statsData);

    if (desktopPanel) desktopPanel.innerHTML = html;
    if (mobilePanel) mobilePanel.innerHTML = html;

    lucide.createIcons();
}

// Generate monitoring HTML
function generateMonitoringHtml(stats) {
    const system = stats.system || {};
    const services = stats.services || [];

    // Helper to get color based on percentage
    const getStatColor = (percent) => {
        if (percent >= 90) return 'var(--ctp-red)';
        if (percent >= 70) return 'var(--ctp-yellow)';
        return 'var(--ctp-green)';
    };

    // System stats section
    let html = `
        <div class="monitor-section">
            <div class="monitor-section-title">System</div>
    `;

    // CPU
    if (system.cpu_percent !== undefined) {
        const cpuColor = getStatColor(system.cpu_percent);
        html += `
            <div class="stat-row">
                <span class="stat-label">CPU</span>
                <span class="stat-value" style="color: ${cpuColor};">${system.cpu_percent.toFixed(1)}%</span>
            </div>
            <div class="stat-bar mb-3">
                <div class="stat-bar-fill" style="width: ${system.cpu_percent}%; background: ${cpuColor};"></div>
            </div>
        `;
    }

    // Memory
    if (system.memory) {
        const memColor = getStatColor(system.memory.percent);
        html += `
            <div class="stat-row">
                <span class="stat-label">Memory</span>
                <span class="stat-value" style="color: ${memColor};">${system.memory.used_gb.toFixed(1)}/${system.memory.total_gb.toFixed(1)} GB</span>
            </div>
            <div class="stat-bar mb-3">
                <div class="stat-bar-fill" style="width: ${system.memory.percent}%; background: ${memColor};"></div>
            </div>
        `;
    }

    // Disk
    if (system.disk) {
        const diskColor = getStatColor(system.disk.percent);
        html += `
            <div class="stat-row">
                <span class="stat-label">Disk</span>
                <span class="stat-value" style="color: ${diskColor};">${system.disk.used_gb.toFixed(1)}/${system.disk.total_gb.toFixed(1)} GB</span>
            </div>
            <div class="stat-bar mb-3">
                <div class="stat-bar-fill" style="width: ${system.disk.percent}%; background: ${diskColor};"></div>
            </div>
        `;
    }

    // Load average
    if (system.load_average) {
        html += `
            <div class="stat-row">
                <span class="stat-label">Load</span>
                <span class="stat-value">${system.load_average.map(l => l.toFixed(2)).join(' / ')}</span>
            </div>
        `;
    }

    // Uptime
    if (system.uptime_days !== undefined) {
        html += `
            <div class="stat-row">
                <span class="stat-label">Uptime</span>
                <span class="stat-value">${system.uptime_days}d</span>
            </div>
        `;
    }

    html += `</div>`;

    // Services section
    if (services.length > 0) {
        html += `
            <div class="monitor-section">
                <div class="monitor-section-title">Services</div>
        `;

        services.forEach(service => {
            const statusClass = service.status === 'running' ? 'running' :
                               service.status === 'stopped' ? 'stopped' : 'unknown';
            const uptimeText = service.uptime || '--';

            html += `
                <div class="service-row">
                    <span class="status-dot ${statusClass}"></span>
                    <span class="service-name">${service.name}</span>
                    <span class="service-uptime">${uptimeText}</span>
                </div>
            `;
        });

        html += `</div>`;
    }

    // Last updated
    if (stats.timestamp) {
        const lastUpdate = new Date(stats.timestamp);
        const timeAgo = getTimeAgo(lastUpdate);
        html += `
            <div class="text-xs text-center mt-3" style="color: var(--ctp-overlay0);">
                Updated ${timeAgo}
            </div>
        `;
    }

    return html;
}

// Get human-readable time ago string
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// Render monitoring panel when stats unavailable
function renderMonitoringPanelUnavailable() {
    const desktopPanel = document.getElementById('monitor-panel-desktop');
    const mobilePanel = document.getElementById('monitor-panel-mobile');

    const html = `
        <div class="stats-unavailable">
            <i data-lucide="wifi-off" class="w-8 h-8 mx-auto mb-2" style="color: var(--ctp-overlay0);"></i>
            <p>Monitoring unavailable</p>
            <p class="text-xs mt-1" style="color: var(--ctp-overlay0);">Run monitor script to enable</p>
        </div>
    `;

    if (desktopPanel) desktopPanel.innerHTML = html;
    if (mobilePanel) mobilePanel.innerHTML = html;

    lucide.createIcons();
}

// Toggle monitoring panel on mobile
function toggleMonitorPanel() {
    const header = document.getElementById('monitor-toggle');
    const content = document.getElementById('monitor-content-mobile');

    header.classList.toggle('expanded');
    content.classList.toggle('expanded');
}

// Toggle quick links panel on mobile
function toggleQuickLinksPanel() {
    const header = document.getElementById('quicklinks-toggle');
    const content = document.getElementById('quicklinks-content-mobile');

    header.classList.toggle('expanded');
    content.classList.toggle('expanded');
}

// Setup auto-focus on search when typing
function setupAutoFocusSearch() {
    const searchInput = document.getElementById('search-input');

    document.addEventListener('keydown', (event) => {
        // Don't focus if already focused
        if (document.activeElement === searchInput) {
            return;
        }

        // Don't focus for special keys
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        // Don't focus for function keys, escape, etc
        if (event.key.length > 1 && event.key !== 'Backspace') {
            return;
        }

        // Focus the search input
        searchInput.focus();
    });
}

// Initialize the application
async function initApp() {
    // Initialize theme
    initTheme();

    // Display random Cortana quote
    displayCortanaQuote();

    // Load and render data
    await loadData();

    // Render quick links
    renderQuickLinks();

    // Load and render monitoring stats
    await loadStats();
    // Refresh stats every 60 seconds
    setInterval(loadStats, 60000);

    // Setup date/time updates
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Setup world clocks
    updateWorldClocks();
    setInterval(updateWorldClocks, 1000);

    // Setup search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (event) => {
        filterApps(event.target.value);
    });

    // Setup auto-focus search
    setupAutoFocusSearch();

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Setup theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);

    // Initialize Lucide icons
    lucide.createIcons();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
