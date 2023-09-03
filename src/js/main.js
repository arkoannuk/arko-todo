// Import our custom CSS
import '../scss/styles.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

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
    }

    addTodo() {
        this.todoList.push(new Todo(title, desc, date, starred))
        console.log(this.todoList)

    }

}

class App {
    constructor() {
        this.projectList = []
        const defaultProject = new Project('Default')
        this.projectList.push(defaultProject)
        console.log(this.projectList)
    }

    addProject() {
        let name = prompt('What is the project name?')
        this.projectList.push(new Project(name))
        console.log(this.projectList)
    }

    
}

const app = new App();