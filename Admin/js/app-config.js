// CORE UTILITIES (Global)
var firstValue = (...vals) => {
    for (const v of vals) {
        if (v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim().toLowerCase() !== 'undefined') return v;
    }
    return vals[vals.length - 1];
};

var normalizeList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(/,|\n|\|/).map(s => s.trim()).filter(Boolean);
    return [];
};

var escapeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
};

var getIncidentLocation = (inc) => {
    const raw = firstValue(inc.location, inc.barangay, inc.address, inc.fullAddress, inc.landmark, inc.reportLocation, inc.latlng, 'Unknown location');
    const text = String(raw).trim();
    if (text === 'Unknown location' || /pasig/i.test(text)) return text;
    return `${text}, Pasig City`;
};

var getIncidentNeeds = (inc) => {
    return normalizeList(firstValue(
        inc.needs, inc.requiredAssistance, inc.assistanceNeeded, inc.resourcesNeeded, inc.unitsNeeded, inc.responseUnits, inc.assistance, inc.requirements
    ));
};

var getIncidentMedia = (inc) => {
    return normalizeList(firstValue(
        inc.media, inc.attachments, inc.photos, inc.images, inc.photoUrls, inc.photoUrl, inc.imageUrl
    )).filter(Boolean);
};

var severityTone = (severity) => {
    if (!severity) return 'default';
    const s = String(severity).toLowerCase();
    if (s.includes('critical')) return 'critical';
    if (s.includes('high') || s.includes('urgent')) return 'warning';
    if (s.includes('medium') || s.includes('stable')) return 'nominal';
    if (s.includes('low') || s.includes('info')) return 'success';
    return 'default';
};

var sourceTone = (source) => {
    if (!source) return 'badge';
    const s = String(source).toLowerCase();
    if (s.includes('admin') || s.includes('official')) return 'badge critical';
    if (s.includes('field') || s.includes('verify')) return 'badge warning';
    if (s.includes('mobile') || s.includes('app')) return 'badge nominal';
    return 'badge';
};

var getCallableNumber = (phone) => {
    if (!phone) return '';
    return String(phone).replace(/[^\d+]/g, '');
};

var renderCallButton = (label, phone, type = 'primary') => {
    if (!phone) return `<button class="btn btn-ghost" disabled style="opacity:0.55;cursor:not-allowed;">No phone number</button>`;
    const btnClass = type === 'ghost' ? 'btn-ghost' : 'btn-primary';
    return `<a href="tel:${phone}" class="btn ${btnClass}" style="text-decoration:none;font-size:11px;padding:6px 10px;" onclick="if(typeof onInitiateCall==='function')onInitiateCall(this,'${phone}');event.stopPropagation()">☎ ${label}</a>`;
};

// Global Interactive Call Handlers
window.onInitiateCall = function (el, phone) {
    const parent = el.parentElement;
    if (!parent || parent.querySelector('.call-status-actions')) return;

    const actions = document.createElement('div');
    actions.className = 'call-status-actions';
    actions.style.display = 'flex';
    actions.style.gap = '8px';
    actions.style.marginTop = '6px';
    actions.style.animation = 'fadeInStatus 0.3s ease-out';

    actions.innerHTML = `
        <button class="btn btn-sm" style="background:rgba(245,158,11,0.1);color:#F59E0B;border:1px solid rgba(245,158,11,0.2);flex:1;font-size:10px;padding:5px;font-weight:600;" onclick="updateCallStatus(this, 'Busy')">Line Busy</button>
        <button class="btn btn-sm" style="background:rgba(34,197,94,0.1);color:#22C55E;border:1px solid rgba(34,197,94,0.2);flex:1;font-size:10px;padding:5px;font-weight:600;" onclick="updateCallStatus(this, 'Accepted')">Accepted</button>
    `;
    
    parent.appendChild(actions);
    
    // Add animation if not present
    if (!document.getElementById('call-tracking-styles')) {
        const style = document.createElement('style');
        style.id = 'call-tracking-styles';
        style.textContent = `
            @keyframes fadeInStatus { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            .btn-status-badge { animation: fadeInStatus 0.3s ease-out; font-size: 11px; font-weight: 600; padding: 6px 12px; border-radius: var(--radius); text-align: center; margin-top: 6px; }
        `;
        document.head.appendChild(style);
    }
};

window.updateCallStatus = function (btn, status) {
    const wrap = btn.parentElement;
    const parent = wrap.parentElement;
    const badge = document.createElement('div');
    badge.className = 'btn-status-badge';

    // Find responder name and incident ID
    const nameEl = parent.querySelector('.responder-name');
    const responderName = nameEl ? nameEl.textContent.trim() : null;
    const incidentId = document.getElementById('modal-inc-id')?.textContent.trim();

    if (incidentId && responderName) {
        const incidents = JSON.parse(localStorage.getItem('ligtas_incidents') || '[]');
        const idx = incidents.findIndex(i => i.id === incidentId);
        if (idx !== -1) {
            if (!incidents[idx].responderResponses) incidents[idx].responderResponses = {};
            incidents[idx].responderResponses[responderName] = status;
            localStorage.setItem('ligtas_incidents', JSON.stringify(incidents));
        }
    }

    if (status === 'Busy') {
        badge.style.background = 'rgba(245,158,11,0.1)';
        badge.style.color = '#F59E0B';
        badge.style.border = '1px solid rgba(245,158,11,0.2)';
        badge.innerHTML = '⚠ Line Busy — No Response';
    } else {
        badge.style.background = 'rgba(34,197,94,0.1)';
        badge.style.color = '#22C55E';
        badge.style.border = '1px solid rgba(34,197,94,0.2)';
        badge.innerHTML = '✓ Accepted — Unit En Route';
        
        if (typeof logAction === 'function') {
            const title = document.getElementById('modal-inc-title')?.textContent || 'Incident';
            logAction('Dispatch', title, `Responder ${responderName} accepted via direct call`);
        }
    }

    wrap.replaceWith(badge);
    const callBtn = parent.querySelector('a.btn');
    if (callBtn) {
        callBtn.style.opacity = '0.4';
        callBtn.style.pointerEvents = 'none';
    }
};

