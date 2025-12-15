// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentDateEl = document.getElementById('currentDate');
const taskCountEl = document.getElementById('taskCount');
const memoryInput = document.getElementById('memoryInput');
const saveMemoryBtn = document.getElementById('saveMemoryBtn');

// State Variables
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let weeklyStats = JSON.parse(localStorage.getItem('weeklyStats')) || [0, 0, 0, 0, 0, 0, 0];
const MAX_TASKS = 10;

// Initialize App
function init() {
    displayDate();
    checkDailyReset();
    renderTasks();
    updateChart();
    
    // Load saved memory for today
    const todayStr = new Date().toDateString();
    const savedMemory = localStorage.getItem(`memory_${todayStr}`);
    if (savedMemory) memoryInput.value = savedMemory;
}

// 1. Display Current Date
function displayDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerText = new Date().toLocaleDateString('en-US', options);
}

// 2. Check for Daily Reset (New Day = Uncheck Tasks)
function checkDailyReset() {
    const lastLoginDate = localStorage.getItem('lastLoginDate');
    const today = new Date().toDateString();

    if (lastLoginDate !== today) {
        // If it's a new day, reset 'completed' status of all tasks
        tasks = tasks.map(t => ({ ...t, completed: false }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('lastLoginDate', today);
        
        // Note: In a real app, you would shift the weekly stats array here
    }
}

// 3. Render Tasks
function renderTasks() {
    taskList.innerHTML = '';
    let completedCount = 0;

    tasks.forEach((task, index) => {
        if (task.completed) completedCount++;
        
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="task-left" onclick="toggleTask(${index})">
                <div class="check-circle">
                    ${task.completed ? '<i class="ri-check-line" style="font-size:12px; color:black"></i>' : ''}
                </div>
                <span>${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">
                <i class="ri-delete-bin-line"></i>
            </button>
        `;
        taskList.appendChild(li);
    });

    updateProgress(completedCount);
    taskCountEl.innerText = `${tasks.length}/${MAX_TASKS}`;
}

// 4. Add Task
addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text && tasks.length < MAX_TASKS) {
        tasks.push({ text, completed: false });
        saveData();
        renderTasks();
        taskInput.value = '';
    } else if (tasks.length >= MAX_TASKS) {
        alert("Maximum 10 tasks allowed for better focus!");
    }
});

// 5. Toggle Task Completion
window.toggleTask = (index) => {
    tasks[index].completed = !tasks[index].completed;
    saveData();
    renderTasks();
    updateStatsToday();
};

// 6. Delete Task
window.deleteTask = (index) => {
    if(confirm("Delete this habit?")) {
        tasks.splice(index, 1);
        saveData();
        renderTasks();
        updateStatsToday();
    }
};

// 7. Update Progress Bar
function updateProgress(completed) {
    const total = tasks.length === 0 ? 1 : tasks.length;
    const percent = Math.round((completed / total) * 100);
    
    progressBar.style.width = `${percent}%`;
    progressText.innerText = `${percent}%`;
}

// 8. Update Daily Stats for Chart
function updateStatsToday() {
    const todayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, etc.
    // Adjust so 0 is Mon, 6 is Sun (optional, but standard chart uses Mon-Sun)
    const chartIndex = (todayIndex + 6) % 7; 
    
    const completedCount = tasks.filter(t => t.completed).length;
    weeklyStats[chartIndex] = completedCount;
    localStorage.setItem('weeklyStats', JSON.stringify(weeklyStats));
    updateChart();
}

// 9. Save Memory
saveMemoryBtn.addEventListener('click', () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem(`memory_${todayStr}`, memoryInput.value);
    alert("Memory saved successfully!");
});

function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --- Chart.js Configuration ---
let growthChart;
function updateChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    
    if (growthChart) growthChart.destroy(); // Destroy old chart to re-render

    growthChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            datasets: [{
                label: 'Tasks Done',
                data: weeklyStats,
                backgroundColor: '#00E5FF',
                borderRadius: 4,
                barThickness: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#888' } },
                x: { grid: { display: false }, ticks: { color: '#888' } }
            }
        }
    });
}

// Run App
init();