// ==========================================
// 1. DOM ELEMENTS & SETUP
// ==========================================

// Screens
const welcomeScreen = document.getElementById('welcomeScreen');
const mainApp = document.getElementById('mainApp');
const memoryBrowser = document.getElementById('memoryBrowser');
const memoryEditor = document.getElementById('memoryEditor');
const moneyApp = document.getElementById('moneyApp');

// Navigation Buttons
const startDayBtn = document.getElementById('startDayBtn');
const openMemoriesBtn = document.getElementById('openMemoriesBtn');
const openMoneyBtn = document.getElementById('openMoneyBtn');

// Welcome Screen Elements
const calendarGrid = document.getElementById('calendarGrid');
const welcomeDateEl = document.getElementById('welcomeDate');
const monthNameEl = document.getElementById('monthName');
const daysGoneEl = document.getElementById('daysGone');
const daysLeftEl = document.getElementById('daysLeft');
const totalCompletedEl = document.getElementById('totalCompleted');

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

// ==========================================
// 2. STATE MANAGEMENT (LocalStorage)
// ==========================================

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let weeklyStats = JSON.parse(localStorage.getItem('weeklyStats')) || [0, 0, 0, 0, 0, 0, 0];
let memories = JSON.parse(localStorage.getItem('memories_v2')) || {}; 
let moneyData = JSON.parse(localStorage.getItem('moneyData')) || {
    target: 0,
    current: 0,
    buckets: { needs: 0, savings: 0, invest: 0, fun: 0 }
};

// Global Variables for Runtime
let currentEditingDate = null;
let currentMediaList = [];

// Charts
let growthChartMain;
let growthChartWelcome; 

const MAX_TASKS = 10;
const MAX_MEDIA_ITEMS = 7;

// ==========================================
// 3. INITIALIZATION
// ==========================================

function init() {
    renderWelcomeScreen();
    updateCharts(); // Initialize graph on welcome screen immediately
    
    // Navigation Listeners
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
}

function switchScreen(screenToShow) {
    welcomeScreen.style.display = 'none';
    mainApp.style.display = 'none';
    memoryBrowser.style.display = 'none';
    moneyApp.style.display = 'none';
    screenToShow.style.display = 'block';
}

function goBack() {
    switchScreen(welcomeScreen);
    renderWelcomeScreen();
    updateCharts(); // Refresh chart when going back to welcome screen
}

function closeMoneyApp() { goBack(); }
function closeMemories() { goBack(); }

// ==========================================
// 4. WELCOME SCREEN LOGIC
// ==========================================

function renderWelcomeScreen() {
    const date = new Date();
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    welcomeDateEl.innerText = date.toDateString();
    monthNameEl.innerText = `${month} ${year}`;

    // Render Calendar
    const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate();
    calendarGrid.innerHTML = ''; 

    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-box');
        dayDiv.innerText = i;
        if (i < day) dayDiv.classList.add('past');
        else if (i === day) dayDiv.classList.add('today');
        calendarGrid.appendChild(dayDiv);
    }

    // Stats
    daysGoneEl.innerText = day - 1;
    daysLeftEl.innerText = daysInMonth - day;
    const totalDone = weeklyStats.reduce((a, b) => a + b, 0);
    totalCompletedEl.innerText = totalDone;
}

// ==========================================
// 5. MONEY APP LOGIC
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

    // Update Total
    moneyData.current += amount;

    // RULE CALCULATION
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
    if(confirm("Start over? This will reset your money progress.")) {
        moneyData = { target: 0, current: 0, buckets: { needs: 0, savings: 0, invest: 0, fun: 0 } };
        saveMoneyData();
        initMoneyApp();
    }
}

function saveMoneyData() {
    localStorage.setItem('moneyData', JSON.stringify(moneyData));
}

// ==========================================
// 6. HABIT TRACKING LOGIC
// ==========================================

function initMainApp() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.innerText = new Date().toLocaleDateString('en-US', options);
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
    const todayIndex = new Date().getDay(); 
    const chartIndex = (todayIndex + 6) % 7;
    
    const completedCount = tasks.filter(t => t.completed).length;
    weeklyStats[chartIndex] = completedCount;
    localStorage.setItem('weeklyStats', JSON.stringify(weeklyStats));
    updateCharts();
}