var renderInfoBadge = (text, type = 'default') => {
    const colors = {
        'critical': 'background:rgba(239,68,68,0.1);color:var(--critical);border-color:rgba(239,68,68,0.2)',
        'warning': 'background:rgba(245,158,11,0.1);color:var(--warning);border-color:rgba(245,158,11,0.2)',
        'nominal': 'background:rgba(59,130,246,0.1);color:var(--primary);border-color:rgba(59,130,246,0.2)',
        'success': 'background:rgba(34,197,94,0.1);color:var(--success);border-color:rgba(34,197,94,0.2)',
        'default': 'background:var(--bg3);color:var(--text3);border-color:var(--border)'
    };
    return `<span class="badge" style="${colors[type] || colors.default}">${escapeHTML(text)}</span>`;
};

var setText = (id, value, fallback = '—') => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || fallback;
};

var getIncidents = () => JSON.parse(localStorage.getItem('ligtas_incidents') || '[]');
var saveIncidents = (arr) => localStorage.setItem('ligtas_incidents', JSON.stringify(arr));

// MASTER DUMMY DATA
const DEFAULT_ZONES = {
    'Bagong Ilog': 18200,
    'Bagong Katipunan': 1200,
    'Bambang': 22000,
    'Buting': 11000,
    'Caniogan': 31000,
    'Dela Paz': 19000,
    'Kalawaan': 28000,
    'Kapasigan': 6700,
    'Kapitolyo': 14300,
    'Malinao': 7000,
    'Manggahan': 94000,
    'Maybunga': 45200,
    'Oranbo': 4000,
    'Palatiw': 22000,
    'Pinagbuhatan': 151000,
    'Pineda': 18000,
    'Rosario': 68000,
    'Sagad': 8000,
    'San Antonio': 15000,
    'San Joaquin': 15600,
    'San Jose': 2500,
    'San Miguel': 35000,
    'San Nicolas': 3000,
    'Santa Cruz': 5000,
    'Santa Lucia': 48000,
    'Santa Rosa': 2000,
    'Santolan': 52100,
    'Santo Tomas': 42000,
    'Sumilang': 6000,
    'Ugong': 28500
};


const DEFAULT_UNITS = [
    { name: 'PASIG-AMB-01 (Advanced Life Support)', type: 'Medical', status: 'Available' },
    { name: 'PASIG-AMB-02 (Basic Life Support)', type: 'Medical', status: 'En Route' },
    { name: 'PASIG-FIRE-01 (Pumper)', type: 'Fire', status: 'Available' },
    { name: 'PASIG-RESCUE-01 (Heavy Rescue)', type: 'Rescue', status: 'Available' },
    { name: 'PASIG-BOAT-01 (Swift Water)', type: 'Rescue', status: 'Available' }
];


const DEFAULT_CATEGORIES = [
    { name: 'Structure Fire', group: 'Fire & Safety' },
    { name: 'Electrical Hazard', group: 'Fire & Safety' },
    { name: 'Gas Leak', group: 'Fire & Safety' },
    { name: 'Medical Emergency', group: 'Medical & Health' },
    { name: 'Road Accident', group: 'Medical & Health' },
    { name: 'Flash Flood', group: 'Environmental' },
    { name: 'Downed Tree', group: 'Environmental' },
    { name: 'Civil Disturbance', group: 'Security' }
];


