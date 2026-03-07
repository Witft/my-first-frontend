// Todo List 核心逻辑

// 数据存储键名
const STORAGE_KEY = 'todo-list-data';

// 任务数组
let todos = [];

// DOM 元素
const todoInput = document.getElementById('todoInput');
const categorySelect = document.getElementById('categorySelect');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const statsText = document.getElementById('statsText');
const filterBtns = document.querySelectorAll('.filter-btn');
const statusBtns = document.querySelectorAll('.status-btn');

// 分类配置
const categoryConfig = {
  work: { label: '工作', class: 'work' },
  life: { label: '生活', class: 'life' },
  study: { label: '学习', class: 'study' }
};

// 当前筛选状态
let currentCategoryFilter = 'all';
let currentStatusFilter = 'all';

// 初始化
function init() {
  // 从 localStorage 加载数据
  loadTodos();
  
  // 绑定事件
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });
  
  // 绑定分类筛选按钮事件
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 更新激活状态
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 更新筛选条件
      currentCategoryFilter = btn.dataset.filter;
      renderTodos();
    });
  });
  
  // 绑定状态筛选按钮事件
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 更新激活状态
      statusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // 更新筛选条件
      currentStatusFilter = btn.dataset.status;
      renderTodos();
    });
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
  
  const category = categorySelect.value;
  
  const todo = {
    id: Date.now(),
    text: text,
    category: category,
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

// 开始编辑任务
function startEdit(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  
  const todoItem = document.querySelector(`li[data-id="${id}"]`);
  const textSpan = todoItem.querySelector('.todo-text');
  
  // 创建输入框替换文字
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = todo.text;
  
  // 替换 DOM
  textSpan.replaceWith(input);
  input.focus();
  input.select();
  
  // 保存编辑的函数
  const saveEdit = () => {
    const newText = input.value.trim();
    if (newText && newText !== todo.text) {
      todo.text = newText;
      saveTodos();
    }
    renderTodos();
  };
  
  // 绑定事件
  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur(); // 触发保存
    } else if (e.key === 'Escape') {
      renderTodos(); // 取消编辑，重新渲染
    }
  });
}

// 渲染任务列表
function renderTodos() {
  // 根据筛选条件过滤任务
  let filteredTodos = todos;
  
  // 分类筛选
  if (currentCategoryFilter !== 'all') {
    filteredTodos = filteredTodos.filter(todo => todo.category === currentCategoryFilter);
  }
  
  // 状态筛选
  if (currentStatusFilter !== 'all') {
    const isCompleted = currentStatusFilter === 'completed';
    filteredTodos = filteredTodos.filter(todo => todo.completed === isCompleted);
  }
  
  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <p>${currentFilter === 'all' ? '还没有任务，添加一个吧！' : '该分类下没有任务'}</p>
      </div>
    `;
    statsText.textContent = '0 个任务';
    return;
  }
  
  todoList.innerHTML = filteredTodos.map(todo => {
    const categoryInfo = categoryConfig[todo.category] || categoryConfig.work;
    return `
    <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
      <input type="checkbox" 
             class="todo-checkbox" 
             ${todo.completed ? 'checked' : ''}
             onchange="toggleTodo(${todo.id})">
      <span class="todo-category ${categoryInfo.class}">${categoryInfo.label}</span>
      <span class="todo-text" ondblclick="startEdit(${todo.id})">${escapeHtml(todo.text)}</span>
      <button class="delete-btn" onclick="deleteTodo(${todo.id})">删除</button>
    </li>
  `}).join('');
  
  // 更新统计
  const completedCount = filteredTodos.filter(t => t.completed).length;
  const totalCount = filteredTodos.length;
  statsText.textContent = `${totalCount} 个任务 · ${completedCount} 个已完成`;
}

// 防止 XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 启动
init();
