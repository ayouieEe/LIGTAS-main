lucide.createIcons();

function initMaps() {
    // Google Maps embeds are loaded directly via iframe; no JavaScript init required.
}

function refreshMaps() {
    // No Leaflet maps to refresh for Google Maps iframe embeds.
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const target = document.getElementById(id);
    if (target) {
        target.classList.add('active');
        target.style.display = 'flex';
    }

    // Handle volunteer screen transitions
    if (id === 'screen-volunteer') {
        loadVolunteerData();
    } else if (id === 'screen-home') {
        // Reset header profile image when going back to home
        const profileImg = document.querySelector('header img');
        if (profileImg) {
            profileImg.src = 'https://ui-avatars.com/api/?name=User&background=1C1C1E&color=fff';
        }
    }

    lucide.createIcons();
    refreshMaps();
}

function openInventoryScreen() {
    updateReadiness();
    updateCategoryProgress();
    updateInventorySummaryCards();
    showScreen('screen-inventory');
}

function getCategoryPercent(category) {
    const section = document.querySelector(`[data-inventory-category="${category}"]`);
    if (!section) return 0;
    const items = Array.from(section.querySelectorAll('.checkbox[data-inventory-item]'));
    if (!items.length) return 0;
    const checked = items.filter(cb => cb.classList.contains('checked') || cb.classList.contains('checked-green')).length;
    return Math.round((checked / items.length) * 100);
}

function updateInventorySummaryCards() {
    const hydrationPercent = getCategoryPercent('hydration');
    const healthPercent = getCategoryPercent('health');
    const powerPercent = getCategoryPercent('power');
    const documentsPercent = getCategoryPercent('documents');

    const waterBadge = document.getElementById('water-storage-badge');
    const waterValue = document.getElementById('water-storage-value');
    if (waterBadge && waterValue) {
        if (hydrationPercent >= 100) {
            waterBadge.textContent = 'Good';
            waterBadge.className = 'status-badge status-good';
            waterValue.textContent = '-- Liters';
        } else if (hydrationPercent >= 50) {
            waterBadge.textContent = 'Low';
            waterBadge.className = 'status-badge status-low';
            waterValue.textContent = '-- Liters';
        } else {
            waterBadge.textContent = 'Critical';
            waterBadge.className = 'status-badge status-critical';
            waterValue.textContent = '-- Liters';
        }

    }

    const foodBadge = document.getElementById('canned-food-badge');
    const foodValue = document.getElementById('canned-food-value');
    if (foodBadge && foodValue) {
        if (hydrationPercent >= 100) {
            foodBadge.textContent = 'Good';
            foodBadge.className = 'status-badge status-good';
            foodValue.textContent = '-- Days';
        } else if (hydrationPercent >= 50) {
            foodBadge.textContent = 'Low';
            foodBadge.className = 'status-badge status-low';
            foodValue.textContent = '-- Days';
        } else {
            foodBadge.textContent = 'Critical';
            foodBadge.className = 'status-badge status-critical';
            foodValue.textContent = '-- Days';
        }

    }

    const medicalBadge = document.getElementById('medical-kit-badge');
    const medicalValue = document.getElementById('medical-kit-value');
    if (medicalBadge && medicalValue) {
        if (healthPercent >= 100) {
            medicalBadge.textContent = 'Good';
            medicalBadge.className = 'status-badge status-good';
            medicalValue.textContent = 'Complete';
        } else if (healthPercent >= 50) {
            medicalBadge.textContent = 'Low';
            medicalBadge.className = 'status-badge status-low';
            medicalValue.textContent = 'Incomplete';
        } else {
            medicalBadge.textContent = 'Critical';
            medicalBadge.className = 'status-badge status-critical';
            medicalValue.textContent = 'Empty';
        }

    }

    const powerBadge = document.getElementById('power-source-badge');
    const powerValue = document.getElementById('power-source-value');
    if (powerBadge && powerValue) {
        if (powerPercent >= 100) {
            powerBadge.textContent = 'Good';
            powerBadge.className = 'status-badge status-good';
            powerValue.textContent = '0% Charge';
            powerValue.className = 'text-[17px] font-bold mt-0.5 text-navy';
        } else if (powerPercent >= 50) {
            powerBadge.textContent = 'Low';
            powerBadge.className = 'status-badge status-low';
            powerValue.textContent = '0% Charge';
            powerValue.className = 'text-[17px] font-bold mt-0.5 text-amber';
        } else {
            powerBadge.textContent = 'Critical';
            powerBadge.className = 'status-badge status-critical';
            powerValue.textContent = '0% Charge';
            powerValue.className = 'text-[17px] font-bold mt-0.5 text-emergency';
        }

    }
}

function showAssemblyDetails(centerId) {
    const centers = {
        sports: {
            title: 'Pasig City Sports Complex',
            address: 'Ortigas Avenue, Brgy. San Joaquin, Pasig City',
            description: 'Designated evacuation assembly point with medical tents, water supply, and emergency support services.',
            mapUrl: 'https://maps.google.com/maps?f=d&hl=en&geocode=&saddr=14.5760,121.0835&daddr=14.5826,121.0735&dirflg=d&output=embed'
        }
    };

    const center = centers[centerId] || centers.sports;
    const titleEl = document.getElementById('assembly-title');
    const addressEl = document.getElementById('assembly-address');
    const descriptionEl = document.getElementById('assembly-description');
    const mapIframe = document.getElementById('assembly-map-iframe');
    if (titleEl) titleEl.textContent = center.title;
    if (addressEl) addressEl.textContent = center.address;
    if (descriptionEl) descriptionEl.textContent = center.description;
    if (mapIframe && center.mapUrl) mapIframe.src = center.mapUrl;
    showScreen('screen-assembly');
}

