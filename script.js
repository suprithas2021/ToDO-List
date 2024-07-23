// Selecting DOM elements
const todoContainer = document.querySelector(".todo-container");
const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");
const searchInput = document.getElementById("search");

// Event listeners
document.addEventListener("DOMContentLoaded", getLocalTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", handleTodoActions);
filterOption.addEventListener("change", filterTodo);
searchInput.addEventListener("input", searchTodo);
searchInput.addEventListener("keypress", clearSearchOnEnter);

// Initialize Bootstrap tooltips globally
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(element => new bootstrap.Tooltip(element));

// Function to add a new todo
function addTodo(event) {
    event.preventDefault();
    const todoText = todoInput.value.trim();
    if (!todoText) {
        alert("Please enter a todo!");
        return;
    }
    if (isDuplicate(todoText)) {
        alert("This todo item already exists!");
        return;
    }
    createTodoElement(todoText);
    saveLocalTodos(todoText);
    todoInput.value = "";
}

// Function to check if a todo item is a duplicate
function isDuplicate(todoText) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    return todos.includes(todoText);
}

// Function to create a new todo element
function createTodoElement(todoText) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

    const newTodo = document.createElement("li");
    newTodo.innerText = todoText;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    const completedButton = createButton("btn-success complete-btn", "fas fa-check-circle", "Mark Completed");
    const editButton = createButton("edit-btn", "fas fa-edit", "Edit");
    const trashButton = createButton("btn-danger trash-btn", "fas fa-trash", "Delete");

    todoDiv.appendChild(completedButton);
    todoDiv.appendChild(editButton);
    todoDiv.appendChild(trashButton);

    todoList.appendChild(todoDiv);
    todoContainer.style.display = "block";
    highlightTodoElement(todoDiv);
}

// Function to create a button with specified classes, icon, and tooltip
function createButton(buttonClasses, iconClasses, tooltipText) {
    const button = document.createElement("button");
    button.innerHTML = `<i class="${iconClasses}"></i>`;
    button.classList.add("btn", "tooltip-btn", ...buttonClasses.split(" "));
    button.setAttribute("data-bs-toggle", "tooltip");
    button.setAttribute("data-bs-placement", "top");
    button.setAttribute("title", tooltipText);
    new bootstrap.Tooltip(button);
    return button;
}

// Function to handle delete, complete, and edit actions on todos
function handleTodoActions(event) {
    const item = event.target;
    const todo = item.closest(".todo");

    if (item.classList.contains("trash-btn") && confirm("Are you sure you want to delete this todo?")) {
        bootstrap.Tooltip.getInstance(item).dispose();
        todo.classList.add("slide");
        removeLocalTodos(todo);
        todo.addEventListener("transitionend", () => {
            todo.remove();
            if (!todoList.childElementCount) todoContainer.style.display = "none";
        });
    }

    if (item.classList.contains("complete-btn")) {
        toggleComplete(todo);
    }

    if (item.classList.contains("edit-btn")) {
        editTodoItem(todo);
    }
}

// Function to toggle the complete status of a todo item
function toggleComplete(todo) {
    todo.classList.toggle("completed");
    const editButton = todo.querySelector(".edit-btn");
    const todoTextElement = todo.querySelector(".todo-item");

    if (todo.classList.contains("completed")) {
        editButton.disabled = true;
        editButton.style.display = 'none';
        todoTextElement.style.textDecoration = 'line-through';
    } else {
        editButton.disabled = false;
        editButton.style.display = 'inline-block';
        todoTextElement.style.textDecoration = 'none';
    }
}

// Function to edit a todo item
function editTodoItem(todo) {
    const todoTextElement = todo.querySelector(".todo-item");
    const oldTodoText = todoTextElement.innerText;
    const newTextElement = document.createElement('input');
    newTextElement.type = 'text';
    newTextElement.value = oldTodoText;
    newTextElement.classList.add('todo-item', 'edit-mode');
    
    // Apply styles to the input element to match the original todo item
    const styles = window.getComputedStyle(todoTextElement);
    for (const style of ["border", "outline", "background", "color", "width", "height", "fontSize", "padding", "margin", "boxSizing"]) {
        newTextElement.style[style] = styles[style];
    }

    todoTextElement.replaceWith(newTextElement);
    newTextElement.focus();
    newTextElement.setSelectionRange(newTextElement.value.length, newTextElement.value.length);

    newTextElement.addEventListener('blur', saveChanges);
    newTextElement.addEventListener('keypress', handleKeyPress);

    function handleKeyPress(e) {
        if (e.key === 'Enter') saveChanges();
    }

    function saveChanges() {
        const newText = newTextElement.value.trim();
        // if (!newText) {
        //     alert("to-do list not be kept empty!");
        //     newTextElement.focus();
        //     return;
        // }
        if (newText !== oldTodoText) {
            const updatedTodoTextElement = document.createElement("li");
            updatedTodoTextElement.innerText = newText;
            updatedTodoTextElement.classList.add("todo-item");
            todo.replaceChild(updatedTodoTextElement, newTextElement);
            updateLocalTodos(oldTodoText, newText);
        } else {
            todo.replaceChild(todoTextElement, newTextElement);
        }
        newTextElement.removeEventListener('keypress', handleKeyPress);
        newTextElement.removeEventListener('blur', saveChanges);
    }
}


