const taskInput = document.querySelector('#taskInput');
const addButton = document.querySelector('#addButton');
const taskList = document.querySelector('#taskList');

const taskCount = document.querySelector('#taskCount');

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

    listItem.append(deleteButton);
    taskList.append(listItem);
}

tasks.forEach((task) => {
    createTask(task);
});

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
        createTask(task);
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
