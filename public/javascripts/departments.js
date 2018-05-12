$(document).ready(function() {
    var globalUsers;
    labelDepartmentName();
    setTimeout(appendSharedDepartmentToSelectbox,250);
    setTimeout(getUsers, 500);
    setTimeout(appendUserSelectbox, 750);

    $('#searchBtn').click(function(e) {
        var item = $('#searchItem').val();
        var searchType = $('#searchType').val() === 'by name'? 'searchAnimal' : 'searchAttribute';
        var userDepartment = $('#department').val();
        if ($("#department option:selected").html().includes("view only")) {
            var notRemovable = true;
        }

        sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("departments/" + userDepartment + "/" + searchType + "/" + item), function(xmlhttp) {
            var response = JSON.parse(xmlhttp.responseText);
            appendResultToTable(response, notRemovable);
        });
    });

    $('#addBtn').click(function(e) {
        redirectTo("protected/animal.html");
    });

    $('#showBtn').click(function(e) {
        var depratment = $('#department').val();

        if ($("#department option:selected").html().includes("view only")) {
            var notRemovable = true;
        }

        sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("departments/" + depratment + "/allAnimals"), function(xmlhttp) {
            var response = JSON.parse(xmlhttp.responseText);
            appendResultToTable(response, notRemovable);
        });
    });

    $('#shareBtn').click(function(e) {
        var user = $('#selectUser').val();
        var depratment = $('#department').val();

        sendXhrAndRunFunctionAsync("POST", appendToCurrentPath("departments/shareDepartments/" + user + "/" + depratment), function(xmlhttp) {

            alert("department shared");
            $('#selectUser').empty();
            getUsers();
            setTimeout(appendUserSelectbox, 1000);
        });
    });

   $('#unshareBtn').click(function(e) {
        var user = $('#selectUser').val();
        var depratment = $('#department').val();

        sendXhrAndRunFunctionAsync("DELETE", appendToCurrentPath("departments/shareDepartments/" + user + "/" + depratment), function(xmlhttp) {

            alert("department unshared");
            $('#selectUser').empty();
            getUsers();
            setTimeout(appendUserSelectbox, 1000);
        });
    });

    $('body').on('click','img',function(e){
        var itemName = e.target.id;
        var depratment = $('#department').val();

        sendXhrAndRunFunctionAsync("DELETE", appendToCurrentPath("departments/" + depratment + "/" + itemName), function(x) {
            $('tr[id=img' + itemName + ']').remove();
            alert("Item " + itemName + " has been deleted");
        });
    });

    $('#selectUser').change(function (e) {
        var itemSelect =  $(this).find(":selected").text();

        if (itemSelect.includes('shared')) {
            $('#shareBtn').hide();
            $('#unshareBtn').show();
        } else if (itemSelect != '') {
            $('#shareBtn').show();
            $('#unshareBtn').hide();
        }
    });

    $('#deleteBtn').on('click',function(e){
        var depratment = $('#departmentType').text().replace(/["\""]+/g, '');

        if (confirm("Are you sure you want to delete your department?") == true) {
             sendXhrAndRunFunctionAsync("DELETE", appendToCurrentPath("departments/" + depratment), function(xmlhttp) {
                alert("department deleted");
                $('#showBtn').click();
            });
        };
    });

});

function labelDepartmentName() {
    sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("profile/department"), function(xmlhttp) {
        var response = JSON.parse(xmlhttp.responseText);
        var option = '<option value="'+ response + '">' + response + '</option>';
        $('#department').append(option);
        $('#departmentType').text(xmlhttp.responseText)});
}

function getUsers () {
    sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("users"), function(xmlhttp) {
        globalUsers = JSON.parse(xmlhttp.responseText);

        if (globalUsers.length > 0) {
            $('#selectUser').show();
            $('#lblNoUsersshare').hide();
        } else {
            $('#selectUser').hide();
            $('#lblNoUsersshare').show();
        }
        $('#unshareBtn').hide();
        $('#shareBtn').hide();
        });
};

function appendUserSelectbox() {
    sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("departments/sharedUsers"), function(xmlhttp) {
        var option = '';
        var response = JSON.parse(xmlhttp.responseText);

        for(var i in globalUsers) {
            if (response.indexOf(globalUsers[i]) === -1) {
                option += '<option value="'+ globalUsers[i] + '">' + globalUsers[i] + '</option>';
            } else {
                option = '<option value="'+ globalUsers[i] + '">' + globalUsers[i] + ' - shared </option>';
                break;
            }
        }

        $('#selectUser').append(option);
        $('#selectUser').trigger("change");
    });
};

//shared departments
function appendSharedDepartmentToSelectbox() {
    sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("departments/shareDepartments"), function(xmlhttp) {
        var option = '';
        var response = JSON.parse(xmlhttp.responseText);

        for(var i in response) {
            option += '<option value="'+ response[i] + '">' + response[i] + ' - view only </option>';
        }
        $('#department').append(option);
    });
};

function appendResultToTable(response, notRemovable) {
   $('#table tbody').remove();
   $('#table').append('<tbody></tbody>');
   var hide = '';
   if (notRemovable) {
        hide = 'hidden';
   }
   if (response.hasOwnProperty('name')) {
        $('#table tbody').append('<tr id="img' + response.name + '"><td>' + response.name + '</td><td>' + response.species +
        '</td><td>' + response.gender + '</td><td><img id=' + response.name + ' class=' +
        hide + '></img></td></tr>');
   } else {
        for(var item in response)
           {
            $('#table tbody').append('<tr id="img' + response[item].name + '"><td>' + response[item].name + '</td><td>' + response[item].species +
            '</td><td>' + response[item].gender + '</td><td><img id=' + response[item].name + ' class=' +
            hide + '></img></td></tr>');
           }
   }
}