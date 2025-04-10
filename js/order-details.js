import { api } from "./api.js";

export function SetupOrderDetails(orderId) {
    console.log('SetupOrderDetails called with orderId:', orderId); // Debug log
    LoadOrderDetails(orderId);
}

function LoadOrderDetails(orderId) {
    const token = localStorage.getItem('JWT');
    if (!token) {
        console.error('No JWT token found.');
        return;
    }

    let url = new URL(`${api}/api/order/${orderId}`);
    fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    })
    .then(order => {
        const container = document.getElementById('order-details-container');
        const template = document.getElementById('order-details-template').innerHTML;
        const orderElement = document.createElement('div');
        orderElement.innerHTML = template;
        orderElement.querySelector('.order-id').textContent = order.id;
        orderElement.querySelector('.order-status').textContent = order.status;
        const dishesList = orderElement.querySelector('.dishes-list');
        order.dishes.forEach(dish => {
            const listItem = document.createElement('li');
            listItem.textContent = dish.name;
            dishesList.appendChild(listItem);
        });
        container.appendChild(orderElement);
    })
    .catch(error => {
        console.error('Error loading order details:', error);
        // Handle error: Display error message or redirect to error page
    });
}
