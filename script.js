// ==========================================
// 1. DOM ELEMENTS & SETUP
// ==========================================

// Screens
const welcomeScreen = document.getElementById('welcomeScreen');
const mainApp = document.getElementById('mainApp');
const memoryBrowser = document.getElementById('memoryBrowser');
const memoryEditor = document.getElementById('memoryEditor');
const moneyApp = document.getElementById('moneyApp');
const analyticsApp = document.getElementById('analyticsApp');
const workoutApp = document.getElementById('workoutApp'); 

// Navigation Buttons
const startDayBtn = document.getElementById('startDayBtn');
const openMemoriesBtn = document.getElementById('openMemoriesBtn');
const openMoneyBtn = document.getElementById('openMoneyBtn');
const openWorkoutBtn = document.getElementById('openWorkoutBtn'); 
const themeBtn = document.getElementById('themeBtn');

// Welcome Screen Elements
const calendarGrid = document.getElementById('calendarGrid');
const welcomeDateEl = document.getElementById('welcomeDate');
const monthNameEl = document.getElementById('monthName');
const daysGoneEl = document.getElementById('daysGone');
const daysLeftEl = document.getElementById('daysLeft');
const totalCompletedEl = document.getElementById('totalCompleted');
const homeWorkoutPercent = document.getElementById('homeWorkoutPercent'); // NEW

// Habit App Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentDateEl = document.getElementById('currentDate');
const taskCountEl = document.getElementById('taskCount');

// Money App Elements
const goalSetupSection = document.getElementById('goalSetupSection');
const moneyDashboard = document.getElementById('moneyDashboard');
const goalInput = document.getElementById('goalInput');
const currentTotalDisplay = document.getElementById('currentTotalDisplay');
const goalTotalDisplay = document.getElementById('goalTotalDisplay');
const moneyProgressBar = document.getElementById('moneyProgressBar');
const addMoneyInput = document.getElementById('addMoneyInput');
const valNeeds = document.getElementById('valNeeds');
const valSavings = document.getElementById('valSavings');
const valInvest = document.getElementById('valInvest');
const valFun = document.getElementById('valFun');

// Memory Elements
const memoryListContainer = document.getElementById('memoryListContainer');
const memoryBreadcrumb = document.getElementById('memoryBreadcrumb');
const editorDateTitle = document.getElementById('editorDateTitle');
const editorText = document.getElementById('editorText');
const carouselTrack = document.getElementById('carouselTrack');
const carouselDots = document.getElementById('carouselDots');

// Analytics Elements
const analyticsChartEl = document.getElementById('analyticsChart');
const analyticsTotalDisplay = document.getElementById('analyticsTotalDisplay');

// Workout Elements
const workoutDashboard = document.getElementById('workoutDashboard');
const workoutManager = document.getElementById('workoutManager');
const planCreatorModal = document.getElementById('planCreatorModal');
const activePlanContainer = document.getElementById('activePlanContainer');
const planBuilderContainer = document.getElementById('planBuilderContainer');
const creatorStep1 = document.getElementById('creatorStep1');
const creatorStep2 = document.getElementById('creatorStep2');
const toggleEditBtn = document.getElementById('toggleEditBtn'); // NEW

// ==========================================
// 2. THEME MANAGEMENT
// ==========================================

let currentTheme = localStorage.getItem('theme') || 'dark';
const sunIcon = '<i class="ri-sun-line"></i>';
const moonIcon = '<i class="ri-moon-line"></i>';

function applyTheme() {
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        themeBtn.innerHTML = moonIcon; 
    } else {
        document.body.classList.remove('light-mode');
        themeBtn.innerHTML = sunIcon; 
    }
}

function toggleTheme() {
    if (currentTheme === 'dark') {
        currentTheme = 'light';
    } else {
        currentTheme = 'dark';
    }
    localStorage.setItem('theme', currentTheme);
    applyTheme();
    updateCharts();
    if (analyticsApp.style.display === 'block') switchAnalyticsTab('7d');
}

// ==========================================
// 3. STATE MANAGEMENT
// ==========================================

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let weeklyStats = JSON.parse(localStorage.getItem('weeklyStats')) || [0, 0, 0, 0, 0, 0, 0];
let memories = JSON.parse(localStorage.getItem('memories_v2')) || {}; 
let moneyData = JSON.parse(localStorage.getItem('moneyData')) || {
    target: 0,
    current: 0,
    buckets: { needs: 0, savings: 0, invest: 0, fun: 0 }
};
let taskHistory = JSON.parse(localStorage.getItem('taskHistory')) || {};

