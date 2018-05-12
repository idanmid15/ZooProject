$(document).ready(function() {

    $('#addItemBtn').click(function(e) {
        const chore = $('#todoItemText').val();
        const listName = $('#listName').val();
        addToDoItem(chore, listName);
    });

    $('#deleteListBtn').click(function(e) {
        const listName = $('#listName').val();
        deleteList(listName);
    });


    function deleteList(listName) {
        sendXhrAndRunFunctionAsync("DELETE", appendToCurrentPath("todoList/deleteList/" + listName), function(x) {
            alert(listName + " has been deleted");
        });
    }

    function addToDoItem(item, listName) {
        let randomNumber = Math.random().toString();
        randomNumber = randomNumber.substring(2, randomNumber.length);
        sendXhrAndRunFunctionAsync("POST", appendToCurrentPath("todoList/addItem/" + listName), function(x) {
            alert("Chore Added");
        }, JSON.stringify({itemId:randomNumber, data:item}));
    }
});