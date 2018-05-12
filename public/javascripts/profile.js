$(document).ready(function() {
   appendDepartmentsToSelectBox();


    $('#changePassBtn').click(function(e) {
        const oldPassword = $('#oldPassword').val();
        const newRepeatPassword = $('#newRepeatPassword').val();
        const newPassword = $('#newPassword').val();
        if (newPassword === newRepeatPassword) {
            changePassword(oldPassword, newPassword);
        } else {
            alert("New passwords do not match!");
        }
    });


    $('#changeDepartmentBtn').click(function(e) {
        const department = $('#department').val();
        changeDepartment(department);
    });

    function changeDepartment(department) {
        sendXhrAndRunFunctionAsync("POST", appendToCurrentPath("profile/changeDepartment/" + department), function(x) {
            alert("Department Changed");
        });
    }

    function changePassword(oldPassword, newPassword) {
        sendXhrAndRunFunctionAsync("POST", appendToCurrentPath("profile/changePass/" + oldPassword + "/" + newPassword), function(x) {
            alert("Password Changed");
        });
    }

    function appendDepartmentsToSelectBox() {
        sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("departments"), function(xmlhttp) {
            let option = '';
            const response = JSON.parse(xmlhttp.responseText);
            const departments = Object.keys(response);
            for(const i in departments) {
                option += '<option value="'+ departments[i] + '">' + departments[i] + '</option>';
            }
            $('#department').append(option);
            $('#registerDiv').css('visibility', 'visible');
        });
    }
});