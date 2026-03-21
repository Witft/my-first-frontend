const { createApp, ref, computed, onMounted } = Vue

createApp({
  setup() {
    const todos = ref([])           // 任务列表
    const newText = ref('')         // 输入框内容
    const newDate = ref('')         // 截止日期
    const newCategory = ref('work') // 分类
    const categoryFilter = ref('all') // 当前分类筛选
    const statusFilter = ref('all')   // 当前状态筛选
    const editingId = ref(null)  // 正在编辑的任务ID
    const editText = ref('')     // 编辑时的临时文本

    // 计算属性
    const filteredTodos = computed(() => {
      const filtered = todos.value.filter(t => {
        // 分类筛选
        const matchCategory = categoryFilter.value === 'all' || t.category === categoryFilter.value
        // 状态筛选
        const matchStatus = statusFilter.value === 'all'
          || (statusFilter.value === 'completed' && t.completed)
          || (statusFilter.value === 'active' && !t.completed)

        return matchCategory && matchStatus
      })

      return filtered.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      })
    })

    const stats = computed(() => {
      const completedCount = filteredTodos.value.filter(t => t.completed).length;
      const totalCount = filteredTodos.value.length;
      return `已完成 ${completedCount} / 总计 ${totalCount}`;
    })

    onMounted(() => { 
      
    })
  }
}).mount('#app')

// 分类配置
const categoryConfig = {
  work: { label: '工作', class: 'work' },
  life: { label: '生活', class: 'life' },
  study: { label: '学习', class: 'study' }
};

// 添加任务（API 版本）
async function addTodo() {
  const text = newText.value.trim();
  if (!text) return;
  const todo = {
    text: text,
    category: newCategory.value,
    dueDate: newDate.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  const newTodo = await createTodo(todo);
  todos.value.unshift(newTodo);
  newText.value = '';
  newDate.value = '';
}

// 切换完成状态（API 版本）
async function toggleTodo(id) {
  const todo = todos.value.find(t => t.id === id);
  if (!todo) return;
  const updated = await updateTodo(id, { completed: !todo.completed });
  // 更新本地数据
  const index = todos.value.findIndex(t => t.id === id);
  todos[index] = updated;
}

// 删除任务（API 版本）
async function deleteTodo(id) {
  if (!confirm('确定要删除这个任务吗？')) return;
  await deleteTodoApi(id);
  todos = todos.value.filter(t => t.id !== id);
}

// 检查是否逾期
async function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
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

// 启动
init();
