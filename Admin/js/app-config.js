// DEFAULT DATA SEEDING
const DEFAULT_ZONES = {
    'all': 811800,
    'Bagong Ilog': 18200, 'Bagong Katipunan': 1200, 'Bambang': 22000,
    'Buting': 11500, 'Caniogan': 31000, 'Dela Paz': 15400,
    'Kalawaan': 32100, 'Kapasigan': 6700, 'Kapitolyo': 14300,
    'Malinao': 5900, 'Manggahan': 94000, 'Maybunga': 45200,
    'Oranbo': 4500, 'Palatiw': 22800, 'Pinagbuhatan': 151000,
    'Pineda': 18900, 'Rosario': 68000, 'Sagad': 8400,
    'San Antonio': 16500, 'San Joaquin': 15600, 'San Jose': 2300,
    'San Miguel': 33000, 'San Nicolas': 1800, 'Santa Cruz': 6400,
    'Santa Lucia': 46200, 'Santa Rosa': 1700, 'Santolan': 52100,
    'Santo Tomas': 40300, 'Sumilang': 5600, 'Ugong': 28500
};

const DEFAULT_UNITS = [
    { name: 'Fire Truck', type: 'FIRE' },
    { name: 'Ambulance', type: 'MED' },
    { name: 'Police', type: 'SECURITY' },
    { name: 'Food & Water', type: 'RELIEF' },
    { name: 'Shelter', type: 'RELIEF' }
];

const DEFAULT_CATEGORIES = [
    { name: 'Fire', group: 'Technological' },
    { name: 'Flood', group: 'Hydrological' },
    { name: 'Earthquake', group: 'Geological' },
    { name: 'Accident', group: 'Medical/Health' },
    { name: 'Medical', group: 'Medical/Health' },
    { name: 'Neighbor', group: 'Security/Social' },
    { name: 'Crime', group: 'Security/Social' },
    { name: 'Other', group: 'General' }
];

const applyLigtasConfig = () => {
    // Seed defaults if empty
    if (!localStorage.getItem('ligtas_zones')) localStorage.setItem('ligtas_zones', JSON.stringify(DEFAULT_ZONES));
    if (!localStorage.getItem('ligtas_units')) localStorage.setItem('ligtas_units', JSON.stringify(DEFAULT_UNITS));
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
