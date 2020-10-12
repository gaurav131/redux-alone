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

function handleDeleteTodo(todo) {
  return dispatch => {
    dispatch(removeTodoAction(todo.id))
    return API.deleteTodo(todo.id).catch(()=>{
      dispatch(addTodoAction(todo))
      alert("an error occurred")
    })
  }
}

function handleToggleTodo(id){
  return dispatch=>{
    dispatch(toggleTodoAction(id))
    return API.saveTodoToggle(id).catch(()=>{
      dispatch(toggleTodoAction(id))
      alert("an error occurred")
    })
  }
}

function handleAddTodo(todo, cb){
  return dispatch => {
    API.saveTodo(todo).then((todo)=>{
      dispatch(addTodoAction(todo))
      cb()
    }).catch(()=>{
      alert("an error occurred")
    })
  }
}
function handleAddGoal(goal, cb) {
  return dispatch => {
    API.saveGoal(goal).then(goal=>{
      dispatch(addGoalAction(goal))
      cb()
    }).catch(()=> {
      alert("an error occurred")
    })
  }
}
function handleRemoveGoal(goal){
  return dispatch => {
    dispatch(removeGoalAction(goal.id))
    return API.deleteGoal(goal.id).catch(()=>{
      dispatch(addGoalAction(goal))
      alert('an error occurred')
    })
  }
}
function handleInitialData(){
  return dispatch=>{
    Promise.all([API.fetchTodos(), API.fetchGoals()]).then(([todos, goals])=>{
      dispatch(receiveDataAction(todos, goals))
    })
  }
}
const store = Redux.createStore(Redux.combineReducers({
  todos,
  goals,
  loading,
}), Redux.applyMiddleware(ReduxThunk.default, checker, logger))

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount(){
    const {dispatch} = this.props
    dispatch(handleInitialData())
  }
  render() {
    if (this.props.loading === true){
      return <h3>Loading</h3>
    }
    return (
      <div>
        <ConnectTodo/>
        <ConnectGoal/>
      </div>
    )
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
    this.props.dispatch(handleAddTodo(this.input.value, ()=>this.input.value=''))
  }
  removeItem = todo=>{
    this.props.dispatch(handleDeleteTodo(todo))
  }
  toggleItem = id => {
    this.props.dispatch(handleToggleTodo(id))
  }
  render(){
    return( <div>
      <h1>TODO List</h1>
      <input type='text' ref={(input) => (this.input = input)} placeholder='Add Todo'/>
      <button onClick={this.addTodoItem}>Add Todo</button>
      <ListItems items={this.props.todos} removeItem={this.removeItem} toggle={this.toggleItem}/>
    </div>)
  }
}
class GoalList extends React.Component{
  addGoalItem = (e)=>{
    e.preventDefault()
    this.props.dispatch(handleAddGoal(this.input.value, () => this.input.value=''))

  }
  removeItem = goal=>{
    this.props.dispatch(handleRemoveGoal(goal))
  }
  render(){
    return(
      <div>
        <h1>Goal List</h1>
        <input type='text' ref={(input) => (this.input = input)} placeholder='Add Goal'/>
        <button onClick={this.addGoalItem}>Add Goal</button>
        <ListItems items={this.props.goals} removeItem={this.removeItem}/>
      </div>
    )
  }
}

const ConnectApp = ReactRedux.connect(state => ({
  loading: state.loading
}))(App)
const ConnectGoal = ReactRedux.connect(state => ({
  goals: state.goals
}))(GoalList)
const ConnectTodo = ReactRedux.connect(state => ({
  todos: state.todos
}))(TodoList)


ReactDOM.render(
  <ReactRedux.Provider store={store}>
    <ConnectApp/>
  </ReactRedux.Provider>,
  document.getElementById('app')
)