// Global Variables
let currentEditingDate = null;
let currentMediaList = [];
let analyticsChartInstance = null;
let growthChartMain;
let growthChartWelcome; 

const MAX_TASKS = 10;
const MAX_MEDIA_ITEMS = 7;

// Workout State
let workoutPlan = JSON.parse(localStorage.getItem('workoutPlan')) || null;
let tempPlanType = ''; 
let tempBuilderData = []; 
let isEditingPlan = false; // NEW state for editing

// ==========================================
// 4. INITIALIZATION
// ==========================================

function init() {
    applyTheme();
    renderWelcomeScreen();
    updateCharts(); 
    updateHomeWorkoutProgress(); // Update button on load
    
    startDayBtn.addEventListener('click', () => {
        switchScreen(mainApp);
        initMainApp();
    });

    openMemoriesBtn.addEventListener('click', () => {
        switchScreen(memoryBrowser);
        openMemoryBrowser();
    });

    openMoneyBtn.addEventListener('click', () => {
        switchScreen(moneyApp);
        initMoneyApp();
    });

    openWorkoutBtn.addEventListener('click', () => {
        switchScreen(workoutApp);
        renderWorkoutUI();
    });

    window.onpopstate = function(event) {
        welcomeScreen.style.display = 'block';
        mainApp.style.display = 'none';
        memoryBrowser.style.display = 'none';
        moneyApp.style.display = 'none';
        analyticsApp.style.display = 'none';
        workoutApp.style.display = 'none'; 
        
        renderWelcomeScreen();
        updateCharts();
        updateHomeWorkoutProgress();
    };
}

function switchScreen(screenToShow) {
    welcomeScreen.style.display = 'none';
    mainApp.style.display = 'none';
    memoryBrowser.style.display = 'none';
    moneyApp.style.display = 'none';
    analyticsApp.style.display = 'none';
    workoutApp.style.display = 'none'; 
    
    screenToShow.style.display = 'block';

    if (screenToShow !== welcomeScreen) {
        history.pushState({ page: screenToShow.id }, "", "#" + screenToShow.id);
    }
}

function goBack() {
    switchScreen(welcomeScreen);
    renderWelcomeScreen();
    updateCharts(); 
    updateHomeWorkoutProgress();
}

function closeMoneyApp() { goBack(); }
function closeMemories() { goBack(); }
function openAnalytics() {
    switchScreen(analyticsApp);
    switchAnalyticsTab('7d'); 
}

// ==========================================
// 5. WELCOME SCREEN LOGIC
// ==========================================

function renderWelcomeScreen() {
    const date = new Date();
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    welcomeDateEl.innerText = date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    monthNameEl.innerText = date.toLocaleString('default', { month: 'long' }) + ' ' + year;

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    calendarGrid.innerHTML = ''; 

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-box');
        dayDiv.innerText = i; 
        
        const d = new Date(year, monthIndex, i);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        
        if (i < day) dayDiv.classList.add('past');
        else if (i === day) dayDiv.classList.add('today');
        
        if (taskHistory[key] && taskHistory[key] > 0) {
             dayDiv.style.borderColor = 'var(--success)';
             dayDiv.style.color = 'var(--success)';
        }
        
        calendarGrid.appendChild(dayDiv);
    }

    daysGoneEl.innerText = day - 1;
    daysLeftEl.innerText = daysInMonth - day;

    let monthTotal = 0;
    const currentMonthPrefix = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    Object.keys(taskHistory).forEach(key => {
        if (key.startsWith(currentMonthPrefix)) monthTotal += taskHistory[key];
    });
    totalCompletedEl.innerText = monthTotal;
}

// ==========================================
// 6. MONEY APP LOGIC
// ==========================================

function initMoneyApp() {
    if (moneyData.target === 0) {
        goalSetupSection.style.display = 'block';
        moneyDashboard.style.display = 'none';
    } else {
        goalSetupSection.style.display = 'none';
        moneyDashboard.style.display = 'block';
        updateMoneyUI();
    }
}

function setMoneyGoal() {
    const amount = parseFloat(goalInput.value);
    if (amount > 0) {
        moneyData.target = amount;
        saveMoneyData();
        initMoneyApp();
    } else {
        alert("Please enter a valid goal amount.");
    }
}

function addMoney() {
    const amount = parseFloat(addMoneyInput.value);
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    if (moneyData.current + amount > moneyData.target) {
        alert("That exceeds your goal! Increase your target first.");
        return;
    }
    moneyData.current += amount;
    moneyData.buckets.needs += amount * 0.45;
    moneyData.buckets.savings += amount * 0.15;
    moneyData.buckets.invest += amount * 0.25;
    moneyData.buckets.fun += amount * 0.10;
    saveMoneyData();
    updateMoneyUI();
    addMoneyInput.value = ''; 
}

