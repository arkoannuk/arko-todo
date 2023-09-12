// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

// Import custom utils
import { hideModalAndResetForm } from './utils.js'

// Import data-fns
import { format, parseISO } from 'date-fns'

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
        let todo = this.todoList[todoIndex]
        if (checked) {
            todo.status = true
        } else {
            todo.status = false
        }
        this.displayController.hideTodoCard(checked, todoIndex, projectIndex)
        this.todoList = this.sortTodoList(this.todoList) // This should be sorted when clicking
    }

    addTodo(title, desc, date, starred, status, projectIndex) {
        this.todoList.push(new Todo(title, desc, date, starred, status))
        let todoIndex = this.todoList.length - 1 // This is being calculated wrong since the this.todoList will be sorted | Should've used IDs from the start (TODO: Optimize)
        this.todoList = this.sortTodoList(this.todoList)
        this.displayController.addTodoCard(title, desc, date, starred, status, todoIndex, projectIndex, true)
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

    sortTodoList(sortableTodoList) {
        const sortedTasks = sortableTodoList.sort((a, b) => {
            // First, compare the "status" values
            if (b.status !== a.status) {
                return a.status - b.status;
            }

            // Next, compare the "starred" values
            if (b.starred !== a.starred) {
                return b.starred - a.starred;
            }

            // If both have the same "starred" value, then compare by date
            if (a.date && !b.date) {
                return -1; // a comes first because it has a date
            } else if (!a.date && b.date) {
                return 1; // b comes first because it has a date
            } else if (a.date && b.date) {
                // If both have dates, compare them
                return new Date(a.date) - new Date(b.date);
            }
            // If both have the same "starred" value and no dates, maintain their original order
            return 0;
        });
        return sortedTasks
    }
}

class DisplayController {

    hideTodoCard(checked, todoIndex, projectIndex) {
        let todoCard = document.querySelector(`[data-project-index="${projectIndex}"][data-todo-index="${todoIndex}"]`)
        let showDone = document.querySelector('#showDone').checked

        if (checked && showDone != true) {
            todoCard.style.display = 'none'
        } else {
            todoCard.style.display = 'show'
        }
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
            // todoDate.textContent = ` ${format(parseISO(date), 'dd-MM-yy')}`
            todoDate.textContent = ` ${date}`
            todoDate.style.display = 'block'
        } else {
            todoDate.textContent = ``
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

    deleteProjectSelector() {
        let projectSelector = document.getElementById('projectSelector')
        let deletableProject = projectSelector.value
        let optionToRemove = projectSelector.querySelector(`option[value="${deletableProject}"]`);
        projectSelector.removeChild(optionToRemove);

        let options = projectSelector.getElementsByTagName('option');
        for (let i = 0; i < options.length; i++) { // Update remaining selector values
            options[i].value = i
        }
    }

    showSelectedProject() {
        const projectIndex = document.getElementById('projectSelector').value
        const showAll = document.querySelector('#showAll').checked
        const showDone = document.querySelector('#showDone').checked
        const storedProjects = app.getStorage()

        storedProjects.forEach((project, projectIndex) => {
            // Check if a project selector with the same value exists
            const existingSelector = document.querySelector(`option[value="${projectIndex}"]`);
            if (!existingSelector) {
                this.displayController.addProjectSelector(project.name, projectIndex);
            }
        })

        // This re-renders all TODOs even if showAll is already True upon Project change (TODO: optimize)
        const myNode = document.getElementById("todoList");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }

        if (showAll) {
            storedProjects.forEach((project, projectIndex) => {
                let projectName = document.createElement('h3');
                projectName.classList.add('mt-2', 'text-center', "text-secondary")
                projectName.textContent = `${project.name}`


                project.todoList.forEach((todo, todoIndex) => {
                    if (todoIndex === 0) {
                        document.getElementById('todoList').appendChild(projectName);
                    }
                    this.displayController.addTodoCard(todo.title, todo.desc, todo.date, todo.starred, todo.status, todoIndex, projectIndex, false);
                });
                if (project.todoList.length === 0) {
                    document.getElementById('todoList').appendChild(projectName);
                }
            })
        } else {
            let selectedProject = storedProjects[projectIndex]
            let projectName = document.createElement('h3');
            projectName.classList.add('mt-2', 'text-center', "text-secondary")
            projectName.textContent = `${selectedProject.name}`

            document.getElementById('todoList').appendChild(projectName);
            selectedProject.sortTodoList(selectedProject.todoList).forEach((todo, index) => {
                this.displayController.addTodoCard(todo.title, todo.desc, todo.date, todo.starred, todo.status, index, projectIndex, false)
            })
        }

        let todoCards = document.querySelectorAll('.todoCard');
        let DoneTodoCards = Array.from(todoCards).filter((todoCard) => {
            let status = todoCard.querySelector('input.todoStatusBtn')
            return status.checked
        });
        DoneTodoCards.forEach((todoCard) => {
            if (showDone) {
                todoCard.style.display = 'show'
            } else {
                todoCard.style.display = 'none'
            }
        })
    }