let currentAssignmentId = null;

const assignmentDetails = {
    'flood-response': {
        title: 'Emergency Response Team Needed',
        summary: 'Flooding in Barangay San Miguel requires immediate volunteer assistance.',
        description: 'Flooding in Barangay San Miguel requires immediate volunteer assistance. We need experienced responders for evacuation and first aid support. Report to the barangay hall within 30 minutes.',
        status: 'Urgent',
        time: 'Report within 30 minutes',
        location: 'Barangay San Miguel',
        coordinator: 'LDRRMO Field Team',
        tasks: [
            'Assist families to safe zones',
            'Provide basic first aid to affected residents',
            'Help coordinate evacuation transports'
        ]
    },
    'medical-support': {
        title: 'Medical Assistance Team',
        summary: 'Support medical personnel at evacuation centers. Basic first aid knowledge helpful.',
        description: 'Support medical personnel at evacuation centers. Basic first aid knowledge is helpful but not required. Flexible scheduling available.',
        status: 'Urgent',
        time: 'Starts in 1 hour',
        location: 'Pasig City Sports Complex',
        coordinator: 'Medical Unit Lead',
        tasks: [
            'Assist with patient intake',
            'Deliver medical supplies to tents',
            'Support triage and monitoring'
        ]
    },
    'supply-distribution': {
        title: 'Supply Distribution Support',
        summary: 'Help distribute emergency supplies to affected families. Training provided.',
        description: 'Help distribute emergency supplies to affected families. Training will be provided. This is a 4-hour shift tomorrow morning.',
        status: 'Urgent',
        time: 'Tomorrow morning',
        location: 'City Hall',
        coordinator: 'Logistics Coordinator',
        tasks: [
            'Load and sort supply packages',
            'Distribute packages to families',
            'Track inventory and report shortages'
        ]
    },
    'communication-hotline': {
        title: 'Hotline Support Volunteer',
        summary: 'Answer emergency calls and assist with family reunification.',
        description: 'Answer emergency calls and assist with family reunification. Training is provided. You can work from the command center or remotely.',
        status: 'Urgent',
        time: 'Available now',
        location: 'Emergency Operations Center',
        coordinator: 'Communications Supervisor',
        tasks: [
            'Receive emergency hotline calls',
            'Log calls and relay information to responders',
            'Provide reassurance to callers'
        ]
    },
    'shelter-logistics': {
        title: 'Shelter Logistics & Setup',
        summary: 'Help set up and organize emergency shelter facilities.',
        description: 'Help set up and organize emergency shelter facilities. This task involves physical setup and coordination. Starts this evening.',
        status: 'Urgent',
        time: 'This evening',
        location: 'Barangay San Antonio',
        coordinator: 'Shelter Manager',
        tasks: [
            'Arrange sleeping areas and supplies',
            'Set up registration desks',
            'Ensure shelter signage and safety checks are in place'
        ]
    },
    'road-safety-patrol': {
        title: 'Road Safety Patrol',
        summary: 'Help manage traffic flow and ensure safe passage for emergency vehicles.',
        description: 'Help manage traffic flow and ensure safe passage for emergency vehicles near the evacuation route. High visibility gear is provided.',
        status: 'Urgent',
        time: 'Starting now',
        location: 'C-5 Road Section',
        coordinator: 'Traffic Control Lead',
        tasks: [
            'Direct traffic around the evacuation corridor',
            'Coordinate with emergency responders',
            'Monitor for hazards and report issues'
        ]
    },
    'community-outreach': {
        title: 'Community Outreach Support',
        summary: 'Coordinate neighborhood safety checks and share preparedness information.',
        description: 'Coordinate neighborhood safety checks and share preparedness information with local residents.',
        status: 'Accepted',
        time: 'Ongoing',
        location: 'Brgy. Kapitolyo',
        coordinator: 'Outreach Lead',
        tasks: [
            'Visit households with safety information',
            'Check on vulnerable residents',
            'Collect and submit community feedback'
        ]
    },
    'shelter-checkin': {
        title: 'Shelter Check-in Team',
        summary: 'Confirm shelter readiness, log arrivals, and ensure emergency supplies are in place.',
        description: 'Confirm shelter readiness, log arrivals, and ensure emergency supplies are in place.',
        status: 'Completed',
        time: 'Completed yesterday',
        location: 'Brgy. San Joaquin',
        coordinator: 'Shelter Operations Supervisor',
        tasks: [
            'Verify shelter check-in process',
            'Confirm supply inventory',
            'Report completed shelter status'
        ]
    }
};