function updateMoneyUI() {
    const format = (num) => Math.floor(num).toLocaleString(); 
    goalTotalDisplay.innerText = format(moneyData.target);
    currentTotalDisplay.innerText = format(moneyData.current);
    const percent = Math.min(100, (moneyData.current / moneyData.target) * 100);
    moneyProgressBar.style.width = `${percent}%`;
    valNeeds.innerText = format(moneyData.buckets.needs);
    valSavings.innerText = format(moneyData.buckets.savings);
    valInvest.innerText = format(moneyData.buckets.invest);
    valFun.innerText = format(moneyData.buckets.fun);
}

function resetMoneyGoal() {
    if(confirm("Start over?")) {
        moneyData = { target: 0, current: 0, buckets: { needs: 0, savings: 0, invest: 0, fun: 0 } };
        saveMoneyData();
        initMoneyApp();
    }
}

function saveMoneyData() {
    localStorage.setItem('moneyData', JSON.stringify(moneyData));
}

// ==========================================
// 7. HABIT TRACKING LOGIC
// ==========================================

function initMainApp() {
    currentDateEl.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    checkDailyReset();
    renderTasks();
    updateCharts();
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
            <button class="delete-btn" onclick="deleteTask(${index})" style="background:none; border:none; color:#ef4444;"><i class="ri-delete-bin-line"></i></button>
        `;
        taskList.appendChild(li);
    });
    
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
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        taskInput.value = '';
    } else if (tasks.length >= MAX_TASKS) alert("Max 10 tasks!");
});

window.toggleTask = (index) => {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    updateStatsToday();
};

window.deleteTask = (index) => {
    if(confirm("Delete this habit?")) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        updateStatsToday();
    }
};

function updateStatsToday() {
    const todayDate = new Date();
    const todayIndex = todayDate.getDay(); 
    const chartIndex = (todayIndex + 6) % 7;
    const completedCount = tasks.filter(t => t.completed).length;
    
    weeklyStats[chartIndex] = completedCount;
    localStorage.setItem('weeklyStats', JSON.stringify(weeklyStats));
    
    const year = todayDate.getFullYear();
    const month = String(todayDate.getMonth() + 1).padStart(2, '0');
    const day = String(todayDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;
    taskHistory[dateKey] = completedCount;
    localStorage.setItem('taskHistory', JSON.stringify(taskHistory));

    updateCharts();
}

// ==========================================
// 8. CHART.JS LOGIC
// ==========================================

function updateCharts() {
    const ctxWelcome = document.getElementById('chartWelcome').getContext('2d');
    if (growthChartWelcome) growthChartWelcome.destroy();
    
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    growthChartWelcome = createSmoothChart(ctxWelcome, weeklyStats, labels);

    const mainChartEl = document.getElementById('growthChart');
    if (mainChartEl) {
        const ctxMain = mainChartEl.getContext('2d');
        if (growthChartMain) growthChartMain.destroy();
        growthChartMain = createSmoothChart(ctxMain, weeklyStats, labels);
    }
}

function createSmoothChart(ctx, data, labels) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    const textColor = currentTheme === 'light' ? '#64748b' : '#94a3b8';

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ 
                label: 'Focus Level', 
                data: data, 
                borderColor: '#06b6d4',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: currentTheme === 'light' ? '#fff' : '#0f172a',
                pointBorderColor: currentTheme === 'light' ? '#06b6d4' : '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: currentTheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)' }, ticks: { color: textColor, font: { size: 10 } } },
                x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } }
            },
            interaction: { intersect: false, mode: 'index' },
        }
    });
}

// ==========================================
// 9. ANALYTICS
// ==========================================

function switchAnalyticsTab(range) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    let labels = [];
    let dataPoints = [];
    let totalCount = 0;

    if (range === 'monthly') {
        const monthMap = {};
        Object.keys(taskHistory).sort().forEach(key => {
            const [y, m, d] = key.split('-');
            const monthKey = `${new Date(y, m-1).toLocaleString('default',{month:'short'})} ${y}`;
            if (!monthMap[monthKey]) monthMap[monthKey] = 0;
            monthMap[monthKey] += taskHistory[key];
            totalCount += taskHistory[key];
        });
        labels = Object.keys(monthMap);
        dataPoints = Object.values(monthMap);
    } else if (range === 'yearly') {
        const yearMap = {};
        Object.keys(taskHistory).sort().forEach(key => {
            const y = key.split('-')[0];
            if (!yearMap[y]) yearMap[y] = 0;
            yearMap[y] += taskHistory[key];
            totalCount += taskHistory[key];
        });
        labels = Object.keys(yearMap);
        dataPoints = Object.values(yearMap);
    } else {
        let daysToLookBack = 0;
        if (range === '7d') daysToLookBack = 7;
        else if (range === '28d') daysToLookBack = 28;
        else if (range === '90d') daysToLookBack = 90;
        else if (range === '365d') daysToLookBack = 365;
        else if (range === 'life') daysToLookBack = 99999;

        if (range === 'life') {
             const sortedKeys = Object.keys(taskHistory).sort();
             labels = sortedKeys;
             dataPoints = sortedKeys.map(k => taskHistory[k]);
             totalCount = dataPoints.reduce((a,b) => a+b, 0);
        } else {
            for (let i = daysToLookBack - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const key = `${year}-${month}-${day}`;
                const label = `${d.getDate()} ${d.toLocaleString('default',{month:'short'})}`;
                labels.push(label);
                const val = taskHistory[key] || 0;
                dataPoints.push(val);
                totalCount += val;
            }
        }
    }

    analyticsTotalDisplay.innerText = totalCount;
    renderAnalyticsChart(labels, dataPoints);
}

function renderAnalyticsChart(labels, data) {
    const ctx = analyticsChartEl.getContext('2d');
    if (analyticsChartInstance) analyticsChartInstance.destroy();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
    
    const textColor = currentTheme === 'light' ? '#64748b' : '#94a3b8';

    analyticsChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tasks',
                data: data,
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHitRadius: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: textColor, maxTicksLimit: 7 } },
                y: { display: true, grid: { color: currentTheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }, ticks: { color: textColor } }
            }
        }
    });
}

// Memory browser functions
function openMemoryBrowser() { memoryBreadcrumb.innerText = "Select Year"; renderYears(); }
function renderYears() { memoryListContainer.innerHTML = ''; const currentYear = new Date().getFullYear().toString(); const years = Object.keys(memories).sort().reverse(); if (!years.includes(currentYear)) years.unshift(currentYear); years.forEach(year => { const card = createFolderCard(year, 'ri-calendar-fill', null, () => renderMonths(year)); memoryListContainer.appendChild(card); }); }
function renderMonths(year) { memoryListContainer.innerHTML = ''; const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]; const backCard = createFolderCard("Back", "ri-arrow-go-back-line", null, () => renderYears()); memoryListContainer.appendChild(backCard); allMonths.forEach(month => { if ((memories[year] && memories[year][month]) || year == new Date().getFullYear()) { const card = createFolderCard(month, 'ri-folder-3-fill', null, () => renderDays(year, month)); memoryListContainer.appendChild(card); } }); }
function renderDays(year, month) { memoryListContainer.innerHTML = ''; const backCard = createFolderCard("Back", "ri-arrow-go-back-line", null, () => renderMonths(year)); memoryListContainer.appendChild(backCard); if (memories[year] && memories[year][month]) { const days = Object.keys(memories[year][month]).sort((a,b) => a-b); days.forEach(day => { const dateObj = new Date(`${month} ${day}, ${year}`); const memoryData = memories[year][month][day]; const coverImg = (memoryData.media && memoryData.media.length > 0) ? memoryData.media[0] : null; const card = createFolderCard(`${day}${getOrdinal(day)}`, 'ri-image-2-line', coverImg, () => openMemoryEditor(dateObj)); memoryListContainer.appendChild(card); }); } else { memoryListContainer.innerHTML += `<p style="color:#666; width:100%; text-align:center;">No memories yet.</p>`; } }
function createFolderCard(text, iconClass, bgImage, onClick) { const div = document.createElement('div'); div.className = 'folder-card'; let content = `<i class="${iconClass}"></i><span>${text}</span>`; if (bgImage) content += `<img src="${bgImage}" class="folder-cover">`; div.innerHTML = content; div.onclick = onClick; return div; }
function getOrdinal(n) { const s = ["th", "st", "nd", "rd"]; const v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; }
function openMemoryEditor(date) { currentEditingDate = date; const year = date.getFullYear(); const month = date.toLocaleString('default', { month: 'long' }); const day = date.getDate(); editorDateTitle.innerText = date.toDateString(); memoryEditor.style.display = 'flex'; const existingData = memories[year]?.[month]?.[day]; if (existingData) { editorText.value = existingData.text || ""; currentMediaList = existingData.media ? (Array.isArray(existingData.media) ? existingData.media : [existingData.media]) : []; } else { editorText.value = ""; currentMediaList = []; } renderCarousel(); }
function closeEditor() { memoryEditor.style.display = 'none'; }
function renderCarousel() { carouselTrack.innerHTML = ''; carouselDots.innerHTML = ''; if (currentMediaList.length === 0) { carouselTrack.innerHTML = `<div class="carousel-slide empty-state-slide"><i class="ri-image-add-line"></i><p>Tap + to upload</p></div>`; } else { currentMediaList.forEach((mediaStr, index) => { const slide = document.createElement('div'); slide.className = 'carousel-slide'; slide.innerHTML = `<img src="${mediaStr}">`; slide.onclick = () => { if(confirm("Remove?")) { currentMediaList.splice(index, 1); renderCarousel(); } }; carouselTrack.appendChild(slide); const dot = document.createElement('div'); dot.className = index === 0 ? 'dot-indicator active' : 'dot-indicator'; carouselDots.appendChild(dot); }); } }
function handleMediaPreview(input) { const files = input.files; if (!files || files.length === 0) return; Array.from(files).forEach(file => { const reader = new FileReader(); reader.onload = function(e) { resizeImage(e.target.result, 800, 800, (c) => { currentMediaList.push(c); renderCarousel(); }); }; reader.readAsDataURL(file); }); }
function resizeImage(base64Str, maxWidth, maxHeight, callback) { const img = new Image(); img.src = base64Str; img.onload = () => { const canvas = document.createElement('canvas'); let width = img.width; let height = img.height; if (width > height) { if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; } } else { if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; } } canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height); callback(canvas.toDataURL('image/jpeg', 0.7)); }; }
function saveCurrentMemory() { const year = currentEditingDate.getFullYear().toString(); const month = currentEditingDate.toLocaleString('default', { month: 'long' }); const day = currentEditingDate.getDate().toString(); const text = editorText.value; if (!text && currentMediaList.length === 0) return; if (!memories[year]) memories[year] = {}; if (!memories[year][month]) memories[year][month] = {}; memories[year][month][day] = { text: text, media: currentMediaList }; try { localStorage.setItem('memories_v2', JSON.stringify(memories)); alert("Saved!"); closeEditor(); if(memoryBrowser.style.display === 'block') renderDays(year, month); } catch (e) { alert("Storage Full!"); } }
function deleteCurrentMemory() { const year = currentEditingDate.getFullYear().toString(); const month = currentEditingDate.toLocaleString('default', { month: 'long' }); const day = currentEditingDate.getDate().toString(); if (confirm("Delete memory?")) { if (memories[year] && memories[year][month]) { delete memories[year][month][day]; localStorage.setItem('memories_v2', JSON.stringify(memories)); closeEditor(); renderDays(year, month); } } }


// ==========================================
// 10. WORKOUT MANAGER LOGIC (FULL UPDATE)
// ==========================================

// --- HOME SCREEN PROGRESS ---
function updateHomeWorkoutProgress() {
    if (!workoutPlan) {
        homeWorkoutPercent.innerText = "0%";
        return;
    }
    let totalGoal = 0;
    let totalCurrent = 0;

    if (workoutPlan.type === 'section') {
        workoutPlan.data.forEach(sec => {
            sec.exercises.forEach(ex => {
                totalGoal += ex.goal;
                totalCurrent += ex.current;
            });
        });
    } else {
        workoutPlan.data.forEach(ex => {
            totalGoal += ex.goal;
            totalCurrent += ex.current;
        });
    }

    const percent = totalGoal === 0 ? 0 : Math.round((totalCurrent / totalGoal) * 100);
    homeWorkoutPercent.innerText = `${percent}%`;
}

// --- INIT & ROUTING ---
function renderWorkoutUI() {
    if (workoutPlan) {
        workoutDashboard.style.display = 'block';
        workoutManager.style.display = 'none';
        
        // Reset edit mode when re-opening
        isEditingPlan = false;
        toggleEditBtn.innerHTML = `<i class="ri-edit-line"></i> Edit Plan`;
        toggleEditBtn.className = "secondary-glow-btn";
        
        calculateAndRenderProgress();
    } else {
        workoutDashboard.style.display = 'none';
        workoutManager.style.display = 'block';
    }
}

function openPlanManager() {
    if(confirm("This will DELETE your current plan and progress. Create new one?")) {
        workoutPlan = null;
        localStorage.removeItem('workoutPlan');
        renderWorkoutUI();
        updateHomeWorkoutProgress();
    }
}

// --- EDIT MODE TOGGLE ---
function toggleEditMode() {
    isEditingPlan = !isEditingPlan;
    if(isEditingPlan) {
        toggleEditBtn.innerHTML = `<i class="ri-save-line"></i> Finish Editing`;
        toggleEditBtn.className = "glow-btn small"; // Highlight button
    } else {
        toggleEditBtn.innerHTML = `<i class="ri-edit-line"></i> Edit Plan`;
        toggleEditBtn.className = "secondary-glow-btn";
    }
    calculateAndRenderProgress(); // Re-render with new state
}

// --- PLAN CREATION WIZARD ---
function startPlanCreation() {
    planCreatorModal.style.display = 'flex';
    creatorStep1.style.display = 'block';
    creatorStep2.style.display = 'none';
}

function closePlanCreator() {
    planCreatorModal.style.display = 'none';
}

function choosePlanType(type) {
    tempPlanType = type;
    tempBuilderData = []; // Reset
    creatorStep1.style.display = 'none';
    creatorStep2.style.display = 'block';
    renderBuilderInputs();
}

function renderBuilderInputs() {
    planBuilderContainer.innerHTML = '';
    if (tempBuilderData.length === 0) {
        if (tempPlanType === 'section') {
            tempBuilderData.push({ sectionName: '', exercises: [{ name: '', goal: '' }] });
        } else {
            tempBuilderData.push({ name: '', goal: '' });
        }
    }
    if (tempPlanType === 'section') renderSectionBuilder();
    else renderListBuilder();
}

// --- BUILDER RENDERERS ---
function renderSectionBuilder() {
    tempBuilderData.forEach((section, sIndex) => {
        const div = document.createElement('div');
        div.className = 'glass-card';
        div.style.marginBottom = '15px';
        div.style.padding = '15px';
        div.innerHTML = `
            <input type="text" placeholder="Section Name (e.g. Chest)" value="${section.sectionName}" 
                onchange="updateSectionName(${sIndex}, this.value)"
                style="width:100%; background:transparent; border:none; border-bottom:1px solid #555; color:white; font-size:1.1rem; margin-bottom:10px; font-weight:bold;">
            <div id="ex-container-${sIndex}"></div>
            <button onclick="addExerciseToSection(${sIndex})" style="font-size:0.8rem; color:#10b981; background:none; border:none; margin-top:10px;">+ Add Exercise</button>
        `;
        planBuilderContainer.appendChild(div);
        const exContainer = div.querySelector(`#ex-container-${sIndex}`);
        section.exercises.forEach((ex, exIndex) => {
            const exRow = document.createElement('div');
            exRow.style.display = 'flex'; exRow.style.gap = '10px'; exRow.style.marginBottom = '5px';
            exRow.innerHTML = `
                <input type="text" placeholder="Exercise" value="${ex.name}" onchange="updateSectionEx(${sIndex}, ${exIndex}, 'name', this.value)" style="flex:2; padding:8px; border-radius:5px; border:none; background:rgba(255,255,255,0.1); color:white;">
                <input type="number" placeholder="Goal" value="${ex.goal}" onchange="updateSectionEx(${sIndex}, ${exIndex}, 'goal', this.value)" style="flex:1; padding:8px; border-radius:5px; border:none; background:rgba(255,255,255,0.1); color:white;">
            `;
            exContainer.appendChild(exRow);
        });
    });
}

