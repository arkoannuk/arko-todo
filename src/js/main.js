// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

// Import custom utils
import { hideModalAndResetForm } from './utils.js';

class Todo {
    constructor(title, desc, date, starred) {
        this.title = title
        this.desc = desc
        this.date = date
        this.starred = starred
    }
}

class Project {
    constructor(name) {
        this.name = name
        this.todoList = []
        this.displayController = new DisplayController()
    }

    addTodo(title, desc, date, starred, project) {
        this.todoList.push(new Todo(title, desc, date, starred, project))
        let todoIndex = this.todoList.length - 1
        this.displayController.addTodoCard(title, desc, date, starred, todoIndex, project)
    }

}

class DisplayController {
    addProjectSelector(name, index) {
        const projectSelectorTemp = document.getElementById('projectSelectorTemp').content.cloneNode(true)
        const projectSelectorOption = projectSelectorTemp.querySelector('.projectSelectorOption')

        projectSelectorOption.textContent = name
        projectSelectorOption.value = index

        document.getElementById('projectSelector').appendChild(projectSelectorTemp)
    }

    showSelectedProject() {
        let project = document.getElementById('projectSelector').value

        let selectedProject = this.projectList[project]
        let selectedTodoList = selectedProject.todoList

        const myNode = document.getElementById("todoList");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }

        console.log(selectedTodoList)

        selectedTodoList.forEach((Todo, index) => {
            console.log(Todo.title)
            console.log(index)
            this.displayController.addTodoCard(Todo.title, Todo.desc, Todo.date, Todo.starred, index, project)
        })
    }

    addTodoCard(title, desc, date, starred, todoIndex, projectIndex) {
        const todoCardTemp = document.getElementById('todoCardTemp').content.cloneNode(true)
        const todoCard = todoCardTemp.querySelector('.todoCard')
        todoCard.dataset.projectIndex = projectIndex
        todoCard.dataset.todoIndex = todoIndex

        const todoTitle = todoCard.querySelector('.todoTitle')
        const todoText = todoCard.querySelector('.todoText')
        const todoDate = todoCard.querySelector('.todoDate')
        const todoStarred = todoCard.querySelector('.todoStarred')

        todoTitle.textContent = title
        todoText.textContent = desc
        todoDate.textContent = date
        todoStarred.textContent = starred

        document.getElementById('todoList').appendChild(todoCardTemp)
    }
}

class App {
    constructor() {
        this.projectList = []
        const defaultProject = new Project('Default')
        this.projectList.push(defaultProject)
        this.displayController = new DisplayController()

        document.getElementById('todoForm').addEventListener('submit', this.submitTodoForm.bind(this));
        document.getElementById('projectForm').addEventListener('submit', this.submitProjectForm.bind(this));
        document.getElementById('projectSelector').addEventListener('change', this.displayController.showSelectedProject.bind(this));
    }

    addProject(name) {
        this.projectList.push(new Project(name))
        let index = this.projectList.length - 1
        this.displayController.addProjectSelector(name, index)
    }

    submitProjectForm(event) {
        event.preventDefault()

        let name = document.getElementById('projectName').value

        this.addProject(name)
        hideModalAndResetForm('projectFormModal', 'projectForm');
    }

    submitTodoForm(event) {
        event.preventDefault()

        let title = document.getElementById('todoTitle').value
        let desc = document.getElementById('todoDesc').value
        let date = document.getElementById('todoDate').value
        const todoStarredCheckbox = document.querySelector('#todoStarred')
        let starred = todoStarredCheckbox.checked
        let project = document.getElementById('projectSelector').value

        this.projectList[project].addTodo(title, desc, date, starred, project)
        hideModalAndResetForm('todoFormModal', 'todoForm');
    }

    createSampleData() {
        this.addProject('Project A');
        this.addProject('Project B')
        this.projectList[0].addTodo('Task 1', 'Description for Task 1', '2023-09-10', false, 0);
        this.projectList[0].addTodo('Task 2', 'Description for Task 2', '2023-09-15', true, 0);
        this.projectList[1].addTodo('Task 3', 'Description for Task 3', '2023-09-12', false, 1);
        this.projectList[1].addTodo('Task 4', 'Description for Task 4', '2023-09-20', true, 1);
        this.projectList[2].addTodo('Task 5', 'Description for Task 5', '2023-09-21', true, 0);
    }
}

const app = new App()
app.createSampleData()