// ==========================================
// 7. CHART.JS LOGIC (Dual Rendering)
// ==========================================

function updateCharts() {
    // 1. Render Welcome Screen Chart
    const ctxWelcome = document.getElementById('chartWelcome').getContext('2d');
    if (growthChartWelcome) growthChartWelcome.destroy();
    growthChartWelcome = createSmoothChart(ctxWelcome);

    // 2. Render Main App Chart (if visible)
    // We check if the element exists in DOM or is visible, but creating it doesn't hurt.
    const ctxMain = document.getElementById('growthChart').getContext('2d');
    if (growthChartMain) growthChartMain.destroy();
    growthChartMain = createSmoothChart(ctxMain);
}

function createSmoothChart(ctx) {
    // Shared Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.5)');
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{ 
                label: 'Focus Level', 
                data: weeklyStats, 
                borderColor: '#06b6d4',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#0f172a',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#94a3b8',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: { label: function(c) { return c.parsed.y + ' Tasks'; } }
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }, 
                    ticks: { color: '#64748b', font: { size: 10 } } 
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#94a3b8', font: { size: 11 } } 
                }
            },
            interaction: { intersect: false, mode: 'index' },
        }
    });
}

// ==========================================
// 8. MEMORY BROWSER LOGIC
// ==========================================

function openMemoryBrowser() {
    memoryBreadcrumb.innerText = "Select Year";
    renderYears();
}

function renderYears() {
    memoryListContainer.innerHTML = '';
    memoryBreadcrumb.innerText = "Select Year";
    
    const currentYear = new Date().getFullYear().toString();
    const years = Object.keys(memories).sort().reverse();
    if (!years.includes(currentYear)) years.unshift(currentYear);

    years.forEach(year => {
        const card = createFolderCard(year, 'ri-calendar-fill', null, () => renderMonths(year));
        memoryListContainer.appendChild(card);
    });
}

function renderMonths(year) {
    memoryListContainer.innerHTML = '';
    memoryBreadcrumb.innerText = `${year} > Select Month`;
    
    const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const backCard = createFolderCard("Back", "ri-arrow-go-back-line", null, () => renderYears());
    memoryListContainer.appendChild(backCard);

    allMonths.forEach(month => {
        const hasMemories = memories[year] && memories[year][month];
        if (hasMemories || year == new Date().getFullYear()) {
             const card = createFolderCard(month, 'ri-folder-3-fill', null, () => renderDays(year, month));
             memoryListContainer.appendChild(card);
        }
    });
}

function renderDays(year, month) {
    memoryListContainer.innerHTML = '';
    memoryBreadcrumb.innerText = `${year} > ${month} > Select Date`;

    const backCard = createFolderCard("Back", "ri-arrow-go-back-line", null, () => renderMonths(year));
    memoryListContainer.appendChild(backCard);

    if (memories[year] && memories[year][month]) {
        const days = Object.keys(memories[year][month]).sort((a,b) => a-b);
        days.forEach(day => {
            const dateObj = new Date(`${month} ${day}, ${year}`);
            const memoryData = memories[year][month][day];
            const coverImg = (memoryData.media && memoryData.media.length > 0) ? memoryData.media[0] : null;
            
            const card = createFolderCard(`${day}${getOrdinal(day)}`, 'ri-image-2-line', coverImg, () => openMemoryEditor(dateObj));
            memoryListContainer.appendChild(card);
        });
    } else {
        memoryListContainer.innerHTML += `<p style="color:#666; width:100%; text-align:center;">No memories yet.</p>`;
    }
}

function createFolderCard(text, iconClass, bgImage, onClick) {
    const div = document.createElement('div');
    div.className = 'folder-card';
    let content = `<i class="${iconClass}"></i><span>${text}</span>`;
    if (bgImage) content += `<img src="${bgImage}" class="folder-cover">`;
    div.innerHTML = content;
    div.onclick = onClick;
    return div;
}

