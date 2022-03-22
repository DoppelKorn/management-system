window.addEventListener('DOMContentLoaded', function() {
    $("priority").oninput = showNewPriority;
    // Default Value für date Input auf heute setzen
    $("dueDate").value = new Date().toISOString().split('T')[0];
})

function createNewTodo() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());

    let newDescription = $('newTodoDescription').value;
    let newDueDate = $('dueDate').value;
    let newPriority = $('priority').value;
    let newTodoListsId = params.todo_lists_id;

    let data = {
        "description": newDescription,
        "dueDate": newDueDate,
        "priority": newPriority,
        "todoListsId": newTodoListsId,
    };

    let request = new XMLHttpRequest();
    request.open( "POST", `http://localhost:3000/todoInsert`, false); // false for synchronous request
    request.addEventListener('load', function(event) {
        if (request.status >= 200 && request.status < 300) {
            console.log("Insert Todo succesfull");
            window.opener.location.reload();
            window.close();
        } else {
            console.warn(request.statusText, request.responseText);
        }
    });
    request.send(JSON.stringify(data));
}

// Helpfunctions
function $(id) {
    return document.getElementById(id);
}

function closeWindow() {
    window.close();
}

function showNewPriority() {
    let priority = $("priority").value;
    let label = $("priorityLabel");
    label.innerText = `Priorität: ${priority}`;
}