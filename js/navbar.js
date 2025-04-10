import { Authorization } from "./authorization.js";
import { PageLoader } from './router.js';

export function InitNavbar(){
    Authorization();
    $("#navbar-container").load('/Common/navbar.html', function (data){
        SetNavLinksEventListeners();
        let user = JSON.parse(localStorage.getItem("user"));
        if(!user.auth){
            $("#profile-link").addClass("d-none");
            $("#logout-link").addClass("d-none");
            $("#login-link").removeClass("d-none");
            $("#register-link").removeClass("d-none");
            $("#orders-link").addClass("d-none");
            $("#cart-link").addClass("d-none");
        }
        else{
            $("#profile-link").removeClass("d-none");
            $("#logout-link").removeClass("d-none");
            $("#login-link").addClass("d-none");
            $("#register-link").addClass("d-none");
            $("#orders-link").removeClass("d-none");
            $("#cart-link").removeClass("d-none");
        }
    });
}

function SetNavLinksEventListeners(){
    var links = $("a");
    for (let link of links){
        $(link).click(function (e) {
            e.preventDefault();
            var url = $(e.target).attr("href");
            var fullUrl = new URL(location.origin + url);
            PageLoader.loadPage(fullUrl.pathname, fullUrl.search)
        });
    }
}