function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

// ==========================================
// 9. MEMORY EDITOR LOGIC
// ==========================================

function openMemoryEditor(date) {
    currentEditingDate = date;
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();

    editorDateTitle.innerText = date.toDateString();
    memoryEditor.style.display = 'flex';

    const existingData = memories[year]?.[month]?.[day];
    if (existingData) {
        editorText.value = existingData.text || "";
        if (Array.isArray(existingData.media)) {
            currentMediaList = existingData.media;
        } else if (existingData.media) {
            currentMediaList = [existingData.media]; 
        } else {
            currentMediaList = [];
        }
    } else {
        editorText.value = "";
        currentMediaList = [];
    }
    renderCarousel();
}

function closeEditor() {
    memoryEditor.style.display = 'none';
}

function renderCarousel() {
    carouselTrack.innerHTML = '';
    carouselDots.innerHTML = '';

    if (currentMediaList.length === 0) {
        carouselTrack.innerHTML = `
            <div class="carousel-slide empty-state-slide">
                <i class="ri-image-add-line"></i>
                <p>Tap + to upload up to 7 photos</p>
            </div>
        `;
    } else {
        currentMediaList.forEach((mediaStr, index) => {
            const slide = document.createElement('div');
            slide.className = 'carousel-slide';
            slide.innerHTML = `<img src="${mediaStr}">`;
            slide.onclick = () => {
                if(confirm("Remove this photo?")) {
                    currentMediaList.splice(index, 1);
                    renderCarousel();
                }
            };
            carouselTrack.appendChild(slide);

            const dot = document.createElement('div');
            dot.className = index === 0 ? 'dot-indicator active' : 'dot-indicator';
            carouselDots.appendChild(dot);
        });
    }

    carouselTrack.onscroll = () => {
        const scrollLeft = carouselTrack.scrollLeft;
        const width = carouselTrack.offsetWidth;
        const index = Math.round(scrollLeft / width);
        const dots = document.querySelectorAll('.dot-indicator');
        dots.forEach((d, i) => {
            if(i === index) d.classList.add('active');
            else d.classList.remove('active');
        });
    };
}

function handleMediaPreview(input) {
    const files = input.files;
    if (!files || files.length === 0) return;

    if (currentMediaList.length + files.length > MAX_MEDIA_ITEMS) {
        alert(`You can only have ${MAX_MEDIA_ITEMS} items total.`);
        return;
    }

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resizeImage(e.target.result, 800, 800, (compressedBase64) => {
                currentMediaList.push(compressedBase64);
                renderCarousel();
            });
        };
        reader.readAsDataURL(file);
    });
}

function resizeImage(base64Str, maxWidth, maxHeight, callback) {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
            if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.7)); 
    };
}

function saveCurrentMemory() {
    const year = currentEditingDate.getFullYear().toString();
    const month = currentEditingDate.toLocaleString('default', { month: 'long' });
    const day = currentEditingDate.getDate().toString();
    const text = editorText.value;

    if (!text && currentMediaList.length === 0) {
        alert("Please write something or add a photo.");
        return;
    }

    if (!memories[year]) memories[year] = {};
    if (!memories[year][month]) memories[year][month] = {};

    memories[year][month][day] = {
        text: text,
        media: currentMediaList
    };

    try {
        localStorage.setItem('memories_v2', JSON.stringify(memories));
        alert("Memory Saved!");
        closeEditor();
        if(memoryBrowser.style.display === 'block') {
            renderDays(year, month);
        }
    } catch (e) {
        alert("Storage Full! Browser storage is full. Try deleting old memories.");
    }
}

function deleteCurrentMemory() {
    const year = currentEditingDate.getFullYear().toString();
    const month = currentEditingDate.toLocaleString('default', { month: 'long' });
    const day = currentEditingDate.getDate().toString();

    if (confirm("Are you sure you want to delete this memory?")) {
        if (memories[year] && memories[year][month]) {
            delete memories[year][month][day];
            localStorage.setItem('memories_v2', JSON.stringify(memories));
            closeEditor();
            renderDays(year, month);
        }
    }
}

// Start App
init();