function openAssignmentModal(assignmentId) {
    currentAssignmentId = assignmentId;
    const assignment = assignmentDetails[assignmentId];
    if (!assignment) return;

    const titleEl = document.getElementById('assignment-modal-title');
    const summaryEl = document.getElementById('assignment-modal-summary');
    const locationEl = document.getElementById('assignment-modal-location');
    const timeEl = document.getElementById('assignment-modal-time');
    const descEl = document.getElementById('assignment-modal-desc');
    const priorityBadgeEl = document.getElementById('assignment-modal-priority-badge');
    const pendingButtonsEl = document.getElementById('assignment-modal-buttons-pending');
    const acceptedButtonsEl = document.getElementById('assignment-modal-buttons-accepted');
    const completedButtonsEl = document.getElementById('assignment-modal-buttons-completed');
    const declinedButtonsEl = document.getElementById('assignment-modal-buttons-declined');

    if (titleEl) titleEl.textContent = assignment.title;
    if (summaryEl) summaryEl.textContent = assignment.summary;
    if (locationEl) locationEl.textContent = assignment.location;
    if (timeEl) timeEl.textContent = assignment.time;
    if (descEl) descEl.textContent = assignment.description;
    
    // Set priority badge
    const currentStatus = getAssignmentStatus(assignmentId);

    if (priorityBadgeEl) {
        if (currentStatus === 'urgent') {
            priorityBadgeEl.className = 'px-3 py-1 rounded-full text-[11px] font-semibold status-badge status-urgent';
            priorityBadgeEl.textContent = 'URGENT';
        } else if (currentStatus === 'accepted') {
            priorityBadgeEl.className = 'px-3 py-1 rounded-full text-[11px] font-semibold status-badge status-accepted';
            priorityBadgeEl.textContent = 'ACCEPTED';
        } else if (currentStatus === 'completed') {
            priorityBadgeEl.className = 'px-3 py-1 rounded-full text-[11px] font-semibold status-badge status-completed';
            priorityBadgeEl.textContent = 'COMPLETED';
        } else {
            priorityBadgeEl.className = 'px-3 py-1 rounded-full text-[11px] font-semibold status-badge status-declined';
            priorityBadgeEl.textContent = 'DECLINED';
        }
    }

    if (pendingButtonsEl && acceptedButtonsEl && completedButtonsEl && declinedButtonsEl) {
        pendingButtonsEl.classList.add('hidden');
        acceptedButtonsEl.classList.add('hidden');
        completedButtonsEl.classList.add('hidden');
        declinedButtonsEl.classList.add('hidden');

        if (currentStatus === 'urgent') {
            pendingButtonsEl.classList.remove('hidden');
        } else if (currentStatus === 'accepted') {
            acceptedButtonsEl.classList.remove('hidden');
        } else if (currentStatus === 'completed') {
            completedButtonsEl.classList.remove('hidden');
        } else {
            declinedButtonsEl.classList.remove('hidden');
        }
    }

    openModal('assignment-modal');
    lucide.createIcons();
}

function showAssignmentDetailPage(assignmentId) {
    const assignment = assignmentDetails[assignmentId];
    if (!assignment) return;

    const titleEl = document.getElementById('assignment-detail-title');
    const subtitleEl = document.getElementById('assignment-detail-subtitle');
    const statusEl = document.getElementById('assignment-detail-status');
    const timeEl = document.getElementById('assignment-detail-time');
    const descriptionEl = document.getElementById('assignment-detail-description');
    const tasksEl = document.getElementById('assignment-detail-tasks');
    const locationEl = document.getElementById('assignment-detail-location');
    const reportTimeEl = document.getElementById('assignment-detail-report-time');
    const coordinatorEl = document.getElementById('assignment-detail-coordinator');

    if (titleEl) titleEl.textContent = assignment.title;
    if (subtitleEl) subtitleEl.textContent = assignment.summary;
    if (statusEl) statusEl.textContent = assignment.status;
    if (timeEl) timeEl.textContent = assignment.time;
    if (descriptionEl) descriptionEl.textContent = assignment.description;
    if (tasksEl) {
        tasksEl.innerHTML = assignment.tasks.map(task => `<li>${task}</li>`).join('');
    }
    if (locationEl) locationEl.textContent = assignment.location;
    if (reportTimeEl) reportTimeEl.textContent = assignment.time;
    if (coordinatorEl) coordinatorEl.textContent = assignment.coordinator;

    showScreen('assignment-detail-screen');
}

function updateVolunteerAssignmentCount() {
    const count = document.querySelectorAll('.announcement-card[data-assignment-id]').length;
    const badge = document.getElementById('assignment-count-badge');
    if (badge) {
        badge.textContent = `${count} Active`;
    }
}

function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('open');
        lucide.createIcons();
        refreshMaps();
    }
}

function markMyselfSafe() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4';
    modal.innerHTML = `<div class="bg-white rounded-3xl p-6 text-center w-full max-w-[340px] shadow-xl"><h2 class="text-[20px] font-bold text-navy mb-3">Status Updated</h2><p class="text-[14px] text-slate leading-relaxed mb-6">Your safety status has been shared with your Emergency Circle.</p><button onclick="this.closest('.fixed').remove()" class="w-full h-12 rounded-xl bg-safe text-white font-semibold text-[14px]">OK</button></div>`;
    document.body.appendChild(modal);
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('open');
}

