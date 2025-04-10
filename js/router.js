import { SetupOrders } from "./orders.js";
import { SetupOrderDetails } from "./order-details.js";
import { SetupPurchase } from "./purchase.js";
import { SetupProfile } from "./profile.js";
import { SetupItem } from "./item.js";
import { SetupMenu } from "./main.js";
import { SetupLogin } from "./login.js";
import { SetupRegister } from "./register.js";
import { InitNavbar } from "./navbar.js";
import { SetupCart } from "./cart.js";

export class PageLoader {
    static endpoints = {
        orders: SetupOrders,
        orderdetails: SetupOrderDetails,
        purchase: SetupPurchase,
        profile: SetupProfile,
        item: SetupItem,
        login: SetupLogin,
        register: SetupRegister,
        cart: SetupCart
    };

    static async loadPage(url, query, isBack = false, isFirstPage = false) {
        console.log("Page loader works now!");
        InitNavbar();
        $("main").empty();
        if (!isBack && !isFirstPage) {
            history.pushState(null, "", url + query);
        }
        let address = url.substring(1).split("/");
        let firstElement = address[0].toLowerCase();
        console.log("Loading page for:", firstElement); // Log the page being loaded
        if (firstElement === "") {
            $("main").load("html/main.html", function () {
                SetupMenu(query);
            });
        } else if (firstElement in this.endpoints) {
            $("main").load(`/html/${firstElement}.html`, function() {
                if (firstElement === "orderdetails") {
                    // Extract orderId from query string
                    const urlParams = new URLSearchParams(query);
                    const orderId = urlParams.get('id');
                    if (orderId) {
                        SetupOrderDetails(orderId); // Pass orderId to SetupOrderDetails function
                    } else {
                        console.error('Order ID not found in URL.');
                        $("main").load("/html/notFound.html");
                    }
                } else {
                    this.endpoints[firstElement]();
                }
            }.bind(this));
        } else {
            console.error("Page not found for:", firstElement); // Log when page is not found
            $("main").load("/html/notFound.html");
        }
    }
}

// Example usage: add event listener to handle browser navigation (back/forward)
window.addEventListener('popstate', () => {
    const url = window.location.pathname;
    const query = window.location.search;
    PageLoader.loadPage(url, query, true);
});

// Initial load
window.addEventListener('load', () => {
    const url = window.location.pathname;
    const query = window.location.search;
    PageLoader.loadPage(url, query, false, true);
});
