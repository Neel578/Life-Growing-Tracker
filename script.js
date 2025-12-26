// --- DOM ELEMENTS ---
const welcomeScreen = document.getElementById('welcomeScreen');
const mainApp = document.getElementById('mainApp');
const startDayBtn = document.getElementById('startDayBtn');
const calendarGrid = document.getElementById('calendarGrid');
const welcomeDateEl = document.getElementById('welcomeDate');
const monthNameEl = document.getElementById('monthName');

// Stats Elements (Welcome Screen)
const daysGoneEl = document.getElementById('daysGone');
const daysLeftEl = document.getElementById('daysLeft');
const totalCompletedEl = document.getElementById('totalCompleted');

// App Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentDateEl = document.getElementById('currentDate');
const taskCountEl = document.getElementById('taskCount');
const memoryInput = document.getElementById('memoryInput');
const saveMemoryBtn = document.getElementById('saveMemoryBtn');

// --- STATE ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let weeklyStats = JSON.parse(localStorage.getItem('weeklyStats')) || [0, 0, 0, 0, 0, 0, 0];
const MAX_TASKS = 10;

// --- INITIALIZATION ---
function init() {
    renderWelcomeScreen();
    
    startDayBtn.addEventListener('click', () => {
        welcomeScreen.style.display = 'none';
        mainApp.style.display = 'block';
        initMainApp();
    });
}

// --- WELCOME SCREEN LOGIC ---
function renderWelcomeScreen() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    welcomeDateEl.innerText = `${date.toDateString()}`;
    monthNameEl.innerText = `${month} ${year}`;

    const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
    calendarGrid.innerHTML = ''; 

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-box');
        dayDiv.innerText = i;

        if (i < day) {
            dayDiv.classList.add('past');
        } else if (i === day) {
            dayDiv.classList.add('today');
        }
        calendarGrid.appendChild(dayDiv);
    }

    daysGoneEl.innerText = day - 1;
    daysLeftEl.innerText = daysInMonth - day;
    const totalDone = weeklyStats.reduce((a, b) => a + b, 0);
    totalCompletedEl.innerText = totalDone;
}

// --- MAIN APP LOGIC ---
function initMainApp() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerText = new Date().toLocaleDateString('en-US', options);
    
    checkDailyReset();
    renderTasks();
    updateChart();
    
    const todayStr = new Date().toDateString();
    const savedMemory = localStorage.getItem(`memory_${todayStr}`);
    if (savedMemory) memoryInput.value = savedMemory;
}

function goBack() {
    mainApp.style.display = 'none';
    welcomeScreen.style.display = 'block';
    renderWelcomeScreen(); 
}

function checkDailyReset() {
    const lastLoginDate = localStorage.getItem('lastLoginDate');
    const today = new Date().toDateString();

    if (lastLoginDate !== today) {
        tasks = tasks.map(t => ({ ...t, completed: false }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('lastLoginDate', today);
    }
}

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
                    ${task.completed ? '<i class="ri-check-line" style="font-size:14px; color:black"></i>' : ''}
                </div>
                <span>${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})"><i class="ri-delete-bin-line"></i></button>
        `;
        taskList.appendChild(li);
    });
    
    // Progress
    const total = tasks.length === 0 ? 1 : tasks.length;
    const percent = Math.round((completedCount / total) * 100);
    progressBar.style.width = `${percent}%`;
    progressText.innerText = `${percent}%`;
    taskCountEl.innerText = `${tasks.length}/${MAX_TASKS}`;
}

addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (text && tasks.length < MAX_TASKS) {
        tasks.push({ text, completed: false });
        saveData();
        renderTasks();
        taskInput.value = '';
    } else if (tasks.length >= MAX_TASKS) alert("Max 10 tasks!");
});

window.toggleTask = (index) => {
    tasks[index].completed = !tasks[index].completed;
    saveData();
    renderTasks();
    updateStatsToday();
};

window.deleteTask = (index) => {
    if(confirm("Delete this habit?")) {
        tasks.splice(index, 1);
        saveData();
        renderTasks();
        updateStatsToday();
    }
};

function updateStatsToday() {
    const todayIndex = new Date().getDay();
    const chartIndex = (todayIndex + 6) % 7;
    const completedCount = tasks.filter(t => t.completed).length;
    weeklyStats[chartIndex] = completedCount;
    localStorage.setItem('weeklyStats', JSON.stringify(weeklyStats));
    updateChart();
}

saveMemoryBtn.addEventListener('click', () => {
    const todayStr = new Date().toDateString();
    localStorage.setItem(`memory_${todayStr}`, memoryInput.value);
    alert("Memory saved!");
});

function saveData() { localStorage.setItem('tasks', JSON.stringify(tasks)); }

let growthChart;
function updateChart() {
    const ctx = document.getElementById('growthChart').getContext('2d');
    if (growthChart) growthChart.destroy();
    
    // Chart Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, '#06b6d4');
    gradient.addColorStop(1, '#0f172a');

    growthChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
            datasets: [{ 
                label: 'Tasks', 
                data: weeklyStats, 
                backgroundColor: gradient,
                borderRadius: 4 
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        }
    });
}

// Start
init();