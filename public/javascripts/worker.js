$(document).ready(function() {

    showAnimalsButtonIfManager();
    $('#editProfileBtn').click(function(e) {
        redirectTo("protected/profile.html");
    });

    $('#listAllAnimalsBtn').click(function(e) {
        appendAnimalsToList();
    });

    $('#deleteUserBtn').click(function(e) {
        deleteUser();
    });

    $('#todoListBtn').click(function(e) {
        redirectTo("protected/todos.html");
    });

    $('#departmentBtn').click(function(e) {
        redirectTo("protected/department.html")
    });

    function deleteUser(){
        let conf = confirm("Are you sure you would like to delete this user?");
        if (conf === true) {
            sendXhrAndRunFunctionAsync("DELETE", appendToCurrentPath("deleteuser"), function(x) {
                redirectTo("public/hello.html")
            });
        }
    }

    function appendAnimalsToList() {
        sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("departments/allAnimals"), function(xmlhttp) {
            $('#animalListDiv li').remove();
            const response = JSON.parse(xmlhttp.responseText);
            const animals = Object.keys(response);
            let li;
            animals.forEach(function (animal) {
                li = document.createElement("li");
                li.textContent = response[animal]['name'];
                $('#animalList').append(li);
            });
            $('#animalListDiv').css('visibility', 'visible');
        });
    }

    function showAnimalsButtonIfManager() {
        const shouldAlert = false;
        sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("IsUserManager"), function(x) {
            $('#listAllAnimalsBtn').css('visibility', 'visible');
        }, undefined, shouldAlert);
    }
});