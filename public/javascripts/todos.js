$(document).ready(function() {

    $('#createListBtn').click(function(e) {
        const listName = $('#listName').val();
        const backgroundColor = $('#backgroundColor').val();
        createList(listName, backgroundColor);
    });

    $('#showListBtn').click(function(e) {
        const listName = $('#listName').val();
        showToDoList(listName);
    });

    $('#editList').click(function(e) {
        redirectTo("protected/singletodo.html")
    });

    function showToDoList(listName) {
        sendXhrAndRunFunctionAsync("GET", appendToCurrentPath("todoList/" + listName), function(xmlhttp) {
            const response = JSON.parse(xmlhttp.responseText);
            $('#table tbody').remove();
            $('#table').append('<tbody></tbody>');
            $("#table").css("background-color", response.backgroundColor);
            for(const item in response.items)
             {
                $('#table tbody').append('<tr id="img' + response.items[item].itemId + '"><td>' + response.items[item].data +
                '</td><td><img id="' + response.items[item].itemId + '"></img></tr>');
             }
            $("td").addClass(response.backgroundColor + 'Bg');
        });
    }

    function createList(listName, backgroundColor) {
        sendXhrAndRunFunctionAsync("POST", appendToCurrentPath("todoList/createList/" + listName + "/" + backgroundColor), function(x) {
            alert("List Created!")
        });
    }

     $('body').on('click','img',function(e){
         const itemId = e.target.id;
         const listName = $('#listName').val();
         sendXhrAndRunFunctionAsync("DELETE", appendToCurrentPath("todoList/deleteItem/" + listName + "/" + itemId), function(x) {
            $('#img' + itemId).remove();
            alert("Item " + itemId + " has been deleted");
        });
     });
});