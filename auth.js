function validateEmail(email){
    return email.includes("@") && email.includes(".") ;
}
function validatePassword(password) {
    return password.length >= 6;
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
if (loginForm) {
    loginForm.addEventListener("submit",function(e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const  password= document.getElementById("password").value;

        if (!email) {
            alert("Email is required");
            return;
        }

        if (!validateEmail(email)) {
            alert("Invalid email format");
            return;
        }

        if (!password) {
            alert("Password is required");
            return;
        }

        if (!validatePassword(password)) {
            alert("Password must be at least 6 characters");
            return;
        }
        console.log("LOGIN: ", {email,password});
    });
}


const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
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

        console.log("SIGNUP:", { firstName, lastName, dob, email, password });
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