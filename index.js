function generateId () {
      return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
    }


// app todo
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const TOGGLE_TODO = 'TOGGLE_TODO'
const ADD_GOAL = 'ADD_GOAL'
const REMOVE_GOAL = 'REMOVE_GOAL'

function addTodoAction(todo){
    return {
        type: ADD_TODO,
        todo
    }
}
function removeTodoAction(id){
    return {
        type: REMOVE_TODO,
        id
    }
}
function toggleTodoAction(action){
    return {
        type: TOGGLE_TODO,
        id: action
    }
}
function addGoalAction(goal) {
    return {
        type: ADD_GOAL,
        goal: goal
    }
}
function removeGoalAction(id) {
    return {
        type: REMOVE_GOAL,
        id
    }
}

function todos(state = [], action) {
    switch (action.type) {
        case ADD_TODO:
            return state.concat([action.todo])
        case REMOVE_TODO:
            return state.filter(value => value.id!==action.id)
        case TOGGLE_TODO:
            console.log(state)
            return state.map((todo) => todo.id !== action.id ? todo :
            Object.assign({}, todo, { complete: !todo.complete }))
        default:
            return state
    }
}

function goals(state = [], action) {
    switch (action.type) {
        case ADD_GOAL:
            return state.concat([action.goal])
        case REMOVE_GOAL:
            return state.filter(value => value.id !== action.id)
        default:
            return state
    }
}

const checker = (store) => (next) => (action) => {
    if (action.type === ADD_TODO && action.todo.name.toLowerCase().includes('bitcoin')){
        return alert('This is strictly prohibited')
    }
    if (action.type === ADD_GOAL && action.goal.name.toLowerCase().includes('bitcoin')){
        return alert('This is strictly prohibited')
    }
    return next(action)
}
const logger = (store) => (next) => (action) => {
    console.group(action.type)
        console.log('the action is: ',action)
        const result = next(action)
        console.log('new state is: ', store.getState())
    console.groupEnd()
    return  result
}

const store = Redux.createStore(Redux.combineReducers({
    todos,
    goals,
}), Redux.applyMiddleware(checker, logger))

function addTodo() {
    const input = document.getElementById('todo')
    const name = input.value
    input.value = ''
   store.dispatch(addTodoAction({
        name,
        id: generateId(),
        complete: false
    }))
}

function addGoal() {
    const input = document.getElementById('goal')
    const name = input.value
    input.value = ''
   store.dispatch(addGoalAction({
        name: name,
        id: generateId()
    }))
}
document.getElementById('todoBtn').addEventListener('click', addTodo)
document.getElementById('goalBtn').addEventListener('click', addGoal)
store.subscribe(() => {
    const {goals, todos} = store.getState()
    $('#goalList').empty()
    $('#todoList').empty()
    goals.forEach(addGoalDom)
    todos.forEach(addTodoDom)
})

function addGoalDom(goal) {
    let node = $(`<li>${goal.name}</li>`)
    let button = $('<button>X</button>')
    button.on('click', ()=>{
       store.dispatch(removeGoalAction(goal.id))
    })
    $('#goalList').append(node).append(button)
}
function addTodoDom(todo) {
    let node = $(`<li>${todo.name}</li>`)
    let button = $('<button>X</button>')
    button.on('click', ()=>{
       store.dispatch(removeTodoAction(todo.id))
    })
    node.css('text-decoration', todo.complete?'line-through': 'none')
    node.on('click', ()=>{
       store.dispatch(toggleTodoAction(todo.id))})
    $('#todoList').append(node).append(button)
}

function App(props) {
    return <div><TodoList store={props.store}/><GoalList store={props.store}/></div>
}
function ListItems(props){
    return (<ul>
        {props.items.forEach(item => <li>{item.name}</li>)}
    </ul>)
}

class TodoList extends React.Component{
    addTodoItem = (e)=>{
        e.preventDefault()
        const name = this.input.value
        this.input.value = ''
        this.props.store.dispatch(addTodoAction({
            name,
            id: generateId(),
            complete: false
        }))
    }
    render(){
        return( <div>
            <h1>TODO List</h1>
            <input type='text' ref={(input) => (this.input = input)} placeholder='Add Todo'/>
            <button onClick={this.addTodoItem}>Add Todo</button>
            <ListItems items={this.props.store.getState().todos}/>
            </div>)
    }
}
class GoalList extends React.Component{
    render(){
        return( <div>
        <h1>Goal List</h1>
        <ListItems items={this.props.store.getState().goals}/>
        </div>)
    }
}

ReactDOM.render(<App store={store}/>, document.getElementById('app'))