// // modified javascript

/*------- External JavaScript ---------*/
/*------- External JavaScript ---------*/
// Selecting DOM elements
const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");
const searchInput = document.getElementById("search");

// Event listeners
document.addEventListener("DOMContentLoaded", getLocalTodos);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", deleteCheck);
todoList.addEventListener("click", editTodo); // Listen for edit clicks
filterOption.addEventListener("change", filterTodo);
searchInput.addEventListener("input", searchTodo);

// Function to add a new todo
function addTodo(event) {
    event.preventDefault();
    const todoText = todoInput.value.trim();
    if (todoText === "") {
        alert("Please enter a todo!");
        return;
    }

    createTodoElement(todoText);
    saveLocalTodos(todoText);
    todoInput.value = "";
}

// Function to create a new todo element
function createTodoElement(todoText) {
    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

    // Create <li> element for todo item text
    const newTodo = document.createElement("li");
    newTodo.innerText = todoText;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    // Create button for completing todo
    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add("btn", "btn-success", "complete-btn"); // Add Bootstrap button classes
    completedButton.setAttribute("data-bs-toggle", "tooltip"); // Add tooltip toggle attribute
    completedButton.setAttribute("data-bs-placement", "top"); // Tooltip placement (top, bottom, left, right)
    completedButton.setAttribute("title", "Mark Completed"); // Tooltip text

    // Initialize the tooltip
    new bootstrap.Tooltip(completedButton);

    // Append completedButton to todoDiv or any other parent element
    todoDiv.appendChild(completedButton);


    // Create button for editing todo
    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.classList.add("btn", "edit-btn"); // Add Bootstrap button classes
    editButton.setAttribute("data-bs-toggle", "tooltip"); // Add tooltip toggle attribute
    editButton.setAttribute("data-bs-placement", "top"); // Tooltip placement (top, bottom, left, right)
    editButton.setAttribute("title", "Edit"); // Tooltip text

    // Initialize the tooltip
    new bootstrap.Tooltip(editButton);

    // Append editButton to todoDiv or any other parent element
    todoDiv.appendChild(editButton);

    // Create button for deleting todo
    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("btn", "btn-danger", "trash-btn"); // Add Bootstrap button classes
    trashButton.setAttribute("data-bs-toggle", "tooltip"); // Add tooltip toggle attribute
    trashButton.setAttribute("data-bs-placement", "top"); // Tooltip placement (top, bottom, left, right)
    trashButton.setAttribute("title", "Delete"); // Tooltip text

    // Initialize the tooltip
    new bootstrap.Tooltip(trashButton);

    // Append trashButton to todoDiv or any other parent element
    todoDiv.appendChild(trashButton);

    todoList.appendChild(todoDiv);
}

// Function to handle delete and complete actions on todos
function deleteCheck(e) {
    const item = e.target;

    if (item.classList.contains("trash-btn")) {
        const todo = item.parentElement;
        todo.classList.add("slide");
        removeLocalTodos(todo);
        todo.addEventListener("transitionend", function () {
            todo.remove();
        });
    }

    if (item.classList.contains("complete-btn")) {
        const todo = item.parentElement;
        todo.classList.toggle("completed");
    }
}

// Function to handle editing a todo
function editTodo(e) {
    const item = e.target;
    if (item.classList.contains("edit-btn")) {
        const todo = item.parentElement;
        const todoTextElement = todo.querySelector(".todo-item");
        const oldTodoText = todoTextElement.innerText;

        // Create an input element for editing
        const newTextElement = document.createElement('input');
        newTextElement.type = 'text';
        newTextElement.value = oldTodoText;
        newTextElement.classList.add('todo-item', 'edit-mode');

        // Replace the todo item text with the input element
        todoTextElement.replaceWith(newTextElement);

        // Focus on the input element
        newTextElement.focus();

        // Save changes on enter key press or focus out
        function saveChanges() {
            const newText = newTextElement.value.trim();
            if (newText !== "") {
                // Update the todo item text in the UI with the new text
                todoTextElement.innerText = newText;

                // Update local storage with the new text
                updateLocalTodos(oldTodoText, newText);

                // Replace input element with updated todo item text
                newTextElement.replaceWith(todoTextElement);

                // Remove event listeners after saving changes
                newTextElement.removeEventListener('keypress', handleKeyPress);
                newTextElement.removeEventListener('blur', saveChanges);
            }
        }

        // Handle enter key press
        function handleKeyPress(e) {
            if (e.key === 'Enter') {
                saveChanges();
            }
        }

        // Handle focus out
        newTextElement.addEventListener('blur', saveChanges);

        // Attach enter key press listener
        newTextElement.addEventListener('keypress', handleKeyPress);
    }
}

// Function to filter todos based on selected option
function filterTodo() {
    const todos = todoList.childNodes;
    todos.forEach(function (todo) {
        switch (filterOption.value) {
            case "all":
                todo.style.display = "flex";
                break;
            case "completed":
                if (todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
            case "incomplete":
                if (!todo.classList.contains("completed")) {
                    todo.style.display = "flex";
                } else {
                    todo.style.display = "none";
                }
                break;
        }
    });
}

// Function to search todos based on input value
function searchTodo() {
    const searchTerm = searchInput.value.toLowerCase();
    const todos = todoList.childNodes;
    todos.forEach(function (todo) {
        const todoText = todo.textContent.toLowerCase();
        if (todoText.includes(searchTerm)) {
            todo.style.display = "flex";
        } else {
            todo.style.display = "none";
        }
    });
}

// Function to save todos to local storage
function saveLocalTodos(todo) {
    let todos;
    if (localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to retrieve todos from local storage
function getLocalTodos() {
    let todos;
    if (localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }
    todos.forEach(function (todo) {
        createTodoElement(todo);
    });
}

// Function to remove todo from local storage
function removeLocalTodos(todo) {
    let todos;
    if (localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }

    const todoIndex = todo.children[0].innerText;
    todos.splice(todos.indexOf(todoIndex), 1);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to update todo in local storage
function updateLocalTodos(oldTodoText, newTodoText) {
    let todos;
    if (localStorage.getItem("todos") === null) {
        todos = [];
    } else {
        todos = JSON.parse(localStorage.getItem("todos"));
    }
    const index = todos.indexOf(oldTodoText);
    if (index !== -1) {
        todos[index] = newTodoText;
        localStorage.setItem("todos", JSON.stringify(todos));
    }
}



