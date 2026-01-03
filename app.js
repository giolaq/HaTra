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

// 2026 Calendar Configuration
const YEAR = 2026;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DAYS_SHORT = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

// Get the Monday of week 1 of 2026 (ISO week date)
// January 1, 2026 is a Thursday, so Week 1 starts on Monday Dec 29, 2025
function getWeekStart(weekNumber) {
    // Find the first Thursday of the year (ISO 8601 week definition)
    const jan4 = new Date(YEAR, 0, 4); // Jan 4 is always in week 1
    const dayOfWeek = jan4.getDay() || 7; // Convert Sunday=0 to 7
    const firstMonday = new Date(jan4);
    firstMonday.setDate(jan4.getDate() - dayOfWeek + 1);

    // Add weeks
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7);
    return weekStart;
}

// Get dates for a specific week
function getWeekDates(weekNumber) {
    const weekStart = getWeekStart(weekNumber);
    const dates = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        dates.push({
            day: date.getDate(),
            month: date.getMonth(),
            monthName: MONTHS[date.getMonth()],
            dayName: DAYS_SHORT[i],
            fullDate: date,
            isCurrentYear: date.getFullYear() === YEAR
        });
    }
    return dates;
}

// Format week display string
function formatWeekDisplay(weekNumber) {
    const dates = getWeekDates(weekNumber);
    const startDate = dates[0];
    const endDate = dates[6];

    if (startDate.month === endDate.month) {
        return `${startDate.monthName} ${startDate.day}-${endDate.day}`;
    } else {
        return `${startDate.monthName} ${startDate.day} - ${endDate.monthName} ${endDate.day}`;
    }
}

// Get total weeks in 2026
function getTotalWeeks() {
    // 2026 has 53 weeks (ISO week numbering)
    const dec31 = new Date(YEAR, 11, 31);
    const dayOfWeek = dec31.getDay() || 7;
    // If Dec 31 is Thursday or later, it's week 53
    return dayOfWeek >= 4 ? 53 : 52;
}

const TOTAL_WEEKS = getTotalWeeks();

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
    // Set current week based on today's date if we're in 2026
    const today = new Date();
    if (today.getFullYear() === YEAR) {
        currentWeek = getISOWeek(today);
    }

    loadData();
    updateDateHeaders();
    renderHabits();
    updateProgress();
    setupEventListeners();
    drawChart();
}