function registerVolunteer() {
    const name = document.getElementById('volunteer-name').value.trim();
    const contact = document.getElementById('volunteer-contact').value.trim();
    const email = document.getElementById('volunteer-email').value.trim();
    const address = document.getElementById('volunteer-address').value.trim();
    const role = document.getElementById('volunteer-role').value.trim();
    const skills = document.getElementById('volunteer-skills').value.trim();
    const availability = document.getElementById('volunteer-availability').value.trim();
    const emergencyName = document.getElementById('volunteer-emergency-name').value.trim();
    const emergencyNumber = document.getElementById('volunteer-emergency-number').value.trim();
    const note = document.getElementById('volunteer-note').value.trim();
    const consent = document.getElementById('volunteer-consent').checked;

    if (!name || !contact || !email || !address || !role) {
        showToast('Please complete Name, Contact, Email, Address, and Role.');
        return;
    }
    if (!consent) {
        showToast('Please agree to the volunteer consent before registering.');
        return;
    }

    closeModal('volunteer-modal');
    showToast(`${name} is registered as ${role}.`);

    console.log('Volunteer registered:', {
        name,
        contact,
        email,
        address,
        role,
        skills,
        availability,
        emergencyName,
        emergencyNumber,
        note,
        consent,
    });

    // Store volunteer data in localStorage for the volunteer page
    const volunteerData = {
        name,
        contact,
        email,
        address,
        role,
        skills,
        availability,
        emergencyName,
        emergencyNumber,
        note,
        registeredAt: new Date().toISOString()
    };
    localStorage.setItem('ligtas_volunteer_data', JSON.stringify(volunteerData));

    // Update the volunteer button so the user can access the dashboard
    updateVolunteerActionButton();
}

const INVENTORY_STORAGE_KEY = 'ligtas_inventoryState';

function getInventoryState() {
    try {
        return JSON.parse(localStorage.getItem(INVENTORY_STORAGE_KEY) || '{}');
    } catch (error) {
        return {};
    }
}

function setInventoryState(state) {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(state));
}

function getInventoryItemKey(el) {
    return el.dataset.inventoryItem || '';
}

function applyInventoryCheckbox(el, checked) {
    el.classList.toggle('checked', checked);
    el.classList.toggle('checked-green', checked);
    el.innerHTML = checked ? '<i data-lucide="check" class="w-3 h-3 text-white"></i>' : '';
    lucide.createIcons();
}

function setInventoryItemState(itemKey, checked) {
    const state = getInventoryState();
    state[itemKey] = checked;
    setInventoryState(state);
}

function updateCategoryProgress() {
    document.querySelectorAll('[data-inventory-category]').forEach(section => {
        const checkboxes = Array.from(section.querySelectorAll('.checkbox[data-inventory-item]'));
        if (!checkboxes.length) return;
        const completed = checkboxes.filter(cb => cb.classList.contains('checked') || cb.classList.contains('checked-green')).length;
        const percent = Math.round((completed / checkboxes.length) * 100);
        const category = section.dataset.inventoryCategory;
        const label = document.getElementById(`${category}-pct`);
        if (label) {
            label.textContent = `${percent}%`;
            // Preserve existing classes and add dynamic styling
            const baseClasses = 'text-[12px] font-bold px-2 py-0.5 rounded';
            const positionClasses = Array.from(label.classList).filter(cls => cls.includes('ml-') || cls.includes('mr-') || cls.includes('flex'));
            let styleClasses = [];
            if (percent === 100) {
                styleClasses = ['bg-safe/10', 'text-safe', 'border', 'border-safe/20'];
            } else if (percent >= 50) {
                styleClasses = ['bg-amber/10', 'text-amber', 'border', 'border-amber/20'];
            } else {
                styleClasses = ['bg-slate-100', 'text-slate'];
            }
            label.className = baseClasses + ' ' + positionClasses.join(' ') + ' ' + styleClasses.join(' ');
        }
    });
}

function openAddItemModal(category) {
    const modal = document.getElementById('add-item-modal');
    const categorySelect = document.getElementById('item-category');
    if (categorySelect) categorySelect.value = category;
    if (modal) modal.classList.add('open');
    lucide.createIcons();
}

