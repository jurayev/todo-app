function createTodo(e) {
    e.preventDefault();
    let url = window.location.href.split('/');
    const list_id = Number(url[url.length - 1]);
    const descInput = document.getElementById('todos-description');
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
            document.getElementById('error').className = '';
        })

}

function deleteTodo(e) {
    console.log('Event:', e)
    fetch(`/todos/${e.target.dataset.id}/delete`, {method: 'DELETE'})
    .then(response => response.json())
    .then(data => {
        console.log("SUCCESS:", data);
        document.querySelector(`[id="todos"] [id="${e.target.dataset.id}"]`).remove();
        document.getElementById("error").className = 'hidden';
    })
    .catch((error) => {
        console.log("ERROR:", error);
        document.getElementById("error").className = '';
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
        const checkbox = document.querySelector(`[id='lists'] [id='${data.list_id}'] input`);
        if (data.are_all_completed == true) {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
        document.getElementById("error").className = 'hidden';
    })
    .catch((error) => {
        console.log("ERROR:", error);
        document.getElementById('error').className = '';
    })

}

function renderNewTodo(data) {
    // Add a new to do record
    let li = document.createElement('li');
    li.id = data.id;

    let checkbox = document.createElement('input');
    checkbox.className = 'check';
    checkbox.setAttribute('data-id', data.id);
    checkbox.type = 'checkbox';
    li.appendChild(checkbox);
    
    let deleteBtn = document.createElement('button');
    deleteBtn.id = 'todo-delete';
    deleteBtn.setAttribute('data-id', data.id);
    deleteBtn.innerHTML += '&cross;';
    li.appendChild(deleteBtn);

    li.innerHTML += data.description;
    document.getElementById("todos").appendChild(li);
    // Add event listeners
    document.querySelector(`li[id='${data.id}'] input`).addEventListener('change', (e) => completeTodo(e));
    document.querySelector(`li[id='${data.id}'] button`).addEventListener('click', (e) => deleteTodo(e));
    // Hide errors
    document.getElementById("error").className = 'hidden';
}

function createList(e) {
    e.preventDefault();
    const input = document.getElementById('list-description');
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
            document.getElementById('error').className = '';
        })

}

function deleteList(e) {
    console.log('Event:', e)
    fetch(`/lists/${e.target.dataset.id}/delete`, {method: 'DELETE'})
    .then(response => response.json())
    .then(data => {
        console.log("SUCCESS:", data);
        document.querySelector(`[id="lists"] [id="${e.target.dataset.id}"]`).remove();
        document.getElementById("error").className = 'hidden';
        window.location = "/";
    })
    .catch((error) => {
        console.log("ERROR:", error);
        document.getElementById("error").className = '';
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
                const checkbox = document.querySelector(`ul[id='todos'] li[id='${todo_id}'] input`);
                if (data.completed == true) {
                    checkbox.checked = true;
                } else {
                    checkbox.checked = false;
                }
            }
        }
        document.getElementById("error").className = 'hidden';
    })
    .catch((error) => {
        console.log("ERROR:", error);
        document.getElementById('error').className = '';
    })

}

function renderNewList(data) {
    // Add a new to do record
    let li = document.createElement('li');
    li.id = data.id;

    let deleteBtn = document.createElement('button');
    deleteBtn.id = 'list-delete';
    deleteBtn.setAttribute('data-id', data.id);
    deleteBtn.innerHTML += '&cross;';
    li.appendChild(deleteBtn);

    let checkbox = document.createElement('input');
    checkbox.className = 'check';
    checkbox.type = 'checkbox';
    checkbox.setAttribute('data-id', data.id);
    li.appendChild(checkbox);

    li.innerHTML += `<a href="/lists/${data.id}">  ${data.name}  </a>`;
    document.getElementById("lists").appendChild(li);
    // Add event listeners
    document.querySelector(`ul[id='lists'] li[id='${data.id}'] input`).addEventListener('change', (e) => completeList(e));
    document.querySelector(`ul[id='lists'] li[id='${data.id}'] button`).addEventListener('click', (e) => deleteList(e));
    // Hide errors
    document.getElementById("error").className = 'hidden';
    // Redirect to the new list
    window.location = `/lists/${data.id}`;
}

document.getElementById('todos-form').addEventListener('submit', (e) => createTodo(e));
document.getElementById('lists-form').addEventListener('submit', (e) => createList(e));
