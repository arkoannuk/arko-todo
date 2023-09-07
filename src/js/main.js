// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

// Import custom utils
import { hideModalAndResetForm } from './utils.js';

class Todo {
    constructor(title, desc, date, starred, status) {
        this.title = title
        this.desc = desc
        this.date = date
        this.starred = starred
        this.status = status
    }
}

class Project {
    constructor(name) {
        this.name = name
        this.todoList = []
        this.displayController = new DisplayController()
    }

    completeTodo(checked, todoIndex, projectIndex) {
        console.log(todoIndex)
        let todo = this.todoList[todoIndex]
        if (checked) {
            todo.status = true
        } else {
            todo.status = false
        }
        this.displayController.hideTodoCard(checked, todoIndex, projectIndex)
    }

    addTodo(title, desc, date, starred, status, projectIndex) {
        this.todoList.push(new Todo(title, desc, date, starred, status))
        let todoIndex = this.todoList.length - 1
        this.displayController.addTodoCard(title, desc, date, starred, status, todoIndex, projectIndex)
    }

    deleteTodo(todoIndex, todoCard) {
        this.todoList.splice(todoIndex, 1)
        this.displayController.deleteTodoCard(todoCard)
    }

    editTodo(title, desc, date, starred, todoIndex, projectIndex) {
        let todo = this.todoList[todoIndex]
        todo.title = title
        todo.desc = desc
        todo.date = date
        todo.starred = starred

        this.displayController.editTodoCard(title, desc, date, starred, todoIndex, projectIndex)
    }
}

class DisplayController {

    hideTodoCard(checked, todoIndex, projectIndex) {
        let todoCard = document.querySelector(`[data-project-index="${projectIndex}"][data-todo-index="${todoIndex}"]`)
        let showCompleted = document.querySelector('#showCompleted').checked

        if (checked && showCompleted != true) {
            todoCard.style.display = 'none'
        } else {
            todoCard.style.display = 'block'
        }
        console.log(todoCard)
    }

    editTodoCard(title, desc, date, starred, todoIndex, projectIndex) {
        let todoCard = document.querySelector(`[data-project-index="${projectIndex}"][data-todo-index="${todoIndex}"]`)

        const todoTitle = todoCard.querySelector('.todoTitle')
        const todoDesc = todoCard.querySelector('.todoDesc')
        const todoDate = todoCard.querySelector('.todoDate')
        const todoStarred = todoCard.querySelector('.todoStarred')
        const todoEditBtn = todoCard.querySelector('.todoEditBtn')

        todoTitle.textContent = title
        todoDesc.textContent = desc

        if (date !== '') {
            todoDate.textContent = ` ${date}`
            todoDate.style.display = 'block'
        } else {
            todoDate.textContent = ` ${date}`
            todoDate.style.display = 'none'
        };

        if (starred) {
            todoStarred.style.display = 'block'
            todoEditBtn.classList.remove('ms-auto')
        } else {
            todoStarred.style.display = 'none'
            todoEditBtn.classList.add('ms-auto')
        }
    }

    deleteTodoCard(todoCard) {
        let projectIndex = todoCard.dataset.projectIndex
        todoCard.remove()
        let remainingTodoCards = document.querySelectorAll(`[data-project-index="${projectIndex}"]`);
        remainingTodoCards.forEach((card, index) => card.dataset.todoIndex = index)
    }

    addProjectSelector(name, index) {
        const projectSelectorTemp = document.getElementById('projectSelectorTemp').content.cloneNode(true)
        const projectSelectorOption = projectSelectorTemp.querySelector('.projectSelectorOption')

        projectSelectorOption.textContent = name
        projectSelectorOption.value = index

        document.getElementById('projectSelector').appendChild(projectSelectorTemp)
    }

    deleteProjectSelector() {
        let projectSelector = document.getElementById('projectSelector')
        let deletableProject = projectSelector.value
        let optionToRemove = projectSelector.querySelector(`option[value="${deletableProject}"]`);
        projectSelector.removeChild(optionToRemove);
    }

    showSelectedProject() {
        let projectIndex = document.getElementById('projectSelector').value
        let showAll = document.querySelector('#showAll').checked
        let showCompleted = document.querySelector('#showCompleted').checked
        let selectedProject = this.projectList[projectIndex]
        let selectedTodoList = selectedProject.todoList

        // This re-renders all TODOs even if showAll is already True upon Project change (TODO: optimize)
        const myNode = document.getElementById("todoList");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }

