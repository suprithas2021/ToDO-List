/*------- External JavaScript ---------*/
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
    if (todoText === "") {
        alert("Please enter a todo!");
        return;
    }

    // Check for duplicates
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

    // Create <li> element for todo item text
    const newTodo = document.createElement("li");
    newTodo.innerText = todoText;
    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    // Create button for completing todo
    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class="fas fa-check-circle"></i>';
    completedButton.classList.add("btn", "btn-success", "complete-btn", "tooltip-btn");
    completedButton.setAttribute("data-bs-toggle", "tooltip");
    completedButton.setAttribute("data-bs-placement", "top");
    completedButton.setAttribute("title", "Mark Completed");
    todoDiv.appendChild(completedButton);

    // Create button for editing todo
    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.classList.add("btn", "edit-btn", "tooltip-btn");
    editButton.setAttribute("data-bs-toggle", "tooltip");
    editButton.setAttribute("data-bs-placement", "top");
    editButton.setAttribute("title", "Edit");
    todoDiv.appendChild(editButton);

    // Create button for deleting todo
    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fas fa-trash"></i>';
    trashButton.classList.add("btn", "btn-danger", "trash-btn", "tooltip-btn");
    trashButton.setAttribute("data-bs-toggle", "tooltip");
    trashButton.setAttribute("data-bs-placement", "top");
    trashButton.setAttribute("title", "Delete");
    todoDiv.appendChild(trashButton);

    // Append todoDiv to todoList
    todoList.appendChild(todoDiv);

    // Initialize tooltips for all tooltip buttons
    const tooltipButtons = todoDiv.querySelectorAll(".tooltip-btn");
    tooltipButtons.forEach(button => new bootstrap.Tooltip(button));

    // Show the todo container
    todoContainer.style.display = "block";

    // Highlight the new task
    highlightTodoElement(todoDiv);
}

// Function to handle delete, complete, and edit actions on todos
function handleTodoActions(event) {
    const item = event.target;
    const todo = item.closest(".todo");

    if (item.classList.contains("trash-btn")) {
        // Show confirmation message before deleting
        if (confirm("Are you sure you want to delete this task?")) {
            // Dispose of tooltips before deleting
            const tooltipInstance = bootstrap.Tooltip.getInstance(item);
            if (tooltipInstance) {
                tooltipInstance.dispose();
            }

            todo.classList.add("slide");
            removeLocalTodos(todo);
            todo.addEventListener("transitionend", function() {
                todo.remove();

                // Hide the todo container if there are no todos left
                if (todoList.childElementCount === 0) {
                    todoContainer.style.display = "none";
                }
            });
        }
    }

    if (item.classList.contains("complete-btn")) {
        const todo = item.parentElement;
        todo.classList.toggle("completed");
    }

    if (item.classList.contains("edit-btn")) {
        const todoTextElement = todo.querySelector(".todo-item");
        const oldTodoText = todoTextElement.innerText;

        // Create an input element for editing
        const newTextElement = document.createElement('input');
        newTextElement.type = 'text';
        newTextElement.value = oldTodoText;
        newTextElement.classList.add('todo-item', 'edit-mode');

        // Apply styles to the input element to match the original todo item
        const styles = window.getComputedStyle(todoTextElement);
        newTextElement.style.border = styles.border;
        newTextElement.style.outline = "none";
        newTextElement.style.background = styles.background;
        newTextElement.style.color = styles.color;
        newTextElement.style.width = styles.width;
        newTextElement.style.height = styles.height;
        newTextElement.style.fontSize = styles.fontSize;
        newTextElement.style.padding = styles.padding;
        newTextElement.style.margin = styles.margin;
        newTextElement.style.boxSizing = styles.boxSizing;

        // Replace the todo item text with the input element
        todoTextElement.replaceWith(newTextElement);

        // Set cursor at the end of the input value
        newTextElement.focus();
        newTextElement.setSelectionRange(newTextElement.value.length, newTextElement.value.length);

        // Save changes on enter key press or focus out
        function saveChanges() {
            const newText = newTextElement.value.trim();
            if (newText !== "" && newText !== oldTodoText) {
                // Update the todo item text in the UI with the new text
                const updatedTodoTextElement = document.createElement("li");
                updatedTodoTextElement.innerText = newText;
                updatedTodoTextElement.classList.add("todo-item");
                todo.replaceChild(updatedTodoTextElement, newTextElement);

                // Update local storage with the new text
                updateLocalTodos(oldTodoText, newText);
            }
            newTextElement.removeEventListener('keypress', handleKeyPress);
            newTextElement.removeEventListener('blur', saveChanges);
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
    todos.forEach(todo => {
        switch (filterOption.value) {
            case "all":
                todo.style.display = "block";
                break;
            case "completed":
                todo.style.display = todo.classList.contains("completed") ? "block" : "none";
                break;
            case "incomplete":
                todo.style.display = !todo.classList.contains("completed") ? "block" : "none";
                break;
        }
    });
}

// Function to search todos based on input value
function searchTodo() {
    const searchTerm = searchInput.value.toLowerCase();
    const todos = todoList.childNodes;
    todos.forEach(todo => {
        const todoText = todo.querySelector(".todo-item").textContent.toLowerCase();
        todo.style.display = todoText.includes(searchTerm) ? "block" : "none";
    });
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
    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.push(todo);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to retrieve todos from local storage
function getLocalTodos() {
    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    todos.forEach(todo => createTodoElement(todo));
    // Hide the todo container if there are no todos
    todoContainer.style.display = todos.length === 0 ? "none" : "block";
}

// Function to remove todo from local storage
function removeLocalTodos(todo) {
    let todos = JSON.parse(localStorage.getItem("todos")) || [];
    const todoText = todo.querySelector(".todo-item").innerText;
    todos = todos.filter(t => t !== todoText);
    localStorage.setItem("todos", JSON.stringify(todos));
}

// Function to update todo in local storage
function updateLocalTodos(oldTodoText, newTodoText) {
    let todos = JSON.parse(localStorage.getItem("todos")) || [];
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
        // Hide all tooltips if click is outside tooltip element
        document.querySelectorAll('.tooltip').forEach(tooltip => bootstrap.Tooltip.getInstance(tooltip).hide());
    }
});
