import { api } from "./api.js";

export function SetupCart() {
    displayCartItems();

    // Setup checkout button handler
    $('#checkoutBtn').on('click', function() {
        showOrderModal();
    });
}

async function displayCartItems() {
    try {
        const token = localStorage.getItem('JWT'); // Retrieve the JWT token from local storage
        const response = await fetch(`${api}/api/basket`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Add the Authorization header
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch cart items:', response.status, response.statusText, errorText);
            throw new Error('Failed to fetch cart items.');
        }
        const cartItems = await response.json();
        console.log('Fetched cart items:', cartItems); // Log the fetched cart items
        renderCartItems(cartItems);
    } catch (error) {
        console.error('Error fetching cart items:', error);
        $("#cartItems").html('<p>Error fetching cart items. Please try again later.</p>');
    }
}

function renderCartItems(cartItems) {
    const cartList = $("#cartItems");
    cartList.empty();  // Clears existing items

    if (cartItems.length === 0) {
        cartList.html('<p>Your cart is empty.</p>');
        return;
    }

    let total = 0;
    cartItems.forEach(item => {
        total += item.price * item.amount;
        const cartItem = `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text">Price: ${item.price}₽</p>
                    <p class="card-text">Quantity: ${item.amount}</p>
                    <button class="btn btn-danger remove-cart-btn" data-id="${item.id}">Remove</button>
                    <button class="btn btn-warning reduce-cart-btn" data-id="${item.id}">Reduce Quantity</button>
                    <button class="btn btn-success add-cart-btn" data-id="${item.id}">Add More</button>
                </div>
            </div>
        `;
        cartList.append(cartItem);
    });

    $("#cart-total-price").text(`Total: ${total}₽`);
    attachEventHandlers();  // Reattach event handlers after updating the DOM
}

function attachEventHandlers() {
    $(".remove-cart-btn").off('click').on('click', function() {
        updateCart($(this).data('id'), false);
    });
    $(".reduce-cart-btn").off('click').on('click', function() {
        console.log('Reduce Quantity button clicked for item ID:', $(this).data('id'));
        updateCart($(this).data('id'), false, true);
    });
    $(".add-cart-btn").off('click').on('click', function() {
        updateCart($(this).data('id'), true);
    });
}

async function updateCart(dishId, increase, reduce = false) {
    const method = increase ? 'POST' : (reduce ? 'PATCH' : 'DELETE');
    console.log(`Method used: ${method}, Dish ID: ${dishId}, Increase: ${increase}, Reduce: ${reduce}`);
    const token = localStorage.getItem('JWT'); // Retrieve the JWT token from local storage
    try {
        const response = await fetch(`${api}/api/basket/dish/${dishId}`, {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Add the Authorization header
            }
        });
        console.log('Response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to ${increase ? 'add to' : (reduce ? 'reduce' : 'remove from')} cart:`, response.status, response.statusText, errorText);
            throw new Error(`Failed to ${increase ? 'add to' : (reduce ? 'reduce' : 'remove from')} cart.`);
        }
        // Check if the response body is empty
        const result = response.headers.get('Content-Length') === '0' ? {} : await response.json();
        console.log('Cart updated successfully:', result);
        displayCartItems();
        location.reload(); // Reload the page after updating the cart
    } catch (error) {
        console.error(`Error ${increase ? 'adding to' : (reduce ? 'reducing' : 'removing from')} cart:`, error);
    }
}

function showOrderModal() {
    const modal = $("#orderModal");
    modal.show();
    $("#orderForm").on('submit', function(event) {
        event.preventDefault();
        confirmOrder();
    });
    $(".close").on('click', function() {
        modal.hide();
    });
}

async function confirmOrder() {
    const deliveryTime = $("#deliveryTime").val();
    const deliveryAddress = $("#deliveryAddress").val();
    const orderDetails = {
        deliveryTime: deliveryTime,
        deliveryAddress: deliveryAddress
    };

    try {
        const token = localStorage.getItem('JWT');
        if (!token) {
            throw new Error('JWT token is missing. Please log in.');
        }

        const response = await fetch(`${api}/api/order`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderDetails)
        });

        // Log the response status for debugging
        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            throw new Error(errorData.message || '');
        }

        alert('Order confirmed successfully!');
        $("#orderModal").hide();
        localStorage.removeItem("cart");
        displayCartItems();
        window.location.href = '/order'; // Redirect to the order page
    } catch (error) {
        console.error('Error confirming order:', error.message);
        alert(`Order Confirmed! ${error.message}`);
    }
}


$(document).ready(function() {
    SetupCart();

    $('#goToMenuBtn').on('click', function() {
        window.location.href = '/menu';
    });

    $('#logout-link').on('click', function(event) {
        console.log("Logging out...");
        logout();
    });

    $("#cartItems").on('click', '.reduce-cart-btn', function() {
        console.log('Reduce Quantity button clicked for item ID:', $(this).data('id'));
        updateCart($(this).data('id'), false, true);
    });
});

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("JWT");
    window.location.href = '/login';
}
