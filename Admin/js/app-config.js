// CORE UTILITIES (Global)
const firstValue = (...vals) => {
    for (const v of vals) {
        if (v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim().toLowerCase() !== 'undefined') return v;
    }
    return vals[vals.length - 1];
};

const normalizeList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(/,|\n|\|/).map(s => s.trim()).filter(Boolean);
    return [];
};

const escapeHTML = (str) => {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
};

const getIncidentLocation = (inc) => {
    const raw = firstValue(inc.location, inc.barangay, inc.address, inc.fullAddress, inc.landmark, inc.reportLocation, inc.latlng, 'Unknown location');
    const text = String(raw).trim();
    if (text === 'Unknown location' || /pasig/i.test(text)) return text;
    return `${text}, Pasig City`;
};

const getIncidentNeeds = (inc) => {
    return normalizeList(firstValue(
        inc.needs, inc.requiredAssistance, inc.assistanceNeeded, inc.resourcesNeeded, inc.unitsNeeded, inc.responseUnits, inc.assistance, inc.requirements
    ));
};

const getIncidentMedia = (inc) => {
    return normalizeList(firstValue(
        inc.media, inc.attachments, inc.photos, inc.images, inc.photoUrls, inc.photoUrl, inc.imageUrl
    )).filter(Boolean);
};

const severityTone = (severity) => {
    if (!severity) return 'default';
    const s = String(severity).toLowerCase();
    if (s.includes('critical')) return 'critical';
    if (s.includes('high') || s.includes('urgent')) return 'warning';
    if (s.includes('medium') || s.includes('stable')) return 'nominal';
    if (s.includes('low') || s.includes('info')) return 'success';
    return 'default';
};

const sourceTone = (source) => {
    if (!source) return 'badge';
    const s = String(source).toLowerCase();
    if (s.includes('admin') || s.includes('official')) return 'badge critical';
    if (s.includes('field') || s.includes('verify')) return 'badge warning';
    if (s.includes('mobile') || s.includes('app')) return 'badge nominal';
    return 'badge';
};

const getCallableNumber = (phone) => {
    if (!phone) return '';
    return String(phone).replace(/[^\d+]/g, '');
};

const renderCallButton = (label, phone, type = 'primary') => {
    if (!phone) return `<button class="btn btn-ghost" disabled style="opacity:0.55;cursor:not-allowed;">No phone number</button>`;
    const btnClass = type === 'ghost' ? 'btn-ghost' : 'btn-primary';
    return `<a href="tel:${phone}" class="btn ${btnClass}" style="text-decoration:none;font-size:11px;padding:6px 10px;" onclick="event.stopPropagation()">☎ ${label}</a>`;
};

const renderInfoBadge = (text, type = 'default') => {
    const colors = {
        'critical': 'background:rgba(239,68,68,0.1);color:var(--critical);border-color:rgba(239,68,68,0.2)',
        'warning': 'background:rgba(245,158,11,0.1);color:var(--warning);border-color:rgba(245,158,11,0.2)',
        'nominal': 'background:rgba(59,130,246,0.1);color:var(--primary);border-color:rgba(59,130,246,0.2)',
        'success': 'background:rgba(34,197,94,0.1);color:var(--success);border-color:rgba(34,197,94,0.2)',
        'default': 'background:var(--bg3);color:var(--text3);border-color:var(--border)'
    };
    return `<span class="badge" style="${colors[type] || colors.default}">${escapeHTML(text)}</span>`;
};

const setText = (id, value, fallback = '—') => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || fallback;
};

