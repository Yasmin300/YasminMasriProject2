const tasks = getTasks();
const ids = getIds();
document.getElementById('submitid').addEventListener('click', addTask);

let currentFilter = 'all';
function getTasks() {
    let taskarray = [];
    try {
        const tasks = localStorage.getItem('tasks');
        if (tasks != null) {
            taskarray = JSON.parse(tasks);
        }
    }
    catch (error) {
        console.error("Error reading from localStorage:", error.message);
    }
    return taskarray;

}
function getIds() {  //get the ids of all tasks in the tasks array in a set to unsure uniqueness
    const existingSet = new Set();
    for (let task of tasks)
        existingSet.add(task.id);
    return existingSet;
}

function saveTasks(tasks) {
    try {
        if (tasks != null) {
            let task = JSON.stringify(tasks);
            localStorage.setItem('tasks', task);
        }
    }
    catch (error) {
        console.error("Error saving to localStorage:", error.message);
        alert("Can't save tasks. Storage may be full.");
    }
}
// Adds a new task to the task list, saves it, and re-renders the UI
function addTask() {
    let description = document.getElementById('descNewTask');
    let date = document.getElementById('dueNewTask');
    let id = getId();
    if (description.value.trim() != "" && date.value.trim() != "") {
        let taskstoadd = {
            id: id,
            text: description.value,
            dueDate: date.value,
            completed: false,
        }
        tasks.push(taskstoadd);
        ids.add(id);
        saveTasks(tasks);
        description.value = "";
        date.value = "";
        renderTasks();
    }

}
function checkid(id, ids) {
    return !ids.has(id);
}
//generates an id for task
function generateid(length = 6) {
    return Math.random().toString(36).substring(2, length + 2);
}
function getId() {
    const limit = 100; // max tries to create unique id
    let attempts = 0; // how many attempts
    let id = generateid();
    let checkId = checkid(id, ids);
    while (checkId && attempts < limit) {
        id = generateid();
        checkId = checkid(id, ids);
        attempts++;
    }
    return id;
}

function renderTasks() {
    let taskList = document.querySelector('#taskList');
    taskList.innerHTML = '';
    const currenttasks = filterTasks(tasks, currentFilter);
    //foreach task we add a list in the tasklist showing each task
    currenttasks.forEach(task => {
        let newli = document.createElement('li');
        newli.innerHTML = `<p>Task description: ${task.text}</p> <p> due date: ${task.dueDate}</p>
        <button class="completeTask" data-id="${task.id}" > השלמה </button>
        <button class="deleteTask" data-id="${task.id}" > מחיקה</button>`;
        if (task.completed) {
            newli.classList.add('complete');
        }
        newli.querySelector('.completeTask').addEventListener('click', completeTask);
        newli.querySelector('.deleteTask').addEventListener('click', deleteTask);
        taskList.appendChild(newli);

    })
}
//delete task from task array and renders page again
function deleteTask(event) {
    const id = event.target.dataset.id;
    for (let task of tasks) {
        if (task.id == id) {
            let position = tasks.indexOf(task);
            tasks.splice(position, 1);
            saveTasks(tasks);
            renderTasks();
            break;
        }
    }
}
// if task is completed becomes incompleted and if its incompleted becomes completed
function completeTask(event) {
    const id = event.target.dataset.id;
    for (let task of tasks) {
        if (task.id == id) {
            task.completed = !task.completed;
            saveTasks(tasks);
            renderTasks();
            break;
        }
    }
}
document.getElementById('allbtn').addEventListener('click', () => {
    currentFilter = 'all';
    renderTasks();
});
document.getElementById('completedbtn').addEventListener('click', () => {
    currentFilter = 'completed';
    renderTasks();
});
document.getElementById('activebtn').addEventListener('click', () => {
    currentFilter = 'active';
    renderTasks();
});
//filter tasks array by the value of currentFilter
function filterTasks(tasks, filter) {
    switch (filter) {
        case 'all':
            return tasks;
        case 'active':
            return tasks.filter((task) => {  //filter the array by a function , using arrow function
                if (task.completed != true)
                    return task;
            }
            );
        case 'completed':
            return tasks.filter((task) => task.completed);
        default:
            return tasks;
    }

}

function sortTasks(tasks) {
    return tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

document.getElementById('sortbtn').addEventListener('click', () => {
    sortTasks(tasks);
    saveTasks(tasks);
    renderTasks();
}
);

async function fetchInitialTasks() {
    if (tasks.length > 0) {
        // We already have tasks saved, no need to fetch initial tasks again
        renderTasks();
        return;
    }
    const url = "https://jsonplaceholder.typicode.com/todos?_limit=5";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const inttasks = await response.json();
        for (let task of inttasks) {
            let taskstoadd = {
                id: task.id,
                text: task.title,
                dueDate: new Date().toISOString().split('T')[0],
                completed: task.completed
            }
            tasks.push(taskstoadd);
        }

        saveTasks(tasks);
        renderTasks();
        console.log(inttasks);
    } catch (error) {
        console.error(error.message);//incase not able to connect add default tasks.
        let intasks = [{
            id: '1',
            text: 'Task1',
            dueDate: new Date().toISOString().split('T')[0],
            completed: false
        },
        {
            id: '2',
            text: 'Task2 ',
            dueDate: new Date().toISOString().split('T')[0],
            completed: false
        },
        {
            id: '3',
            text: 'Task3',
            dueDate: new Date().toISOString().split('T')[0],
            completed: false
        },
        {
            id: '4',
            text: 'Task4',
            dueDate: new Date().toISOString().split('T')[0],
            completed: true
        },
        ];
        tasks.push(...intasks);
        saveTasks(tasks);
        renderTasks();
    }
}

fetchInitialTasks();
