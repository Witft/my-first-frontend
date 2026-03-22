// API 封装 - 所有后端交互都在这里

const API_URL = 'http://localhost:3000/todos';

// 获取所有任务
window.fetchTodos = async function fetchTodos() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('获取任务失败');
  return response.json();
}

// 添加任务
window.createTodo = async function createTodo(todo) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todo)
  });
  if (!response.ok) throw new Error('添加任务失败');
  return response.json();
}

// 更新任务
window.updateTodo = async function updateTodo(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('更新任务失败');
  return response.json();
}

// 删除任务
window.deleteTodoApi = async function deleteTodoApi(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('删除任务失败');
  return true;
}
