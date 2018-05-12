$(document).ready(function() {

    $('#loginBtn').click(function(e) {
        const id = $('#id').val();
        const password = $('#password').val();
        sendXhrAndRunFunctionAsync("POST", appendToCurrentPath("login/") + id + '/' + password, function(xmlHttp){
            redirectTo("protected/worker.html");
        });
    });

    $('#signupBtn').click(function(e) {
        $('#loginDiv').remove();
        appendDepartmentsToSelectBox();
    });

    function appendDepartmentsToSelectBox() {
        sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("departments"), function(xmlHttp) {
            const response = JSON.parse(xmlHttp.responseText);
            const departments = Object.keys(response);
            let option = '';
            for(const i in departments) {
                option += '<option value="'+ departments[i] + '">' + departments[i] + '</option>';
            }
            $('#department').append(option);
            $('#registerDiv').css('visibility', 'visible');
        });
    }

    $('#registerBtn').click(function(e) {
        const firstName = $('#firstName').val();
        const lastName = $('#lastName').val();
        const id = $('#idRegistration').val();
        const password = $('#passwordRegistration').val();
        const repeatPass = $('#passwordRepeat').val();
        const department = $('#department').val();
        const isManager = $('#managerBox').is(':checked');
        if (repeatPass !== password) {
            alert("Password not repeated correctly");
        } else {
            const url = appendToCurrentPath("register/") + firstName + '/' + lastName + '/' + id + '/' + department + '/' + password + '/' + isManager;
            sendXhrAndRunFunctionAsync("POST", url, function(xmlHttp) {
                redirectTo("protected/worker.html");
            });
        }
     });
});

