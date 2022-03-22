window.addEventListener('DOMContentLoaded', function () {
    let request = new XMLHttpRequest();
    request.open("GET", "http://localhost:3000/todoListsLoad", false); // false for synchronous request
    request.addEventListener('load', function (event) {
        if (request.status >= 200 && request.status < 300) {
            console.log("Loaded Entries");
            let todoLists = JSON.parse(request.responseText);
            console.log(todoLists);
            let todoListsDiv = $('todoListsDiv');
            if (todoLists.length > 0) {
                let todoListsSelect = document.createElement("select");
                todoListsSelect.id = "todoListsSelect";
                todoListsSelect.addEventListener("change", loadTodos);
                todoListsSelect.className = "form-control";
                todoLists.forEach(function (todoList) {
                    let todoListsOption = document.createElement("option");
                    todoListsOption.value = todoList.id;
                    todoListsOption.innerText = todoList.name;
                    todoListsSelect.appendChild(todoListsOption);
                });

                let todoListDeleteButtonDiv = document.createElement('div');
                todoListDeleteButtonDiv.className = "input-group-append";
                let todoListDeleteButton = document.createElement('button');
                todoListDeleteButton.className = "btn btn-danger";
                todoListDeleteButton.type = "button";
                todoListDeleteButton.innerText = 'Liste löschen';
                todoListDeleteButton.addEventListener('click', function () {
                    deleteTodoList();
                })
                todoListDeleteButtonDiv.appendChild(todoListDeleteButton);

                todoListsDiv.appendChild(todoListsSelect);
                todoListsDiv.appendChild(todoListDeleteButtonDiv);
                loadTodos();
            } else {
                let noListsFoundInfo = document.createElement("h4");
                noListsFoundInfo.innerText = "Keine To-do-Listen gefunden!"
                todoListsDiv.appendChild(noListsFoundInfo);
            }
        } else {
            console.warn(request.statusText, request.responseText);
        }
    });
    request.send(null);
})

function loadTodos() {
    let todoListId = $("todoListsSelect").value;

    let request = new XMLHttpRequest();
    request.open("GET", `http://localhost:3000/todosLoad/${todoListId}`, false); // false for synchronous request
    request.addEventListener('load', function (event) {
        if (request.status >= 200 && request.status < 300) {
            console.log("Loaded Entries");
            let todos = JSON.parse(request.responseText);
            console.log(todos);
            let todosTableBody = $('todosTableBody');
            todosTableBody.innerHTML = '';
            if (todos.length > 0) {
                todos.forEach(function (todo) {
                    let todoTr = document.createElement("tr");
                    todoTr.id = `todoId_${todo.id}`

                    let checkBoxTd = document.createElement("td");
                    let checkBoxDiv = document.createElement("div");
                    checkBoxDiv.className = "form-check";
                    let checkBoxInput = document.createElement("input");
                    checkBoxInput.type = "checkbox";
                    checkBoxInput.className = "form-check-input"
                    if (todo.active === 0) checkBoxInput.checked = true
                    checkBoxInput.addEventListener("change", function () {
                        console.log(todo.duedate);
                        if (this.checked === true) {
                            updateTodo(todo.id, todo.description, todo.duedate, todo.priority, 0)
                        } else {
                            updateTodo(todo.id, todo.description, todo.duedate, todo.priority, 1)
                        }
                    })
                    checkBoxDiv.appendChild(checkBoxInput);
                    checkBoxTd.appendChild(checkBoxDiv);

                    let descriptionTd = document.createElement("td");
                    descriptionTd.innerText = todo.description;

                    let dueDateTd = document.createElement("td");
                    let dueDate = new Date(todo.duedate);
                    dueDateTd.innerText = dueDate.toLocaleDateString();

                    let priorityTd = document.createElement("td");
                    for (let i = 1; i < 6; i++) {
                        if (i <= todo.priority) {
                            priorityTd.innerHTML += '&#9726;'
                        } else {
                            priorityTd.innerHTML += '&#9725;'
                        }
                    }

                    let editableButtonTd = document.createElement('td');
                    let editableButton = document.createElement('button');
                    editableButton.type = "button";
                    editableButton.className = "btn btn-sm btn-secondary";
                    editableButton.innerText = "Bearbeiten";
                    editableButton.addEventListener("click", function () {
                        makeEditable(todo);
                    });
                    editableButtonTd.appendChild(editableButton);

                    todoTr.appendChild(checkBoxTd);
                    todoTr.appendChild(descriptionTd);
                    todoTr.appendChild(dueDateTd);
                    todoTr.appendChild(priorityTd);
                    todoTr.appendChild(editableButtonTd);

                    todosTableBody.appendChild(todoTr);
                });
            }
        } else {
            console.warn(request.statusText, request.responseText);
        }
    });
    request.send(null);
}