// Get ISO week number for a date
function getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Update the date headers in the DOM
function updateDateHeaders() {
    const dates = getWeekDates(currentWeek);

    // Update day headers (day names)
    const dayHeaders = document.querySelectorAll('.day-header');
    dayHeaders.forEach((header, index) => {
        if (index < dates.length) {
            header.textContent = dates[index].dayName;
        }
    });

    // Update day numbers
    const dayNumbers = document.querySelectorAll('.day-number');
    dayNumbers.forEach((numEl, index) => {
        if (index < dates.length) {
            numEl.textContent = dates[index].day;
            // Dim dates from other years
            if (!dates[index].isCurrentYear) {
                numEl.style.opacity = '0.5';
            } else {
                numEl.style.opacity = '1';
            }
        }
    });

    // Update progress section day headers
    const progressDayHeaders = document.querySelectorAll('.progress-day-header');
    progressDayHeaders.forEach((header, index) => {
        if (index < dates.length) {
            header.textContent = dates[index].dayName;
        }
    });
}

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('habitData2026');
    if (saved) {
        habitData = JSON.parse(saved);
    } else {
        // Initialize empty data structure
        habitData = {};
        for (let week = 1; week <= TOTAL_WEEKS; week++) {
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
    const dates = getWeekDates(currentWeek);

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
            checkbox.checked = habitData[currentWeek]?.[day]?.[habitIndex] || false;

            // Check if this date is in 2026
            const isInYear = dates[day].isCurrentYear;
            if (!isInYear) {
                checkbox.disabled = true;
                checkbox.style.opacity = '0.3';
            }

            checkbox.addEventListener('change', (e) => {
                if (!habitData[currentWeek]) habitData[currentWeek] = {};
                if (!habitData[currentWeek][day]) habitData[currentWeek][day] = {};
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

    // Update week display with date range
    weekDisplay.innerHTML = `<span style="font-size: 0.7em; opacity: 0.7;">WK${currentWeek}</span><br>${formatWeekDisplay(currentWeek)}`;
}

// Update progress statistics
function updateProgress() {
    const dates = getWeekDates(currentWeek);

    for (let day = 0; day < 7; day++) {
        let done = 0;
        let total = habits.length;

        // Only count if the date is in 2026
        if (dates[day].isCurrentYear) {
            habits.forEach((_, habitIndex) => {
                if (habitData[currentWeek]?.[day]?.[habitIndex]) {
                    done++;
                }
            });
        } else {
            total = 0; // Don't count days outside 2026
        }

        const notDone = total - done;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;

        const progressEl = document.getElementById(`progress-${day}`);
        const doneEl = document.getElementById(`done-${day}`);
        const notDoneEl = document.getElementById(`notdone-${day}`);

        if (progressEl) {
            progressEl.textContent = total > 0 ? `${progress}%` : '-';
            progressEl.style.opacity = total > 0 ? '1' : '0.3';
        }
        if (doneEl) {
            doneEl.textContent = total > 0 ? done : '-';
            doneEl.style.opacity = total > 0 ? '1' : '0.3';
        }
        if (notDoneEl) {
            notDoneEl.textContent = total > 0 ? notDone : '-';
            notDoneEl.style.opacity = total > 0 ? '1' : '0.3';
        }
    }
}

// Draw progress chart - Neo-Terminal Theme
function drawChart() {
    const canvas = document.getElementById('progressChart');
    const ctx = canvas.getContext('2d');
    const dates = getWeekDates(currentWeek);

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 45;

    // Theme colors
    const colors = {
        bg: '#12121a',
        grid: 'rgba(0, 245, 212, 0.1)',
        text: '#888899',
        accent: '#00f5d4',
        accentGlow: 'rgba(0, 245, 212, 0.3)',
        disabled: 'rgba(136, 136, 153, 0.3)'
    };

    // Clear canvas
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    // Calculate progress for each day
    const progressData = [];
    for (let day = 0; day < 7; day++) {
        if (!dates[day].isCurrentYear) {
            progressData.push(null); // null for days outside 2026
            continue;
        }
        let done = 0;
        habits.forEach((_, habitIndex) => {
            if (habitData[currentWeek]?.[day]?.[habitIndex]) {
                done++;
            }
        });
        const progress = habits.length > 0 ? (done / habits.length) * 100 : 0;
        progressData.push(progress);
    }

    // Draw grid lines
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;

    const yLabels = [100, 75, 50, 25, 0];
    yLabels.forEach(label => {
        const y = padding + ((100 - label) / 100) * (height - 2 * padding);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    });

    // Draw y-axis labels
    ctx.fillStyle = colors.text;
    ctx.font = '10px "Orbitron", sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    yLabels.forEach(label => {
        const y = padding + ((100 - label) / 100) * (height - 2 * padding);
        ctx.fillText(`${label}%`, padding - 8, y);
    });

    // Draw x-axis labels with actual day numbers
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const barWidth = (width - 2 * padding) / 7;

    dates.forEach((date, i) => {
        const x = padding + (i + 0.5) * barWidth;
        ctx.fillStyle = date.isCurrentYear ? colors.text : colors.disabled;
        ctx.fillText(`${date.dayName} ${date.day}`, x, height - padding + 8);
    });

    // Draw bars with glow effect
    progressData.forEach((progress, i) => {
        const x = padding + i * barWidth + barWidth * 0.15;
        const barW = barWidth * 0.7;
        const maxBarHeight = height - 2 * padding;
        const y = height - padding;

        if (progress === null) {
            // Disabled day - just show faint outline
            ctx.strokeStyle = colors.disabled;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.roundRect(x, padding, barW, maxBarHeight, 4);
            ctx.stroke();
            ctx.setLineDash([]);
        } else if (progress > 0) {
            const barHeight = (progress / 100) * maxBarHeight;
            const barY = height - padding - barHeight;

            // Glow effect
            ctx.shadowColor = colors.accent;
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // Bar with gradient
            const gradient = ctx.createLinearGradient(0, barY, 0, height - padding);
            gradient.addColorStop(0, colors.accent);
            gradient.addColorStop(1, 'rgba(0, 245, 212, 0.4)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, barY, barW, barHeight, 4);
            ctx.fill();

            // Reset shadow
            ctx.shadowBlur = 0;

            // Draw percentage on top
            ctx.fillStyle = colors.accent;
            ctx.font = 'bold 10px "Orbitron", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`${Math.round(progress)}%`, x + barW / 2, barY - 4);
        } else {
            // Empty bar outline
            ctx.strokeStyle = 'rgba(0, 245, 212, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x, padding, barW, maxBarHeight, 4);
            ctx.stroke();
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    prevWeekBtn.addEventListener('click', () => {
        if (currentWeek > 1) {
            currentWeek--;
            updateDateHeaders();
            renderHabits();
            updateProgress();
            drawChart();
        }
    });

    nextWeekBtn.addEventListener('click', () => {
        if (currentWeek < TOTAL_WEEKS) {
            currentWeek++;
            updateDateHeaders();
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
