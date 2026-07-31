const taskInput = document.querySelector('#taskInput');
const addButton = document.querySelector('#addButton');
const taskList = document.querySelector('#taskList');

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
    });

    listItem.append(deleteButton);
    taskList.append(listItem);
}

tasks.forEach((task) => {
    createTask(task);
});

addButton.addEventListener('click', () => {
    const taskText = taskInput.value.trim();

    if (taskText !== ''){
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(task); 
        createTask(task);
        saveTasks();

        taskInput.value = '';
        taskInput.focus();
    }
});

taskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        addButton.click();
    }
});