function renderListBuilder() {
    tempBuilderData.forEach((item, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex'; div.style.gap = '10px'; div.style.marginBottom = '10px';
        div.innerHTML = `
            <input type="text" placeholder="Exercise Name" value="${item.name}" onchange="updateListItem(${index}, 'name', this.value)" style="flex:2; padding:10px; border-radius:8px; border:none; background:rgba(255,255,255,0.1); color:white;">
            <input type="number" placeholder="Monthly Goal" value="${item.goal}" onchange="updateListItem(${index}, 'goal', this.value)" style="flex:1; padding:10px; border-radius:8px; border:none; background:rgba(255,255,255,0.1); color:white;">
        `;
        planBuilderContainer.appendChild(div);
    });
}

// --- BUILDER HELPERS ---
function addBuilderItem() {
    if (tempPlanType === 'section') {
        tempBuilderData.push({ sectionName: '', exercises: [{ name: '', goal: '' }] });
        renderBuilderInputs();
    } else {
        tempBuilderData.push({ name: '', goal: '' });
        renderBuilderInputs();
    }
}
function addExerciseToSection(sIndex) {
    tempBuilderData[sIndex].exercises.push({ name: '', goal: '' });
    renderBuilderInputs();
}
window.updateSectionName = (idx, val) => { tempBuilderData[idx].sectionName = val; };
window.updateSectionEx = (sIdx, exIdx, field, val) => { tempBuilderData[sIdx].exercises[exIdx][field] = val; };
window.updateListItem = (idx, field, val) => { tempBuilderData[idx][field] = val; };