const DEFAULT_INCIDENTS = [
    {
        id: 'INC-2026-001', title: 'Industrial Structure Fire — Brgy. Manggahan', status: 'Ongoing', severity: 'Critical',
        location: 'Amang Rodriguez Ave, Manggahan', barangay: 'Manggahan',
        description: 'Large scale fire at a warehouse facility. Multiple units responding. Low visibility due to heavy smoke. Evacuation of immediate perimeter in progress.',
        reporter: 'Sgt. Antonio Luna', contact: '+63 917 123 4567', source: 'Official Field Report',
        type: 'Structure Fire', createdAt: '2026-05-15, 08:12 AM',
        needs: ['Fire Suppression', 'Medical Standby', 'Evacuation'],
        reportingFor: 'Industrial Area',
        media: ['https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=400'],
        calledResponders: [
            { name: 'BFP Pasig City Fire Station', unit: 'Fire', role: 'Primary Fire Response', phone: '(02) 8643-0000', distance: '0.7 km away' },
            { name: 'PASIG-AMB-01 (Dr. Apolinar Cruz)', unit: 'Ambulance', role: 'Medical Standby', phone: '+63 919 100 1001', distance: '1.2 km away' },
            { name: 'PNP Pasig City HQ', unit: 'Police', role: 'Perimeter Security', phone: '(02) 8641-0000', distance: '0.5 km away' }
        ],
        assignedVolunteers: [
            { name: 'Volunteer Roberto Tan', initials: 'RT', status: 'Assigned', distance: '0.9 km away', color: 'var(--nominal)' }
        ],
        acceptedVolunteers: [
            { name: 'Volunteer Juan Dela Cruz', initials: 'JD', status: 'Assigned', distance: '0.4 km away', color: 'var(--success)' }
        ],
        declinedVolunteers: [
            { name: 'Volunteer Maria Santos', initials: 'MS', status: 'Assigned', distance: '0.8 km away', color: 'var(--critical)' }
        ],
        fieldNotes: 'Fire spreading to adjacent block. Requesting additional water tankers immediately. Perimeter secured by PNP.'
    },
    {
        id: 'INC-2026-002', title: 'Severe Street Flooding — Brgy. Pinagbuhatan', status: 'Dispatched', severity: 'Urgent',
        location: 'Urbano Velasco Ave', barangay: 'Pinagbuhatan',
        description: 'Water level reached knee-high. Residents in low-lying areas requesting assistance with moving belongings. No casualties reported yet.',
        reporter: 'Maria Clara', contact: '+63 918 987 6543', source: 'Mobile App',
        type: 'Flash Flood', createdAt: '2026-05-15, 09:45 AM',
        needs: ['Rescue Boat', 'Pumping Unit'],
        reportingFor: 'Residential Area',
        media: ['https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400'],
        calledResponders: [
            { name: 'Brgy. Pinagbuhatan Rescue Team', unit: 'Rescue', role: 'Boat Rescue Unit', phone: '+63 919 888 7777', distance: '0.3 km away' },
            { name: 'DSWD Pasig City Field Office', unit: 'Relief', role: 'Social Welfare & Aid', phone: '(02) 8643-2000', distance: '1.1 km away' }
        ],
        assignedVolunteers: [
            { name: 'Volunteer Roberto Tan', initials: 'RT', status: 'Assigned', distance: '1.0 km away', color: 'var(--nominal)' }
        ],
        acceptedVolunteers: [
            { name: 'Volunteer Maria Santos', initials: 'MS', status: 'On-Scene', distance: '0.2 km away', color: 'var(--warning)' }
        ],
        declinedVolunteers: [
            { name: 'Volunteer Juan Dela Cruz', initials: 'JD', status: 'Assigned', distance: '0.6 km away', color: 'var(--nominal)' }
        ],
        responderResponses: {
            'Brgy. Pinagbuhatan Rescue Team': 'Accepted',
            'DSWD Pasig City Field Office': 'Accepted'
        },
        fieldNotes: 'Water level slowly subsiding. Rescue boat extracted 8 residents from Sitio Pag-asa. Pumping operations ongoing.'
    },
    {
        id: 'INC-2026-003', title: 'Multi-Vehicle Collision — Ortigas Ave Extension', status: 'Acknowledged', severity: 'High',
        location: 'Near Rosario Bridge, Brgy. Rosario', barangay: 'Rosario',
        description: 'Three-car pileup causing major traffic congestion. At least 2 persons with minor injuries. PNP and Traffic Management on site.',
        reporter: 'Ricardo Dalisay', contact: '+63 920 555 1212', source: 'Verified Field Report',
        type: 'Road Accident', createdAt: '2026-05-15, 10:05 AM',
        needs: ['Ambulance', 'Towing Service'],
        reportingFor: 'Public Road', media: [],
        calledResponders: [
            { name: 'Pasig City Traffic Management', unit: 'Traffic', role: 'Traffic Control', phone: '+63 917 800 0001', distance: '1.0 km away' },
            { name: 'Pasig City General Hospital ER', unit: 'Medical', role: 'Emergency Medical Services', phone: '(02) 8643-1111', distance: '0.8 km away' },
            { name: 'PNP Pasig City HQ', unit: 'Police', role: 'Law Enforcement', phone: '(02) 8641-0000', distance: '0.5 km away' }
        ],
        acceptedVolunteers: [
            { name: 'Volunteer Juan Dela Cruz', initials: 'JD', status: 'On-Scene', distance: '0.0 km away', color: 'var(--warning)' },
            { name: 'Volunteer Maria Santos', initials: 'MS', status: 'On-Scene', distance: '0.0 km away', color: 'var(--warning)' }
        ],
        responderResponses: {
            'Pasig City Traffic Management': 'Accepted',
            'Pasig City General Hospital ER': 'Accepted',
            'PNP Pasig City HQ': 'Accepted'
        },
        fieldNotes: 'Two lanes blocked. Towing truck ETA 10 mins. 2 victims with minor lacerations transported to PCGH.'
    },
    {
        id: 'INC-2026-004', title: 'Security: Civil Disturbance — Brgy. San Antonio', status: 'Reported', severity: 'High',
        location: 'Emerald Ave, Ortigas Center', barangay: 'San Antonio',
        description: 'Unsanctioned protest gathering near financial buildings. Requesting police presence for crowd management and traffic rerouting.',
        reporter: 'Admin Security', contact: '+63 916 333 4444', source: 'CCTV Monitoring',
        type: 'Civil Disturbance', createdAt: '2026-05-15, 10:30 AM',
        needs: ['Police Assistance'],
        reportingFor: 'Business District', media: [],
        calledResponders: [
            { name: 'PNP Ortigas Detachment', unit: 'Police', role: 'Sub-station', phone: '+63 917 555 4444', distance: '0.9 km away' },
            { name: 'PNP Pasig City HQ', unit: 'Police', role: 'Law Enforcement', phone: '(02) 8641-0000', distance: '0.5 km away' }
        ],
        assignedVolunteers: [
            { name: 'Brgy. Tanod — Team Alpha', initials: 'TA', status: 'Assigned', distance: '0.3 km away', color: 'var(--nominal)' },
            { name: 'Brgy. Tanod — Team Bravo', initials: 'TB', status: 'Assigned', distance: '0.5 km away', color: 'var(--nominal)' }
        ],
        fieldNotes: 'Crowd size approx 150 people. Peaceful but blocking main road. PNP Ortigas notified, ETA 5 mins.'
    },
    {
        id: 'INC-2026-005', title: 'Logistics: Center Overflow — Brgy. Santolan', status: 'Reported', severity: 'Medium',
        location: 'Santolan Elementary School', barangay: 'Santolan',
        description: 'Evacuation center reached 90% capacity. Requesting immediate transfer plan for incoming residents from low-lying zones.',
        reporter: 'Officer Benitez', contact: '+63 908 777 8888', source: 'Center Manager Report',
        type: 'Center Overflow', createdAt: '2026-05-15, 10:45 AM',
        needs: ['Transportation', 'Shelter Assessment'],
        reportingFor: 'Evacuation Center', media: [],
        calledResponders: [
            { name: 'Santolan Elementary Evac Center', unit: 'Shelter', role: 'Evacuation Manager', phone: '+63 918 222 3333', distance: '0.0 km away' },
            { name: 'Rizal High School Evac Center', unit: 'Shelter', role: 'Center-In-Charge', phone: '+63 908 444 5555', distance: '1.5 km away' },
            { name: 'Pasig DRRMO Relief Division', unit: 'Relief', role: 'Relief Coordinator', phone: '+63 906 777 8888', distance: '0.4 km away' }
        ],
        assignedVolunteers: [
            { name: 'Relief Coord Aling Nena', initials: 'AN', status: 'Assigned', distance: '0.0 km away', color: 'var(--nominal)' },
            { name: 'Relief Coord Mang Isko', initials: 'MI', status: 'Assigned', distance: '0.0 km away', color: 'var(--nominal)' },
            { name: 'Volunteer Driver 01', initials: 'VD', status: 'Assigned', distance: '0.8 km away', color: 'var(--nominal)' }
        ],
        fieldNotes: 'Need 2 L300 vans to transport 40 individuals to Rizal High School center. Transferred 15 already.'
    },
    {
        id: 'INC-2026-007', title: 'Power Outage — Brgy. Oranbo', status: 'Reported', severity: 'Medium',
        location: 'Shaw Boulevard', barangay: 'Oranbo',
        description: 'Transformer blew out. Three street blocks are currently without power. Meralco has been notified but requesting traffic enforcers for the intersection.',
        reporter: 'LGU Hotline', contact: '+63 2 8643 1111', source: 'Hotline Call',
        type: 'Utility Failure', createdAt: '2026-05-15, 11:15 AM',
        needs: ['Traffic Enforcer', 'Utility Service'],
        reportingFor: 'Commercial Area', media: [],
        calledResponders: [
            { name: 'Meralco Emergency Hotline', unit: 'Utility', role: 'Power Restoration', phone: '16211', distance: '— (Utility)' },
            { name: 'Pasig City Traffic Management', unit: 'Traffic', role: 'Traffic Control', phone: '+63 917 800 0001', distance: '1.0 km away' }
        ],
        assignedVolunteers: [
            { name: 'Brgy. Tanod Team Alpha', initials: 'TA', status: 'Assigned', distance: '0.1 km away', color: 'var(--nominal)' },
            { name: 'Traffic Aux 03 (Mark Diaz)', initials: 'MD', status: 'Assigned', distance: '0.7 km away', color: 'var(--nominal)' }
        ],
        fieldNotes: 'Meralco dispatched. ETA 30 mins. Traffic enforcers positioned at Shaw-Ortigas intersection.'
    },
    {
        id: 'INC-2026-006', title: 'Medical: Respiratory Distress — Brgy. Kapitolyo', status: 'Resolved', severity: 'Medium',
        location: '12 Pioneer St, Kapitolyo', barangay: 'Kapitolyo',
        description: '72-year-old male experiencing difficulty breathing. PASIG-AMB-01 responded. Patient stabilized and transported to Medical City.',
        reporter: 'Elena Gomez', contact: '+63 915 444 3322', source: 'Mobile App',
        type: 'Medical Emergency', createdAt: '2026-05-15, 07:30 AM',
        needs: ['Oxygen Support'],
        reportingFor: 'Private Residence', media: [],
        calledResponders: [
            { name: 'PASIG-AMB-01 (Dr. Apolinar Cruz)', unit: 'Ambulance', role: 'Paramedic Unit', phone: '+63 919 100 1001', distance: '1.2 km away' },
            { name: 'Medical City Pasig ER', unit: 'Hospital', role: 'Receiving Facility', phone: '(02) 8988-1000', distance: '0.6 km away' }
        ],
        acceptedVolunteers: [
            { name: 'Volunteer Juan Dela Cruz', initials: 'JD', status: 'Accepted', distance: '0.4 km away', color: 'var(--success)' },
            { name: 'Volunteer Medic Ana Lim', initials: 'AL', status: 'Accepted', distance: '0.2 km away', color: 'var(--success)' }
        ],
        responderResponses: {
            'PASIG-AMB-01 (Dr. Apolinar Cruz)': 'Accepted',
            'Medical City Pasig ER': 'Accepted'
        },
        fieldNotes: 'Patient successfully handed over to ER staff. Condition: stable. Unit PASIG-AMB-01 returning to base.'
    },
    {
        id: 'INC-2026-008', title: 'Fallen Tree Obstruction — Brgy. Ugong', status: 'Resolved', severity: 'Low',
        location: 'Valle Verde 1', barangay: 'Ugong',
        description: 'Old acacia tree fell and blocked the subdivision main gate. Clearing operations completed by local DRRMO unit.',
        reporter: 'HOA President', contact: '+63 917 888 9999', source: 'Phone Report',
        type: 'Downed Tree', createdAt: '2026-05-14, 04:20 PM',
        needs: ['Clearing Team', 'Chainsaw'],
        reportingFor: 'Residential Village',
        media: ['https://images.unsplash.com/photo-1590422749909-51dd3fb52f9c?w=400'],
        calledResponders: [
            { name: 'Ugong DRRMO Unit', unit: 'Rescue', role: 'Clearing Operations', phone: '+63 920 444 5555', distance: '0.4 km away' },
            { name: 'Brgy. Hall Emergency Desk', unit: 'Barangay', role: 'Barangay Response Unit', phone: '+63 927 111 2222', distance: '0.3 km away' }
        ],
        assignedVolunteers: [
            { name: 'HOA Maintenance Lead (Tony)', initials: 'TM', status: 'Resolved', distance: '0.0 km away', color: 'var(--text3)' },
            { name: 'DRRMO Clearing Crew', initials: 'DC', status: 'Resolved', distance: '0.0 km away', color: 'var(--text3)' }
        ],
        fieldNotes: 'Area fully cleared by 05:30 PM. Gate reopened. Traffic flowing normally again.'
    },
    {
        id: 'INC-2026-009', title: 'Minor Earthquake Damage — Brgy. Maybunga', status: 'Resolved', severity: 'Low',
        location: 'Maybunga Public Market', barangay: 'Maybunga',
        description: 'Cracks observed on the outer wall following the 4.2 tremor. Engineering team assessed and declared structure safe. Routine monitoring advised.',
        reporter: 'Market Admin', contact: '+63 919 222 3333', source: 'Field Assessment',
        type: 'Structural Damage', createdAt: '2026-05-14, 02:10 PM',
        needs: ['Engineering Assessor'],
        reportingFor: 'Public Market', media: [],
        calledResponders: [
            { name: 'City Engineering Dept', unit: 'Engineering', role: 'Structural Assessment', phone: '(02) 8643-2222', distance: '0.9 km away' },
            { name: 'Brgy. Hall Emergency Desk', unit: 'Barangay', role: 'Barangay Response Unit', phone: '+63 927 111 2222', distance: '0.3 km away' }
        ],
        assignedVolunteers: [
            { name: 'Engr. Mario Bautista', initials: 'MB', status: 'Resolved', distance: '0.5 km away', color: 'var(--text3)' }
        ],
        fieldNotes: 'Assessment complete. Cracks are superficial, no structural compromise. Routine check scheduled in 2 weeks.'
    },
    {
        id: 'INC-2026-010', title: 'Chemical Gas Leak — Brgy. Kapasigan', status: 'Ongoing', severity: 'Critical',
        location: 'Kapasigan Residential Block', barangay: 'Kapasigan',
        description: 'Strong chemical odor reported by multiple residents. Possible industrial gas leak from nearby facility. Evacuation of immediate radius in progress. HAZMAT team requested.',
        reporter: 'Brgy. Captain V. Reyes', contact: '+63 928 333 4444', source: 'Official Field Report',
        type: 'Gas Leak', createdAt: '2026-05-15, 11:30 AM',
        needs: ['HAZMAT Unit', 'Medical Standby', 'Evacuation Support'],
        reportingFor: 'Residential Area',
        media: [],
        calledResponders: [
            { name: 'BFP HAZMAT Unit', unit: 'Fire', role: 'Chemical Containment', phone: '(02) 8643-0000', distance: '1.2 km away' },
            { name: 'Pasig City Health Dept', unit: 'Medical', role: 'Health Assessment', phone: '(02) 8643-1111', distance: '0.8 km away' }
        ],
        acceptedVolunteers: [
            { name: 'Volunteer Juan Dela Cruz', initials: 'JD', status: 'On-Scene', distance: '0.2 km away', color: 'var(--success)' }
        ],
        responderResponses: {
            'BFP HAZMAT Unit': 'Accepted',
            'Pasig City Health Dept': 'Accepted'
        },
        fieldNotes: 'Source identified as a corroded valve in a private storage unit. Containment in progress. No respiratory distress reported yet.'
    },
    {
        id: 'INC-2026-011', title: 'Structural Collapse — Santolan Center', status: 'Dispatched', severity: 'High',
        location: 'Santolan Multi-Purpose Center', barangay: 'Santolan',
        description: 'Partial ceiling collapse in the main hall. Three individuals trapped under light debris. Structure instability suspected. Requesting engineering assessment.',
        reporter: 'Center Supervisor', contact: '+63 919 555 6666', source: 'Mobile App',
        type: 'Structural Damage', createdAt: '2026-05-15, 12:15 PM',
        needs: ['Engineering Assessor', 'Search & Rescue', 'Ambulance'],
        reportingFor: 'Public Facility',
        media: [],
        calledResponders: [
            { name: 'City Engineering Dept', unit: 'Engineering', role: 'Stability Assessment', phone: '(02) 8643-2222', distance: '2.1 km away' },
            { name: 'Pasig Search & Rescue', unit: 'Rescue', role: 'Extrication Team', phone: '(02) 8643-0000', distance: '1.5 km away' }
        ],
        acceptedVolunteers: [
            { name: 'Volunteer Maria Santos', initials: 'MS', status: 'On-Scene', distance: '0.1 km away', color: 'var(--success)' },
            { name: 'Volunteer Roberto Tan', initials: 'RT', status: 'On-Scene', distance: '0.2 km away', color: 'var(--success)' }
        ],
        responderResponses: {
            'City Engineering Dept': 'Accepted',
            'Pasig Search & Rescue': 'Accepted'
        },
        fieldNotes: 'All trapped individuals extricated with minor injuries. Engineering team declared the main hall off-limits until further notice.'
    },
    {
        id: 'INC-2026-012', title: 'Civil Disturbance — Brgy. Kapitolyo', status: 'Reported', severity: 'Medium',
        location: 'Kapitolyo Public Market', barangay: 'Kapitolyo',
        description: 'Reported heated dispute between stall owners and customers. Crowd gathering. Requesting police mediation to prevent escalation.',
        reporter: 'Market Security', contact: '+63 920 777 8888', source: 'Mobile App',
        type: 'Civil Disturbance', createdAt: '2026-05-15, 01:30 PM',
        needs: ['Police'],
        reportingFor: 'Public Market',
        media: [],
        calledResponders: [],
        fieldNotes: 'Awaiting dispatcher acknowledgement.'
    },
    {
        id: 'INC-2026-013', title: 'Missing Person — Brgy. Bagong Ilog', status: 'Reported', severity: 'Medium',
        location: 'Sitio Pag-asa', barangay: 'Bagong Ilog',
        description: 'Elderly male, 72 years old, reported missing since 08:00 AM. Last seen wearing a blue shirt and khaki shorts. Family requesting assistance.',
        reporter: 'Elena Dela Cruz', contact: '+63 917 444 5555', source: 'Phone Report',
        type: 'Missing Person', createdAt: '2026-05-15, 02:05 PM',
        needs: ['Police', 'Search Team'],
        reportingFor: 'Residential Area',
        media: [],
        calledResponders: [],
        fieldNotes: 'Initial search by family yielded no results. Requesting official broadcast.'
    }
];


