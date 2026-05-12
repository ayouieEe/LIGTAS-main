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
            waterValue.textContent = '15.5 Liters';
        } else if (hydrationPercent >= 50) {
            waterBadge.textContent = 'Low';
            waterBadge.className = 'status-badge status-low';
            waterValue.textContent = '8.0 Liters';
        } else {
            waterBadge.textContent = 'Critical';
            waterBadge.className = 'status-badge status-critical';
            waterValue.textContent = '3.0 Liters';
        }
    }

    const foodBadge = document.getElementById('canned-food-badge');
    const foodValue = document.getElementById('canned-food-value');
    if (foodBadge && foodValue) {
        if (hydrationPercent >= 100) {
            foodBadge.textContent = 'Good';
            foodBadge.className = 'status-badge status-good';
            foodValue.textContent = '5 Days Left';
        } else if (hydrationPercent >= 50) {
            foodBadge.textContent = 'Low';
            foodBadge.className = 'status-badge status-low';
            foodValue.textContent = '3 Days Left';
        } else {
            foodBadge.textContent = 'Critical';
            foodBadge.className = 'status-badge status-critical';
            foodValue.textContent = '1 Day Left';
        }
    }

    const medicalBadge = document.getElementById('medical-kit-badge');
    const medicalValue = document.getElementById('medical-kit-value');
    if (medicalBadge && medicalValue) {
        if (healthPercent >= 100) {
            medicalBadge.textContent = 'Good';
            medicalBadge.className = 'status-badge status-good';
            medicalValue.textContent = 'Level 2 Kit';
        } else if (healthPercent >= 50) {
            medicalBadge.textContent = 'Low';
            medicalBadge.className = 'status-badge status-low';
            medicalValue.textContent = 'Level 1 Kit';
        } else {
            medicalBadge.textContent = 'Critical';
            medicalBadge.className = 'status-badge status-critical';
            medicalValue.textContent = 'Check Supplies';
        }
    }

    const powerBadge = document.getElementById('power-source-badge');
    const powerValue = document.getElementById('power-source-value');
    if (powerBadge && powerValue) {
        if (powerPercent >= 100) {
            powerBadge.textContent = 'Good';
            powerBadge.className = 'status-badge status-good';
            powerValue.textContent = '100% Charge';
            powerValue.className = 'text-[17px] font-bold mt-0.5 text-navy';
        } else if (powerPercent >= 50) {
            powerBadge.textContent = 'Low';
            powerBadge.className = 'status-badge status-low';
            powerValue.textContent = '50% Charge';
            powerValue.className = 'text-[17px] font-bold mt-0.5 text-amber';
        } else {
            powerBadge.textContent = 'Critical';
            powerBadge.className = 'status-badge status-critical';
            powerValue.textContent = '12% Charge';
            powerValue.className = 'text-[17px] font-bold mt-0.5 text-emergency';
        }
    }
}