function addCustomItem() {
    const nameInput = document.getElementById('item-name');
    const descInput = document.getElementById('item-description');
    const categorySelect = document.getElementById('item-category');

    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const category = categorySelect.value;

    if (!name) {
        showToast('Please enter an item name');
        return;
    }

    // Generate unique ID for the custom item
    const itemId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the new item element
    const itemDiv = document.createElement('div');
    itemDiv.className = 'checklist-item';
    itemDiv.innerHTML = `
        <div class="checkbox" data-inventory-item="${itemId}" onclick="toggleCheck(this)"></div>
        <div>
            <p class="text-[14px] font-semibold text-slate">${name}</p>
            ${description ? `<p class="text-[12px] mt-0.5 text-slate">${description}</p>` : ''}
        </div>
        <button class="ml-auto text-slate-400 hover:text-red-500 transition-colors" onclick="removeCustomItem('${itemId}', this)">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;

    // Find the category section and add the item before the "Add Item" button
    const categorySection = document.querySelector(`[data-inventory-category="${category}"]`);
    if (categorySection) {
        const addButton = categorySection.querySelector('button[onclick*="openAddItemModal"]');
        if (addButton) {
            addButton.parentNode.insertBefore(itemDiv, addButton);
        }
    }

    // Save the custom item to localStorage
    const customItems = JSON.parse(localStorage.getItem('ligtas_customItems') || '[]');
    customItems.push({
        id: itemId,
        name: name,
        description: description,
        category: category
    });
    localStorage.setItem('ligtas_customItems', JSON.stringify(customItems));

    // Clear form and close modal
    nameInput.value = '';
    descInput.value = '';
    closeModal('add-item-modal');

    // Update progress
    updateReadiness();
    updateCategoryProgress();

    showToast(`Added "${name}" to ${category}`);
    lucide.createIcons();
}

function removeCustomItem(itemId, buttonElement) {
    // Remove from DOM
    const itemDiv = buttonElement.closest('.checklist-item');
    if (itemDiv) itemDiv.remove();

    // Remove from localStorage
    const customItems = JSON.parse(localStorage.getItem('ligtas_customItems') || '[]');
    const filteredItems = customItems.filter(item => item.id !== itemId);
    localStorage.setItem('ligtas_customItems', JSON.stringify(filteredItems));

    // Update progress
    updateReadiness();
    updateCategoryProgress();

    showToast('Item removed');
}

function loadCustomItems() {
    const customItems = JSON.parse(localStorage.getItem('ligtas_customItems') || '[]');
    customItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'checklist-item';
        itemDiv.innerHTML = `
            <div class="checkbox" data-inventory-item="${item.id}" onclick="toggleCheck(this)"></div>
            <div>
                <p class="text-[14px] font-semibold text-slate">${item.name}</p>
                ${item.description ? `<p class="text-[12px] mt-0.5 text-slate">${item.description}</p>` : ''}
            </div>
            <button class="ml-auto text-slate-400 hover:text-red-500 transition-colors" onclick="removeCustomItem('${item.id}', this)">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        `;

        // Find the category section and add the item before the "Add Item" button
        const categorySection = document.querySelector(`[data-inventory-category="${item.category}"]`);
        if (categorySection) {
            const addButton = categorySection.querySelector('button[onclick*="openAddItemModal"]');
            if (addButton) {
                addButton.parentNode.insertBefore(itemDiv, addButton);
            }
        }
    });
    updateCategoryProgress(); // Update percentages after loading custom items
}


function initInventoryState() {
    const state = getInventoryState();
    document.querySelectorAll('.checkbox[data-inventory-item]').forEach(el => {
        const key = getInventoryItemKey(el);
        const stored = state[key];
        const defaultChecked = el.classList.contains('checked') || el.classList.contains('checked-green');
        const isChecked = typeof stored === 'boolean' ? stored : defaultChecked;
        applyInventoryCheckbox(el, isChecked);
    });
    updateReadiness();
    updateCategoryProgress();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => {
        t.style.opacity = '0';
    }, 2800);
}

function toggleCheck(el) {
    const isChecked = el.classList.contains('checked') || el.classList.contains('checked-green');
    const result = !isChecked;
    applyInventoryCheckbox(el, result);
    const itemKey = getInventoryItemKey(el);
    if (itemKey) setInventoryItemState(itemKey, result);
    updateReadiness();
    updateCategoryProgress();
}

function updateReadiness() {
    const all = document.querySelectorAll('.checkbox[data-inventory-item]');
    const checked = document.querySelectorAll('.checkbox[data-inventory-item].checked, .checkbox[data-inventory-item].checked-green');
    const pct = all.length ? Math.round((checked.length / all.length) * 100) : 0;
    const bar = document.getElementById('readiness-bar');
    const label = document.getElementById('readiness-pct');
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = pct + '%';
    updateInventorySummaryCards();
}

function initSOS() {
    const sosModal = document.getElementById('sos-modal');
    const sosSuccessModal = document.getElementById('sos-success-modal');
    const sosCancelBtn = document.getElementById('sos-cancel-btn');
    const sosSendBtn = document.getElementById('sos-send-btn');
    const sosCloseBtn = document.getElementById('sos-close-btn');
    const sosBtn = document.getElementById('sos-btn');
    const sosWrapper = document.getElementById('sos-wrapper');

    let holdTimer;
    let isHolding = false;

    function startHold() {
        isHolding = true;
        if (sosWrapper) {
            const ring = sosWrapper.querySelector('.sos-progress-ring');
            if (ring) ring.classList.add('border-t-emergency', 'border-r-emergency', 'animate-[spin_3s_linear_forwards]');
        }
        holdTimer = setTimeout(() => {
            if (isHolding && sosModal) {
                if (sosWrapper) {
                    const ring = sosWrapper.querySelector('.sos-progress-ring');
                    if (ring) {
                        ring.className = 'sos-progress-ring absolute inset-[-4px] rounded-full border-[4px] border-transparent pointer-events-none z-[1]';
                    }
                }
                sosModal.classList.remove('hidden');
                sosModal.classList.add('flex');
            }
        }, 3000);
    }

    function cancelHold() {
        isHolding = false;
        clearTimeout(holdTimer);
        if (sosWrapper) {
            const ring = sosWrapper.querySelector('.sos-progress-ring');
            if (ring) {
                ring.className = 'sos-progress-ring absolute inset-[-4px] rounded-full border-[4px] border-transparent pointer-events-none z-[1]';
            }
        }
    }

    if (sosBtn) {
        sosBtn.addEventListener('mousedown', startHold);
        sosBtn.addEventListener('mouseup', cancelHold);
        sosBtn.addEventListener('mouseleave', cancelHold);
        sosBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startHold(); });
        sosBtn.addEventListener('touchend', cancelHold);
        sosBtn.addEventListener('touchcancel', cancelHold);
    }

    if (sosCancelBtn) sosCancelBtn.addEventListener('click', () => { sosModal.classList.remove('flex'); sosModal.classList.add('hidden'); });
    if (sosSendBtn) sosSendBtn.addEventListener('click', () => {
        sosModal.classList.remove('flex'); sosModal.classList.add('hidden');
        if (sosSuccessModal) {
            sosSuccessModal.classList.remove('hidden');
            sosSuccessModal.classList.add('flex');
        }
    });
    if (sosCloseBtn) sosCloseBtn.addEventListener('click', () => {
        if (sosSuccessModal) {
            sosSuccessModal.classList.remove('flex');
            sosSuccessModal.classList.add('hidden');
        }
    });
}

function bindPreparePageEvents() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    // Add click listeners for safety protocol rows
    document.querySelectorAll('.protocol-row').forEach((row, index) => {
        const modalIds = ['fire-modal', 'quake-modal', 'flood-modal'];
        row.addEventListener('click', () => openModal(modalIds[index]));
    });

    // Add click listeners for add item buttons
    document.querySelectorAll('[data-inventory-category]').forEach(section => {
        const btn = section.querySelector('button:last-of-type');
        if (btn && btn.textContent.includes('Add Item')) {
            const category = section.getAttribute('data-inventory-category');
            btn.addEventListener('click', () => openAddItemModal(category));
        }
    });

    // Add click listener for safe arrival button
    const safeArrivalBtn = document.querySelector('button.w-12.h-12.bg-safe');
    if (safeArrivalBtn) {
        safeArrivalBtn.addEventListener('click', () => openModal('safe-modal'));
    }

    // Add click listener for safe arrival notify button
    const notifyBtn = document.querySelector('#safe-modal button.bg-safe');
    if (notifyBtn) {
        notifyBtn.addEventListener('click', () => {
            closeModal('safe-modal');
            showToast('Family notified — Safe arrival!');
        });
    }

    initInventoryState();
    loadCustomItems();
    initFirstAidKitStatus();
    updateVolunteerActionButton();
    const sosContainer = document.getElementById('sos-modal-container');
    if (sosContainer) initSOS();
}

function updateVolunteerActionButton() {
    const volunteerData = localStorage.getItem('ligtas_volunteer_data');
    const button = document.getElementById('volunteer-action-button');
    const message = document.getElementById('volunteer-status-message');

    if (button) {
        if (volunteerData) {
            button.innerHTML = '<i data-lucide="hand-helping" class="w-5 h-5"></i>Open Volunteer Page';
        } else {
            button.innerHTML = '<i data-lucide="hand-helping" class="w-5 h-5"></i>Register as Volunteer';
        }
    }

    if (message) {
        if (volunteerData) {
            message.classList.remove('hidden');
            message.textContent = 'You are registered as a volunteer. Open the dashboard anytime.';
        } else {
            message.classList.add('hidden');
        }
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

function unregisterVolunteer() {
    localStorage.removeItem('ligtas_volunteer_data');
    showToast('You have been unregistered as a volunteer.');
    updateVolunteerActionButton();
    showScreen('screen-home');
}

// First Aid Kit Settings Functions
function openFirstAidSettings() {
    const modal = document.getElementById('first-aid-settings-modal');
    if (modal) {
        // Load current first aid kit settings from localStorage
        const settings = getFirstAidSettings();
        document.querySelectorAll('.first-aid-item .checkbox').forEach(checkbox => {
            const itemId = checkbox.getAttribute('data-first-aid-item');
            const isChecked = settings[itemId] !== false; // Default to true if not set
            applyInventoryCheckbox(checkbox, isChecked);
        });
        modal.classList.add('open');
        lucide.createIcons();
    }
}

function toggleFirstAidItem(checkbox) {
    const isChecked = !checkbox.classList.contains('checked');
    applyInventoryCheckbox(checkbox, isChecked);
}

function saveFirstAidSettings() {
    const settings = {};
    document.querySelectorAll('.first-aid-item .checkbox').forEach(checkbox => {
        const itemId = checkbox.getAttribute('data-first-aid-item');
        const isChecked = checkbox.classList.contains('checked');
        settings[itemId] = isChecked;
    });

    // Save to localStorage
    localStorage.setItem('firstAidKitSettings', JSON.stringify(settings));

    // Update the main first aid kit checkbox based on settings
    updateFirstAidKitStatus(settings);

    closeModal('first-aid-settings-modal');
    showToast('First aid kit settings saved');
    updateCategoryProgress(); // Update percentages after settings change
}

function getFirstAidSettings() {
    const stored = localStorage.getItem('firstAidKitSettings');
    if (stored) {
        return JSON.parse(stored);
    }
    // Default settings - all essential items checked
    return {
        'bandages': false,
        'antiseptics': false,
        'gauze': false,
        'scissors': false,
        'gloves': false,
        'burn-cream': false,
        'pain-relief': false,
        'thermometer': false,
        'cpr-mask': false,
        'blanket': false
    };
}

function updateFirstAidKitStatus(settings) {
    const firstAidCheckbox = document.querySelector('.checkbox[data-inventory-item="first-aid-kit"]');
    if (firstAidCheckbox) {
        // Check if at least the essential items are selected
        const essentialItems = ['bandages', 'antiseptics', 'gauze'];
        const hasEssentials = essentialItems.every(item => settings[item]);
        applyInventoryCheckbox(firstAidCheckbox, hasEssentials);
    }
}

function initFirstAidKitStatus() {
    const settings = getFirstAidSettings();
    updateFirstAidKitStatus(settings);
    updateCategoryProgress(); // Ensure percentages are updated after first aid kit initialization
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bindPreparePageEvents();
    });
} else {
    bindPreparePageEvents();
}

// Volunteer Functions
function checkVolunteerStatus() {
    const volunteerData = localStorage.getItem('ligtas_volunteer_data');
    if (volunteerData) {
        // User is registered, show volunteer screen
        showScreen('screen-volunteer');
        loadVolunteerData();
    } else {
        // User not registered, show registration modal
        openModal('volunteer-modal');
    }
}

function loadVolunteerData() {
    const volunteerData = localStorage.getItem('ligtas_volunteer_data');
    if (volunteerData) {
        const data = JSON.parse(volunteerData);

        // Update welcome message with volunteer's name
        const welcomeTitle = document.querySelector('.volunteer-welcome-title');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Welcome, ${data.name}!`;
        }

        // Update role display
        const roleDisplay = document.querySelector('.volunteer-role');
        if (roleDisplay) {
            roleDisplay.textContent = data.role;
        }

        // Update header profile image
        const profileImg = document.querySelector('header img');
        if (profileImg) {
            profileImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=2E7D32&color=fff`;
        }

        // Reset sample assignment state on reload, then update section layout
        resetAssignmentSampleState();
        setTimeout(() => {
            updateAllAssignmentCardStatuses();
            updateSectionPlaceholders();
        }, 100);

        console.log('Loaded volunteer data:', data);
    }
}

function resetAssignmentSampleState() {
    localStorage.removeItem(ASSIGNMENT_STATUS_KEY);
    localStorage.removeItem(ACCEPTED_ASSIGNMENTS_KEY);
}

// Assignment acceptance tracking
const ACCEPTED_ASSIGNMENTS_KEY = 'ligtas_accepted_assignments';
const ASSIGNMENT_STATUS_KEY = 'ligtas_assignment_statuses';

function getAcceptedAssignments() {
    try {
        return JSON.parse(localStorage.getItem(ACCEPTED_ASSIGNMENTS_KEY) || '[]');
    } catch (error) {
        return [];
    }
}

function getAssignmentStatuses() {
    try {
        return JSON.parse(localStorage.getItem(ASSIGNMENT_STATUS_KEY) || '{}');
    } catch (error) {
        return {};
    }
}

function getAssignmentStatus(assignmentId) {
    const statuses = getAssignmentStatuses();
    if (statuses[assignmentId]) {
        return statuses[assignmentId];
    }
    const card = document.querySelector(`[data-assignment-id="${assignmentId}"]`);
    if (card && card.dataset.assignmentStatus) {
        return card.dataset.assignmentStatus;
    }
    return 'urgent';
}

function setAssignmentStatus(assignmentId, status) {
    const statuses = getAssignmentStatuses();
    statuses[assignmentId] = status;
    localStorage.setItem(ASSIGNMENT_STATUS_KEY, JSON.stringify(statuses));
    updateAssignmentCardStatus(assignmentId);
    updateSectionPlaceholders();
}

function isAssignmentAccepted(assignmentId) {
    return getAssignmentStatus(assignmentId) === 'accepted';
}

function isAssignmentDeclined(assignmentId) {
    return getAssignmentStatus(assignmentId) === 'declined';
}

function saveAcceptedAssignment(assignmentId) {
    const assignment = assignmentDetails[assignmentId];
    if (!assignment) return false;

    const volunteerData = JSON.parse(localStorage.getItem('ligtas_volunteer_data') || '{}');
    
    // Check if already accepted or declined
    const currentStatus = getAssignmentStatus(assignmentId);
    if (currentStatus === 'accepted') {
        return false;
    }
    if (currentStatus === 'declined') {
        return false;
    }

    const acceptedAssignments = getAcceptedAssignments();
    const acceptanceRecord = {
        assignmentId,
        assignmentTitle: assignment.title,
        volunteerName: volunteerData.name || 'Unknown',
        volunteerPhone: volunteerData.contact || '',
        volunteerEmail: volunteerData.email || '',
        acceptedAt: new Date().toISOString(),
        location: assignment.location,
        deadline: assignment.time,
        status: 'accepted'
    };
    
    acceptedAssignments.push(acceptanceRecord);
    localStorage.setItem(ACCEPTED_ASSIGNMENTS_KEY, JSON.stringify(acceptedAssignments));
    setAssignmentStatus(assignmentId, 'accepted');
    
    console.log('Assignment saved:', acceptanceRecord);
    return true;
}

function moveAssignmentCard(assignmentId, status) {
    const sectionMap = {
        urgent: 'urgent-assignments',
        accepted: 'accepted-assignments',
        completed: 'completed-assignments',
        declined: 'declined-assignments'
    };
    const targetId = sectionMap[status] || sectionMap.urgent;
    const target = document.getElementById(targetId);
    const card = document.querySelector(`[data-assignment-id="${assignmentId}"]`);
    if (!card || !target) return;
    target.appendChild(card);
}

function updateSectionPlaceholders() {
    ['accepted', 'completed', 'declined'].forEach(status => {
        const sectionId = `${status}-assignments`;
        const section = document.getElementById(sectionId);
        const placeholder = section ? section.querySelector(`#${status}-empty`) : null;
        if (!section || !placeholder) return;
        const hasCards = Array.from(section.children).some(child => child.classList && child.classList.contains('announcement-card'));
        placeholder.style.display = hasCards ? 'none' : 'block';
    });
}