const DEFAULT_AUDIT = [
    {
        id: 'LOG-004',
        timestamp: '2026-05-15, 10:48 AM',
        admin: 'Cmdr. Reyes',
        action: 'Status Update',
        target: 'INC-2026-005',
        detail: 'Requested transport units for Santolan center transfer',
        ip: '192.168.1.45'
    },
    {
        id: 'LOG-001',
        timestamp: '2026-05-15, 10:10 AM',
        admin: 'Cmdr. Reyes',
        action: 'Dispatch',
        target: 'INC-2026-003',
        detail: 'Dispatched PASIG-AMB-02 to Rosario collision site',
        ip: '192.168.1.45'
    },
    {
        id: 'LOG-002',
        timestamp: '2026-05-15, 09:50 AM',
        admin: 'Cmdr. Reyes',
        action: 'Acknowledged',
        target: 'INC-2026-002',
        detail: 'Flood report in Pinagbuhatan acknowledged; monitoring water levels',
        ip: '192.168.1.45'
    },
    {
        id: 'LOG-003',
        timestamp: '2026-05-15, 08:30 AM',
        admin: 'System',
        action: 'Broadcast',
        target: 'Manggahan Zone',
        detail: 'Emergency Alert: Fire at Industrial Area. Stay clear.',
        ip: '127.0.0.1'
    }
];


