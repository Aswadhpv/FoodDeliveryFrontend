import { api } from "./api.js";

export function SetupProfile() {
    let user = JSON.parse(localStorage.getItem("user"));
    let token = localStorage.getItem("JWT");
    if (!user.auth) {
        var fullUrl = new URL(location.origin + '/login');
        PageLoader.loadPage(fullUrl.pathname, "");
    }

    // Fetch user profile data
    fetchUserProfile(token);

    // Save changes on blur
    $("#name, #birthDate, #address, #phone").on("blur", function () {
        const fieldId = $(this).attr("id");
        const newValue = $(this).text();

        // Update user data in localStorage
        user.userData[fieldId] = newValue;
        localStorage.setItem("user", JSON.stringify(user));

        // Update user data on the server
        updateUserField(fieldId, newValue, token);
    });
}

async function fetchUserProfile(token) {
    try {
        const response = await fetch(`${api}/api/account/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user profile data: ${response.statusText}`);
        }

        const userData = await response.json();

        // Display user profile data
        $("#email").text(userData.email);
        $("#name").text(userData.fullName);
        $("#birthDate").text(userData.birthDate.slice(0, 10));
        $("#gender").text(userData.gender);
        $("#address").text(userData.address);
        $("#phone").text(userData.phone);
    } catch (error) {
        console.error('Error fetching user profile data:', error);
        alert(error.message);
    }
}

async function updateUserField(fieldId, newValue, token) {
    try {
        const requestBody = { [fieldId]: newValue };

        const response = await fetch(`${api}/api/account/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();

            if (errorData.errors) {
                for (const [field, messages] of Object.entries(errorData.errors)) {
                    console.error(`Validation error on ${field}: ${messages.join(', ')}`);
                }
            }

            throw new Error(`Failed to update user profile data: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error updating user profile data:', error);
        alert(error.message);
    }
}

function logout() {
    console.log("Logging out...");
    // localStorage.removeItem("user"); 
    // localStorage.removeItem("JWT"); 
    // window.location.href = '/login'; 
}

$(document).ready(function() {
    $('#logout-link').on('click', function(event) {
        console.log("Logging out...");
        logout();
    });
});
