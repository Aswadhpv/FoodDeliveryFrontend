import { api } from "./api.js";

export function SetupItem() {
    let params = new URLSearchParams(window.location.search);
    let dishId = window.location.pathname.split("/")[2];

    LoadDishDetails(dishId);
    CheckUserCanRate(dishId);
}

function LoadDishDetails(dishId) {
    let url = `${api}/api/dish/${dishId}`;
    fetch(url)
        .then(response => response.json())
        .then(dish => {
            $("#dish-title").text(dish.name);
            $("#dish-img").attr("src", dish.image);
            $("#dish-description").text(dish.description);
            $("#dish-category").text(dish.category);

            let ratingElement = $("#dish-rating");
            setRating(ratingElement, dish.rating);

            $("#is-vegetarian").text(dish.vegetarian ? "Vegetarian" : "Not vegetarian");
        })
        .catch(err => {
            console.error('Error loading dish details:', err);
            PageLoader.loadPage("/not-found");
        });
}

function CheckUserCanRate(dishId) {
    let user = JSON.parse(localStorage.getItem("user"));
    if (user && user.auth) {
        let url = `${api}/api/dish/${dishId}/rating/check`;
        fetch(url)
            .then(response => response.json())
            .then(result => {
                if (result.canRate) {
                    $("#rating-section").removeClass("d-none");
                    SetupRatingSubmission(dishId);
                }
            })
            .catch(err => {
                console.error('Error checking if user can rate:', err);
            });
    }
}

function SetupRatingSubmission(dishId) {
    $("#submit-rating").on("click", function () {
        let rating = $("#rating-input").val();
        let url = `${api}/api/dish/${dishId}/rating`;
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify({ rating: rating })
        })
        .then(response => {
            if (response.ok) {
                alert("Rating submitted successfully!");
                LoadDishDetails(dishId); // Refresh dish details to show new rating
            } else {
                alert("Failed to submit rating");
            }
        })
        .catch(err => {
            console.error('Error submitting rating:', err);
        });
    });
}

function setRating(ratingElement, ratingValue) {
    const starsPercentage = (ratingValue / 5) * 100;
    ratingElement.html(`
        <div class="stars-outer">
            <div class="stars-inner" style="width:${starsPercentage}%"></div>
        </div>
    `);
}

document.addEventListener('DOMContentLoaded', SetupItem);
