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
const DEFAULT_ZONES = {};


const DEFAULT_UNITS = [];


const DEFAULT_CATEGORIES = [];


const DEFAULT_INCIDENTS = [];


const DEFAULT_AUDIT = [];


const DEFAULT_INVENTORY = {};


const DEFAULT_AIDED = [];


const applyLigtasConfig = () => {
    // FORCE RESET FOR DATA CONSISTENCY (One-time migration to high-fidelity dummy data)
    const CURRENT_VERSION = '2026.05.15.v2';

    const savedVersion = localStorage.getItem('ligtas_data_version');
    if (savedVersion !== CURRENT_VERSION) {
        // Clear specific dummy data keys to allow fresh seeding
        const keysToReset = ['ligtas_incidents', 'ligtas_audit', 'ligtas_inventory', 'ligtas_aided_requests', 'ligtas_audit_logs'];
        keysToReset.forEach(k => localStorage.removeItem(k));
        localStorage.setItem('ligtas_data_version', CURRENT_VERSION);
        console.log("LIGTAS: Dummy data reset to latest version (" + CURRENT_VERSION + ")");
    }

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
