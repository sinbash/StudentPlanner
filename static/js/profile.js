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

    const enableDarkmode = () => { document.body.classList.add('darkmode'); localStorage.setItem('darkmode', 'active'); };
    const disableDarkmode = () => { document.body.classList.remove('darkmode'); localStorage.setItem('darkmode', null); };

    if (darkmode === "active") enableDarkmode();

    themeSwitch.addEventListener("click", () => {
        darkmode = localStorage.getItem('darkmode');
        darkmode !== "active" ? enableDarkmode() : disableDarkmode();
    });

    // ── Timezone loader ──
    function loadTimezones() {
        const select = document.getElementById("timezone");
        const timezones = Intl.supportedValuesOf('timeZone');
        timezones.forEach(tz => {
            const option = document.createElement("option");
            option.value = tz;
            option.textContent = tz;
            select.appendChild(option);
        });
    }

    // ── Profile data keys ──
    const PROFILE_KEY = 'sp-profile-v1';
    const PROFILE_FIELDS = ['firstName', 'lastName', 'profileEmail', 'studentId', 'dob', 'university', 'bio', 'degree', 'year', 'semester', 'timezone'];

    // ── Save profile ──
    function saveProfile() {
        const data = {};
        PROFILE_FIELDS.forEach(id => {
            data[id] = document.getElementById(id).value;
        });
        data.joinedDate = data.joinedDate || new Date().toISOString();

        // Preserve joined date
        const existing = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        if (existing.joinedDate) data.joinedDate = existing.joinedDate;

        localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
        updateHero(data);
        showToast('Profile saved successfully');
    }

    // ── Load profile ──
    function loadProfile() {
        const data = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        PROFILE_FIELDS.forEach(id => {
            const el = document.getElementById(id);
            if (data[id]) el.value = data[id];
        });

        // Also pull from legacy settings if profile is empty
        if (!data.firstName) {
            const legacy = JSON.parse(localStorage.getItem('userSettings') || '{}');
            if (legacy.name) document.getElementById('firstName').value = legacy.name;
            if (legacy.email) document.getElementById('profileEmail').value = legacy.email;
            if (legacy.timezone) document.getElementById('timezone').value = legacy.timezone;
        }

        updateHero(data);
    }

    // ── Update hero section ──
    function updateHero(data) {
        const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Student';
        const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

        document.getElementById('avatar').textContent = initials;
        document.getElementById('hero-name').textContent = name;
        document.getElementById('hero-email').textContent = data.profileEmail || 'Set up your profile below';

        const joined = data.joinedDate ? new Date(data.joinedDate).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Today';
        document.getElementById('hero-joined').textContent = joined;
    }

    // ── Reset form ──
    function resetProfile() {
        const data = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        PROFILE_FIELDS.forEach(id => {
            document.getElementById(id).value = data[id] || '';
        });
        showToast('Changes discarded');
    }

    // ── Stats from localStorage ──
    function loadStats() {
        const units = JSON.parse(localStorage.getItem('unitsData') || '[]');
        const deadlines = JSON.parse(localStorage.getItem('deadlineData') || '[]');
        const todos = JSON.parse(localStorage.getItem('todoData') || '[]');
        const grades = JSON.parse(localStorage.getItem('sp-grades-v1') || '[]');

        document.getElementById('stat-units').textContent = Math.max(units.length, grades.length);
        document.getElementById('stat-deadlines').textContent = deadlines.filter(d => d.date).length;
        document.getElementById('stat-tasks').textContent = todos.filter(t => t.completed).length;
    }

    // ── Password strength ──
    function checkStrength(pw) {
        const fill = document.getElementById('strengthFill');
        const label = document.getElementById('strengthLabel');
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[^A-Za-z0-9]/.test(pw)) score++;

        const levels = [
            { width: '0%', color: '#ccc', text: '' },
            { width: '20%', color: '#e53e3e', text: 'Weak' },
            { width: '40%', color: '#dd6b20', text: 'Fair' },
            { width: '60%', color: '#d69e2e', text: 'Good' },
            { width: '80%', color: '#38a169', text: 'Strong' },
            { width: '100%', color: '#2f855a', text: 'Excellent' },
        ];
        const l = levels[score];
        fill.style.width = l.width;
        fill.style.background = l.color;
        label.textContent = l.text;
        label.style.color = l.color;
    }

    // ── Change password ──
    function changePassword() {
        const current = document.getElementById('currentPassword').value;
        const newPw = document.getElementById('newPassword').value;
        const confirm = document.getElementById('confirmNewPassword').value;

        if (!current) { showToast('Enter current password', true); return; }
        if (newPw.length < 6) { showToast('Password must be at least 6 characters', true); return; }
        if (newPw !== confirm) { showToast('Passwords do not match', true); return; }

        // TODO: actual password change with backend
        console.log("PASSWORD CHANGE:", { current, newPw });
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        checkStrength('');
        showToast('Password updated successfully');
    }

    // ── Clear all data ──
    function clearAllData() {
        if (!confirm('This will clear ALL your Student Planner data (deadlines, todos, units, grades, notes). Continue?')) return;
        const profileData = localStorage.getItem(PROFILE_KEY);
        const keysToRemove = ['deadlineData', 'todoData', 'unitsData', 'sp-grades-v1', 'userDashboardNote', 'semStart', 'semEnd', 'userSettings'];
        keysToRemove.forEach(k => localStorage.removeItem(k));
        loadStats();
        showToast('All planner data cleared');
    }

    // ── Toast ──
    function showToast(msg, isError) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.style.background = isError ? 'var(--red-button)' : 'var(--green-button)';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ── Init ──
    window.onload = function () {
        loadTimezones();
        loadProfile();
        loadStats();

        // Set joined date if first visit
        const data = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        if (!data.joinedDate) {
            data.joinedDate = new Date().toISOString();
            localStorage.setItem(PROFILE_KEY, JSON.stringify(data));
            updateHero(data);
        }
        const hash = window.location.hash;
                if (hash === "#units") showUnits();
                else if (hash === "#todo") showTodo();
                else if (hash === "#settings") showSettings();
                else showDashboard();
    };
