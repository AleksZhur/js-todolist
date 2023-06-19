(function () {
    //Globals
    const todoList = document.getElementById('todo-list');
    const userSelect = document.getElementById('user-todo');
    const form = document.querySelector('form');
    let todos = [];
    let users = [];

    //Attach Events
    document.addEventListener('DOMContentLoaded', initApp);
    form.addEventListener('submit', handlerSubmit);

    //Basic Logic
    function getUserName(userId) {
        const user = users.find(u => u.id === userId);
        return user.name;
    }

    function printToDo({ id, userId, title, completed }) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = id;
        li.innerHTML = `<span>${title} <i>by</i> <b>${getUserName(userId)}</b></span>`;

        const status = document.createElement('input');
        status.type = 'checkbox';
        status.checked = completed;
        status.addEventListener('change', handleTodoChange);

        const close = document.createElement('span');
        close.innerHTML = '&times;';
        close.className = 'close';
        close.addEventListener('click', handleClose);

        li.prepend(status);
        li.append(close);

        todoList.prepend(li);
    }

    function removeTodo(todoId) {
        todos = todos.filter(todo => todoId !== todoId);

        const todo = todoList.querySelector(`[data-id="${todoId}"]`);
        todo.querySelector('input').removeEventListener('change', handleTodoChange);
        todo.querySelector('.close').removeEventListener('click', handleClose);

        todo.remove();
    }

    function alertError(error) {
        alert(error.message);
    }

    function createUserOption(user) {
        const option = document.createElement('option');
        option.value = user.id;
        option.innerHTML = user.name;

        userSelect.append(option);
    }

    //Event Logic
    async function initApp() {
        try {
            const [todosData, usersData] = await Promise.all([getAllToDos(), getAllUsers()]);
            todos = todosData;
            users = usersData;

            todos.forEach((todo) => printToDo(todo));
            users.forEach((user) => createUserOption(user));
        } catch (error) {
            console.log('An error occurred while initializing the app:', error);
        }
    }

    function handlerSubmit(event) {
        event.preventDefault();

        createToDo({
            userId: Number(form.user.value),
            title: form.todo.value,
            completed: false,
        });
    }

    function handleTodoChange() {
        const todoId = this.parentElement.dataset.id;
        const completed = this.checked;

        toggleToDoComplete(todoId, completed);
    }

    function handleClose() {
        const todoId = this.parentElement.dataset.id;
        deleteTodo(todoId);
    }

    // async Logic
    async function getAllToDos() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos');
            const data = await response.json();
            return data;
        } catch (error) {
            console.log('An error occurred while fetching todos:', error);
            return [];
        }
    }

    async function getAllUsers() {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/users');
            const data = await response.json();
            return data;
        } catch (error) {
            console.log('An error occurred while fetching users:', error);
            return [];
        }
    }

    async function createToDo(todo) {
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
                method: 'POST',
                body: JSON.stringify(todo),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const newToDo = await response.json();
                printToDo(newToDo);
            } else {
                console.log('Failed to create todo:', response.status, response.statusText);
            }
        } catch (error) {
            console.log('An error occurred while creating todo:', error);
        }
    }


    async function toggleToDoComplete(todoId, completed) {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
            method: 'PATCH',
            body: JSON.stringify({ completed }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Ошибка сервера');
        }
    }

    async function deleteTodo(todoId) {
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (response.ok) {
            removeTodo(todoId);
        } else {
            throw new Error('Ошибка сервера');
        }
    }
}) ()