    addProjectSelector(name, index) {
        const projectSelectorTemp = document.getElementById('projectSelectorTemp').content.cloneNode(true)
        const projectSelectorOption = projectSelectorTemp.querySelector('.projectSelectorOption')

        projectSelectorOption.textContent = name
        projectSelectorOption.value = index

        document.getElementById('projectSelector').appendChild(projectSelectorTemp)
    }

    addTodoCard(title, desc, date, starred, status, todoIndex, projectIndex, newCard) {
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
            // todoDate.textContent = ` ${format(parseISO(date), 'dd-MM-yy')}`
            todoDate.textContent = ` ${date}`
            todoDate.style.display = 'show'
        } else {
            todoDate.textContent = ``
            todoDate.style.display = 'none'
        }

        if (starred) {
            todoStarred.style.display = 'show'
            todoEditBtn.classList.remove('ms-auto')
        } else {
            todoStarred.style.display = 'none'
            todoEditBtn.classList.add('ms-auto')
        }

        if (newCard) { // This is deprecated due to refresh happening after every add

            const todoList = document.getElementById('todoList');
            todoList.insertBefore(todoCardTemp, todoList.firstChild);
        } else {
            document.getElementById('todoList').appendChild(todoCardTemp)
        }
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
        // const defaultProject = new Project('Default')
        // // this.projectList.push(defaultProject)
        this.displayController = new DisplayController()

        document.getElementById('todoForm').addEventListener('submit', this.submitTodoForm.bind(this))
        document.getElementById('deleteProject').addEventListener('click', this.deleteProject.bind(this))
        document.getElementById('deleteProject').addEventListener('click', this.displayController.showSelectedProject.bind(this))
        document.getElementById('projectForm').addEventListener('submit', this.submitProjectForm.bind(this))
        document.getElementById('projectForm').addEventListener('submit', this.displayController.showSelectedProject.bind(this))
        document.getElementById('projectSelector').addEventListener('change', this.displayController.showSelectedProject.bind(this))
        document.getElementById('showAll').addEventListener('change', this.displayController.showSelectedProject.bind(this));
        document.getElementById('showDone').addEventListener('click', this.displayController.showSelectedProject.bind(this))
        document.getElementById('editTodoForm').addEventListener('submit', this.submitEditTodoForm.bind(this))
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

    changeTodoStatus(todoStatusBtn, todoCard) {
        const storedProjects = this.getStorage()
        let projectIndex = todoCard.dataset.projectIndex
        let todoIndex = todoCard.dataset.todoIndex
        let checked = todoStatusBtn.checked
        storedProjects[projectIndex].completeTodo(checked, todoIndex, projectIndex)
        localStorage.setItem('appJSON', JSON.stringify(storedProjects))
        this.callOutSort()
    }

    deleteProject() {
        const storedProjects = this.getStorage()
        let projectIndex = document.getElementById('projectSelector').value
        if (projectIndex != 0) { //Default project can't be deleted
            storedProjects.splice(projectIndex, 1)
            localStorage.setItem('appJSON', JSON.stringify(storedProjects))
            this.displayController.deleteProjectSelector()

        } else {
            alert("Default project can't be deleted")
        }
    }

