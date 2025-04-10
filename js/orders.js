import { api } from "./api.js";
import { PageLoader } from './router.js';

export function SetupOrders() {
    LoadOrders();
}

function LoadOrders() {
    const token = localStorage.getItem('JWT'); // Retrieve the JWT token from local storage
    let url = new URL(`${api}/api/order`);
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(orders => {
        const container = document.getElementById('orders-container');
        const template = document.getElementById('order-template').innerHTML;
        container.innerHTML = '';
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.innerHTML = template;
            orderElement.querySelector('.order-id').textContent = order.id;
            orderElement.querySelector('.order-status').textContent = order.status;
            if (order.status === "In Process") {
                const confirmButton = orderElement.querySelector('.confirm-delivery-btn');
                confirmButton.classList.remove('d-none');
                confirmButton.addEventListener('click', () => confirmDelivery(order.id));
            }
            orderElement.querySelector('.order-details-link').addEventListener('click', (e) => {
                e.preventDefault();
                PageLoader.loadPage(`/order-details.html?id=${order.id}`);
            });
            container.appendChild(orderElement);
        });
    })
    .catch(err => {
        console.error('Error loading orders:', err);
        // Handle error: Display error message or redirect to error page
    });
}

function confirmDelivery(orderId) {
    const token = localStorage.getItem('JWT'); // Retrieve the JWT token from local storage
    fetch(`${api}/api/order/${orderId}/status`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert("Order delivery confirmed!");
            LoadOrders(); // Reload orders
        } else {
            alert("Failed to confirm delivery.");
        }
    })
    .catch(error => {
        console.error('Error confirming delivery:', error);
        alert('Failed to confirm delivery. Please try again.');
    });
}
