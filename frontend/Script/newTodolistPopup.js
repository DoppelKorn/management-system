function closeWindow() {
    window.close();
}
function createNewList() {
    let newListName = $('newListName').value;

    let data = {
        "name": newListName,
    };

    let request = new XMLHttpRequest();
    request.open( "POST", `http://localhost:3000/todoListInsert`, false); // false for synchronous request
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