function updateAssignmentCardStatus(assignmentId) {
    const card = document.querySelector(`[data-assignment-id="${assignmentId}"]`);
    if (!card) return;

    const status = getAssignmentStatus(assignmentId);
    const badge = card.querySelector('.status-badge');
    const actionArea = card.querySelector('.announcement-actions');
    const button = actionArea ? actionArea.querySelector('button') : null;

    if (status === 'accepted') {
        card.setAttribute('data-assignment-status', 'accepted');
        if (badge) {
            badge.textContent = 'ACCEPTED';
            badge.className = 'status-badge status-accepted';
        }
        if (actionArea) {
            actionArea.style.display = 'block';
        }
        if (button) {
            button.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i> View Full Details';
            button.className = 'w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg';
            button.onclick = () => openAssignmentModal(assignmentId);
        }
    } else if (status === 'completed') {
        card.setAttribute('data-assignment-status', 'completed');
        if (badge) {
            badge.textContent = 'COMPLETED';
            badge.className = 'status-badge status-completed';
        }
        if (actionArea) {
            actionArea.style.display = 'block';
        }
        if (button) {
            button.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i> View Full Details';
            button.className = 'w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg';
            button.onclick = () => openAssignmentModal(assignmentId);
        }
    } else if (status === 'declined') {
        card.setAttribute('data-assignment-status', 'declined');
        if (badge) {
            badge.textContent = 'DECLINED';
            badge.className = 'status-badge status-declined';
        }
        if (actionArea) {
            actionArea.style.display = 'none';
        }
    } else {
        card.setAttribute('data-assignment-status', 'urgent');
        if (badge) {
            badge.textContent = 'URGENT';
            badge.className = 'status-badge status-urgent';
        }
        if (actionArea) {
            actionArea.style.display = 'block';
        }
        if (button) {
            button.innerHTML = '<i data-lucide="eye" class="w-4 h-4"></i> View Full Details';
            button.className = 'w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg';
            button.onclick = () => openAssignmentModal(assignmentId);
        }
    }

    moveAssignmentCard(assignmentId, status);
    lucide.createIcons();
}

