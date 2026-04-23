
    // ── Toast notification ──
    function showToast(msg) {
        const container = document.getElementById('toast-container');
        const el = document.createElement('div');
        el.className = 'toast-msg';
        el.textContent = msg;
        container.appendChild(el);
        requestAnimationFrame(() => el.classList.add('show'));
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 300);
        }, 2500);
    }

    // ── Clock ──
    function startClock() {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString();
        document.getElementById('date').innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    }
    setInterval(startClock, 1000);
    startClock();

    // ── Theme toggle ──
    let darkmode = localStorage.getItem('darkmode');
    const themeSwitch = document.getElementById('theme-switch');

    const enableDarkmode = () => {
        document.body.classList.add('darkmode');
        localStorage.setItem('darkmode', 'active');
    };
    const disableDarkmode = () => {
        document.body.classList.remove('darkmode');
        localStorage.setItem('darkmode', null);
    };

    if (darkmode === "active") enableDarkmode();

    themeSwitch.addEventListener("click", () => {
        darkmode = localStorage.getItem('darkmode');
        if (darkmode !== "active") enableDarkmode();
        else disableDarkmode();
    });

    // ── Grades logic ──
    const COLORS = ['#5c94e4','#e4855c','#5ce48e','#e4c85c','#a05ce4','#5cd4e4','#e45c9e','#8ee45c'];
    let units = [];
    let colorIdx = 0;

    function save() {
        try { localStorage.setItem('sp-grades-v1', JSON.stringify(units)); } catch(e) {}
    }
    function load() {
        try {
            const d = localStorage.getItem('sp-grades-v1');
            if (d) { units = JSON.parse(d); colorIdx = units.length % COLORS.length; }
        } catch(e) {}
        render();
    }

    // ── Unit management ──
    function addUnit() {
        const inp = document.getElementById('unit-name-input');
        const name = inp.value.trim();
        if (!name) { inp.focus(); return; }
        const cp = parseInt(document.getElementById('unit-cp-select').value);
        units.push({ id: Date.now(), name, cp, color: COLORS[colorIdx % COLORS.length], open: true, target: 75, assessments: [] });
        colorIdx++;
        inp.value = '';
        save();
        render();
    }

    document.getElementById('unit-name-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') addUnit();
    });

    function deleteUnit(id) {
        if (!confirm('Remove this unit?')) return;
        units = units.filter(u => u.id !== id);
        save();
        render();
    }

    function toggleUnit(id) {
        const u = units.find(u => u.id === id);
        if (u) { u.open = !u.open; render(); }
    }

    // ── Assessment management ──
    function addAssessment(unitId) {
        const u = units.find(u => u.id === unitId);
        if (!u) return;
        u.assessments.push({ id: Date.now(), name: '', weight: '', grade: '' });
        save();
        render();
        setTimeout(() => {
            const inputs = document.querySelectorAll(`[data-unit="${unitId}"] .asm-name`);
            if (inputs.length) inputs[inputs.length - 1].focus();
        }, 30);
    }

    function deleteAssessment(unitId, asmId) {
        const u = units.find(u => u.id === unitId);
        if (!u) return;
        u.assessments = u.assessments.filter(a => a.id !== asmId);
        save();
        render();
    }

    function updateAssessment(unitId, asmId, field, value) {
        const u = units.find(u => u.id === unitId);
        if (!u) return;
        const a = u.assessments.find(a => a.id === asmId);
        if (!a) return;
        if (field === 'weight' || field === 'grade') {
            let num = parseFloat(value);
            if (!isNaN(num)) {
                if (num > 100) {
                    showToast(field === 'weight' ? 'Weight cannot exceed 100%' : 'Grade cannot exceed 100%');
                    num = 100;
                }
                if (num < 0) {
                    showToast(field === 'weight' ? 'Weight cannot be negative' : 'Grade cannot be negative');
                    num = 0;
                }
                value = String(num);
            }
        }
        a[field] = value;
        save();
        refreshUnit(unitId);
    }

    function updateTarget(unitId, value) {
        const u = units.find(u => u.id === unitId);
        if (u) { u.target = parseFloat(value); save(); refreshUnit(unitId); }
    }

    // ── Calculations ──
    function calcUnit(u) {
        let weightedSum = 0, totalWeight = 0;
        for (const a of u.assessments) {
            const w = parseFloat(a.weight), g = parseFloat(a.grade);
            if (!isNaN(w) && w > 0) {
                totalWeight += w;
                if (!isNaN(g)) weightedSum += (g / 100) * w;
            }
        }
        const remaining = Math.max(0, 100 - totalWeight);
        const current = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : null;
        return { weightedSum, totalWeight, remaining, current };
    }

    function gradeClass(v) {
        if (v === null) return '';
        if (v >= 85) return 'hd';
        if (v >= 75) return 'd';
        if (v >= 65) return 'cr';
        if (v >= 50) return 'p';
        return 'n';
    }

    function gradeLabel(v) {
        if (v === null) return '—';
        if (v >= 85) return 'HD';
        if (v >= 75) return 'D';
        if (v >= 65) return 'CR';
        if (v >= 50) return 'P';
        return 'N';
    }

    function overallWAM() {
        let totalCP = 0, sum = 0;
        for (const u of units) {
            const { current } = calcUnit(u);
            if (current !== null) { sum += current * u.cp; totalCP += u.cp; }
        }
        return totalCP > 0 ? sum / totalCP : null;
    }

    // ── Render ──
    function render() {
        const container = document.getElementById('units-container');

        if (!units.length) {
            container.innerHTML = `<div class="empty-state"><div class="emoji">📚</div><p>No units added yet. Add a unit above to start tracking!</p></div>`;
        } else {
            container.innerHTML = units.map(unitHTML).join('');
            attachListeners(container);
        }

        updateSummary();
    }

    function unitHTML(u) {
        const { weightedSum, totalWeight, remaining, current } = calcUnit(u);
        const gc = gradeClass(current);
        const pct = current !== null ? current.toFixed(1) + '%' : '—';
        const gl = gradeLabel(current);

        let targetHTML = '';
        if (remaining > 0 && totalWeight > 0) {
            const needed = ((u.target - weightedSum) / remaining) * 100;
            if (needed <= 0) targetHTML = `<span class="target-info good">Already on track ✓</span>`;
            else if (needed > 100) targetHTML = `<span class="target-info bad">Not achievable (need ${needed.toFixed(0)}%)</span>`;
            else targetHTML = `<span class="target-info">Need <strong>${needed.toFixed(1)}%</strong> avg on remaining ${remaining.toFixed(0)}%</span>`;
        } else if (!totalWeight) {
            targetHTML = `<span class="target-info">Add assessments to see</span>`;
        } else {
            targetHTML = `<span class="target-info good">All assessments entered</span>`;
        }

        const rows = u.assessments.map(a => {
            const w = parseFloat(a.weight), g = parseFloat(a.grade);
            const contrib = (!isNaN(w) && !isNaN(g) && w > 0) ? ((g / 100) * w).toFixed(1) : null;
            return `<tr>
                <td><input class="tbl-input asm-name" data-field="name" data-unitid="${u.id}" data-asmid="${a.id}" placeholder="Assessment name" value="${esc(a.name)}" /></td>
                <td style="width:100px"><input class="tbl-input" data-field="weight" data-unitid="${u.id}" data-asmid="${a.id}" placeholder="%" type="number" min="0" max="100" value="${esc(a.weight)}" /></td>
                <td style="width:100px"><input class="tbl-input" data-field="grade"  data-unitid="${u.id}" data-asmid="${a.id}" placeholder="%" type="number" min="0" max="100" value="${esc(a.grade)}" /></td>
                <td class="contrib-cell ${contrib !== null ? 'has-val' : ''}" style="width:70px">${contrib !== null ? contrib + '%' : '—'}</td>
                <td style="width:36px"><button class="btn-delete-asm" onclick="deleteAssessment(${u.id},${a.id})">✕</button></td>
            </tr>`;
        }).join('');

        return `
        <div class="unit-card" data-unit="${u.id}">
            <div class="unit-header" onclick="toggleUnit(${u.id})">
                <div class="unit-color-dot" style="background:${u.color}"></div>
                <span class="unit-header-name">${esc(u.name)}</span>
                <div class="unit-header-right">
                    <span class="unit-cp">${u.cp} cp</span>
                    <span class="grade-badge ${gc}">${pct} &nbsp; ${gl}</span>
                </div>
                <span class="chevron ${u.open ? 'open' : ''}">▼</span>
            </div>
            <div class="unit-body ${u.open ? 'open' : ''}">

                <div class="weight-bar-wrap">
                    <div class="weight-bar-meta">
                        <span>Weight entered: ${totalWeight.toFixed(0)}%</span>
                        <span>${remaining.toFixed(0)}% remaining</span>
                    </div>
                    <div class="weight-bar-track">
                        <div class="weight-bar-fill" style="width:${Math.min(totalWeight,100)}%"></div>
                    </div>
                </div>

                <table class="asm-table">
                    <thead>
                        <tr>
                            <th>Assessment</th>
                            <th>Weight %</th>
                            <th>Grade %</th>
                            <th style="text-align:right">Contribution</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>

                <button class="btn-add-asm" onclick="addAssessment(${u.id})">+ Add assessment</button>

                <div class="target-row">
                    <label>Target grade:</label>
                    <select onchange="updateTarget(${u.id}, this.value)">
                        <option value="85" ${u.target===85?'selected':''}>HD — 85%</option>
                        <option value="75" ${u.target===75?'selected':''}>D — 75%</option>
                        <option value="65" ${u.target===65?'selected':''}>CR — 65%</option>
                        <option value="50" ${u.target===50?'selected':''}>P — 50%</option>
                    </select>
                    ${targetHTML}
                </div>

                <div class="unit-footer">
                    <button class="btn-delete-unit" onclick="deleteUnit(${u.id})">Remove unit</button>
                </div>
            </div>
        </div>`;
    }

    function attachListeners(container) {
        container.querySelectorAll('[data-field]').forEach(el => {
            el.addEventListener('input', () => {
                updateAssessment(parseInt(el.dataset.unitid), parseInt(el.dataset.asmid), el.dataset.field, el.value);
            });
        });
    }

    function refreshUnit(unitId) {
        const u = units.find(u => u.id === unitId);
        if (!u) return;
        const card = document.querySelector(`[data-unit="${unitId}"]`);
        if (!card) return;

        const { weightedSum, totalWeight, remaining, current } = calcUnit(u);

        // Update grade badge in header (only if changed)
        const badge = card.querySelector('.grade-badge');
        if (badge) {
            const newBadgeClass = 'grade-badge ' + gradeClass(current);
            const newBadgeHTML = (current !== null ? current.toFixed(1) + '%' : '—') + ' &nbsp; ' + gradeLabel(current);
            if (badge.className !== newBadgeClass) badge.className = newBadgeClass;
            if (badge.innerHTML !== newBadgeHTML) badge.innerHTML = newBadgeHTML;
        }

        // Update weight bar (only if changed)
        const barMeta = card.querySelector('.weight-bar-meta');
        if (barMeta) {
            const wText = 'Weight entered: ' + totalWeight.toFixed(0) + '%';
            const rText = remaining.toFixed(0) + '% remaining';
            if (barMeta.children[0].textContent !== wText) barMeta.children[0].textContent = wText;
            if (barMeta.children[1].textContent !== rText) barMeta.children[1].textContent = rText;
        }
        const barFill = card.querySelector('.weight-bar-fill');
        const newWidth = Math.min(totalWeight, 100) + '%';
        if (barFill && barFill.style.width !== newWidth) barFill.style.width = newWidth;

        // Update contribution cells (only if changed, to avoid layout reflow)
        u.assessments.forEach(a => {
            const row = card.querySelector(`[data-field="name"][data-asmid="${a.id}"]`);
            if (!row) return;
            const tr = row.closest('tr');
            if (!tr) return;
            const contribCell = tr.querySelector('.contrib-cell');
            if (!contribCell) return;
            const w = parseFloat(a.weight), g = parseFloat(a.grade);
            const contrib = (!isNaN(w) && !isNaN(g) && w > 0) ? ((g / 100) * w).toFixed(1) : null;
            const newClass = 'contrib-cell' + (contrib !== null ? ' has-val' : '');
            const newText = contrib !== null ? contrib + '%' : '—';
            if (contribCell.className !== newClass) contribCell.className = newClass;
            if (contribCell.textContent !== newText) contribCell.textContent = newText;
        });

        // Update target info
        const targetRow = card.querySelector('.target-row');
        if (targetRow) {
            let existingInfo = targetRow.querySelector('.target-info');
            let html = '';
            if (remaining > 0 && totalWeight > 0) {
                const needed = ((u.target - weightedSum) / remaining) * 100;
                if (needed <= 0) html = `<span class="target-info good">Already on track ✓</span>`;
                else if (needed > 100) html = `<span class="target-info bad">Not achievable (need ${needed.toFixed(0)}%)</span>`;
                else html = `<span class="target-info">Need <strong>${needed.toFixed(1)}%</strong> avg on remaining ${remaining.toFixed(0)}%</span>`;
            } else if (!totalWeight) {
                html = `<span class="target-info">Add assessments to see</span>`;
            } else {
                html = `<span class="target-info good">All assessments entered</span>`;
            }
            if (existingInfo) {
                const tmp = document.createElement('div');
                tmp.innerHTML = html;
                existingInfo.replaceWith(tmp.firstElementChild);
            }
        }

        updateSummary();
    }

    function updateSummary() {
        const wam = overallWAM();
        document.getElementById('overall-wam').textContent = wam !== null ? wam.toFixed(1) + '%' : '—';
        document.getElementById('overall-grade').textContent = gradeLabel(wam);
        document.getElementById('unit-count').textContent = units.length;
    }

    function esc(s) {
        return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    load();