function makeEditable(todo) {
    let todoTr = $(`todoId_${todo.id}`);
    todoTr.innerHTML = "";

    let checkBoxTd = document.createElement("td");
    let checkBoxDiv = document.createElement("div");
    checkBoxDiv.className = "form-check";
    let checkBoxInput = document.createElement("input");
    checkBoxInput.type = "checkbox";
    checkBoxInput.className = "form-check-input"
    checkBoxDiv.appendChild(checkBoxInput);
    checkBoxTd.appendChild(checkBoxDiv);

    let descriptionTd = document.createElement("td");
    let descriptionInput = document.createElement("input");
    descriptionInput.type = "text";
    descriptionInput.value = todo.description;
    descriptionTd.appendChild(descriptionInput);

    let dueDateTd = document.createElement("td");
    let dueDateInput = document.createElement("input");
    dueDateInput.type = "date";
    let dueDate = new Date(todo.duedate);
    let tzoffset = new Date().getTimezoneOffset() * 60000;
    let localISOTime = new Date(dueDate.getTime() - tzoffset).toISOString().split('T')[0]
    dueDateInput.value = localISOTime;
    dueDateTd.appendChild(dueDateInput);

    let priorityTd = document.createElement("td");
    let priorityInput = document.createElement("input");
    priorityInput.type = "number";
    priorityInput.min = "1";
    priorityInput.max = "5";
    priorityInput.value = todo.priority;
    priorityTd.appendChild(priorityInput);

    let buttonsTd = document.createElement('td');
    let btnGroupDiv = document.createElement('div');
    btnGroupDiv.className = 'btn-group';


    let saveButton = document.createElement('button');
    saveButton.type = "button";
    saveButton.className = "btn btn-sm btn-success";
    saveButton.innerText = "Speichern";
    saveButton.addEventListener("click", function () {
        updateTodo(todo.id, descriptionInput.value, dueDateInput.value, priorityInput.value, todo.active);
    });

    let deleteButton = document.createElement('button');
    deleteButton.type = "button";
    deleteButton.className = "btn btn-sm btn-danger";
    deleteButton.innerText = "Löschen";
    deleteButton.addEventListener("click", function () {
        deleteTodo(todo.id);
    });

    btnGroupDiv.appendChild(saveButton);
    btnGroupDiv.appendChild(deleteButton);
    buttonsTd.appendChild(btnGroupDiv);

    todoTr.appendChild(checkBoxTd);
    todoTr.appendChild(descriptionTd);
    todoTr.appendChild(dueDateTd);
    todoTr.appendChild(priorityTd);
    todoTr.appendChild(buttonsTd);
}

function updateTodo(todoId, todoDescription, todoDueDate, todoPriority, todoActive) {
    let data = {
        "description": todoDescription,
        "dueDate": todoDueDate,
        "priority": todoPriority,
        "active": todoActive,
        "id": todoId
    };

    let request = new XMLHttpRequest();
    request.open("POST", `http://localhost:3000/todoUpdate`, false); // false for synchronous request
    request.addEventListener('load', function (event) {
        if (request.status >= 200 && request.status < 300) {
            console.log("Update Todo succesfull");
            loadTodos();
        } else {
            console.warn(request.statusText, request.responseText);
        }
    });
    request.send(JSON.stringify(data));
}

function deleteTodoList() {
    let todoListId = $('todoListsSelect').value;

    let request = new XMLHttpRequest();
    request.open("POST", `http://localhost:3000/todoListDelete/${todoListId}`, false); // false for synchronous request
    request.addEventListener('load', function (event) {
        if (request.status >= 200 && request.status < 300) {
            console.log("Delete TodoList succesfull");
            location.reload();
        } else {
            console.warn(request.statusText, request.responseText);
        }
    });
    request.send();
}

function deleteTodo(todoId) {
    let request = new XMLHttpRequest();
    request.open("POST", `http://localhost:3000/todoDelete/${todoId}`, false); // false for synchronous request
    request.addEventListener('load', function (event) {
        if (request.status >= 200 && request.status < 300) {
            console.log("Delete Todo succesfull");
            loadTodos();
        } else {
            console.warn(request.statusText, request.responseText);
        }
    });
    request.send();
}

function oeffnePopup(url) {
    let popupWidth = screen.width / 4;
    let popupHeight = screen.height / 2;

    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;

    const width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
    const height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

    const systemZoom = width / window.screen.availWidth;
    const left = (width - popupWidth) / 2 / systemZoom + dualScreenLeft
    const top = (height - popupHeight) / 2 / systemZoom + dualScreenTop

    if (url === 'newTodoPopup.html') {
        url += `?todo_lists_id=${$("todoListsSelect").value}`
    }

    let popup = window.open(url, "popup", `width=${popupWidth},height=${popupHeight},top=${top},left=${left},status=no,scrollbars=no,resizable=no`);
    popup.focus();
}

// Helpfunctions
function $(id) {
    return document.getElementById(id);
}