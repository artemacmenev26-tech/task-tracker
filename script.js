const taskInput = document.querySelector('#taskInput');
const taskPrioritySelect = document.querySelector('#taskPrioritySelect');
const taskSearchInput = document.querySelector('#taskSearchInput');
const taskSortSelect = document.querySelector('#taskSortSelect');
const taskForm = document.querySelector('.task-form');
const taskList = document.querySelector('#taskList');
const taskCount = document.querySelector('#taskCount');
const filterButtons = document.querySelectorAll('.filter-button');
const clearCompletedButton = document.querySelector('#clearCompletedButton');

let currentFilter = 'all';
let searchQuery = '';
let sortOrder = 'newest';

let tasks = loadTasks();

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((filterButton) => {
            filterButton.classList.remove('active');
            filterButton.setAttribute('aria-pressed', 'false');
        });
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

taskSearchInput.addEventListener('input', (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderTasks();
});

taskSortSelect.addEventListener('change', (event) => {
    sortOrder = event.target.value;
    renderTasks();
});

function renderTasks(){
    taskList.textContent = '';
    updateClearCompletedButton();
    let filteredTasks = [...tasks];
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter((task) => {
            return task.completed === false;
        });
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter((task) => {
            return task.completed === true;
        });
    }
    if (searchQuery !== '') {
        filteredTasks = filteredTasks.filter((task) => {
            return task.text.toLowerCase().includes(searchQuery);
        });
    }
    if (sortOrder === 'newest') {
        filteredTasks.sort((firstTask, secondTask) => {
            return secondTask.id - firstTask.id;
        });
    } else {
        filteredTasks.sort((firstTask, secondTask) => {
            return firstTask.id - secondTask.id;
        });
    }
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.classList.add('empty-message');
        const emptyMessages = {
            all: 'Задач пока нет',
            active: 'Активных задач нет',
            completed: 'Выполненных задач нет'
        };
        if (searchQuery !== '') {
            emptyMessage.textContent = 'По вашему запросу задач не найдено';
        } else {
            emptyMessage.textContent = emptyMessages[currentFilter];
        }
        taskList.append(emptyMessage);
        return;
    }
    filteredTasks.forEach((task) => {
        createTask(task);
    });
}

function loadTasks() {
    try {
        const savedTasks = JSON.parse(localStorage.getItem('tasks'));
        if (Array.isArray(savedTasks)) {
            return savedTasks;
        }
        return [];
    } catch {
        return [];
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskCount() {
    const incompleteTasks = tasks.filter((task) => {
        return task.completed === false;
    });
    taskCount.textContent = 'Осталось задач: ' + incompleteTasks.length;
}

function updateClearCompletedButton() {
    const hasCompletedTasks = tasks.some((task) => {
        return task.completed === true;
    });
    clearCompletedButton.disabled = !hasCompletedTasks;
}

function createTask(task) {
    const listItem = document.createElement('li');
    const taskContent = document.createElement('div');
    const taskDateElement = document.createElement('span');
    const taskTextElement = document.createElement('span');
    const createdDate = new Date(task.id);
    const dateOptions = {
        dateStyle: 'short',
        timeStyle: 'short'
    };
    const taskHeader = document.createElement('div');
    const taskPriorityElement = document.createElement('span');
    const currentPriority = task.priority || 'normal';
    const priorityLabels = {
        low: 'Низкий',
        normal: 'Обычный',
        high: 'Высокий'
    };

    taskContent.classList.add('task-content');
    taskPriorityElement.classList.add(currentPriority);
    taskPriorityElement.classList.add('task-priority');
    taskHeader.classList.add('task-header');
    taskDateElement.classList.add('task-date');
    taskTextElement.classList.add('task-text');

    taskDateElement.textContent = createdDate.toLocaleString('ru-RU', dateOptions);
    taskTextElement.textContent = task.text;
    taskPriorityElement.textContent = priorityLabels[currentPriority];
    taskTextElement.tabIndex = 0;
    taskTextElement.setAttribute('role', 'checkbox');
    taskTextElement.setAttribute('aria-checked', task.completed);


    if (task.completed){
        listItem.classList.add('completed');
    }

    listItem.addEventListener('click', () => {
        task.completed = !task.completed;
        listItem.classList.toggle('completed');
        saveTasks();
        updateTaskCount();
        renderTasks();
    });

    taskTextElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            listItem.click();
        }
    });

    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.textContent = 'Редактировать';
    editButton.addEventListener('click', (event) => {
        event.stopPropagation();

        const newText = prompt('Введите новый текст задачи:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Удалить';

    deleteButton.addEventListener('click', (event) => {
        event.stopPropagation();

        tasks = tasks.filter((currentTask) => {
            return currentTask.id !== task.id;
        });

        saveTasks();
        updateTaskCount();
        renderTasks();
    });

    taskHeader.append(taskTextElement, taskPriorityElement);
    taskContent.append(taskHeader, taskDateElement);
    listItem.append(taskContent, editButton, deleteButton);
    taskList.append(listItem);
}

renderTasks();
updateTaskCount();

taskForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    const taskPriority = taskPrioritySelect.value;

    if (taskText !== ''){
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            priority: taskPriority
        };
        
        tasks.push(task); 
        renderTasks();
        saveTasks();
        updateTaskCount();

        taskInput.value = '';
        taskPrioritySelect.value = 'normal';
        taskInput.focus();
    }
});

clearCompletedButton.addEventListener('click', () => {
    const shouldClear = confirm('Удалить все выполненные задачи?');
    if (!shouldClear) {
        return;
    }
    tasks = tasks.filter((task) => {
        return task.completed === false;
    });
    saveTasks();
    updateTaskCount();
    renderTasks();
});