        if (showAll) {
            this.projectList.forEach((project, index) => {
                let projectIndex = index
                project.todoList.forEach((todo, index) => {
                    this.displayController.addTodoCard(todo.title, todo.desc, todo.date, todo.starred, todo.status, index, projectIndex)
                })
            })
        } else {
            selectedTodoList.forEach((todo, index) => {
                this.displayController.addTodoCard(todo.title, todo.desc, todo.date, todo.starred, todo.status, index, projectIndex)
            })
        }

        let todoCards = document.querySelectorAll('.todoCard');
        let completedTodoCards = Array.from(todoCards).filter((todoCard) => {
            let status = todoCard.querySelector('input.todoStatusBtn')
            return status.checked
        });
        completedTodoCards.forEach((todoCard) => {
            if (showCompleted) {
                todoCard.style.display = 'show' // I assume you meant 'block' instead of 'show'
            } else {
                todoCard.style.display = 'none'
            }
        })
    }

    addTodoCard(title, desc, date, starred, status, todoIndex, projectIndex) {
        const todoCardTemp = document.getElementById('todoCardTemp').content.cloneNode(true)
        const todoCard = todoCardTemp.querySelector('.todoCard')
        todoCard.dataset.projectIndex = projectIndex
        todoCard.dataset.todoIndex = todoIndex

        const todoTitle = todoCard.querySelector('.todoTitle')
        const todoDesc = todoCard.querySelector('.todoDesc')
        const todoDate = todoCard.querySelector('.todoDate')
        const todoStarred = todoCard.querySelector('.todoStarred')
        const todoEditBtn = todoCard.querySelector('.todoEditBtn')
        const todoStatusBtn = todoCard.querySelector('.todoStatusBtn')

        todoTitle.textContent = title
        todoDesc.textContent = desc

        if (status) {
            todoStatusBtn.checked = true
        } else {
            todoStatusBtn.checked = false
        }

        if (date !== '') {
            todoDate.textContent = ` ${date}`
            todoDate.style.display = 'block'
        } else {
            todoDate.textContent = ` ${date}`
            todoDate.style.display = 'none'
        }

        if (starred) {
            todoStarred.style.display = 'block'
            todoEditBtn.classList.remove('ms-auto')
        } else {
            todoStarred.style.display = 'none'
            todoEditBtn.classList.add('ms-auto')
        }

        document.getElementById('todoList').appendChild(todoCardTemp)
    }

    showEditModal(todoCard) {
        let todoTitle = todoCard.querySelector('.todoTitle').textContent
        let todoDesc = todoCard.querySelector('.todoDesc').textContent
        let todoDate = todoCard.querySelector('.todoDate').textContent
        let todoStarred = todoCard.querySelector('.todoStarred')

        let editTodoFormModal = document.getElementById('editTodoFormModal')
        editTodoFormModal.dataset.projectIndex = todoCard.dataset.projectIndex
        editTodoFormModal.dataset.todoIndex = todoCard.dataset.todoIndex

        document.getElementById("todoEditTitle").value = todoTitle;
        document.getElementById("todoEditDesc").value = todoDesc;
        document.getElementById("todoEditDate").value = todoDate.slice(1)

        if (todoStarred.style.display !== 'none') {
            document.getElementById("todoEditStarred").checked = true
        } else {
            document.getElementById("todoEditStarred").checked = false
        }
    }
}

