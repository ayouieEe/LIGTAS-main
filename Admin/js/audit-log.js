// ============================================================
// LIGTAS — Centralized Audit Log & Shared Utilities
// ============================================================

// ── Pasig City Barangay Data ──────────────────────────────
const PASIG_BARANGAYS = {
  district1: [
    'Bagong Ilog', 'Bagong Katipunan', 'Bambang', 'Buting', 'Caniogan',
    'Kalawaan', 'Kapasigan', 'Kapitolyo', 'Malinao', 'Oranbo',
    'Palatiw', 'Pineda', 'Sagad', 'San Antonio', 'San Joaquin'
  ],
  district2: [
    'Dela Paz', 'Manggahan', 'Maybunga', 'Pinagbuhatan', 'Rosario',
    'San Jose', 'San Miguel', 'San Nicolas', 'Santa Cruz', 'Santa Lucia',
    'Santa Rosa', 'Santo Tomas', 'Santolan', 'Sumilang', 'Ugong'
  ]
};

const ALL_BARANGAYS = [...PASIG_BARANGAYS.district1, ...PASIG_BARANGAYS.district2];

// ── Rescue Team Adjacency Map ─────────────────────────────
const BARANGAY_ADJACENCY = {
  'Bagong Ilog': ['Kapasigan', 'Buting', 'Kalawaan'],
  'Bagong Katipunan': ['Kapasigan', 'Bambang', 'Caniogan'],
  'Bambang': ['Bagong Katipunan', 'Caniogan', 'Malinao'],
  'Buting': ['Bagong Ilog', 'Kalawaan', 'San Joaquin'],
  'Caniogan': ['Bambang', 'Bagong Katipunan', 'Oranbo'],
  'Kalawaan': ['Bagong Ilog', 'Buting', 'Pineda'],
  'Kapasigan': ['Bagong Ilog', 'Bagong Katipunan', 'Oranbo'],
  'Kapitolyo': ['Oranbo', 'Malinao', 'San Antonio'],
  'Malinao': ['Bambang', 'Kapitolyo', 'Caniogan'],
  'Oranbo': ['Kapasigan', 'Kapitolyo', 'Caniogan'],
  'Palatiw': ['San Antonio', 'Pineda', 'Sagad'],
  'Pineda': ['Kalawaan', 'Palatiw', 'San Joaquin'],
  'Sagad': ['Palatiw', 'San Antonio', 'San Joaquin'],
  'San Antonio': ['Kapitolyo', 'Palatiw', 'Sagad'],
  'San Joaquin': ['Buting', 'Pineda', 'Sagad'],
  'Dela Paz': ['Manggahan', 'Santolan', 'Rosario'],
  'Manggahan': ['Dela Paz', 'Pinagbuhatan', 'Rosario'],
  'Maybunga': ['Pinagbuhatan', 'Santolan', 'Santa Lucia'],
  'Pinagbuhatan': ['Manggahan', 'Maybunga', 'Rosario'],
  'Rosario': ['Dela Paz', 'Manggahan', 'Pinagbuhatan'],
  'San Jose': ['San Miguel', 'San Nicolas', 'Santa Cruz'],
  'San Miguel': ['San Jose', 'San Nicolas', 'Ugong'],
  'San Nicolas': ['San Jose', 'San Miguel', 'Santa Cruz'],
  'Santa Cruz': ['San Jose', 'San Nicolas', 'Sumilang'],
  'Santa Lucia': ['Maybunga', 'Santolan', 'Santa Rosa'],
  'Santa Rosa': ['Santa Lucia', 'Santo Tomas', 'Sumilang'],
  'Santo Tomas': ['Santa Rosa', 'Sumilang', 'Ugong'],
  'Santolan': ['Dela Paz', 'Maybunga', 'Santa Lucia'],
  'Sumilang': ['Santa Cruz', 'Santa Rosa', 'Santo Tomas'],
  'Ugong': ['San Miguel', 'Santo Tomas', 'San Jose']
};

// ── Emergency Hotlines by Incident Type ───────────────────
const EMERGENCY_HOTLINES = {
  Fire: [
    { name: 'BFP Pasig City Fire Station', phone: '8641-2742', role: 'Fire Response' },
    { name: 'Pasig CDRRMO', phone: '8643-0000', role: 'Disaster Response' },
    { name: 'BFP NCR Hotline', phone: '8426-0219', role: 'Regional Fire Command' }
  ],
  Flood: [
    { name: 'Pasig CDRRMO', phone: '8643-0000', role: 'Disaster Response (24/7)' },
    { name: 'Pasig Ka-TXT', phone: '+63 908-899-3333', role: 'Text Reports Only' },
    { name: 'MMDA Flood Control', phone: '136', role: 'Metro-wide Flood Operations' },
    { name: 'Pasig City Engineering', phone: '8643-7000', role: 'Drainage & Pumping' }
  ],
  Medical: [
    { name: 'Pasig City General Hospital', phone: '8643-7027', role: 'Emergency Room' },
    { name: 'Rizal Medical Center', phone: '8671-9740', role: 'Trauma Center' },
    { name: 'Philippine Red Cross NCR', phone: '143', role: 'Medical Assistance' },
    { name: 'Pasig CDRRMO Ambulance', phone: '8643-0000', role: 'Ambulance Dispatch' }
  ],
  Chemical: [
    { name: 'Pasig CDRRMO Hazmat', phone: '8643-0000', role: 'Hazmat Team' },
    { name: 'DENR-EMB NCR', phone: '8928-3725', role: 'Environmental Monitoring' },
    { name: 'PNP Pasig SWAT', phone: '8641-1520', role: 'Hazmat Perimeter' }
  ],
  Infrastructure: [
    { name: 'DPWH NCR District Office', phone: '8304-3764', role: 'Road & Bridge Assessment' },
    { name: 'Pasig City Engineering Office', phone: '8643-7000', role: 'Local Infrastructure' },
    { name: 'Meralco Pasig', phone: '16211', role: 'Power Grid Emergency' }
  ],
  Landslide: [
    { name: 'Pasig CDRRMO', phone: '8643-0000', role: 'Disaster Response' },
    { name: 'PHIVOLCS', phone: '8929-9254', role: 'Geological Assessment' },
    { name: 'MGB NCR', phone: '8928-8937', role: 'Geohazard Assessment' }
  ],
  default: [
    { name: 'Pasig CDRRMO Emergency', phone: '8643-0000', role: 'Primary Emergency (24/7)' },
    { name: 'Pasig Ka-TXT', phone: '+63 908-899-3333', role: 'Text Reports' },
    { name: 'PNP Pasig Station', phone: '8641-1520', role: 'Police Response' },
    { name: 'Philippine Red Cross', phone: '143', role: 'Humanitarian Aid' },
    { name: 'NDRRMC Operations Center', phone: '8911-1406', role: 'National Response' }
  ]
};