const DEFAULT_INVENTORY = {
    'Food Packs': 12500,
    'Medical Supplies': 850,
    'Water Supply': 4200,
    'Hygiene Kits': 1200
};


const DEFAULT_AIDED = [
    {
        id: 'AID-001',
        title: 'Evacuation Center: Rizal High School',
        desc: 'Requesting 500 Food Packs and 200 Hygiene Kits for new arrivals.',
        zone: 'Caniogan',
        unit: 'PASIG-RESCUE-01',
        timestamp: '2026-05-15, 09:15 AM'
    },
    {
        id: 'AID-002',
        title: 'Barangay Hall: Manggahan',
        desc: 'Urgent need for 150 bottled water cases and 50 blankets.',
        zone: 'Manggahan',
        unit: 'BRGY-MANGGAHAN-RRT',
        timestamp: '2026-05-15, 08:30 AM'
    },
    {
        id: 'AID-003',
        title: 'Santolan Elementary School',
        desc: 'Medical supplies required: first aid kits, paracetamol, and bandages.',
        zone: 'Santolan',
        unit: 'PASIG-MED-04',
        timestamp: '2026-05-15, 07:45 AM'
    },
    {
        id: 'AID-004',
        title: 'Rosario Covered Court',
        desc: 'Requesting 300 hot meals and portable generator fuel.',
        zone: 'Rosario',
        unit: 'PASIG-RESCUE-03',
        timestamp: '2026-05-15, 07:00 AM'
    },
    {
        id: 'AID-005',
        title: 'Pinagbuhatan High School',
        desc: 'Need 100 sleeping mats, 200 food packs, and 5 tents.',
        zone: 'Pinagbuhatan',
        unit: 'PASIG-RESCUE-02',
        timestamp: '2026-05-14, 11:20 PM'
    }
];