const getIncidents = () => JSON.parse(localStorage.getItem('ligtas_incidents') || '[]');
const saveIncidents = (arr) => localStorage.setItem('ligtas_incidents', JSON.stringify(arr));

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
        id: 'INC-2026-001',
        title: 'Industrial Structure Fire — Brgy. Manggahan',
        status: 'Ongoing',
        severity: 'Critical',
        location: 'Amang Rodriguez Ave, Manggahan',
        barangay: 'Manggahan',
        description: 'Large scale fire at a warehouse facility. Multiple units responding. Low visibility due to heavy smoke. Evacuation of immediate perimeter in progress.',
        reporter: 'Sgt. Antonio Luna',
        contact: '+63 917 123 4567',
        source: 'Official Field Report',
        type: 'Structure Fire',
        createdAt: '2026-05-15, 08:12 AM',
        needs: ['Fire Suppression', 'Medical Standby', 'Evacuation'],
        reportingFor: 'Industrial Area',
        media: ['https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=400']
    },
    {
        id: 'INC-2026-002',
        title: 'Severe Street Flooding — Brgy. Pinagbuhatan',
        status: 'Dispatched',
        severity: 'Urgent',
        location: 'Urbano Velasco Ave',
        barangay: 'Pinagbuhatan',
        description: 'Water level reached knee-high. Residents in low-lying areas requesting assistance with moving belongings. No casualties reported yet.',
        reporter: 'Maria Clara',
        contact: '+63 918 987 6543',
        source: 'Mobile App',
        type: 'Flash Flood',
        createdAt: '2026-05-15, 09:45 AM',
        needs: ['Rescue Boat', 'Pumping Unit'],
        reportingFor: 'Residential Area'
    },
    {
        id: 'INC-2026-003',
        title: 'Multi-Vehicle Collision — Ortigas Ave Extension',
        status: 'Acknowledged',
        severity: 'High',
        location: 'Near Rosario Bridge, Brgy. Rosario',
        barangay: 'Rosario',
        description: 'Three-car pileup causing major traffic congestion. At least 2 persons with minor injuries. PNP and Traffic Management on site.',
        reporter: 'Ricardo Dalisay',
        contact: '+63 920 555 1212',
        source: 'Verified Field Report',
        type: 'Road Accident',
        createdAt: '2026-05-15, 10:05 AM',
        needs: ['Ambulance', 'Towing Service'],
        reportingFor: 'Public Road'
    },
    {
        id: 'INC-2026-004',
        title: 'Security: Civil Disturbance — Brgy. San Antonio',
        status: 'Reported',
        severity: 'High',
        location: 'Emerald Ave, Ortigas Center',
        barangay: 'San Antonio',
        description: 'Unsanctioned protest gathering near financial buildings. Requesting police presence for crowd management and traffic rerouting.',
        reporter: 'Admin Security',
        contact: '+63 916 333 4444',
        source: 'CCTV Monitoring',
        type: 'Civil Disturbance',
        createdAt: '2026-05-15, 10:30 AM',
        needs: ['Police Assistance'],
        reportingFor: 'Business District'
    },
    {
        id: 'INC-2026-005',
        title: 'Logistics: Center Overflow — Brgy. Santolan',
        status: 'Reported',
        severity: 'Medium',
        location: 'Santolan Elementary School',
        barangay: 'Santolan',
        description: 'Evacuation center reached 90% capacity. Requesting immediate transfer plan for incoming residents from low-lying zones.',
        reporter: 'Officer Benitez',
        contact: '+63 908 777 8888',
        source: 'Center Manager Report',
        type: 'Center Overflow',
        createdAt: '2026-05-15, 10:45 AM',
        needs: ['Transportation', 'Shelter Assessment'],
        reportingFor: 'Evacuation Center'
    },
    {
        id: 'INC-2026-006',
        title: 'Medical: Respiratory Distress — Brgy. Kapitolyo',
        status: 'Resolved',
        severity: 'Medium',
        location: '12 Pioneer St, Kapitolyo',
        barangay: 'Kapitolyo',
        description: '72-year-old male experiencing difficulty breathing. PASIG-AMB-01 responded. Patient stabilized and transported to Medical City.',
        reporter: 'Elena Gomez',
        contact: '+63 915 444 3322',
        source: 'Mobile App',
        type: 'Medical Emergency',
        createdAt: '2026-05-15, 07:30 AM',
        needs: ['Oxygen Support'],
        reportingFor: 'Private Residence'
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


const applyLigtasConfig = () => {
    // FORCE RESET FOR DATA CONSISTENCY (One-time migration to high-fidelity dummy data)
    const CURRENT_VERSION = '2026.05.15.v7';


    const savedVersion = localStorage.getItem('ligtas_data_version');
    if (savedVersion !== CURRENT_VERSION) {
        // Clear specific dummy data keys to allow fresh seeding
        const keysToReset = ['ligtas_incidents', 'ligtas_audit', 'ligtas_inventory', 'ligtas_aided_requests', 'ligtas_audit_logs', 'ligtas_sos_queue'];
        keysToReset.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('ligtas_data_version', CURRENT_VERSION);
        console.log("LIGTAS: Dummy data reset to latest version (" + CURRENT_VERSION + ")");
    }

    const DEFAULT_SOS = [
        {
            name: 'Roberto Garcia',
            location: 'Manggahan Industrial Perimeter',
            coords: '14.5958° N, 121.0827° E',
            timestamp: Date.now()
        },
        {
            name: 'Sgt. Mendoza',
            location: 'Pinagbuhatan Riverside',
            coords: '14.5583° N, 121.0917° E',
            timestamp: Date.now() - 300000
        }
    ];

    // Seed defaults if empty
    if (!localStorage.getItem('ligtas_sos_queue')) localStorage.setItem('ligtas_sos_queue', JSON.stringify(DEFAULT_SOS));


    // Seed defaults if empty
    if (!localStorage.getItem('ligtas_zones')) localStorage.setItem('ligtas_zones', JSON.stringify(DEFAULT_ZONES));
    if (!localStorage.getItem('ligtas_units')) localStorage.setItem('ligtas_units', JSON.stringify(DEFAULT_UNITS));
    if (!localStorage.getItem('ligtas_inventory')) localStorage.setItem('ligtas_inventory', JSON.stringify(DEFAULT_INVENTORY));
    if (!localStorage.getItem('ligtas_aided_requests')) localStorage.setItem('ligtas_aided_requests', JSON.stringify(DEFAULT_AIDED));
    
    if (!localStorage.getItem('ligtas_incidents') || JSON.parse(localStorage.getItem('ligtas_incidents')).length === 0) {
        localStorage.setItem('ligtas_incidents', JSON.stringify(DEFAULT_INCIDENTS));
    }
    
    if (!localStorage.getItem('ligtas_audit') || JSON.parse(localStorage.getItem('ligtas_audit')).length === 0) {
        localStorage.setItem('ligtas_audit', JSON.stringify(DEFAULT_AUDIT));
    }

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
