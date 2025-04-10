import { api } from "./api.js";

export function SetupRegister() {
    $("#form-register").submit(function (e) {
        e.preventDefault();
        let name = $("#inputName").val();
        let email = $("#inputEmail").val();
        let password = $("#inputPassword").val();
        let gender = $("#inputGender").val(); // Get gender from select element
        let phone = $("#inputPhone").val();
        let address = $("#inputAddress").val();
        let birthDate = new Date($("#inputBirthDate").val()).toISOString(); // Convert to ISO 8601 string

        // Basic validation
        if (!name || !email || !password || !gender || !phone || !address || !birthDate) {
            $("#error").removeClass("d-none").text("All fields are required.");
            return;
        }

        let userData = {
            fullName: name,
            password: password,
            email: email,
            address: address,
            birthDate: birthDate,
            gender: gender,
            phoneNumber: phone,
        }

        PostRegisterRequest(userData);
    });
}

async function PostRegisterRequest(userData) {
    try {
        const response = await fetch(`${api}/api/account/register`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData) // Send userData directly
        });

        const responseBody = await response.text(); // Capture the raw response body

        if (!response.ok) {
            console.error('Registration failed:', responseBody); // Log the raw response body
            const errorData = JSON.parse(responseBody);
            throw new Error(errorData.message || 'Registration failed. Please try again later.');
        }

        const json = JSON.parse(responseBody);
        localStorage.setItem("JWT", json.token);
        localStorage.setItem("user", JSON.stringify({ token: json.token, userData })); // Store user data
        $("#error").addClass("d-none");

        // Automatically log in the user after successful registration
        loginUser(userData.email, userData.password);
    } catch (error) {
        console.error('Error during registration:', error);
        $("#error").removeClass("d-none").text(error.message);
    }
}

// Function to log in the user
async function loginUser(email, password) {
    try {
        const response = await fetch(`${api}/api/account/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Login failed. Please try again later.');
        }

        const json = await response.json();
        localStorage.setItem("JWT", json.token);
        $("#error").addClass("d-none");

        // Navigate to profile page after successful login
        location.pathname = "/profile";
    } catch (error) {
        console.error('Error during login:', error);
        $("#error").removeClass("d-none").text(error.message);
    }
}