const DEFAULT_RELIEF_REQUESTS = [
    {
        id: 'REQ-20260515-001',
        center: 'Nagpayong Elementary School EC',
        location: 'Barangay Pinagbuhatan, Pasig City',
        type: 'Food Packs',
        families: '450',
        urgency: 'Critical',
        notes: 'Dinner stock will run short by 6:00 PM. Priority families include seniors, children, and pregnant evacuees from creekside areas.',
        status: 'Pending',
        submittedAt: '5/15/2026, 06:45:00 AM',
        lastComment: ''
    },
    {
        id: 'REQ-20260515-002',
        center: 'Rizal High School EC',
        location: 'Barangay Caniogan, Pasig City',
        type: 'Water Supply',
        families: '620',
        urgency: 'High',
        notes: 'Potable water is below a half-day requirement after new arrivals. Need tanker refill before lunch service.',
        status: 'Pending',
        submittedAt: '5/15/2026, 07:05:00 AM',
        lastComment: ''
    },
    {
        id: 'REQ-20260515-003',
        center: 'Santolan Covered Court EC',
        location: 'Barangay Santolan, Pasig City',
        type: 'Medical Supplies',
        families: '160',
        urgency: 'High',
        notes: 'Clinic table is running low on gauze, alcohol, oral rehydration salts, and paracetamol.',
        status: 'Pending',
        submittedAt: '5/15/2026, 08:25:00 AM',
        lastComment: ''
    },
    {
        id: 'REQ-20260515-004',
        center: 'Buting Elementary School EC',
        location: 'Barangay Buting, Pasig City',
        type: 'Hygiene Kits',
        families: '210',
        urgency: 'Medium',
        notes: 'Comfort room area needs soap, sanitary pads, toothbrushes, and pails for newly registered families.',
        status: 'Pending',
        submittedAt: '5/15/2026, 08:00:00 AM',
        lastComment: ''
    },
    {
        id: 'REQ-20260515-005',
        center: 'Pinagbuhatan High School EC',
        location: 'Barangay Pinagbuhatan, Pasig City',
        type: 'Rice Sacks',
        families: '500',
        urgency: 'Critical',
        notes: 'Approved for central kitchen support serving high-density evacuation rooms.',
        status: 'For Pick-Up',
        submittedAt: '5/15/2026, 07:25:00 AM',
        updatedAt: '5/15/2026, 08:10:00 AM',
        lastComment: 'Approved. Cargo Truck 04 assigned from central warehouse.'
    },
    {
        id: 'REQ-20260515-006',
        center: 'Eusebio High School EC',
        location: 'Barangay Rosario, Pasig City',
        type: 'Medical Supplies',
        families: '220',
        urgency: 'Medium',
        notes: 'Approved for clinic replenishment after morning assessment by the medical desk.',
        status: 'For Pick-Up',
        submittedAt: '5/15/2026, 07:15:00 AM',
        updatedAt: '5/15/2026, 08:00:00 AM',
        lastComment: 'Medical Team Alpha assigned to prepare boxes for release.'
    },
    {
        id: 'REQ-20260515-007',
        center: 'Pasig Elementary School EC',
        location: 'Barangay San Nicolas, Pasig City',
        type: 'Food Packs',
        families: '210',
        urgency: 'High',
        notes: 'Completed morning distribution for evacuees from nearby low-lying streets.',
        status: 'Request Done',
        submittedAt: '5/15/2026, 05:40:00 AM',
        updatedAt: '5/15/2026, 06:50:00 AM',
        lastComment: 'Delivered and signed by center admin.'
    },
    {
        id: 'REQ-20260515-008',
        center: 'Sagad High School EC',
        location: 'Barangay Sagad, Pasig City',
        type: 'Water Supply',
        families: '140',
        urgency: 'Medium',
        notes: 'Completed potable water refill before breakfast distribution.',
        status: 'Request Done',
        submittedAt: '5/15/2026, 05:55:00 AM',
        updatedAt: '5/15/2026, 07:05:00 AM',
        lastComment: 'Water Team 01 completed delivery.'
    }
];