// ── Pasig Emergency Hotlines ──────────────────────────────
const PASIG_HOTLINES = [
  { name: 'Pasig CDRRMO', phone: '8643-0000', desc: 'Disaster Response · 24/7', icon: '🚨' },
  { name: 'Pasig Ka-TXT', phone: '+63 908-899-3333', desc: 'Text Reports Only', icon: '📱' },
  { name: 'PNP Pasig', phone: '8641-1520', desc: 'Police Station', icon: '👮' },
  { name: 'BFP Pasig', phone: '8641-2742', desc: 'Fire Station', icon: '🚒' },
  { name: 'Pasig City General Hospital', phone: '8643-7027', desc: 'Emergency Room', icon: '🏥' },
  { name: 'Philippine Red Cross', phone: '143', desc: 'Humanitarian Aid', icon: '🏥' },
  { name: 'NDRRMC', phone: '8911-1406', desc: 'National Response', icon: '🛡️' }
];

// ── Audit Log Functions ───────────────────────────────────
function getAuditLogs() {
  try {
    return JSON.parse(localStorage.getItem('ligtas_audit_logs') || '[]');
  } catch (e) {
    return [];
  }
}

function logAction(action, target, details) {
  const logs = getAuditLogs();
  const entry = {
    id: 'AUD-' + Date.now(),
    timestamp: new Date().toISOString(),
    action: action,
    user: localStorage.getItem('ligtas_user') || 'Cmdr. Reyes',
    role: localStorage.getItem('ligtas_role') || 'Admin',
    target: target,
    details: details,
    ip: '192.168.1.' + Math.floor(Math.random() * 254 + 1)
  };
  logs.unshift(entry);
  // Keep max 500 entries
  if (logs.length > 500) logs.length = 500;
  localStorage.setItem('ligtas_audit_logs', JSON.stringify(logs));
  return entry;
}

// ── Role Functions ───────────────────────────────────────
function getCurrentRole() {
  return 'Admin';
}

function logoutUser() {
  if (typeof logAction === 'function') {
    logAction('Logout', localStorage.getItem('ligtas_user') || 'Admin', 'Session ended manually');
  }
  sessionStorage.removeItem('ligtas_session_start');
  window.location.href = 'login.html';
}

// ── Utility Functions ─────────────────────────────────────
function getEmergencyHotlines(incidentType) {
  const type = incidentType || 'default';
  const specific = EMERGENCY_HOTLINES[type] || [];
  const general = EMERGENCY_HOTLINES.default || [];
  // Merge without duplicates
  const all = [...specific];
  general.forEach(g => {
    if (!all.find(c => c.phone === g.phone)) all.push(g);
  });
  return all;
}

function getNearestRescueTeam(barangay) {
  const teams = [];
  // Primary team
  teams.push({ barangay: barangay, team: `Brgy. ${barangay} Rescue`, type: 'Primary', eta: '2-5 min' });
  // Adjacent teams
  const adj = BARANGAY_ADJACENCY[barangay] || [];
  adj.forEach((b, i) => {
    teams.push({ barangay: b, team: `Brgy. ${b} Rescue`, type: 'Backup', eta: `${5 + (i + 1) * 3}-${8 + (i + 1) * 3} min` });
  });
  return teams;
}

function populateBarangayDropdowns() {
  document.querySelectorAll('.barangay-select').forEach(sel => {
    // Clear existing
    sel.innerHTML = '';
    // All barangays option
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'All Barangays';
    sel.appendChild(allOpt);
    // District 1
    const g1 = document.createElement('optgroup');
    g1.label = 'District 1';
    PASIG_BARANGAYS.district1.forEach(b => {
      const o = document.createElement('option');
      o.value = b; o.textContent = b;
      g1.appendChild(o);
    });
    sel.appendChild(g1);
    // District 2
    const g2 = document.createElement('optgroup');
    g2.label = 'District 2';
    PASIG_BARANGAYS.district2.forEach(b => {
      const o = document.createElement('option');
      o.value = b; o.textContent = b;
      g2.appendChild(o);
    });
    sel.appendChild(g2);
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    if (typeof showToast === 'function') {
      showToast('Copied: ' + text, 'info');
    }
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    if (typeof showToast === 'function') {
      showToast('Copied: ' + text, 'info');
    }
  });
}

// ── Initialize on DOM Ready ───────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  populateBarangayDropdowns();
});
