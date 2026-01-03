// Habit data
const habits = [
    { name: 'Wake up at 05:00', emoji: '⏰' },
    { name: 'Gym', emoji: '💪' },
    { name: 'Reading / Learning', emoji: '📖' },
    { name: 'Day Planning', emoji: '📝' },
    { name: 'Budget Tracking', emoji: '💰' },
    { name: 'Project Work', emoji: '🎯' },
    { name: 'No Alcohol', emoji: '🍷' },
    { name: 'Social Media Detox', emoji: '🌿' },
    { name: 'Goal Journaling', emoji: '📔' },
    { name: 'Cold Shower', emoji: '🚿' }
];

// State
let currentWeek = 1;
let selectedHabitIndex = null;
let habitData = {};

// DOM Elements
const habitsGrid = document.getElementById('habitsGrid');
const weekDisplay = document.getElementById('weekDisplay');
const prevWeekBtn = document.getElementById('prevWeek');
const nextWeekBtn = document.getElementById('nextWeek');

// Initialize app
function init() {
    loadData();
    renderHabits();
    updateProgress();
    setupEventListeners();
    drawChart();
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('habitData2026');
    if (saved) {
        habitData = JSON.parse(saved);
    } else {
        // Initialize empty data structure
        habitData = {};
        for (let week = 1; week <= 52; week++) {
            habitData[week] = {};
            for (let day = 0; day < 7; day++) {
                habitData[week][day] = {};
                habits.forEach((_, habitIndex) => {
                    habitData[week][day][habitIndex] = false;
                });
            }
        }
        saveData();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('habitData2026', JSON.stringify(habitData));
}

// Render habits grid
function renderHabits() {
    habitsGrid.innerHTML = '';

    habits.forEach((habit, habitIndex) => {
        const row = document.createElement('div');
        row.className = 'habit-row';
        if (selectedHabitIndex === habitIndex) {
            row.classList.add('selected');
        }

        // Habit label
        const label = document.createElement('div');
        label.className = 'habit-label';
        label.innerHTML = `${habit.name} ${habit.emoji}`;
        label.addEventListener('click', () => {
            selectedHabitIndex = selectedHabitIndex === habitIndex ? null : habitIndex;
            renderHabits();
        });
        row.appendChild(label);

        // Checkboxes for each day
        for (let day = 0; day < 7; day++) {
            const cell = document.createElement('div');
            cell.className = 'checkbox-cell';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = habitData[currentWeek][day][habitIndex];
            checkbox.addEventListener('change', (e) => {
                habitData[currentWeek][day][habitIndex] = e.target.checked;
                saveData();
                updateProgress();
                drawChart();
            });

            cell.appendChild(checkbox);
            row.appendChild(cell);
        }

        habitsGrid.appendChild(row);
    });

    weekDisplay.textContent = `Week ${currentWeek}`;
}

// Update progress statistics
function updateProgress() {
    for (let day = 0; day < 7; day++) {
        let done = 0;
        let total = habits.length;

        habits.forEach((_, habitIndex) => {
            if (habitData[currentWeek][day][habitIndex]) {
                done++;
            }
        });

        const notDone = total - done;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        document.getElementById(`progress-${day}`).textContent = `${progress}%`;
        document.getElementById(`done-${day}`).textContent = done;
        document.getElementById(`notdone-${day}`).textContent = notDone;
    }
}

// Draw progress chart
function drawChart() {
    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate progress for each day
    const progressData = [];
    for (let day = 0; day < 7; day++) {
        let done = 0;
        habits.forEach((_, habitIndex) => {
            if (habitData[currentWeek][day][habitIndex]) {
                done++;
            }
        });
        const progress = habits.length > 0 ? (done / habits.length) * 100 : 0;
        progressData.push(progress);
    }

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw y-axis labels
    ctx.fillStyle = '#333';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    const yLabels = [100, 50, 0, -50];
    yLabels.forEach(label => {
        const y = padding + ((100 - label) / 150) * (height - 2 * padding);
        ctx.fillText(`${label}%`, padding - 10, y);

        // Draw grid line
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    });

    // Draw x-axis labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const days = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
    const barWidth = (width - 2 * padding) / 7;

    days.forEach((day, i) => {
        const x = padding + (i + 0.5) * barWidth;
        ctx.fillText(day, x, height - padding + 10);
    });

    // Draw bars
    progressData.forEach((progress, i) => {
        const x = padding + i * barWidth + barWidth * 0.2;
        const barW = barWidth * 0.6;
        const maxBarHeight = (height - 2 * padding) * (100 / 150);
        const barHeight = (progress / 100) * maxBarHeight;
        const y = height - padding - barHeight;

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barW, barHeight);

        // Draw percentage on top of bar
        if (progress > 0) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${Math.round(progress)}%`, x + barW / 2, y - 5);
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    prevWeekBtn.addEventListener('click', () => {
        if (currentWeek > 1) {
            currentWeek--;
            renderHabits();
            updateProgress();
            drawChart();
        }
    });

    nextWeekBtn.addEventListener('click', () => {
        if (currentWeek < 52) {
            currentWeek++;
            renderHabits();
            updateProgress();
            drawChart();
        }
    });

    // Redraw chart on window resize
    window.addEventListener('resize', drawChart);
}

// Start the app
init();