const DEFAULT_VOLUNTEERS = [
    { name: 'Rafael Mendoza', role: 'Rescue', initials: 'RM', color: '#EF4444', status: 'Active', loc: 'Nagpayong Elementary School EC' },
    { name: 'Beatrice Cruz', role: 'Medical', initials: 'BC', color: '#3B82F6', status: 'Active', loc: 'Rizal High School EC' },
    { name: 'Mateo Santos', role: 'Logistics', initials: 'MS', color: '#F59E0B', status: 'Busy', loc: 'Pasig Command Center Warehouse' },
    { name: 'Paolo Reyes', role: 'Rescue', initials: 'PR', color: '#22C55E', status: 'Active', loc: 'Santolan Covered Court EC' },
    { name: 'Elena Dimaculangan', role: 'Comms', initials: 'ED', color: '#8B5CF6', status: 'Active', loc: 'Pasig Command Center' },
    { name: 'Ricardo Dalisay', role: 'Driver', initials: 'RD', color: '#64748B', status: 'Busy', loc: 'C. Raymundo Avenue, Maybunga' },
    { name: 'Marian Salonga', role: 'Medical', initials: 'MS', color: '#14B8A6', status: 'Active', loc: 'Manggahan High School EC' },
    { name: 'Jomar Dela Cruz', role: 'Logistics', initials: 'JC', color: '#F43F5E', status: 'Busy', loc: 'Buting Elementary School EC' }
];

const DEFAULT_USER_SESSION = {
    name: 'Juan Dela Cruz',
    phone: '0917-555-1234',
    barangay: 'Ugong',
    medical: {
        bloodType: 'O+',
        allergies: 'None declared',
        conditions: 'Asthma'
    },
    emergencyContact: {
        name: 'Maria Dela Cruz',
        phone: '0917-555-5678'
    }
};

function hasUsableStoredData(key, expectedType) {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
        const parsed = JSON.parse(raw);
        if (expectedType === 'array') return Array.isArray(parsed) && parsed.length > 0;
        if (expectedType === 'object') return parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0;
        return true;
    } catch (e) {
        return false;
    }
}

function seedStorage(key, data, expectedType) {
    if (!hasUsableStoredData(key, expectedType)) {
        localStorage.setItem(key, JSON.stringify(data));
    }
}

function normalizeIncidentRecord(incident, index = 0) {
    const fallback = DEFAULT_INCIDENTS[index % DEFAULT_INCIDENTS.length] || {};
    const type = firstValue(incident.type, fallback.type, 'Emergency Report');
    const barangay = firstValue(incident.barangay, fallback.barangay, 'Pasig');
    const title = firstValue(incident.title, fallback.title, `${type} — ${barangay}`);
    const location = firstValue(incident.location, incident.address, incident.fullAddress, incident.landmark, fallback.location, barangay);

    return {
        ...fallback,
        ...incident,
        id: firstValue(incident.id, fallback.id, `INC-${Date.now()}-${index + 1}`),
        title,
        type,
        barangay,
        location,
        status: firstValue(incident.status, fallback.status, 'Reported'),
        severity: firstValue(incident.severity, incident.priority, fallback.severity, 'Medium'),
        description: firstValue(incident.description, incident.details, incident.message, fallback.description, 'No description provided.'),
        reporter: firstValue(incident.reporter, incident.reporterName, incident.name, fallback.reporter, 'Field Report'),
        contact: firstValue(incident.contact, incident.phone, incident.mobile, fallback.contact, 'No contact provided'),
        source: firstValue(incident.source, fallback.source, 'Mobile App'),
        createdAt: firstValue(incident.createdAt, incident.submittedAt, incident.time, incident.reportedAt, fallback.createdAt, new Date().toLocaleString('en-PH')),
        needs: getIncidentNeeds(incident).length ? getIncidentNeeds(incident) : normalizeList(fallback.needs),
        reportingFor: firstValue(incident.reportingFor, incident.reportFor, fallback.reportingFor, 'Not provided'),
        media: getIncidentMedia(incident).length ? getIncidentMedia(incident) : normalizeList(fallback.media)
    };
}

function repairIncidentStorage() {
    let incidents;
    try {
        incidents = JSON.parse(localStorage.getItem('ligtas_incidents') || '[]');
    } catch (e) {
        incidents = [];
    }

    if (!Array.isArray(incidents) || incidents.length === 0) {
        localStorage.setItem('ligtas_incidents', JSON.stringify(DEFAULT_INCIDENTS));
        return;
    }

    const repaired = incidents.map((incident, index) => normalizeIncidentRecord(incident || {}, index));
    localStorage.setItem('ligtas_incidents', JSON.stringify(repaired));
}