function saveNewPlan() {
    let finalData;
    if (tempPlanType === 'section') {
        finalData = tempBuilderData.filter(s => s.sectionName.trim() !== '').map(s => ({
            sectionName: s.sectionName,
            exercises: s.exercises.filter(e => e.name && e.goal).map(e => ({ name: e.name, goal: parseInt(e.goal), current: 0 }))
        }));
    } else {
        finalData = tempBuilderData.filter(i => i.name && i.goal).map(i => ({ name: i.name, goal: parseInt(i.goal), current: 0 }));
    }
    if (finalData.length === 0) { alert("Please add at least one valid exercise/section."); return; }
    workoutPlan = { type: tempPlanType, data: finalData };
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    closePlanCreator();
    renderWorkoutUI();
    updateHomeWorkoutProgress();
}

// 4. MAIN DASHBOARD LOGIC (Handles View & Edit Modes)
function calculateAndRenderProgress() {
    activePlanContainer.innerHTML = '';
    let totalGoal = 0;
    let totalCurrent = 0;

    if (workoutPlan.type === 'section') {
        workoutPlan.data.forEach((section, sIndex) => {
            const sectionCard = document.createElement('div');
            sectionCard.className = 'glass-card';
            sectionCard.style.marginBottom = '20px';
            sectionCard.style.padding = '15px';
            
            // Header: View vs Edit
            let headerHTML = '';
            if(isEditingPlan) {
                headerHTML = `
                    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                        <input type="text" value="${section.sectionName}" onchange="saveEditedSectionName(${sIndex}, this.value)" style="width:70%; background:rgba(0,0,0,0.2); border:none; color:white; padding:5px;">
                        <button onclick="deleteSection(${sIndex})" style="color:#ef4444; background:none; border:none;"><i class="ri-delete-bin-line"></i></button>
                    </div>`;
            } else {
                headerHTML = `<h3 style="color:var(--accent); margin-bottom:15px; border-bottom:1px solid #333; padding-bottom:5px;">${section.sectionName}</h3>`;
            }
            
            let exercisesHTML = '';
            section.exercises.forEach((ex, exIndex) => {
                totalGoal += parseInt(ex.goal);
                totalCurrent += parseInt(ex.current);
                exercisesHTML += createExerciseRowHTML(ex, sIndex, exIndex);
            });

            // Edit Mode: Add Exercise Button
            if(isEditingPlan) {
                exercisesHTML += `<button onclick="addItemInEditMode(${sIndex})" style="width:100%; margin-top:10px; padding:8px; border:1px dashed #555; background:none; color:#10b981;">+ Add Exercise</button>`;
            }
            
            sectionCard.innerHTML = headerHTML + exercisesHTML;
            activePlanContainer.appendChild(sectionCard);
        });
        
        // Edit Mode: Add Section Button
        if(isEditingPlan) {
            const addSecBtn = document.createElement('button');
            addSecBtn.innerHTML = "+ Add New Body Part Section";
            addSecBtn.className = "secondary-glow-btn";
            addSecBtn.style.marginTop = "10px";
            addSecBtn.onclick = () => addSectionInEditMode();
            activePlanContainer.appendChild(addSecBtn);
        }

    } else {
        // List Type
        const listCard = document.createElement('div');
        listCard.className = 'glass-card';
        listCard.style.padding = '15px';
        
        let html = '';
        workoutPlan.data.forEach((ex, index) => {
            totalGoal += parseInt(ex.goal);
            totalCurrent += parseInt(ex.current);
            html += createExerciseRowHTML(ex, null, index);
        });

        if(isEditingPlan) {
            html += `<button onclick="addItemInEditMode(null)" style="width:100%; margin-top:10px; padding:8px; border:1px dashed #555; background:none; color:#10b981;">+ Add Exercise</button>`;
        }
        
        listCard.innerHTML = html;
        activePlanContainer.appendChild(listCard);
    }

    const percent = totalGoal === 0 ? 0 : Math.round((totalCurrent / totalGoal) * 100);
    document.getElementById('totalProgressPercent').innerText = `${percent}%`;
    document.getElementById('totalProgressBar').style.width = `${percent}%`;
    document.getElementById('totalStatsText').innerText = `${totalCurrent} / ${totalGoal} Reps Completed`;
    
    updateHomeWorkoutProgress();
}

