function validateEmail(email) {
    return /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateUsername(username) {
    return username && username.length >= 3;
}

function showError(msg) {
    const el = document.getElementById("errorMessage");
    if (el) {
        el.textContent = msg;
        el.classList.remove("d-none");
    } else {
        alert(msg);
    }
}

function hideError() {
    const el = document.getElementById("errorMessage");
    if (el) el.classList.add("d-none");
}

// --- Login ---
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordSection = document.getElementById("passwordSection");

if (emailInput && passwordSection) {
    emailInput.addEventListener("blur", function () {
        if (validateEmail(emailInput.value.trim())) {
            passwordSection.classList.remove("d-none");
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideError();

        const email = emailInput.value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        if (!email || !validateEmail(email)) {
            showError("Please enter a valid email");
            return;
        }
        if (!password || !validatePassword(password)) {
            showError("Password must be at least 6 characters");
            return;
        }

        fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        })
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (ok) {
                    window.location.href = "/";
                } else {
                    showError(data.error || "Login failed");
                }
            })
            .catch(() => showError("Could not connect to server"));
    });
}

// --- Signup ---
const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideError();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!firstName || !lastName || !email || !password) {
            showError("Please fill in all fields");
            return;
        }
        if (!validateEmail(email)) {
            showError("Please enter a valid email");
            return;
        }
        if (!validatePassword(password)) {
            showError("Password must be at least 6 characters");
            return;
        }
        if (password !== confirmPassword) {
            showError("Passwords do not match");
            return;
        }

        const username = firstName + " " + lastName;

        fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        })
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (ok) {
                    window.location.href = "/";
                } else {
                    showError(data.error || "Signup failed");
                }
            })
            .catch(() => showError("Could not connect to server"));
    });
}

// --- Reset Password ---
const resetForm = document.getElementById("resetForm");

if (resetForm) {
    resetForm.addEventListener("submit", function (e) {
        e.preventDefault();
        hideError();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!email || !validateEmail(email)) {
            showError("Please enter a valid email");
            return;
        }
        if (!newPassword || !validatePassword(newPassword)) {
            showError("Password must be at least 6 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            showError("Passwords do not match");
            return;
        }

        fetch("/api/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, new_password: newPassword }),
        })
            .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (ok) {
                    showError(""); // clear
                    alert("Password updated! Redirecting to login...");
                    window.location.href = "/login.html";
                } else {
                    showError(data.error || "Reset failed");
                }
            })
            .catch(() => showError("Could not connect to server"));
    });
}
