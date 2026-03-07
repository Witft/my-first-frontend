// Todo List 核心逻辑

// 数据存储键名
const STORAGE_KEY = 'todo-list-data';

// 任务数组
let todos = [];

// DOM 元素
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const statsText = document.getElementById('statsText');

// 初始化
function init() {
  // 从 localStorage 加载数据
  loadTodos();
  
  // 绑定事件
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  // 渲染列表
  renderTodos();
}

// 加载数据
function loadTodos() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    todos = JSON.parse(stored);
  }
}

// 保存数据
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 添加任务
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;
  
  const todo = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.unshift(todo); // 新任务放最前面
  saveTodos();
  renderTodos();
  
  // 清空输入框
  todoInput.value = '';
  todoInput.focus();
}

// 切换完成状态
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos();
  }
}

// 删除任务
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

// 渲染任务列表
function renderTodos() {
  if (todos.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <p>还没有任务，添加一个吧！</p>
      </div>
    `;
    statsText.textContent = '0 个任务';
    return;
  }
  
  todoList.innerHTML = todos.map(todo => `
    <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <input type="checkbox" 
             class="todo-checkbox" 
             ${todo.completed ? 'checked' : ''}
             onchange="toggleTodo(${todo.id})">
      <span class="todo-text">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" onclick="deleteTodo(${todo.id})">删除</button>
    </li>
  `).join('');
  
  // 更新统计
  const completedCount = todos.filter(t => t.completed).length;
  statsText.textContent = `${todos.length} 个任务 · ${completedCount} 个已完成`;
}

// 防止 XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 启动
init();
