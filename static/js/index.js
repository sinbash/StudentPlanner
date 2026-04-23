            function hideAllSections() {
                document.getElementById("dashboard-section").style.display = "none";
                document.getElementById("units-section").style.display = "none";
                document.getElementById("unit-detail-section").style.display = "none";
                document.getElementById("todo-section").style.display = "none";
                document.getElementById("settings-section").style.display = "none";
            }

            window.onload = function() {

                //Load settings on new user session
                loadTimezones();
                const savedSettings = JSON.parse(localStorage.getItem("userSettings"));

                if (savedSettings) {
                    document.getElementById("user-name").value = savedSettings.name || "";
                    document.getElementById("user-email").value = savedSettings.email || "";
                    document.getElementById("user-age").value = savedSettings.age || "";
                    document.getElementById("timezone").value = savedSettings.timezone || "";
                }


                //Load the Saved Personal To-Do List Data from user's last visit on website.
                const savedTodos = JSON.parse(localStorage.getItem("todoData")) || [];
                const list = document.getElementById("todo-list");
                list.innerHTML = "";
                savedTodos.forEach(todo => addTodo(todo.text, todo.completed, true));
                
                loadUnitsData();

                // Load Dates
                const savedStart = localStorage.getItem('semStart');
                const savedEnd = localStorage.getItem('semEnd');
                if (savedStart && savedEnd) {
                    document.getElementById('start-input').value = savedStart;
                    document.getElementById('end-input').value = savedEnd;
                    calculateProgress(savedStart, savedEnd);
                }

                // Load Notes
                const savedNote = localStorage.getItem('userDashboardNote');
                if (savedNote) {
                    document.getElementById('dashboard-notes').value = savedNote;
                }

                // Load Table Rows
                const savedTable = JSON.parse(localStorage.getItem('deadlineData'));
                if (savedTable && savedTable.length > 0) {
                    // 1. Clear the default HTML row
                    const tableBody = document.getElementById('unit-body');
                    tableBody.innerHTML = ""; 

                    // 2. Filtering out rows that have NO data in the 3 main fields
                    const activeRows = savedTable.filter(rowData => {
                        return rowData.unit.trim() !== "" || 
                            rowData.date.trim() !== "" || 
                            rowData.assignment.trim() !== "";
                    });

                    // 3. Only show the rows that actually have content
                    if (activeRows.length > 0) {
                        activeRows.forEach(rowData => addNewRow(rowData));
                    } else {
                        // 4. If everything was empty, add one fresh blank row so the table isn't invisible
                        addNewRow();
                    }
            
                    // 5. Update the storage so the "deleted" empty rows stay gone
                    saveTableData();  // Save when status changes
                }

                const hash = window.location.hash;
                if (hash === "#units") showUnits();
                else if (hash === "#todo") showTodo();
                else if (hash === "#settings") showSettings();
                else showDashboard();

            };

            // 1. Clock and Date
            function startClock() {
                const now = new Date();
                document.getElementById('clock').innerText = now.toLocaleTimeString();
                document.getElementById('date').innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
            }
            setInterval(startClock, 1000);
            startClock();

            // 2. Add Status Colour & Save
            function updateStatusColour(selectElement) {
                selectElement.classList.remove('status-not-started', 'status-in-progress', 'status-completed');
                const status = selectElement.value;
                if (status) selectElement.classList.add('status-' + status);
                    saveTableData();
                    updateUnitProgress();
            }

            // 3. Add Row (Updated to STORE data)
            function addNewRow(data = { unit: '', date: '', assignment: '', status: 'not-started' }) {
                const tableBody = document.getElementById('unit-body');
                const row = document.createElement('tr');
        
                // Calculate countdown for loaded rows
                let countdown = "-";
                if(data.date) {
                    const diff = new Date(data.date) - new Date().setHours(0,0,0,0);
                    countdown = Math.ceil(diff / (1000 * 60 * 60 * 24));
                }

                row.innerHTML = `
                    <td><input type="text" class="input-field" placeholder="Unit Code" value="${data.unit}" oninput="saveTableData()"></td>
                    <td><input type="date" class="input-field" value="${data.date}" onchange="calculateCountdown(this); saveTableData()"></td>
                    <td><input type="text" class="input-field" placeholder="Assignments" value="${data.assignment}" oninput="saveTableData()"></td>
                    <td style="text-align: center; font-size: 1.1rem;">${countdown}</td>
                    <td>
                        <select class="status-dropdown status-${data.status}" onchange="updateStatusColour(this)">
                            <option value="not-started" ${data.status === 'not-started' ? 'selected' : ''}>Not started</option>
                            <option value="in-progress" ${data.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                            <option value="completed" ${data.status === 'completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </td>
                    <td><button class="btn-delete" onclick="removeRow(this)">&times;</button></td>
                `;
                tableBody.appendChild(row);
                saveTableData();
            }

            // 4. Delete Row & Save
            function removeRow(button) {
                button.closest('tr').remove();
                saveTableData();
            }

            // 5. Semester Progress Logic and saving that data
            function saveDates() {
                const start = document.getElementById('start-input').value;
                const end = document.getElementById('end-input').value;
                if (start && end) {
                    localStorage.setItem('semStart', start);
                    localStorage.setItem('semEnd', end);
                    calculateProgress(start, end);
                } else {
                    alert("Please select both start and end dates!");
                }
            }

            function calculateProgress(startStr, endStr) {
                const startDate = new Date(startStr);
                const endDate = new Date(endStr);
                const today = new Date();
                const totalDuration = endDate - startDate;
                const elapsed = today - startDate;
                let percentage = Math.floor((elapsed / totalDuration) * 100);
                percentage = Math.min(Math.max(percentage, 0), 100);
                const diffInDays = Math.floor(elapsed / (1000 * 60 * 60 * 24));
                const currentWeek = Math.ceil((diffInDays + 1) / 7);
                const totalWeeks = Math.ceil(totalDuration / (1000 * 60 * 60 * 24 * 7));

                document.getElementById('progress-fill').style.width = percentage + "%";
                document.getElementById('percent-complete').innerText = percentage + "% Complete";
                document.getElementById('current-week').innerText = percentage >= 100 ? "Finished!" : `Week ${currentWeek} of ${totalWeeks}`;
            }

            // 6. Countdown Logic
            function calculateCountdown(dateInput) {
                const selectedDate = new Date(dateInput.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                selectedDate.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
                const row = dateInput.closest('tr');
                row.cells[3].innerText = isNaN(diffDays) ? "-" : diffDays;
            }

            // 7. Saving data in the deadline table
            function saveTableData() {
                const rows = document.querySelectorAll('#unit-body tr');
                const data = Array.from(rows).map(row => {
                    return {
                        unit: row.cells[0].querySelector('input').value,
                        date: row.cells[1].querySelector('input').value,
                        assignment: row.cells[2].querySelector('input').value,
                        status: row.cells[4].querySelector('select').value
                    };
                });
                localStorage.setItem('deadlineData', JSON.stringify(data));
            }


            // 9. Notes Auto-Save
            const notesArea = document.getElementById('dashboard-notes');
            const indicator = document.getElementById('save-indicator');
            notesArea.addEventListener('input', () => {
                localStorage.setItem('userDashboardNote', notesArea.value);
                indicator.textContent = "Saving...";
                setTimeout(() => { indicator.textContent = "Saved"; }, 500);
            });

            // 10. Theme switch (dark mode & light mode)
            let darkmode = localStorage.getItem('darkmode')
            const themeSwitch = document.getElementById('theme-switch')

            const enableDarkmode = () => {
            document.body.classList.add('darkmode')
            localStorage.setItem('darkmode', 'active')
            }

            const disableDarkmode = () => {
            document.body.classList.remove('darkmode')
            localStorage.setItem('darkmode', null)
            }

            if(darkmode === "active") enableDarkmode()

            themeSwitch.addEventListener("click", () => {
                darkmode = localStorage.getItem('darkmode')
                if (darkmode !== "active") {
                    enableDarkmode()
                } 
                else{
                    disableDarkmode()
            }})
        

            //Functions for Units Section
            function showUnits() {
                hideAllSections();
                document.getElementById("dashboard-section").style.display = "none";
                document.getElementById("units-section").style.display = "block";
                document.getElementById("unit-detail-section").style.display = "none";
            }

            function showDashboard() {
                hideAllSections();
                document.getElementById("dashboard-section").style.display = "block";
                document.getElementById("units-section").style.display = "none";
                }

            function addNewUnitRow(data = { unit: '', semester: '' }) {
                const tableBody = document.getElementById('units-body');
                const row = document.createElement('tr');

                row.innerHTML = `
                <td onclick="openUnitPage(this.closest('tr'))" class="unit-click">
                    <input type="text" class="input-field" placeholder="Unit Code" value="${data.unit}" oninput="saveUnitsData()">
                </td>
                <td>
                    <input type="text" class="input-field" placeholder="Semester + Year" value="${data.semester}" oninput="saveUnitsData()">
                </td>
                <td>
                    <div class="mini-progress">
                        <div class="mini-fill" style="width: 40%;"></div>
                    </div>
                </td>
                <td>
                    <button class="btn-delete" onclick="event.stopPropagation(); removeUnitRow(this)">&times;</button>
                </td>
                `;

                tableBody.appendChild(row);
                saveUnitsData();
                }

            function removeUnitRow(button) {
                button.closest('tr').remove();
                saveUnitsData();
            }

            function saveUnitsData() {
                const rows = document.querySelectorAll('#units-body tr');

                const data = Array.from(rows).map(row => {
                    return {
                        unit: row.cells[0].querySelector('input').value,
                        semester: row.cells[1].querySelector('input').value
                    };
                });

                localStorage.setItem('unitsData', JSON.stringify(data));
                }

            // Load Units Data
            function loadUnitsData(){
                const savedUnits = JSON.parse(localStorage.getItem('unitsData'));

                if (savedUnits && savedUnits.length > 0) {
                    const tableBody = document.getElementById('units-body');
                    tableBody.innerHTML = "";

                    savedUnits.forEach(unit => addNewUnitRow(unit));
                } else {
                    addNewUnitRow(); // default row
                }
                updateUnitProgress();
            }

            // Calculate real progress for each unit based on completed deadlines
            function updateUnitProgress() {
                const deadlines = JSON.parse(localStorage.getItem('deadlineData')) || [];
                const rows = document.querySelectorAll('#units-body tr');

                rows.forEach(row => {
                    const unitInput = row.cells[0].querySelector('input');
                    if (!unitInput) return;
                    const unitCode = unitInput.value.trim();
                    if (!unitCode) return;

                    const unitDeadlines = deadlines.filter(d => d.unit === unitCode);
                    const total = unitDeadlines.length;
                    const completed = unitDeadlines.filter(d => d.status === 'completed').length;
                    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

                    const fill = row.querySelector('.mini-fill');
                    if (fill) fill.style.width = pct + '%';
                });
            }
        
            function openUnitPage(row) {
                const unitCode = row.cells[0].querySelector('input').value.trim();

                if (!unitCode) {
                    alert("Please enter a unit code first");
                    return;
                }

                // Save selected unit
                localStorage.setItem("selectedUnit", unitCode);

                // Update title
                document.getElementById("unit-title").innerText = unitCode;

                // Hide other sections
                document.getElementById("units-section").style.display = "none";
                document.getElementById("dashboard-section").style.display = "none";
                document.getElementById("unit-detail-section").style.display = "block";

                loadFilteredDeadlines(unitCode);
            }

            function loadFilteredDeadlines(unitCode) {
                const savedTable = JSON.parse(localStorage.getItem('deadlineData')) || [];
                const tbody = document.getElementById("filtered-deadlines");

                tbody.innerHTML = "";

                const filtered = savedTable
                    .map((row, index) => ({ ...row, index }))
                    .filter(row => row.unit === unitCode);

                if (filtered.length === 0) {
                    tbody.innerHTML = "<tr><td colspan='5'>No assignments found</td></tr>";
                    return;
                }

                filtered.forEach(row => {
                    const tr = document.createElement("tr");

                    let countdown = "-";
                    if (row.date) {
                        const diff = new Date(row.date) - new Date().setHours(0,0,0,0);
                        countdown = Math.ceil(diff / (1000 * 60 * 60 * 24));
                    }

                    tr.innerHTML = `
                        <td>
                            <input type="text" class="input-field" value="${row.unit}"
                            oninput="updateFiltered(${row.index}, 'unit', this.value)">
                        </td>

                        <td>
                            <input type="date" class="input-field" value="${row.date}"
                            onchange="updateFilteredDate(${row.index}, this)">
                        </td>

                        <td>
                            <input type="text" class="input-field" value="${row.assignment}"
                            oninput="updateFiltered(${row.index}, 'assignment', this.value)">
                        </td>

                        <td style="text-align: center; font-size: 1.1rem;">${countdown}</td>

                        <td>
                            <select class="status-dropdown status-${row.status}"
                            onchange="updateStatusColour(this); updateFiltered(${row.index}, 'status', this.value)">
                                <option value="not-started" ${row.status === 'not-started' ? 'selected' : ''}>Not started</option>
                                <option value="in-progress" ${row.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                                <option value="completed" ${row.status === 'completed' ? 'selected' : ''}>Completed</option>
                            </select>
                        </td>

                        <td><button class="btn-delete" onclick="deleteFiltered(${row.index})">&times;</button></td>
                    `;

                    tbody.appendChild(tr);
                });
            }

            function refreshDashboardTable() {
                const savedTable = JSON.parse(localStorage.getItem('deadlineData')) || [];
                const tableBody = document.getElementById('unit-body');

                tableBody.innerHTML = "";

                savedTable.forEach(rowData => addNewRow(rowData));
            }

            function updateFiltered(index, field, value) {
                const data = JSON.parse(localStorage.getItem('deadlineData')) || [];
                data[index][field] = value;
                localStorage.setItem('deadlineData', JSON.stringify(data));
                refreshDashboardTable();
                updateUnitProgress();
            }

            function updateFilteredDate(index, dateInput) {
                const data = JSON.parse(localStorage.getItem('deadlineData')) || [];
                data[index].date = dateInput.value;
                localStorage.setItem('deadlineData', JSON.stringify(data));

                // Update countdown in the same row
                const row = dateInput.closest('tr');
                const selectedDate = new Date(dateInput.value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
                row.cells[3].innerText = isNaN(diffDays) ? "-" : diffDays;

                refreshDashboardTable();
            }

            function deleteFiltered(index) {
                const data = JSON.parse(localStorage.getItem('deadlineData')) || [];
                data.splice(index, 1);
                localStorage.setItem('deadlineData', JSON.stringify(data));
                refreshDashboardTable();
                updateUnitProgress();

                const unitCode = localStorage.getItem("selectedUnit");
                if (unitCode) loadFilteredDeadlines(unitCode);
            }

            function addFilteredRow() {
                const unitCode = localStorage.getItem("selectedUnit");
                if (!unitCode) return;

                const data = JSON.parse(localStorage.getItem('deadlineData')) || [];
                data.push({ unit: unitCode, date: '', assignment: '', status: 'not-started' });
                localStorage.setItem('deadlineData', JSON.stringify(data));

                refreshDashboardTable();
                loadFilteredDeadlines(unitCode);
            }

            //Functions for Personal To-Do List Section
            function showTodo() {
                hideAllSections();
                document.getElementById("dashboard-section").style.display = "none";
                document.getElementById("units-section").style.display = "none";
                document.getElementById("unit-detail-section").style.display = "none";
                document.getElementById("todo-section").style.display = "block";
            }

            function addTodo(text = "", completed = false, skipSave = false) {
                // 1. Get the input field
                const input = document.getElementById("todo-input");
                
                // 2. Determine if we are loading an old task or adding a new one from the box
                const taskText = text || (input ? input.value.trim() : "");

                // 3. If the box is empty, don't do anything
                if (!taskText) return;

                const list = document.getElementById("todo-list");

                // 4. Create the HTML for the task
                const item = document.createElement("div");
                item.style.display = "flex";
                item.style.alignItems = "center";
                item.style.justifyContent = "space-between";
                item.style.padding = "10px";
                item.style.borderBottom = "1px solid rgba(0,0,0,0.05)";
                item.style.color = "var(--text-color)";

                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" ${completed ? "checked" : ""}
                            onchange="this.nextElementSibling.style.textDecoration = this.checked ? 'line-through' : 'none'; saveTodos();">
                        <span style="text-decoration:${completed ? "line-through" : "none"};">
                            ${taskText}
                        </span>
                    </div>
                    <button class="btn-delete" onclick="removeTodo(this)">&times;</button>
                `;

                list.appendChild(item);

                // 5. Clear the input box after adding
                if (input) input.value = "";
                
                // 6. Save to local storage unless we are just loading existing data
                if (!skipSave) saveTodos();
            }

            // Don't forget the helper functions for deleting and saving!
            function removeTodo(button) {
                button.parentElement.remove();
                saveTodos();
            }

            //Delete Data Function: saves the deletion of data that user deletes.
            function removeTodo(button) {
                button.parentElement.remove();
                saveTodos();
            }

            //Save Data Function: saves data that user enters into the To-Do List
            function saveTodos() {
                const items = document.querySelectorAll("#todo-list > div");
                const data = Array.from(items).map(item => {
                    const text = item.querySelector("span").innerText;
                    const completed = item.querySelector("input").checked;
                    return { text, completed };
                });
                localStorage.setItem("todoData", JSON.stringify(data));
            }

            //Functions for Settings section
            //Logic function for settings
            function showSettings() {
                hideAllSections();
                document.getElementById("dashboard-section").style.display = "none";
                document.getElementById("units-section").style.display = "none";
                document.getElementById("unit-detail-section").style.display = "none";
                document.getElementById("todo-section").style.display = "none";
                document.getElementById("settings-section").style.display = "block";
            }

            //Load timezones to drop down menu
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

            //Save user settings between sessions
            function saveSettings() {
                const data = {
                    name: document.getElementById("user-name").value,
                    email: document.getElementById("user-email").value,
                    age: document.getElementById("user-age").value,
                    timezone: document.getElementById("timezone").value
                };

                localStorage.setItem("userSettings", JSON.stringify(data));
            }