const applyLigtasConfig = () => {
    // FORCE RESET FOR DATA CONSISTENCY (One-time migration to high-fidelity dummy data)
    const CURRENT_VERSION = '2026.05.15.v16';

    const savedVersion = localStorage.getItem('ligtas_data_version');
    if (savedVersion !== CURRENT_VERSION) {
        // Clear specific dummy data keys to allow fresh seeding
        const keysToReset = ['ligtas_incidents', 'ligtas_audit', 'ligtas_inventory', 'ligtas_aided_requests', 'ligtas_audit_logs', 'ligtas_sos_queue', 'ligtas_relief_requests', 'ligtas_volunteers'];
        keysToReset.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('ligtas_data_version', CURRENT_VERSION);
        console.log("LIGTAS: Dummy data reset to latest version (" + CURRENT_VERSION + ")");
    }

    const DEFAULT_SOS = [
        { 
            name: 'Roberto Garcia', 
            location: 'Manggahan Industrial Perimeter', 
            coords: '14.5958° N, 121.0827° E', 
            timestamp: Date.now(),
            phone: '+63 917 123 4567',
            bloodType: 'O+',
            medical: 'Asthma',
            emergencyContact: 'Maria Garcia (Wife) - +63 917 765 4321'
        },
        { 
            name: 'Leo Santos', 
            location: 'Manggahan Industrial Perimeter', 
            coords: '14.5959° N, 121.0826° E', 
            timestamp: Date.now() - 15000, 
            phone: '+63 918 234 5678',
            bloodType: 'A-',
            medical: 'None',
            emergencyContact: 'Elena Santos (Sister) - +63 918 876 5432'
        },
        { 
            name: 'Sgt. Mendoza', 
            location: 'Pinagbuhatan Riverside', 
            coords: '14.5583° N, 121.0917° E', 
            timestamp: Date.now() - 300000,
            phone: '+63 919 345 6789',
            bloodType: 'B+',
            medical: 'Hypertension',
            emergencyContact: 'Liza Mendoza (Daughter) - +63 919 987 6543'
        }
    ];

    // Seed defaults if empty
    seedStorage('ligtas_sos_queue', DEFAULT_SOS, 'array');


    // Seed defaults if empty
    seedStorage('ligtas_zones', DEFAULT_ZONES, 'object');
    seedStorage('ligtas_units', DEFAULT_UNITS, 'array');
    seedStorage('ligtas_inventory', DEFAULT_INVENTORY, 'object');
    seedStorage('ligtas_aided_requests', DEFAULT_AIDED, 'array');
    seedStorage('ligtas_relief_requests', DEFAULT_RELIEF_REQUESTS, 'array');
    seedStorage('ligtas_volunteers', DEFAULT_VOLUNTEERS, 'array');
    seedStorage('ligtas_incidents', DEFAULT_INCIDENTS, 'array');
    repairIncidentStorage();
    seedStorage('ligtas_audit', DEFAULT_AUDIT, 'array');
    seedStorage('ligtas_audit_logs', DEFAULT_AUDIT, 'array');
    seedStorage('ligtas_user_session', DEFAULT_USER_SESSION, 'object');

    if (!localStorage.getItem('ligtas_role')) localStorage.setItem('ligtas_role', 'super_admin');
    if (!localStorage.getItem('ligtas_user')) localStorage.setItem('ligtas_user', 'Cmdr. Reyes');

    if (!localStorage.getItem('ligtas_config')) {
        localStorage.setItem('ligtas_config', JSON.stringify({
            sysName: 'LIGTAS',
            orgName: 'Pasig City DRRMO',
            critThreshold: 90,
            warnThreshold: 70,
            categories: DEFAULT_CATEGORIES
        }));
    }

    const saved = localStorage.getItem('ligtas_config');
    const savedZones = localStorage.getItem('ligtas_zones');
    const savedUnits = localStorage.getItem('ligtas_units');

    try {
        const config = JSON.parse(saved);
        const zones = JSON.parse(savedZones);
        const units = JSON.parse(savedUnits);

        // 1. Update System Name
        if (config.sysName) {
            document.querySelectorAll('.sidebar-logo span:not(.version)').forEach(el => el.textContent = config.sysName);
            const topTitle = document.querySelector('.topbar h1');
            if (topTitle && (topTitle.textContent === 'LIGTAS' || topTitle.textContent === 'Dashboard Overview')) {
                topTitle.textContent = config.sysName + ' Command Center';
            }
        }

        // 2. Populate Categories
        if (config.categories) {
            const incSelects = document.querySelectorAll('select[id*="inc-type"], select[id*="inc-cats"]');
            incSelects.forEach(sel => {
                const currentVal = sel.value;
                const firstOpt = sel.options[0];
                const hasPrompt = firstOpt && (firstOpt.value === "" || firstOpt.text.includes("Select"));
                sel.innerHTML = '';
                if (hasPrompt) sel.appendChild(firstOpt);

                const groups = {};
                config.categories.forEach(c => {
                    if (!groups[c.group]) groups[c.group] = [];
                    groups[c.group].push(c.name);
                });

                Object.keys(groups).forEach(g => {
                    const og = document.createElement('optgroup');
                    og.label = g;
                    groups[g].forEach(item => {
                        const opt = document.createElement('option');
                        opt.value = item;
                        opt.textContent = item;
                        og.appendChild(opt);
                    });
                    sel.appendChild(og);
                });
                if (currentVal) sel.value = currentVal;
            });
        }

        // 3. Populate Zones
        if (zones) {
            const locSelects = document.querySelectorAll('select[id*="inc-loc"], select[id*="dest"], select[id*="zone"], select[id*="barangay"]');
            locSelects.forEach(sel => {
                const currentVal = sel.value;
                const firstOpt = sel.options[0];
                const hasPrompt = firstOpt && (firstOpt.value === "" || firstOpt.text.includes("Select"));
                sel.innerHTML = '';
                if (hasPrompt) sel.appendChild(firstOpt);

                Object.keys(zones).forEach(name => {
                    if (name === 'all') return;
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    sel.appendChild(opt);
                });
                if (currentVal) sel.value = currentVal;
            });
        }

        // 4. Populate Units
        if (units) {
            const unitSelects = document.querySelectorAll('select[id*="unit"], select[id*="dispatch"]');
            unitSelects.forEach(sel => {
                const firstOpt = sel.options[0];
                const hasPrompt = firstOpt && (firstOpt.value === "" || firstOpt.text.includes("Select"));
                sel.innerHTML = '';
                if (hasPrompt) sel.appendChild(firstOpt);

                units.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.name;
                    opt.textContent = u.name;
                    sel.appendChild(opt);
                });
            });
        }

    } catch (e) {
        console.error("LIGTAS Config Error:", e);
    }
};

// Auto-run
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLigtasConfig);
} else {
    applyLigtasConfig();
}
