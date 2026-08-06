const taskInput = document.querySelector('#taskInput');
const addButton = document.querySelector('#addButton');
const taskList = document.querySelector('#taskList');

const taskCount = document.querySelector('#taskCount');

const filterButtons = document.querySelectorAll('.filter-button');

let currentFilter = 'all';

function renderTasks(){
    taskList.textContent = '';
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter((task) => {
            return task.completed === false;
        });
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter((task) => {
            return task.completed === true;
        });
    }
    filteredTasks.forEach((task) => {
        createTask(task);
    });
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((filterButton) => {
            filterButton.classList.remove('active');
        });
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        renderTasks();
    });
});

function loadTasks() {
    try {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    } catch {
        return [];
    }
}

let tasks = loadTasks();

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskCount() {
    const incompleteTasks = tasks.filter((task) => {
        return task.completed === false;
    });
    taskCount.textContent = 'Осталось задач: ' + incompleteTasks.length;
}



function createTask(task) {
    const listItem = document.createElement('li');
    listItem.textContent = task.text;

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

        listItem.remove();
        saveTasks();
        updateTaskCount();
    });

    listItem.append(editButton, deleteButton);
    taskList.append(listItem);
}

renderTasks();
updateTaskCount();

addButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();

    if (taskText !== ''){
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(task); 
        renderTasks();
        saveTasks();
        updateTaskCount();

        taskInput.value = '';
        taskInput.focus();
    }
});

taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addButton.click();
    }
});
