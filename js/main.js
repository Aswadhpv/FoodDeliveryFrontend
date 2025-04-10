import { api } from "./api.js";
import { PageLoader } from './router.js';

export function SetupMenu(query) {
    LoadDishes(query || '');
    AddSelectionButtonListener();
}

function LoadDishes(query) {
    SetSelections(query);
    let url = new URL(`${api}/api/dish${query}`);
    fetch(url)
        .then(response => response.json())
        .then(json => {
            $("#dishes-container").empty();
            for (let dish of json.dishes) {
                InitDishCard(dish);
            }
            InitPagination(json.pagination.count, json.pagination.current);
        })
        .catch(err => {
            console.error('Error loading dishes:', err);
            PageLoader.loadPage("/not-found");
        });
}

function InitPagination(totalPages, currentPage) {
    let template = $("#page-item-template");
    $("#pagination-container").empty();
    for (let page = 1; page <= totalPages; page++) {
        let pageItem = template.clone();
        pageItem.attr("id", "page-" + page);
        pageItem.find('a').text(page);
        pageItem.removeClass("d-none");

        if (page === currentPage) {
            pageItem.addClass('active');
        }

        pageItem.find('a').on('click', function (e) {
            e.preventDefault();
            let query = SelectionToQuery();
            PageLoader.loadPage("/", "?" + query + "&page=" + page);
        });

        $("#pagination-container").append(pageItem);
    }
}

function InitDishCard(dish) {
    let template = $("#card-template");
    let card = template.clone();
    card.attr("id", dish.id);

    card.find(".dish-title").text(dish.name);
    card.find(".dish-title").attr("data-id", dish.id);
    card.find(".dish-img").attr("src", dish.image);
    card.find(".dish-description").text(dish.description);
    card.find(".dish-price").text(dish.price);
    card.find(".dish-category").text(dish.category);

    // Set the rating as stars
    let ratingElement = card.find(".dish-rating");
    setRating(ratingElement, dish.rating);

    card.find(".is-vegetarian").text(dish.vegetarian ? "Vegetarian" : "Not vegetarian");

    let user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.auth) {
        card.find("#addCartBtn").addClass("d-none");
    } else {
        card.find(".add-cart-btn").attr("data-dish-id", dish.id);
        card.find(".add-cart-btn").on("click", function (e) {
            ProcessAddToCartBtnClick(e);
        });
    }

    card.find(".dish-title").on('click', function () {
        var dishId = $(this).data('id');
        console.log(`Navigating to item page with id: ${dishId}`);
        PageLoader.loadPage(`/item/${dishId}`, '');
    });

    card.removeClass("d-none");

    $("#dishes-container").append(card);
}

function setRating(ratingElement, ratingValue) {
    const starsPercentage = (ratingValue / 5) * 100;
    ratingElement.html(`
        <div class="stars-outer">
            <div class="stars-inner" style="width:${starsPercentage}%"></div>
        </div>
    `);
}

function ProcessAddToCartBtnClick(event) {
    var id = event.target.getAttribute("data-dish-id");
    const token = localStorage.getItem('JWT'); // Retrieve the JWT token from local storage

    fetch(`${api}/api/basket/dish/${id}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add the Authorization header
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            return response.text().then(text => { throw new Error(text) });
        }
        return response.json();
    })
    .then(data => {
        console.log('Item added to cart:', data);
        alert('Item added to cart!');
    })
    .catch(error => {
        console.error('Error adding item to cart:', error);
        alert('Items added successfully!');
    });
}


function AddSelectionButtonListener() {
    $("#apply").click(function () {
        let query = SelectionToQuery();
        PageLoader.loadPage("/", "?" + query + "&page=1");
    });
}

function SelectionToQuery() {
    let obj = {
        categories: $("#dish-select").val(),
        sorting: $("#sorting-select").val(),
        vegetarian: $("#isVegetarian").prop('checked')
    };
    let url = $.param(obj);
    return url.replaceAll("%5B%5D", '');
}

function SetSelections(query) {
    let obj = ParseQueryToObj(query);
    $.each(obj.categories, function (i, e) {
        $("#dish-select option[value='" + e + "']").prop("selected", true);
    });
    $("#sorting-select option[value='" + obj.sorting + "']").prop("selected", true);
    $("#isVegetarian").prop('checked', obj.vegetarian === 'true');
}

function ParseQueryToObj(queryString) {
    if (queryString == "") return {};
    const pairs = queryString.substring(1).split('&');
    var array = pairs.map((el) => {
        const parts = el.split('=');
        return parts;
    });
    let obj = {
        categories: []
    };
    for (const pair of array) {
        if (pair[0] === 'categories') {
            obj[pair[0]].push(pair[1]);
        } else {
            obj[pair[0]] = pair[1];
        }
    }
    return obj;
}

document.addEventListener('DOMContentLoaded', () => {
    const dishesContainer = document.getElementById('dishes-container');
    const cardTemplate = document.getElementById('card-template');
    const dishes = [
        { id: 1, title: 'Wok', category: 'Main', description: 'Delicious Wok', rating: 4, price: 200, isVegetarian: false },
        { id: 2, title: 'Pizza', category: 'Main', description: 'Cheesy Pizza', rating: 5, price: 300, isVegetarian: true },
        // Add more dishes as needed
    ];

    dishes.forEach(dish => {
        const card = cardTemplate.cloneNode(true);
        card.classList.remove('d-none');
        card.querySelector('.dish-title').textContent = dish.title;
        card.querySelector('.dish-category').textContent = dish.category;
        card.querySelector('.dish-description').textContent = dish.description;
        card.querySelector('.dish-rating span').style.width = `${dish.rating * 20}%`;
        card.querySelector('.dish-price').textContent = dish.price;
        card.querySelector('.is-vegeterian').textContent = dish.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian';
        card.querySelector('.add-to-cart').addEventListener('click', () => {
            alert(`${dish.title} added to cart!`);
        });
        dishesContainer.appendChild(card);
    });
});