function createExerciseRowHTML(ex, sIndex, exIndex) {
    const idParams = sIndex !== null ? `${sIndex}, ${exIndex}` : `null, ${exIndex}`;
    
    // EDIT MODE ROW
    if (isEditingPlan) {
        return `
        <div style="display:flex; gap:5px; margin-bottom:10px; align-items:center;">
            <input type="text" value="${ex.name}" onchange="saveEditedItem(${idParams}, 'name', this.value)" style="flex:2; padding:8px; background:rgba(255,255,255,0.05); border:none; color:white; border-radius:5px;">
            <input type="number" value="${ex.goal}" onchange="saveEditedItem(${idParams}, 'goal', this.value)" style="flex:1; padding:8px; background:rgba(255,255,255,0.05); border:none; color:white; border-radius:5px;">
            <button onclick="deleteItem(${idParams})" style="background:none; border:none; color:#ef4444; padding:5px;"><i class="ri-close-circle-fill" style="font-size:1.2rem;"></i></button>
        </div>
        `;
    }

    // VIEW/LOG MODE ROW (With Minus Button)
    return `
    <div style="margin-bottom: 15px;">
        <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:5px;">
            <span>${ex.name}</span>
            <span style="color:var(--text-muted);">${ex.current} / ${ex.goal}</span>
        </div>
        <div class="progress-bar-bg" style="height:8px; margin-bottom:8px;">
            <div class="progress-bar-fill" style="width:${Math.min(100, (ex.current/ex.goal)*100)}%; background:#10b981;"></div>
        </div>
        <div style="display:flex; gap:5px;">
            <input type="number" id="add-input-${sIndex}-${exIndex}" placeholder="Count" style="flex:1; padding:5px; border-radius:5px; border:none; background:rgba(255,255,255,0.1); color:white; font-size:0.8rem;">
            
            <button onclick="logReps(${idParams}, -1)" style="background:rgba(239,68,68,0.2); color:#ef4444; border:1px solid #ef4444; border-radius:5px; padding:5px 12px; font-weight:bold;">-</button>
            
            <button onclick="logReps(${idParams}, 1)" style="background:var(--accent); color:black; border:none; border-radius:5px; padding:5px 15px; font-weight:bold;">+</button>
        </div>
    </div>
    `;
}

