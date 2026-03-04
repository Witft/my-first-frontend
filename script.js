// ===== 主题切换功能 =====
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const html = document.documentElement;

// 检查本地存储的主题偏好，或根据系统偏好设置
function getInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  // 检测系统是否偏好暗色模式
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// 应用主题
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // 更新图标
  if (theme === 'dark') {
    themeIcon.textContent = '☀️';
    themeToggle.setAttribute('aria-label', '切换到亮色模式');
  } else {
    themeIcon.textContent = '🌙';
    themeToggle.setAttribute('aria-label', '切换到暗色模式');
  }
}

// 初始化主题
applyTheme(getInitialTheme());

// 点击切换主题
themeToggle.addEventListener('click', () => {
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
});

// ===== 查看更多/收起功能 =====
const toggleBtn = document.getElementById('toggleBtn');
const moreInfo = document.getElementById('moreInfo');

let isExpanded = false;

toggleBtn.addEventListener('click', () => {
  isExpanded = !isExpanded;
  
  if (isExpanded) {
    moreInfo.classList.add('show');
    toggleBtn.textContent = '收起 ↑';
  } else {
    moreInfo.classList.remove('show');
    toggleBtn.textContent = '查看更多 ↓';
  }
});

// ===== 监听系统主题变化（可选）=====
if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    // 只有当用户没有手动设置过主题时，才跟随系统
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

console.log('🎨 主题切换功能已加载！点击右上角按钮试试~');

// ===== Day 3 练习：技能标签交互 =====
// 学习目标：querySelectorAll、forEach、classList、事件委托

// 技能描述数据（对象结构）
const skillDescriptions = {
  'Java': '企业级后端开发首选，强类型、生态完善',
  'Python': 'AI/数据分析利器，语法简洁优雅',
  'Spring Boot': 'Java微服务框架，快速构建生产级应用',
  '正在学前端！': '全栈之路的起点，HTML/CSS/JS三件套'
};

// 获取所有技能标签
const skillTags = document.querySelectorAll('.skills li');
const card = document.querySelector('.card');

// 创建技能描述显示区域（如果不存在）
let skillDescDiv = document.getElementById('skillDescription');
if (!skillDescDiv) {
  skillDescDiv = document.createElement('div');
  skillDescDiv.id = 'skillDescription';
  skillDescDiv.style.cssText = `
    margin-top: 15px;
    padding: 12px;
    background: var(--tag-bg, #f0f0f0);
    border-radius: 8px;
    font-size: 14px;
    color: var(--text-color, #333);
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(-10px);
  `;
  card.appendChild(skillDescDiv);
}

// 给每个技能标签添加点击事件
skillTags.forEach(tag => {
  tag.style.cursor = 'pointer'; // 鼠标变成手型，提示可点击
  
  tag.addEventListener('click', function() {
    const skillName = this.textContent;
    const description = skillDescriptions[skillName] || '暂无描述';
    
    // 移除其他标签的高亮
    skillTags.forEach(t => t.classList.remove('active-skill'));
    
    // 高亮当前点击的标签
    this.classList.add('active-skill');
    
    // 显示描述
    skillDescDiv.textContent = `💡 ${skillName}: ${description}`;
    skillDescDiv.style.opacity = '1';
    skillDescDiv.style.transform = 'translateY(0)';
    
    console.log(`✅ 点击了技能：${skillName}`);
  });
});

// 点击卡片其他地方取消高亮
card.addEventListener('click', function(e) {
  if (e.target.tagName !== 'LI') {
    skillTags.forEach(t => t.classList.remove('active-skill'));
    skillDescDiv.style.opacity = '0';
    skillDescDiv.style.transform = 'translateY(-10px)';
  }
});

console.log('🚀 Day 3 技能标签交互已加载！点击技能标签试试看~');