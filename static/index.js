function createTodo(e) {
    e.preventDefault();
    const descInput = document.getElementById('description');
    const description = descInput.value;
    // Clear user input on submit
    descInput.value = '';
    fetch('/todos/create', {
        method: 'POST',
        body: JSON.stringify({
            'description': description
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
        document.getElementById(e.target.dataset.id).remove();
        document.getElementById("error").className = 'hidden';
    })
    .catch((error) => {
        console.log("ERROR:", error);
        document.getElementById("error").className = '';
    })
}

function changeTodoState(e) {
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
    li.setAttribute('id', data.id);

    let deleteBtn = document.createElement('button');
    deleteBtn.setAttribute('id', 'delete');
    deleteBtn.setAttribute('data-id', data.id);
    deleteBtn.innerHTML += '&cross;'
    li.appendChild(deleteBtn);

    let checkbox = document.createElement('input');
    checkbox.setAttribute('class', 'check');
    checkbox.setAttribute('data-id', data.id);
    checkbox.setAttribute('type', 'checkbox');
    li.appendChild(checkbox);

    li.innerHTML += data.description;
    document.getElementById("todos").appendChild(li);
    // Add event listeners
    document.querySelector(`li[id='${data.id}'] input`).addEventListener('change', (e) => changeTodoState(e));
    document.querySelector(`li[id='${data.id}'] button`).addEventListener('click', (e) => deleteTodo(e));
    // Hide errors
    document.getElementById("error").className = 'hidden';
}

document.getElementById('form').addEventListener('submit', (e) => createTodo(e));
