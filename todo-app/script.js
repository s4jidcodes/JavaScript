const STORAGE_KEY = "daily-tasks";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const template = document.querySelector("#todo-template");
const emptyState = document.querySelector("#empty-state");
const taskCount = document.querySelector("#task-count");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = document.querySelectorAll(".filter-button");

let todos = loadTodos();
let currentFilter = "all";

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function addTodo(text) {
  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });
  saveTodos();
  render();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo,
  );
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

function getVisibleTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function getEmptyMessage() {
  if (currentFilter === "active") {
    return ["Nothing left to do", "Enjoy the rest of your day."];
  }

  if (currentFilter === "completed") {
    return ["No completed tasks", "Finished tasks will appear here."];
  }

  return ["Your list is clear", "Add a task above and make today count."];
}

function render() {
  const visibleTodos = getVisibleTodos();
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  list.replaceChildren();

  visibleTodos.forEach((todo) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const checkbox = item.querySelector(".todo-check");
    const text = item.querySelector(".todo-text");
    const deleteButton = item.querySelector(".delete-button");

    item.dataset.id = todo.id;
    item.classList.toggle("completed", todo.completed);
    checkbox.checked = todo.completed;
    checkbox.setAttribute(
      "aria-label",
      `${todo.completed ? "Mark active" : "Mark complete"}: ${todo.text}`,
    );
    text.textContent = todo.text;
    deleteButton.setAttribute("aria-label", `Delete: ${todo.text}`);

    checkbox.addEventListener("change", () => toggleTodo(todo.id));
    deleteButton.addEventListener("click", () => deleteTodo(todo.id));
    list.append(item);
  });

  const [emptyTitle, emptyDescription] = getEmptyMessage();
  emptyState.querySelector("h2").textContent = emptyTitle;
  emptyState.querySelector("p").textContent = emptyDescription;
  emptyState.classList.toggle("visible", visibleTodos.length === 0);

  taskCount.textContent = `${activeCount} ${activeCount === 1 ? "task" : "tasks"} left`;
  clearCompletedButton.disabled = completedCount === 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    return;
  }

  addTodo(text);
  form.reset();
  input.focus();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle("active", isActive);
      filterButton.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
});

const today = new Date();
document.querySelector("#date-month").textContent = today.toLocaleDateString(
  undefined,
  { month: "short" },
);
document.querySelector("#date-day").textContent = today.getDate();

filterButtons[0].setAttribute("aria-pressed", "true");
filterButtons.forEach((button, index) => {
  if (index > 0) {
    button.setAttribute("aria-pressed", "false");
  }
});

render();