    addProject(name) {
        const storedProjects = this.getStorage()
        storedProjects.push(new Project(name))
        localStorage.setItem('appJSON', JSON.stringify(storedProjects))
        let index = storedProjects.length - 1
        this.displayController.addProjectSelector(name, index)
    }

    submitEditTodoForm(event) {
        const storedProjects = this.getStorage()
        event.preventDefault()

        let editTodoFormModal = document.getElementById('editTodoFormModal')
        let projectIndex = editTodoFormModal.dataset.projectIndex
        let todoIndex = editTodoFormModal.dataset.todoIndex

        let title = document.getElementById('todoEditTitle').value
        let desc = document.getElementById('todoEditDesc').value
        let date = document.getElementById('todoEditDate').value

        const todoStarredCheckbox = document.querySelector('#todoEditStarred')
        let starred = todoStarredCheckbox.checked

        storedProjects[projectIndex].editTodo(title, desc, date, starred, todoIndex, projectIndex)
        localStorage.setItem('appJSON', JSON.stringify(storedProjects))
        // this.projectList[projectIndex].editTodo(title, desc, date, starred, todoIndex, projectIndex)
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

        const storedProjects = this.getStorage()

        // this.projectList[projectIndex].deleteTodo(todoIndex, todoCard)
        storedProjects[projectIndex].deleteTodo(todoIndex, todoCard)
        localStorage.setItem('appJSON', JSON.stringify(storedProjects))
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

        const storedProjects = this.getStorage()

        // this.projectList[projectIndex].addTodo(title, desc, date, starred, status, projectIndex)
        storedProjects[projectIndex].addTodo(title, desc, date, starred, status, projectIndex)
        localStorage.setItem('appJSON', JSON.stringify(storedProjects))
        hideModalAndResetForm('todoFormModal', 'todoForm')
        app.callOutSort() // Otherwise the todoIndex won't properly get updated (TODO: Optimize)
    }

    createSampleData() {
        // Check if there's no data in localStorage.
        if (!localStorage.getItem("appJSON")) {
            // Initialize with default data.

            // this.addProject('Default');
            this.projectList.push(new Project('General'))
            this.projectList.push(new Project('Work'))
            this.projectList.push(new Project('Health'))

            this.projectList[0].addTodo('Buy Groceries', 'Pick up milk, eggs, bread, and vegetables on the way home from work.', '2023-09-12', true, false, 0);
            this.projectList[0].addTodo('Plan Vacation', 'Research and plan a family vacation to the beach for next summer.', '', false, false, 0);
            this.projectList[0].addTodo('Water Plants', 'Weekly watering required for my living room plants.', '', true, true, 0);
            this.projectList[1].addTodo('Prepare Presentation', 'Create slides and outline for the upcoming client presentation.', '2023-09-25', false, false, 1);
            this.projectList[2].addTodo('Start Exercise Routine', 'Start a new workout routine, including cardio and strength training.', '2023-09-15', true, false, 2);
            this.projectList[2].addTodo('Plan Healthier Diet', 'Research and gather a list of healthy recipes for next week.', '2023-09-10', false, false, 2);

            localStorage.setItem('appJSON', JSON.stringify(this.projectList));
            console.log("Sample Data Created")
            console.log(this.projectList)
            this.callOutSort()
        }
    }

    callOutSort() {
        // Trigger the onChange event of projectSelector
        const projectSelector = document.getElementById('projectSelector');
        const event = new Event('change');
        projectSelector.dispatchEvent(event);
    }

    getStorage() {
        const storedAppJSON = localStorage.getItem("appJSON")
        const storedAppData = JSON.parse(storedAppJSON)

        const storedProjects = []
        storedAppData.forEach((projectData) => {
            const project = new Project(projectData.name)

            projectData.todoList.forEach((todoData) => {
                const todo = new Todo(todoData.title, todoData.desc, todoData.date, todoData.starred, todoData.status)
                project.todoList.push(todo)
            })

            storedProjects.push(project)
        })

        console.log(storedProjects)
        return storedProjects
    }

}

const app = new App()
app.createSampleData()
app.callOutSort()
document.getElementById('projectSelector').value = "0"