function acceptAssignment(assignmentId) {
    const assignment = assignmentDetails[assignmentId];
    if (!assignment) return;

    const currentStatus = getAssignmentStatus(assignmentId);
    if (currentStatus === 'accepted') {
        showToast('You already accepted this assignment');
        closeModal('assignment-modal');
        return;
    }
    if (currentStatus === 'declined') {
        showToast('This assignment was declined and cannot be accepted.');
        closeModal('assignment-modal');
        return;
    }

    const saved = saveAcceptedAssignment(assignmentId);
    if (!saved) {
        showToast('Unable to accept assignment.');
        closeModal('assignment-modal');
        return;
    }

    showToast(`Accepted! Report to ${assignment.location}`);
    closeModal('assignment-modal');
    showScreen('assignment-detail-screen');
    showAssignmentDetailPage(assignmentId);
    console.log('Assignment accepted:', assignmentId);
}

function declineAssignment(assignmentId) {
    const currentStatus = getAssignmentStatus(assignmentId);
    if (currentStatus === 'accepted') {
        showToast('Accepted assignments cannot be declined.');
        closeModal('assignment-modal');
        return;
    }
    setAssignmentStatus(assignmentId, 'declined');
    closeModal('assignment-modal');
    showScreen('screen-volunteer');
    showToast('Assignment declined');
    console.log('Declined assignment:', assignmentId);
}

