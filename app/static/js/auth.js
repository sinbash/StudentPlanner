function validateEmail(email){
    return email.includes("@") && email.includes(".") ;
}
function validatePassword(password) {
    return password.length >= 6;
}

function validateUsername(usernmae){
    return usernmae;
}

function calculateAge(dob) {
    const today = new Date();
    const birthDate = new Date(dob);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    return age;
}

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordSection = document.getElementById("passwordSection");
const errorMessage = document.getElementById("errorMessage");

// Show password field when email is valid (outside form submit)
emailInput.addEventListener('blur', function() {
    if (validateEmail(emailInput.value.trim())) {
        passwordSection.classList.remove('d-none');
    }
});

if (loginForm) {
    loginForm.addEventListener("submit", function(e) {
        // stops the intial submit to validate the fields first
        e.preventDefault();
        
        // Hide previous error
        errorMessage.classList.add('d-none');

        const email = emailInput.value.trim().toLowerCase();
        const password = document.getElementById("password").value;

        // validation checks
        if (!email) {
            errorMessage.textContent = "Email is required";
            errorMessage.classList.remove('d-none');
            return;
        }

        if (!validateEmail(email)) {
            errorMessage.textContent = "Invalid email format";
            errorMessage.classList.remove('d-none');
            return;
        }

        if (!password) {
            errorMessage.textContent = "Password is required";
            errorMessage.classList.remove('d-none');
            return;
        }

        if (!validatePassword(password)) {
            errorMessage.textContent = "Password must be at least 6 characters";
            errorMessage.classList.remove('d-none');
            return;
        }

        // TODO: actual login check here
        // If login fails:
        //errorMessage.textContent = "Wrong password";
        //errorMessage.classList.remove('d-none');
        //console.log("LOGIN: ", {email, password});

        console.log("Validation passed. Checking database for:", email);
        loginForm.submit();
    });
}

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {

        // 1. stop the form to check validation
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const dob = document.querySelector("input[name='dob']").value;
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!firstName || !lastName || !email || !password) {
            alert("Fill all fields");
            return;
        }

        if (!validateEmail(email)) {
            alert("Invalid email");
            return;
        }

        if (!validatePassword(password)) {
            alert("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        if (!dob) {
            alert("Date of birth is required");
            return;
        }

        const age = calculateAge(dob);

        if (age < 10) {
            alert("You must be at least 10 years old");
            return;
        }
        
        // 2. if validation passes: submit the form to the python backend
        console.log("SIGNUP:", { firstName, lastName, dob, email, password });
        signupForm.submit();
    });
}

const resetForm = document.getElementById("resetForm");

if (resetForm) {
    resetForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!email) {
            alert("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            alert("Invalid email");
            return;
        }

        if (!newPassword) {
            alert("New password is required");
            return;
        }

        if (!validatePassword(newPassword)) {
            alert("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        console.log("RESET PASSWORD:", { email, newPassword });
        alert("Password updated");
    });
}