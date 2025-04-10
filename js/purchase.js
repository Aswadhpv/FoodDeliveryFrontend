import { api } from "./api.js";

export function SetupPurchase() {
    document.getElementById('order-form').addEventListener('submit', function(event) {
        event.preventDefault();
        placeOrder();
    });
}

function placeOrder() {
    const token = localStorage.getItem('JWT'); // Retrieve the JWT token from local storage
    const deliveryTime = document.getElementById('delivery-time').value;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    fetch(`${api}/api/order`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deliveryTime, dishes: cart })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Order placed successfully!");
            localStorage.removeItem("cart"); // Clear the cart
            window.location.href = '/orders.html'; // Redirect to orders page
        } else {
            alert("Failed to place order. Please try again.");
        }
    })
    .catch(error => {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again later.');
    });
}
