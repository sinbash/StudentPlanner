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



                // Load Dates
                const savedStart = localStorage.getItem('semStart');
                const savedEnd = localStorage.getItem('semEnd');
                if (savedStart && savedEnd) {
                    document.getElementById('start-input').value = savedStart;
                    document.getElementById('end-input').value = savedEnd;
                    calculateProgress(savedStart, savedEnd);
                }

            }

            

            // 1. Clock and Date
            function startClock() {
                const now = new Date();
                document.getElementById('clock').innerText = now.toLocaleTimeString();
                document.getElementById('date').innerText = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
            }
            setInterval(startClock, 1000);
            startClock();

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