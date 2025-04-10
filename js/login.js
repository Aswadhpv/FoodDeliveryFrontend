import { api } from "./api.js";

export function SetupLogin(){
    $("#form-login").submit(function (e){
        let login = $("#inputLogin").val();
        let password = $("#inputPassword").val();

        let userData = {
            email: login,
            password : password
        }

        PostLoginRequest(userData);
        e.preventDefault();
    });
    $("#btn-register").click(function() {
        location.pathname = "/register";
    });
}

function PostLoginRequest(userData){
    fetch(`${api}/api/account/login`,{
        method: 'POST',
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(userData)
    }).then(response => {
        if(response.ok){
            return response.json();
        }
        $("#error").removeClass("d-none");
    }).then(json => {
        console.log(json);
        localStorage.setItem("JWT", json.token);
        $("#error").addClass("d-none");
        location.pathname = "/Profile";
    })
    .catch(err => {
        localStorage.removeItem("JWT");
        $("#error").removeClass("d-none");
    })
}