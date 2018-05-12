$(document).ready(function() {
     var userDepartment;
     setDepartmentName();

     $('#addBtn').click(function(e) {
        var animalName = $('#name').val();
        var gender = $('#gender').val();
        var species = $('#species').val();

        if (animalName) {
            var animal = {
                        'name' : animalName,
                        'gender' : gender,
                        'species' : species
            };
            sendXhrAndRunFunctionAsync("POST", appendToCurrentPath("animal/addAnimal"), function(xmlhttp) {
                alert("animal added");
            }, JSON.stringify(animal), true);
        } else {
            alert("please insert a name");
        }
     });

    function setDepartmentName() {
        sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("profile/department"), function(xmlhttp) {
            userDepartment = JSON.parse(xmlhttp.responseText);
        });
    }
});
