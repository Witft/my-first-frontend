// Todo List - API 版本

// 任务数组
let todos = [];

// DOM 元素
const todoInput = document.getElementById('todoInput');
const dueDateInput = document.getElementById('dueDateInput');
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
async function init() {
  // 绑定事件
  addBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  // 绑定筛选按钮
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategoryFilter = btn.dataset.filter;
      renderTodos();
    });
  });

  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatusFilter = btn.dataset.status;
      renderTodos();
    });
  });

  // 从 API 加载数据
  await loadTodos();
}

// 加载数据（API 版本）
async function loadTodos() {
  try {
    todos = await fetchTodos();
    renderTodos();
  } catch (error) {
    console.error('加载失败:', error);
    alert('无法连接后端服务，请确保 json-server 已启动 (npm run api)');
  }
}

// 添加任务（API 版本）
async function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  const todo = {
    text: text,
    category: categorySelect.value,
    dueDate: dueDateInput.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  try {
    const newTodo = await createTodo(todo);
    todos.unshift(newTodo);
    renderTodos();

    // 清空输入
    todoInput.value = '';
    dueDateInput.value = '';
    todoInput.focus();
  } catch (error) {
    console.error('添加失败:', error);
    alert('添加任务失败');
  }
}

// 切换完成状态（API 版本）
async function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  try {
    const updated = await updateTodo(id, { completed: !todo.completed });
    // 更新本地数据
    const index = todos.findIndex(t => t.id === id);
    todos[index] = updated;
    renderTodos();
  } catch (error) {
    console.error('更新失败:', error);
    alert('更新状态失败');
  }
}

// 删除任务（API 版本）
async function deleteTodo(id) {
  if (!confirm('确定要删除这个任务吗？')) return;

  try {
    await deleteTodoApi(id);
    todos = todos.filter(t => t.id !== id);
    renderTodos();
  } catch (error) {
    console.error('删除失败:', error);
    alert('删除任务失败');
  }
}

// 开始编辑（本地编辑，API 保存）
async function startEdit(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;

  const todoItem = document.querySelector(`li[data-id="${id}"]`);
  const textSpan = todoItem.querySelector('.todo-text');

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'edit-input';
  input.value = todo.text;

  textSpan.replaceWith(input);
  input.focus();
  input.select();

  const saveEdit = async () => {
    const newText = input.value.trim();
    if (newText && newText !== todo.text) {
      try {
        const updated = await updateTodo(id, { text: newText });
        const index = todos.findIndex(t => t.id === id);
        todos[index] = updated;
      } catch (error) {
        console.error('保存失败:', error);
      }
    }
    renderTodos();
  };

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    } else if (e.key === 'Escape') {
      renderTodos();
    }
  });
}

// 检查是否逾期
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
}

// 渲染任务列表
function renderTodos() {
  let filteredTodos = todos;

  // 分类筛选
  if (currentCategoryFilter !== 'all') {
    filteredTodos = filteredTodos.filter(t => t.category === currentCategoryFilter);
  }

  // 状态筛选
  if (currentStatusFilter !== 'all') {
    const isCompleted = currentStatusFilter === 'completed';
    filteredTodos = filteredTodos.filter(t => t.completed === isCompleted);
  }

  if (filteredTodos.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <p>还没有任务，添加一个吧！</p>
      </div>
    `;
    statsText.textContent = '0 个任务';
    return;
  }

  // 按截止日期排序
  filteredTodos.sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  todoList.innerHTML = filteredTodos.map(todo => {
    const categoryInfo = categoryConfig[todo.category] || categoryConfig.work;
    const overdueClass = isOverdue(todo.dueDate) && !todo.completed ? 'overdue' : '';
    return `
    <li class="todo-item ${todo.completed ? 'completed' : ''} ${overdueClass}" data-id="${todo.id}">
      <input type="checkbox" 
             class="todo-checkbox" 
             ${todo.completed ? 'checked' : ''}
             onchange="toggleTodo(${todo.id})">
      <span class="todo-category ${categoryInfo.class}">${categoryInfo.label}</span>
      <span class="todo-text" ondblclick="startEdit(${todo.id})">${escapeHtml(todo.text)}</span>
      <span class="due-date">${todo.dueDate || '无截止日期'}</span>
      <button class="delete-btn" onclick="deleteTodo(${todo.id})">删除</button>
    </li>
  `}).join('');

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