// Function to filter todos based on selected option
function filterTodo() {
    const todos = todoList.childNodes;
    let hasTodos = false;
    todos.forEach(todo => {
        switch (filterOption.value) {
            case "all":
                todo.style.display = "block";
                hasTodos = true;
                break;
            case "completed":
                if (todo.classList.contains("completed")) {
                    todo.style.display = "block";
                    hasTodos = true;
                } else {
                    todo.style.display = "none";
                }
                break;
            case "incomplete":
                if (!todo.classList.contains("completed")) {
                    todo.style.display = "block";
                    hasTodos = true;
                } else {
                    todo.style.display = "none";
                }
                break;
        }
    });

    const noTodosMessage = document.getElementById("no-todos-message");
    if (!hasTodos) {
        if (!noTodosMessage) {
            const message = document.createElement("p");
            message.id = "no-todos-message";
            message.innerText = "No to-do completed.";
            todoContainer.appendChild(message);
            message.style.fontWeight='bolder'
            message.style.fontSize='3rem'
        }
    } else if (noTodosMessage) {
        noTodosMessage.remove();
    }
}

// Function to search todos based on input value
function searchTodo() {
    const searchTerm = searchInput.value.toLowerCase();
    const todos = todoList.childNodes;
    let hasMatches = false;
    todos.forEach(todo => {
        const todoText = todo.querySelector(".todo-item").textContent.toLowerCase();
        if (todoText.includes(searchTerm)) {
            todo.style.display = "block";
            hasMatches = true;
        } else {
            todo.style.display = "none";
        }
    });

    const noMatchesMessage = document.getElementById("no-matches-message");
    if (!hasMatches) {
        if (!noMatchesMessage) {
            const message = document.createElement("p");
            message.id = "no-matches-message";
            message.innerText = "No matches found.";
            todoContainer.appendChild(message);
            message.style.fontWeight='bolder'
            message.style.fontSize='3rem'
        }
    } else if (noMatchesMessage) {
        noMatchesMessage.remove();
    }
}

// Function to handle the Enter key press and clear the search input
function clearSearchOnEnter(event) {
    if (event.key === 'Enter') {
        searchInput.value = '';
        searchTodo(); // Trigger search to update the list
    }
}

// Function to save todos to local storage
function saveLocalTodos(todo) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to retrieve todos from local storage
function getLocalTodos() {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.forEach(todo => createTodoElement(todo));
    todoContainer.style.display = todos.length ? "block" : "none";
}

// Function to remove todo from local storage
function removeLocalTodos(todo) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const todoText = todo.querySelector(".todo-item").innerText;
    localStorage.setItem("todos", JSON.stringify(todos.filter(t => t !== todoText)));
}

// Function to update todo in local storage
function updateLocalTodos(oldTodoText, newTodoText) {
    const todos = JSON.parse(localStorage.getItem("todos")) || [];
    const index = todos.indexOf(oldTodoText);
    if (index !== -1) {
        todos[index] = newTodoText;
        localStorage.setItem("todos", JSON.stringify(todos));
    }
}

// Function to highlight a newly added todo
function highlightTodoElement(todoDiv) {
    todoDiv.classList.add("highlight-added");
    setTimeout(() => todoDiv.classList.remove("highlight-added"), 1000);
}

// Add event listener to handle tooltip hiding
document.addEventListener('click', (e) => {
    if (!e.target.matches('[data-bs-toggle="tooltip"]')) {
        document.querySelectorAll('.tooltip').forEach(tooltip => bootstrap.Tooltip.getInstance(tooltip).hide());
    }
});
