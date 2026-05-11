/**
 * LIGTAS Global Config Applier
 * Handles applying settings from localStorage to the UI.
 */

const applyLigtasConfig = () => {
    const saved = localStorage.getItem('ligtas_config');
    if (!saved) return;

    try {
        const config = JSON.parse(saved);

        // 1. Update System Name (Sidebar Logo)
        if (config.sysName) {
            document.querySelectorAll('.sidebar-logo span:not(.version)').forEach(el => {
                el.textContent = config.sysName;
            });
        }

        // 2. Update Page Titles (Topbar) if they match LIGTAS
        const topTitle = document.querySelector('.topbar h1');
        if (topTitle && topTitle.textContent === 'LIGTAS') {
            topTitle.textContent = config.sysName;
        }

        // 3. Apply Maintenance Mode (Visual indicator)
        if (config.maintMode === 'on') {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) sidebar.style.borderRight = '2px solid var(--critical)';
        }

        // 4. Update Incident Categories in Dropdowns
        if (config.categories && config.categories.length > 0) {
            const incSelects = document.querySelectorAll('select[id*="inc-type"], select[id*="inc-cats"]');
            incSelects.forEach(sel => {
                // Keep the first "Select..." option if it exists
                const firstOpt = sel.options[0];
                const hasPrompt = firstOpt && (firstOpt.value === "" || firstOpt.text.includes("Select"));
                
                sel.innerHTML = '';
                if (hasPrompt) sel.appendChild(firstOpt);

                config.categories.forEach(cat => {
                    const opt = document.createElement('option');
                    opt.value = cat;
                    opt.textContent = cat;
                    sel.appendChild(opt);
                });
            });
        }

        // 5. Apply Thresholds to Centers (Dynamic Logic)
        window.LIGTAS_CRIT_THRESHOLD = config.critThreshold || 90;
        window.LIGTAS_WARN_THRESHOLD = config.warnThreshold || 70;

        // 6. Global Zone and Unit Injection
        const savedZones = localStorage.getItem('ligtas_zones');
        if (savedZones) {
            window.ZONE_RECIPIENTS = JSON.parse(savedZones);
            
            // Update Location Dropdowns
            const locSelects = document.querySelectorAll('select[id*="inc-loc"], select[id*="dest"], select[id*="zone"], select[id*="barangay"]');
            locSelects.forEach(sel => {
                const firstOpt = sel.options[0];
                const hasPrompt = firstOpt && (firstOpt.value === "" || firstOpt.text.includes("Select"));
                
                sel.innerHTML = '';
                if (hasPrompt) sel.appendChild(firstOpt);

                Object.keys(window.ZONE_RECIPIENTS).forEach(name => {
                    if (name === 'all') return;
                    const opt = document.createElement('option');
                    opt.value = name;
                    opt.textContent = name;
                    sel.appendChild(opt);
                });
            });
        }

        const savedUnits = localStorage.getItem('ligtas_units');
        if (savedUnits) {
            window.LIGTAS_UNITS = JSON.parse(savedUnits);
            
            // Update Unit Dropdowns
            const unitSelects = document.querySelectorAll('select[id*="unit"], select[id*="dispatch"]');
            unitSelects.forEach(sel => {
                const firstOpt = sel.options[0];
                const hasPrompt = firstOpt && (firstOpt.value === "" || firstOpt.text.includes("Select"));
                
                sel.innerHTML = '';
                if (hasPrompt) sel.appendChild(firstOpt);

                window.LIGTAS_UNITS.forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = u.name;
                    opt.textContent = u.name;
                    sel.appendChild(opt);
                });
            });
        }

    } catch (e) {
        console.error("Error applying LIGTAS config:", e);
    }
};

// Run on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyLigtasConfig);
} else {
    applyLigtasConfig();
}