// 5. ACTIONS: LOGGING & EDITING
window.logReps = (sIndex, exIndex, multiplier) => {
    const inputId = `add-input-${sIndex}-${exIndex}`;
    const inputEl = document.getElementById(inputId);
    let amount = parseInt(inputEl.value);

    if (!amount || amount <= 0) amount = 0; // If empty, don't do anything unless button specific logic (optional)
    if (amount === 0 && inputEl.value === "") return; // Safety

    const change = amount * multiplier; // Handles add or subtract

    if (sIndex !== null) {
        let newCurrent = workoutPlan.data[sIndex].exercises[exIndex].current + change;
        if (newCurrent < 0) newCurrent = 0;
        workoutPlan.data[sIndex].exercises[exIndex].current = newCurrent;
    } else {
        let newCurrent = workoutPlan.data[exIndex].current + change;
        if (newCurrent < 0) newCurrent = 0;
        workoutPlan.data[exIndex].current = newCurrent;
    }

    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    inputEl.value = ''; // Clear input
    calculateAndRenderProgress();
};

// Edit Functions
window.saveEditedItem = (sIndex, exIndex, field, val) => {
    if(sIndex !== null) workoutPlan.data[sIndex].exercises[exIndex][field] = (field === 'goal' ? parseInt(val) : val);
    else workoutPlan.data[exIndex][field] = (field === 'goal' ? parseInt(val) : val);
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
};

window.saveEditedSectionName = (sIndex, val) => {
    workoutPlan.data[sIndex].sectionName = val;
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
};

window.deleteItem = (sIndex, exIndex) => {
    if(!confirm("Remove this exercise?")) return;
    if(sIndex !== null) workoutPlan.data[sIndex].exercises.splice(exIndex, 1);
    else workoutPlan.data.splice(exIndex, 1);
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    calculateAndRenderProgress();
};

window.deleteSection = (sIndex) => {
    if(!confirm("Delete this entire section?")) return;
    workoutPlan.data.splice(sIndex, 1);
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    calculateAndRenderProgress();
};

window.addItemInEditMode = (sIndex) => {
    const newEx = { name: "New Exercise", goal: 100, current: 0 };
    if(sIndex !== null) workoutPlan.data[sIndex].exercises.push(newEx);
    else workoutPlan.data.push(newEx);
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    calculateAndRenderProgress();
};

window.addSectionInEditMode = () => {
    workoutPlan.data.push({
        sectionName: "New Section",
        exercises: [{ name: "New Exercise", goal: 100, current: 0 }]
    });
    localStorage.setItem('workoutPlan', JSON.stringify(workoutPlan));
    calculateAndRenderProgress();
};

// Start App
init();
