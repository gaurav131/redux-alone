function generateId () {
      return Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
    }


// app todo
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const TOGGLE_TODO = 'TOGGLE_TODO'
const ADD_GOAL = 'ADD_GOAL'
const REMOVE_GOAL = 'REMOVE_GOAL'
const RECEIVE_DATA = 'RECEIVE_DATA'

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

function receiveDataAction(todos, goals) {
    return{
        type: RECEIVE_DATA,
        todos,
        goals
    }
}


function todos(state = [], action) {
    switch (action.type) {
        case ADD_TODO:
            return state.concat([action.todo])
        case REMOVE_TODO:
            return state.filter(value => value.id!==action.id)
        case TOGGLE_TODO:
            return state.map((todo) => todo.id !== action.id ? todo :
            Object.assign({}, todo, { complete: !todo.complete }))
        case RECEIVE_DATA:
            return action.todos
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
        case RECEIVE_DATA:
            return action.goals
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
function loading(state=true, action) {
    switch (action.type) {
        case RECEIVE_DATA:
            return false
        default:
            return state
    }
}
const store = Redux.createStore(Redux.combineReducers({
    todos,
    goals,
    loading,
}), Redux.applyMiddleware(checker, logger))

class App extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        const {store} = this.props
        store.subscribe(()=> this.forceUpdate())
        Promise.all([API.fetchTodos(), API.fetchGoals()]).then(([todos, goals])=>{
            store.dispatch(receiveDataAction(todos, goals))
        })
    }
    render() {
        if (this.props.store.getState().loading === true){
            return <h3>Loading</h3>
        }
        return <div><TodoList store={this.props.store}/><GoalList store={this.props.store}/></div>
    }
}
function ListItems(props){
    return (<ul>
        {props.items.map(item => {
            return <li key={item.id}>
                <span onClick={()=>props.toggle && props.toggle(item.id)}
                      style={{textDecoration: item.complete?'line-through': 'none'}}>{item.name}</span>
                <button onClick={() => props.removeItem(item)}>X</button></li>
        })}
    </ul>)
}

class TodoList extends React.Component{
    addTodoItem = (e)=>{
        e.preventDefault()
        API.saveTodo(this.input.value).then((todo)=>{
            this.props.store.dispatch(addTodoAction(todo))
            this.input.value = ''
        }).catch(()=>{
            alert("an error occurred")
        })
    }
    removeItem = todo=>{
        this.props.store.dispatch(removeTodoAction(todo.id))
        return API.deleteTodo(todo.id).catch(()=>{
            this.props.store.dispatch(addTodoAction(todo))
            alert("an error occurred")
        })
    }
    toggleItem = id => {
        this.props.store.dispatch(toggleTodoAction(id))
        return API.saveTodoToggle(id).catch(()=>{
            this.props.store.dispatch(toggleTodoAction(id))
            alert("an error occurred")
        })
    }
    render(){
        return( <div>
            <h1>TODO List</h1>
            <input type='text' ref={(input) => (this.input = input)} placeholder='Add Todo'/>
            <button onClick={this.addTodoItem}>Add Todo</button>
            <ListItems items={this.props.store.getState().todos} removeItem={this.removeItem} toggle={this.toggleItem}/>
            </div>)
    }
}
class GoalList extends React.Component{
    addGoalItem = (e)=>{
        e.preventDefault()

        API.saveGoal(this.input.value).then(goal=>{
            this.props.store.dispatch(addGoalAction(goal))
            this.input.value = ''
        }).catch(()=>{
            alert("an error occurred")
        })

    }
    removeItem = goal=>{
        this.props.store.dispatch(removeGoalAction(goal.id))
        return API.deleteGoal(goal.id).catch(()=>{
            this.props.store.dispatch(addGoalAction(goal))
            alert('an error occurred')
        })
    }
    render(){
        return(
            <div>
            <h1>Goal List</h1>
            <input type='text' ref={(input) => (this.input = input)} placeholder='Add Goal'/>
            <button onClick={this.addGoalItem}>Add Todo</button>
            <ListItems items={this.props.store.getState().goals} removeItem={this.removeItem}/>
            </div>
        )
    }
}

ReactDOM.render(<App store={store}/>, document.getElementById('app'))