function createTodo(e) {
    e.preventDefault();
    let url = window.location.href.split('/');
    const list_id = Number(url[url.length - 1]);
    const descInput = document.querySelector('#todos-description');
    const description = descInput.value;
    // Clear user input on submit
    descInput.value = '';
    fetch(`/lists/${list_id}/todos/create`, {
        method: 'POST',
        body: JSON.stringify({
            'description': description,
            'list_id': list_id
        }),
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(response => response.json())
        .then(data => {
            console.log("SUCCESS:", data);
            renderNewTodo(data);
        })
        .catch((error) => {
            console.log("ERROR:", error);
            // Show errors
            $('#errorModal').modal('show');
        })

}

function deleteTodo(e) {
    console.log('Event:', e)
    const todoID = e.currentTarget.dataset.id
    fetch(`/todos/${todoID}/delete`, {method: 'DELETE'})
    .then(response => response.json())
    .then(data => {
        console.log("SUCCESS:", data);
        document.querySelector(`#todos [id="${todoID}"]`).remove();
    })
    .catch((error) => {
        console.log("ERROR:", error);
        $('#errorModal').modal('show');
    })
}

function completeTodo(e) {
    console.log('Event:', e);
    fetch(`/todos/${e.target.dataset.id}/mark-completed`, {
        method: 'POST',
        body: JSON.stringify({
            'completed': e.target.checked
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("SUCCESS:", data);
        const checkbox = document.querySelector(`#lists [id='${data.list_id}'] input`);
        if (data.are_all_completed == true) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    })
    .catch((error) => {
        console.log("ERROR:", error);
        $('#errorModal').modal('show');
    })

}

function renderNewTodo(data) {
    // Add a new to do record
    const li = `<li class="list-group-item bg-transparent" id="${data.id}">
        <input class="mr-2" data-id="${data.id}" type="checkbox" onchange="completeTodo(event)"/>
        ${data.description}
        <button type="button" class="close text-red" aria-label="Close" id="todo-delete" data-id="${data.id}" onclick="deleteTodo(event)">
            <span aria-hidden="true">&cross;</span>
        </button>
    </li>`
    document.querySelector("#todos").innerHTML += li;
}

function createList(e) {
    e.preventDefault();
    const input = document.querySelector('#list-description');
    const name = input.value;
    // Clear user input on submit
    input.value = '';
    fetch('/lists/create', {
        method: 'POST',
        body: JSON.stringify({
            'name': name
        }),
        headers: {
            'Content-Type': 'application/json'
        }
        })
        .then(response => response.json())
        .then(data => {
            console.log("SUCCESS:", data);
            renderNewList(data);
        })
        .catch((error) => {
            console.log("ERROR:", error);
            // Show errors
            $('#errorModal').modal('show');
        })

}

function deleteList(e) {
    console.log('Event:', e)
    const todoID = e.currentTarget.dataset.id
    fetch(`/lists/${todoID}/delete`, {method: 'DELETE'})
    .then(response => response.json())
    .then(data => {
        console.log("SUCCESS:", data);
        document.querySelector(`#lists [id="${todoID}"]`).remove();
        window.location = "/";
    })
    .catch((error) => {
        console.log("ERROR:", error);
        $('#errorModal').modal('show');
    })
}

function completeList(e) {
    console.log('Event:', e);
    const list_id = e.target.dataset.id;
    fetch(`/lists/${list_id}/mark-completed`, {
        method: 'POST',
        body: JSON.stringify({
            'completed': e.target.checked
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("SUCCESS:", data);
        // SET/UNSET all todos
        if (window.location.href.includes(`lists/${list_id}`)) {
            for (let todo_id of data.todos) {
                const checkbox = document.querySelector(`#todos li[id='${todo_id}'] input`);
                if (data.completed == true) {
                    checkbox.checked = true;
                } else {
                    checkbox.checked = false;
                }
            }
        }
    })
    .catch((error) => {
        console.log("ERROR:", error);
        $('#errorModal').modal('show');
    })

}

function renderNewList(data) {
    // Add a new to do record
    const li = `<li class="list-group-item bg-transparent" id="${data.id}">
        <input class="mr-2" data-id="${data.id}" type="checkbox" onchange="completeList(event)"/>
        <a class="text-dark text-decoration-none hover_blue" href="/lists/${data.id}">${data.name}</a>
        <button type="button" class="close text-red" aria-label="Close" id="list-delete" data-id="${data.id}" onclick="deleteList(event)">
            <span aria-hidden="true">&cross;</span>
        </button>
    </li>`
    document.querySelector("#lists").innerHTML += li;
    // Redirect to the new list
    window.location = `/lists/${data.id}`;
}

document.querySelector('#todos-form').addEventListener('submit', (e) => createTodo(e));
document.querySelector('#lists-form').addEventListener('submit', (e) => createList(e));