class App {
    constructor() {
        this.projectList = []
        const defaultProject = new Project('Default')
        this.projectList.push(defaultProject)
        this.displayController = new DisplayController()

        document.getElementById('todoForm').addEventListener('submit', this.submitTodoForm.bind(this))
        document.getElementById('deleteProject').addEventListener('click', this.deleteProject.bind(this))
        document.getElementById('deleteProject').addEventListener('click', this.displayController.showSelectedProject.bind(this))
        document.getElementById('projectForm').addEventListener('submit', this.submitProjectForm.bind(this))
        document.getElementById('projectForm').addEventListener('submit', this.displayController.showSelectedProject.bind(this))
        document.getElementById('projectSelector').addEventListener('change', this.displayController.showSelectedProject.bind(this))
        document.getElementById('showAll').addEventListener('change', this.displayController.showSelectedProject.bind(this))
        document.getElementById('editTodoForm').addEventListener('submit', this.submitEditTodoForm.bind(this))
        document.getElementById('showCompleted').addEventListener('click', this.displayController.showSelectedProject.bind(this))
        document.addEventListener('click', (event) => {
            const todoDeleteBtn = event.target.closest('.todoDeleteBtn')
            const todoEditBtn = event.target.closest('.todoEditBtn')
            const todoStatusBtn = event.target.closest('.todoStatusBtn')
            const todoCard = event.target.closest('.todoCard')

            if (todoStatusBtn) {
                this.changeTodoStatus(todoStatusBtn, todoCard)
            }

            if (todoDeleteBtn) {
                this.btnDeleteTodo(todoCard)
            }
            if (todoEditBtn) {
                this.displayController.showEditModal(todoCard)
            }
        })
    }

    showCompleted() {
        console.log("test")
    }

    changeTodoStatus(todoStatusBtn, todoCard) {
        let projectIndex = todoCard.dataset.projectIndex
        let todoIndex = todoCard.dataset.todoIndex
        let checked = todoStatusBtn.checked
        this.projectList[projectIndex].completeTodo(checked, todoIndex, projectIndex)
    }

    deleteProject() {
        let projectIndex = document.getElementById('projectSelector').value
        if (projectIndex != 0) { //Default project can't be deleted
            this.projectList.splice(projectIndex, 1);
            this.displayController.deleteProjectSelector()

        } else {
            alert("Default project can't be deleted")
        }
    }

    addProject(name) {
        this.projectList.push(new Project(name))
        let index = this.projectList.length - 1
        this.displayController.addProjectSelector(name, index)
    }

    submitEditTodoForm(event) {
        event.preventDefault()

        let editTodoFormModal = document.getElementById('editTodoFormModal')
        let projectIndex = editTodoFormModal.dataset.projectIndex
        let todoIndex = editTodoFormModal.dataset.todoIndex

        let title = document.getElementById('todoEditTitle').value
        let desc = document.getElementById('todoEditDesc').value
        let date = document.getElementById('todoEditDate').value

        const todoStarredCheckbox = document.querySelector('#todoEditStarred')
        let starred = todoStarredCheckbox.checked

        this.projectList[projectIndex].editTodo(title, desc, date, starred, todoIndex, projectIndex)
        hideModalAndResetForm('editTodoFormModal', 'editTodoForm');
    }

    submitProjectForm(event) {
        event.preventDefault()
        let name = document.getElementById('projectName').value
        this.addProject(name)
        hideModalAndResetForm('projectFormModal', 'projectForm');
    }

    btnDeleteTodo(todoCard) {
        let projectIndex = todoCard.dataset.projectIndex
        let todoIndex = todoCard.dataset.todoIndex
        this.projectList[projectIndex].deleteTodo(todoIndex, todoCard)
    }

    submitTodoForm(event) {
        event.preventDefault()

        let title = document.getElementById('todoTitle').value
        let desc = document.getElementById('todoDesc').value
        let date = document.getElementById('todoDate').value
        const todoStarredCheckbox = document.querySelector('#todoStarred')
        let starred = todoStarredCheckbox.checked
        let status = false
        let projectIndex = document.getElementById('projectSelector').value

        this.projectList[projectIndex].addTodo(title, desc, date, starred, status, projectIndex)
        hideModalAndResetForm('todoFormModal', 'todoForm');
    }

    createSampleData() {
        this.addProject('Project A')
        this.addProject('Project B')
        this.projectList[0].addTodo('Task 1', 'Description for Task 1', '', false, false, 0)
        this.projectList[0].addTodo('Task 2', 'Description for Task 2', '2023-09-15', false, false, 0);
        this.projectList[1].addTodo('Task 3', 'Description for Task 3', '', true, false, 1);
        this.projectList[1].addTodo('Task 33', 'Description for Task 3', '', true, false, 1);
        this.projectList[1].addTodo('Task 4', 'Description for Task 4', '2023-09-20', true, false, 1);
        this.projectList[2].addTodo('Task 5', 'Description for Task 5', '2023-09-21', true, false, 2);
        console.log(this.projectList)
    }
}

const app = new App()
app.createSampleData()