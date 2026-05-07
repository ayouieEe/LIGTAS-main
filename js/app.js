// LIGTAS Dashboard Interactivity

document.addEventListener('DOMContentLoaded', () => {
    startClock();
    populateUrgentFeed();
});

// Navigation logic removed (now multi-page architecture)

// --- Live Clock ---
function startClock() {
    const timeDisplay = document.getElementById('live-datetime');
    
    function update() {
        const now = new Date();
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        };
        timeDisplay.textContent = now.toLocaleString('en-US', options);
    }
    
    update();
    setInterval(update, 1000);
}

// --- Modal Controls ---
window.openModal = function(modalId) {
    document.getElementById(modalId).classList.add('active');
}

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// --- Mock Data Injection for Triage Feed ---
function populateUrgentFeed() {
    const feedContainer = document.getElementById('live-feed-list');
    if (!feedContainer) return;

    const mockFeeds = [
        {title:"Flash Flood: Marikina",badge:"Critical",badgeClass:"badge-critical",borderClass:"border-l-critical",desc:"Rising water levels reported in Brgy. Malanday.",time:"2m ago"},
        {title:"Medical Emergency",badge:"Urgent",badgeClass:"badge-urgent",borderClass:"border-l-urgent",desc:"Trauma assistance needed at Evacuation Site A.",time:"18m ago"},
        {title:"Fire Alert: QC",badge:"Critical",badgeClass:"badge-critical",borderClass:"border-l-critical",desc:"Residential fire in Brgy. Commonwealth.",time:"22m ago"},
        {title:"Road Blockage",badge:"Warning",badgeClass:"badge-warning",borderClass:"border-l-warning",desc:"Fallen tree blocking EDSA Southbound.",time:"30m ago"},
        {title:"Power Outage",badge:"Urgent",badgeClass:"badge-urgent",borderClass:"border-l-urgent",desc:"Grid failure in Makati CBD affecting hospitals.",time:"45m ago"},
        {title:"Evacuee Influx",badge:"Info",badgeClass:"badge-info",borderClass:"border-l-info",desc:"San Juan Evac center nearing maximum capacity.",time:"1h ago"},
        {title:"Structural Damage",badge:"Critical",badgeClass:"badge-critical",borderClass:"border-l-critical",desc:"Bridge crack reported in Pasig River.",time:"1h 15m ago"},
        {title:"Water Shortage",badge:"Urgent",badgeClass:"badge-urgent",borderClass:"border-l-urgent",desc:"Clean water needed at Taguig Civic Center.",time:"1h 30m ago"},
        {title:"Chemical Spill",badge:"Critical",badgeClass:"badge-critical",borderClass:"border-l-critical",desc:"Toxic fumes reported near Manila Port.",time:"2h ago"},
        {title:"Rescue Needed",badge:"Urgent",badgeClass:"badge-urgent",borderClass:"border-l-urgent",desc:"Trapped residents in Navotas village.",time:"2h 10m ago"}
    ];

    feedContainer.innerHTML = mockFeeds.map(feed => `
        <div class="feed-item ${feed.borderClass} mb-3">
            <div class="flex justify-between items-start mb-2">
                <div class="feed-title mb-0"><i class="ph-fill ph-warning-circle text-critical"></i> ${feed.title}</div>
                <div class="feed-meta">${feed.time}</div>
            </div>
            <p class="text-sm text-secondary mb-4">${feed.desc}</p>
            <div class="flex gap-2">
                <button class="btn btn-sm btn-primary flex-1" onclick="showToast('Unit Dispatched', 'success')">Dispatch</button>
                <button class="btn btn-sm btn-outline flex-1" onclick="showToast('Loading Map...', 'info')">View Map</button>
            </div>
        </div>
    `).join('');
}

// --- Center Selection Logic ---
window.selectCenter = function(id) {
    const cards = document.querySelectorAll('.center-card-lg');
    cards.forEach(card => card.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

// --- Toast Notification System ---
window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    let icon = 'ph-info';
    if(type === 'success') icon = 'ph-check-circle';
    if(type === 'warning') icon = 'ph-warning';
    if(type === 'error') icon = 'ph-x-circle';

    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="ph-fill ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Attach toast to filter chips for interactivity
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
        if(e.target.closest('.filter-chips')) {
            document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            showToast(`Filter applied: ${chip.textContent.trim()}`, 'info');
        } else if (e.target.closest('.form-group')) {
            chip.classList.toggle('active');
        }
    });
});