function showAssemblyDetails(centerId) {
    const centers = {
        sports: {
            title: 'Pasig City Sports Complex',
            address: 'Caruncho Ave, Pasig City',
            description: 'Main evacuation center with medical tents, water supply, and food distribution.',
            mapUrl: 'https://maps.google.com/maps?f=d&hl=en&geocode=&saddr=14.5826,121.0735&daddr=14.5760,121.0835&dirflg=d&output=embed',
            badgeColor: '#D32F2F',
        },
        cityHall: {
            title: 'Pasig City Hall Evacuation Center',
            address: 'F. Ortigas Jr Road, Pasig City',
            description: 'City Hall shelter offering community support, emergency services, and temporary lodging.',
            mapUrl: 'https://maps.google.com/maps?f=d&hl=en&geocode=&saddr=14.5826,121.0735&daddr=14.5814,121.0740&dirflg=d&output=embed',
            badgeColor: '#1976D2',
        },
        sanAntonio: {
            title: 'Barangay San Antonio Evacuation Center',
            address: 'San Antonio, Pasig City',
            description: 'Barangay evacuation center with first aid, drinking water, and local coordination support.',
            mapUrl: 'https://maps.google.com/maps?f=d&hl=en&geocode=&saddr=14.5826,121.0735&daddr=14.5810,121.0520&dirflg=d&output=embed',
            badgeColor: '#388E3C',
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
    if (mapIframe) mapIframe.src = center.mapUrl;
    showScreen('screen-assembly');
}

let currentAssignmentId = null;

const assignmentDetails = {
    'flood-response': {
        title: 'Emergency Response Team Needed',
        summary: 'Flooding in Barangay San Miguel requires immediate volunteer assistance. We need experienced responders for evacuation and first aid support.',
        location: 'Barangay San Miguel',
        status: 'URGENT',
        time: 'Report within 30 minutes',
        description: 'Coordinate with barangay volunteers, assist with evacuation, provide first aid, and help move affected families to safe assembly points. Bring rain gear, a flashlight, and medical supplies.',
        tasks: [
            'Report to Barangay Hall immediately',
            'Support evacuation and carry essential supplies',
            'Provide basic first aid to injured residents',
            'Help document missing persons and family reunification requests'
        ],
        coordinator: 'Barangay Emergency Officer'
    },
    'supply-distribution': {
        title: 'Supply Distribution Support',
        summary: 'Help distribute emergency supplies to affected families. Training will be provided and a 4-hour shift is available tomorrow morning.',
        location: 'City Hall Distribution Center',
        status: 'ASSIGNED',
        time: 'Tomorrow 8:00 AM',
        description: 'Assist logistics staff in packing and delivering food packs, water, and hygiene kits. Ensure each household receives the correct package and support safe distancing protocols.',
        tasks: [
            'Attend brief volunteer orientation at 7:30 AM',
            'Pack supplies into distribution boxes',
            'Deliver kits to assigned barangay zones',
            'Record recipient names and package quantities'
        ],
        coordinator: 'City Hall Logistics Team'
    },
    'medical-support': {
        title: 'Medical Assistance Team',
        summary: 'Support medical personnel at evacuation centers. Basic first aid knowledge helpful but not required. Flexible scheduling available.',
        location: 'Pasig City Sports Complex',
        status: 'URGENT',
        time: 'Immediate to 6 hours',
        description: 'Assist medical staff in triaging patients, distributing medications, monitoring vital signs, and providing comfort to displaced families. Personal protective equipment will be provided.',
        tasks: [
            'Report to medical tent at evacuation center',
            'Assist with patient intake and vital sign monitoring',
            'Help distribute medications and first aid supplies',
            'Provide emotional support to affected families',
            'Maintain cleanliness of medical area'
        ],
        coordinator: 'Dr. Maria Santos, Medical Coordinator'
    },
    'communication-hotline': {
        title: 'Hotline Support Volunteer',
        summary: 'Answer emergency calls and assist with family reunification. Training provided. Can work from command center or remotely.',
        location: 'Pasig City Emergency Operations Center',
        status: 'ASSIGNED',
        time: 'Tomorrow 10:00 AM - 6:00 PM',
        description: 'Help manage incoming calls from displaced residents seeking family members, provide information about assembly points and services, and connect callers with appropriate resources. Bilingual skills (Filipino/English) preferred.',
        tasks: [
            'Attend 30-minute call center orientation',
            'Answer incoming hotline calls',
            'Document caller information and family reunification requests',
            'Provide accurate information about evacuation centers and services',
            'Transfer critical cases to case managers'
        ],
        coordinator: 'Red Cross Command Center'
    },
    'shelter-logistics': {
        title: 'Shelter Logistics & Setup',
        summary: 'Help set up and organize emergency shelter facilities. Physical tasks involved - good for group volunteering. Starts this evening.',
        location: 'Barangay San Antonio Hall',
        status: 'URGENT',
        time: 'Tonight 6:00 PM',
        description: 'Assist in setting up cots, organizing supply stations, creating sleeping areas, and establishing sanitation facilities. Heavy lifting and manual work involved. Wear comfortable clothes and closed-toe shoes.',
        tasks: [
            'Arrive at shelter site by 6:00 PM',
            'Assemble cots and bedding stations',
            'Organize food and water distribution areas',
            'Set up sanitation and hygiene stations',
            'Help arrange registration and check-in areas'
        ],
        coordinator: 'Barangay San Antonio Emergency Coordinator'
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

    if (titleEl) titleEl.textContent = assignment.title;
    if (summaryEl) summaryEl.textContent = assignment.summary;
    if (locationEl) locationEl.textContent = assignment.location;
    if (timeEl) timeEl.textContent = assignment.time;
    if (descEl) descEl.textContent = assignment.description;
    
    // Set priority badge
    if (priorityBadgeEl) {
        if (assignment.status === 'URGENT') {
            priorityBadgeEl.className = 'px-3 py-1 rounded-full text-[11px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30';
            priorityBadgeEl.textContent = 'HIGH PRIORITY';
        } else {
            priorityBadgeEl.className = 'px-3 py-1 rounded-full text-[11px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30';
            priorityBadgeEl.textContent = 'ASSIGNED';
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
    t.textContent = '✓ ' + msg;
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
        'bandages': true,
        'antiseptics': true,
        'gauze': true,
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

        console.log('Loaded volunteer data:', data);
    }
}

function acceptAssignment(assignmentId) {
    closeModal('assignment-modal');
    showScreen('assignment-detail-screen');
    showAssignmentDetailPage(assignmentId);
    console.log('Accepted assignment:', assignmentId);
}

function declineAssignment(assignmentId) {
    closeModal('assignment-modal');
    showScreen('screen-volunteer');
    console.log('Declined assignment:', assignmentId);
}

function viewAssignmentDetails(assignmentId) {
    closeModal('assignment-modal');
    showAssignmentDetailPage(assignmentId);
    console.log('Viewing assignment:', assignmentId);
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
window.viewAssignmentDetails = viewAssignmentDetails;
window.markMyselfSafe = markMyselfSafe;
window.checkVolunteerStatus = checkVolunteerStatus;
window.registerVolunteer = registerVolunteer;
window.openFirstAidSettings = openFirstAidSettings;
window.saveFirstAidSettings = saveFirstAidSettings;
window.unbindVolunteer = unregisterVolunteer;
window.openAddItemModal = openAddItemModal;
window.showToast = showToast;