function completeAssignment(assignmentId) {
    const currentStatus = getAssignmentStatus(assignmentId);
    if (currentStatus !== 'accepted') {
        showToast('Only accepted assignments can be marked as done.');
        return;
    }

    setAssignmentStatus(assignmentId, 'completed');
    closeModal('assignment-modal');
    showScreen('screen-volunteer');
    showToast('Assignment marked as completed!');
    console.log('Completed assignment:', assignmentId);
}

function viewAssignmentDetails(assignmentId) {
    closeModal('assignment-modal');
    showAssignmentDetailPage(assignmentId);
    console.log('Viewing assignment:', assignmentId);
}

function updateAllAssignmentCardStatuses() {
    const cards = document.querySelectorAll('[data-assignment-id]');
    cards.forEach(card => {
        const assignmentId = card.dataset.assignmentId;
        updateAssignmentCardStatus(assignmentId);
    });
}

// Expose functions used by inline event handlers to ensure page interactions work reliably.
window.showScreen = showScreen;
window.openInventoryScreen = openInventoryScreen;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleCheck = toggleCheck;
window.openAssignmentModal = openAssignmentModal;
window.acceptAssignment = acceptAssignment;
window.declineAssignment = declineAssignment;
window.completeAssignment = completeAssignment;
window.viewAssignmentDetails = viewAssignmentDetails;
window.markMyselfSafe = markMyselfSafe;
window.checkVolunteerStatus = checkVolunteerStatus;
window.registerVolunteer = registerVolunteer;
window.openFirstAidSettings = openFirstAidSettings;
window.saveFirstAidSettings = saveFirstAidSettings;
window.unbindVolunteer = unregisterVolunteer;
window.openAddItemModal = openAddItemModal;
window.showToast = showToast;
window.isAssignmentAccepted = isAssignmentAccepted;
window.updateAllAssignmentCardStatuses = updateAllAssignmentCardStatuses;

