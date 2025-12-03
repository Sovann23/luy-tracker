// Luy Tracker - Modern Sidebar Layout

let expenses = [];
let currentEditIndex = null;
let currentLanguage = localStorage.getItem('luy-language') || 'en';
let translations = {};

let categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Travel', 'Others'];

const exchangeRates = {
    'USD': 1,
    'KHR': 4000
};

const categoryColors = [
    '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#C7CEEA',
    '#FF8B94', '#B4A7D6', '#95E1D3', '#F38181', '#AA96DA'
];

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    applySavedTheme();
    applySavedLanguage();
    loadLanguages();
    loadAllData();
    initializeDate();
    updateDashboard();
    initializeCharts();
    setupEventListeners();
    updateReportMonths();
    applyLanguage();
});

function loadAllData() {
    const storedExpenses = localStorage.getItem("expenses");
    const storedCategories = localStorage.getItem("categories");
    
    if (storedExpenses) expenses = JSON.parse(storedExpenses);
    if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        if (parsedCategories.length > 0) categories = parsedCategories;
    }
    
    updateCategorySelects();
    updateExpenseTable();
}

function saveAllData() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("categories", JSON.stringify(categories));
}

function initializeDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expenseDate').value = today;
    document.getElementById('editExpenseDate').value = today;
    updateMonthFilter();
}

function setupEventListeners() {
    document.getElementById("expenseForm").addEventListener("submit", addExpense);
    document.getElementById("editExpenseForm").addEventListener("submit", updateExpense);
    document.getElementById("searchExpenses").addEventListener("input", updateExpenseTable);
    document.getElementById("filterMonth").addEventListener("change", updateExpenseTable);
    document.getElementById("downloadCSV").addEventListener("click", downloadCSV);
    document.getElementById("downloadPDF").addEventListener("click", downloadPDF);
    document.getElementById("importData").addEventListener("click", () => document.getElementById("importFile").click());
    document.getElementById("importFile").addEventListener("change", importData);
    document.getElementById("addCategory").addEventListener("click", addCategoryFromModal);
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        if (mobileMenu && mobileMenuBtn) {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        }
    });
}

function addExpense(event) {
    event.preventDefault();

    const expense = { 
        date: document.getElementById("expenseDate").value,
        amount: parseFloat(document.getElementById("expenseAmount").value),
        currency: document.getElementById("expenseCurrency").value,
        category: document.getElementById("expenseCategory").value,
        moneyType: document.getElementById("expenseMoneyType").value,
        expenseType: document.getElementById("expenseType").value,
        note: document.getElementById("expenseNote").value,
        id: Date.now()
    };

    expenses.push(expense);
    saveAllData();
    updateExpenseTable();
    updateDashboard();
    updateMonthFilter();
    updateCharts();
    
    // Success feedback
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.textContent = '✓ Added!';
    submitBtn.style.background = '#10b981';
    setTimeout(() => {
        submitBtn.textContent = 'Add Expense';
        submitBtn.style.background = '';
    }, 2000);
    
    event.target.reset();
    document.getElementById("expenseDate").value = new Date().toISOString().split('T')[0];
}

function updateExpenseTable() {
    const tableBody = document.getElementById("expenseTableBody");
    const searchTerm = document.getElementById("searchExpenses").value.toLowerCase();
    const filterMonth = document.getElementById("filterMonth").value;
    
    let filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.note.toLowerCase().includes(searchTerm) || 
                             expense.category.toLowerCase().includes(searchTerm);
        const matchesMonth = !filterMonth || expense.date.startsWith(filterMonth);
        return matchesSearch && matchesMonth;
    });

    tableBody.innerHTML = "";

    if (filteredExpenses.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-icon">💸</div>
                    <div>No expenses found. Start tracking!</div>
                </td>
            </tr>
        `;
        return;
    }

    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    filteredExpenses.forEach((expense) => {
        const originalIndex = expenses.findIndex(e => e.id === expense.id);
        const row = document.createElement("tr");
        row.className = "expense-row";
        
        const categoryIndex = categories.indexOf(expense.category);
        const colorClass = `cat-color-${categoryIndex % 10}`;

        row.innerHTML = `
            <td><strong>${formatDate(expense.date)}</strong></td>
            <td>
                <strong>${expense.amount} ${expense.currency}</strong>
                ${expense.currency !== 'USD' ? `<br><small style="color: #666;">${convertCurrency(expense.amount, expense.currency, 'USD').toFixed(2)} USD</small>` : ''}
            </td>
            <td>
                <span class="category-badge ${colorClass}">${expense.category}</span>
            </td>
            <td>${expense.moneyType === 'Cash' ? 'Self Money' : 'House Money'}</td>
            <td>${expense.expenseType}</td>
            <td>${expense.note || '-'}</td>
            <td class="no-print">
                <div class="action-btns">
                    <button class="btn btn-warning btn-sm" onclick="openEditModal(${originalIndex})">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteExpense(${originalIndex})">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateDashboard() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = expenses.filter(expense => 
        expense.date.startsWith(currentMonth)
    );

    const totalExpensesUSD = currentMonthExpenses.reduce((sum, expense) => {
        return sum + convertCurrency(expense.amount, expense.currency, 'USD');
    }, 0);

    const allTimeTotalUSD = expenses.reduce((sum, expense) => {
        return sum + convertCurrency(expense.amount, expense.currency, 'USD');
    }, 0);

    const dailyAverage = totalExpensesUSD / new Date().getDate();
    const largestExpense = Math.max(...currentMonthExpenses.map(expense => 
        convertCurrency(expense.amount, expense.currency, 'USD')
    ), 0);

    document.getElementById("totalExpenses").textContent = `$${totalExpensesUSD.toFixed(2)}`;
    document.getElementById("allTimeTotal").textContent = `$${allTimeTotalUSD.toFixed(2)}`;
    document.getElementById("dailyAverage").textContent = `$${dailyAverage.toFixed(2)}`;
    document.getElementById("largestExpense").textContent = `$${largestExpense.toFixed(2)}`;
    
    // Update dashboard spending pattern
    updateDashboardInsights();
}

function updateDashboardInsights() {
    // Top spending days
    const dailyPattern = getDailySpendingPattern().sort((a, b) => b.total - a.total).slice(0, 5);
    const spendingBody = document.getElementById('dashboardSpendingBody');
    if (dailyPattern.length > 0) {
        spendingBody.innerHTML = dailyPattern.map(d => 
            `<tr><td>${d.day}</td><td>$${d.total.toFixed(2)}</td><td>$${d.average.toFixed(2)}</td></tr>`
        ).join('');
    } else {
        spendingBody.innerHTML = '<tr><td colspan="3" class="text-center">No data</td></tr>';
    }
}

// Chart functions
let categoryChart, monthlyChart;

function initializeCharts() {
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            family: '-apple-system, BlinkMacSystemFont, Inter, sans-serif',
                            weight: '500'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    cornerRadius: 8
                }
            }
        }
    });

    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Monthly Expenses',
                data: [],
                borderColor: '#000000',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                tension: 0.4,
                fill: true,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#000000',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#e5e5e5',
                        drawBorder: false
                    },
                    ticks: {
                        font: { size: 12 },
                        padding: 10
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: { size: 12 },
                        padding: 10
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 },
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });

    updateCharts();
}

function updateCharts() {
    updateCategoryChart();
    updateMonthlyChart();
}

function updateCategoryChart() {
    const filterMonth = document.getElementById("filterMonth").value;
    const filteredExpenses = expenses.filter(expense => {
        return !filterMonth || expense.date.startsWith(filterMonth);
    });

    const categoryTotals = {};
    categories.forEach(category => {
        categoryTotals[category] = 0;
    });

    filteredExpenses.forEach(expense => {
        const amountUSD = convertCurrency(expense.amount, expense.currency, 'USD');
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + amountUSD;
    });

    const labels = [];
    const data = [];
    const backgroundColors = [];

    categories.forEach(category => {
        if (categoryTotals[category] > 0) {
            labels.push(category);
            data.push(categoryTotals[category]);
            const colorIndex = categories.indexOf(category) % categoryColors.length;
            backgroundColors.push(categoryColors[colorIndex]);
        }
    });

    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = data;
    categoryChart.data.datasets[0].backgroundColor = backgroundColors;
    categoryChart.update();
}

function updateMonthlyChart() {
    const monthKeys = [];
    const monthlyTotals = {};
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        monthKeys.push(monthKey);
        monthlyTotals[monthKey] = 0;
    }

    expenses.forEach(expense => {
        const monthKey = expense.date.slice(0, 7);
        if (monthlyTotals.hasOwnProperty(monthKey)) {
            const amountUSD = convertCurrency(expense.amount, expense.currency, 'USD');
            monthlyTotals[monthKey] += amountUSD;
        }
    });

    const data = monthKeys.map(key => monthlyTotals[key] || 0);
    const labels = monthKeys.map(key => {
        return new Date(key + '-02').toLocaleString('default', { month: 'short', year: '2-digit' });
    });

    monthlyChart.data.labels = labels;
    monthlyChart.data.datasets[0].data = data;
    monthlyChart.update();
}

// -------------------- Language Support --------------------
function loadLanguages() {
    fetch('languages.json')
        .then(response => response.json())
        .then(data => {
            translations = data;
            applyLanguage();
        })
        .catch(err => console.error('Failed to load languages:', err));
}

function applyLanguage() {
    const lang = translations[currentLanguage];
    if (!lang) return;
    
    // Update all elements with data-key attributes (for backward compatibility)
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        if (lang[key]) el.textContent = lang[key];
    });
    
    // Update all elements with data-placeholder attributes
    document.querySelectorAll('[data-placeholder]').forEach(el => {
        const key = el.getAttribute('data-placeholder');
        if (lang[key]) el.placeholder = lang[key];
    });
    
    // Update all elements by their ID from languages.json
    Object.entries(lang).forEach(([key, value]) => {
        // Skip brand-name and brand-subtitle - keep them in English
        if (key === 'brand-name' || key === 'brand-subtitle') {
            return;
        }
        
        const element = document.getElementById(key);
        if (element) {
            // Check if it's an input/select with placeholder
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = value;
                } else {
                    element.textContent = value;
                }
            } else if (element.tagName === 'OPTION') {
                element.textContent = value;
            } else if (element.tagName === 'LABEL') {
                element.textContent = value;
            } else if (element.tagName === 'BUTTON') {
                // For buttons, update text nodes while preserving icons/emojis
                const text = element.textContent;
                const icon = text.substring(0, text.search(/[A-Za-z]/)); // Get leading emojis/symbols
                element.textContent = (icon || '') + value;
            } else {
                // For other elements (h1, h2, h3, p, th, td, etc)
                element.textContent = value;
            }
        }
    });
    
    // Update language icon
    const langIcon = document.getElementById('langIcon');
    if (langIcon) langIcon.textContent = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
    
    const langIcon2 = document.getElementById('langIcon2');
    if (langIcon2) langIcon2.textContent = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
    
    // Set language attribute on body for CSS styling
    document.body.setAttribute('data-language', currentLanguage);
    
    // Save preference
    localStorage.setItem('luy-language', currentLanguage);
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'km' : 'en';
    applyLanguage();
}

function t(key) {
    return translations[currentLanguage]?.[key] || key;
}

// -------------------- Page & Theme Helpers --------------------
function showPage(pageName) {
    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
    const page = document.getElementById(`${pageName}-page`);
    if (page) page.classList.add('active');

    // When showing analytics, ensure charts/stats are up to date
    if (pageName === 'analytics') {
        if (!window.analyticsInitialized) initializeAnalyticsCharts();
        updateAnalytics();
    } else {
        // update dashboard charts when returning
        updateCharts();
    }
}

function applySavedTheme() {
    const saved = localStorage.getItem('luy-theme') || 'light';
    if (saved === 'dark') document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function applySavedLanguage() {
    const saved = localStorage.getItem('luy-language') || 'en';
    document.body.setAttribute('data-language', saved);
}

function toggleTheme() {
    const current = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
    localStorage.setItem('luy-theme', next);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
}

// Toggle mobile menu visibility
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }
}

// Apply saved theme on load
applySavedTheme();

// -------------------- Analytics (uses the same `expenses` array) --------------------
let moneyTypeChart, trendChart, categoryAnalyticsChart, expenseTypeChart;
window.analyticsInitialized = false;

function initializeAnalyticsCharts() {
    // Money Type Chart
    const moneyCtx = document.getElementById('moneyTypeChart').getContext('2d');
    moneyTypeChart = new Chart(moneyCtx, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: ['#10B981','#0EA5E9'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 12-Month Trend
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: 'Expenses', data: [], borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Category Distribution
    const catCtx = document.getElementById('categoryAnalyticsChart').getContext('2d');
    categoryAnalyticsChart = new Chart(catCtx, { type: 'pie', data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] }, options: { responsive: true, maintainAspectRatio: false } });

    // Expense Type
    const typeCtx = document.getElementById('expenseTypeChart').getContext('2d');
    expenseTypeChart = new Chart(typeCtx, { type: 'doughnut', data: { labels: [], datasets: [{ data: [], backgroundColor: ['#FFB020','#EF4444'] }] }, options: { responsive: true, maintainAspectRatio: false } });

    window.analyticsInitialized = true;
}

function updateAnalytics() {
    // Basic stats
    const total = expenses.reduce((s, e) => s + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const amounts = expenses.map(e => convertCurrency(e.amount, e.currency, 'USD')).sort((a,b) => a-b);
    const median = amounts.length === 0 ? 0 : (amounts.length % 2 === 1 ? amounts[(amounts.length-1)/2] : ((amounts[amounts.length/2 -1] + amounts[amounts.length/2]) / 2));
    const avg = expenses.length ? (total / expenses.length) : 0;

    document.getElementById('statTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('statMedian').textContent = `$${median.toFixed(2)}`;
    document.getElementById('statCount').textContent = `${expenses.length}`;

    // Money Type breakdown - use proper labels
    const moneyTotals = { 'Self Money': 0, 'House Money': 0 };
    expenses.forEach(e => {
        const label = e.moneyType === 'Cash' ? 'Self Money' : 'House Money';
        moneyTotals[label] = (moneyTotals[label] || 0) + convertCurrency(e.amount, e.currency, 'USD');
    });
    moneyTypeChart.data.labels = Object.keys(moneyTotals);
    moneyTypeChart.data.datasets[0].data = Object.values(moneyTotals);
    moneyTypeChart.update();

    // Expense Type breakdown
    const typeTotals = {};
    expenses.forEach(e => { typeTotals[e.expenseType] = (typeTotals[e.expenseType] || 0) + convertCurrency(e.amount, e.currency, 'USD'); });
    expenseTypeChart.data.labels = Object.keys(typeTotals);
    expenseTypeChart.data.datasets[0].data = Object.values(typeTotals);
    expenseTypeChart.update();

    // Category distribution
    const catTotals = {};
    categories.forEach(c => catTotals[c] = 0);
    expenses.forEach(e => catTotals[e.category] = (catTotals[e.category] || 0) + convertCurrency(e.amount, e.currency, 'USD'));
    const catLabels = [], catData = [], catColors = [];
    categories.forEach((c, idx) => { if (catTotals[c] > 0) { catLabels.push(c); catData.push(catTotals[c]); catColors.push(categoryColors[idx % categoryColors.length]); } });
    categoryAnalyticsChart.data.labels = catLabels;
    categoryAnalyticsChart.data.datasets[0].data = catData;
    categoryAnalyticsChart.data.datasets[0].backgroundColor = catColors;
    categoryAnalyticsChart.update();

    // 12-month trend for analytics
    const monthKeys = [];
    const monthlyTotals = {};
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toISOString().slice(0,7);
        monthKeys.push(key);
        monthlyTotals[key] = 0;
    }
    expenses.forEach(e => { const k = e.date.slice(0,7); if (monthlyTotals.hasOwnProperty(k)) monthlyTotals[k] += convertCurrency(e.amount, e.currency, 'USD'); });
    trendChart.data.labels = monthKeys.map(k => new Date(k + '-02').toLocaleString('default', { month: 'short', year: '2-digit' }));
    trendChart.data.datasets[0].data = monthKeys.map(k => monthlyTotals[k] || 0);
    trendChart.update();

    // Monthly Summary Table
    updateMonthlySummaryTable();
}

function updateMonthlySummaryTable() {
    const months = new Set(expenses.map(e => e.date.slice(0, 7)));
    const sortedMonths = Array.from(months).sort().reverse();
    
    const body = document.getElementById('monthlySummaryBody');
    if (!body) return; // Exit if element doesn't exist
    
    if (sortedMonths.length === 0) {
        body.innerHTML = '<tr><td colspan="5" class="text-center">No data available</td></tr>';
        return;
    }
    
    body.innerHTML = '';
    sortedMonths.forEach(month => {
        const monthExpenses = expenses.filter(e => e.date.startsWith(month));
        const total = monthExpenses.reduce((s, e) => s + convertCurrency(e.amount, e.currency, 'USD'), 0);
        const avgPerDay = total / new Date(month + '-01').getDate();
        const highest = Math.max(...monthExpenses.map(e => convertCurrency(e.amount, e.currency, 'USD')), 0);
        
        const monthLabel = new Date(month + '-01').toLocaleDateString('default', { year: 'numeric', month: 'long' });
        const row = `<tr>
            <td>${monthLabel}</td>
            <td>$${total.toFixed(2)}</td>
            <td>$${avgPerDay.toFixed(2)}</td>
            <td>${monthExpenses.length}</td>
            <td>$${highest.toFixed(2)}</td>
        </tr>`;
        body.innerHTML += row;
    });
}

// Ensure analytics update whenever charts/data change
const originalUpdateCharts = updateCharts;
updateCharts = function() {
    originalUpdateCharts();
    if (window.analyticsInitialized) updateAnalytics();
};

// -------------------- Reports Page Functions --------------------
function generateAndDisplayReport() {
    const monthKey = document.getElementById('reportMonth').value;
    if (!monthKey) {
        alert('Please select a month');
        return;
    }
    
    const report = generateMonthlyReport(monthKey);
    
    // Show stats
    document.getElementById('reportStats').style.display = 'grid';
    document.getElementById('reportTotal').textContent = `$${report.total.toFixed(2)}`;
    document.getElementById('reportAvg').textContent = `$${report.average.toFixed(2)}`;
    document.getElementById('reportCount').textContent = `${report.count}`;
    document.getElementById('reportHighest').textContent = `$${report.highest ? report.highest.amount : '0.00'}`;
    
    // Category breakdown
    document.getElementById('categoryReportSection').style.display = 'block';
    const catBody = document.getElementById('reportCategoryBody');
    catBody.innerHTML = '';
    const catEntries = Object.entries(report.categories).sort((a, b) => b[1] - a[1]);
    catEntries.forEach(([cat, amount]) => {
        const pct = ((amount / report.total) * 100).toFixed(1);
        const row = `<tr><td>${cat}</td><td>$${amount.toFixed(2)}</td><td>${pct}%</td></tr>`;
        catBody.innerHTML += row;
    });
    
    // Money type breakdown
    document.getElementById('moneyTypeReportSection').style.display = 'block';
    const moneyBody = document.getElementById('reportMoneyTypeBody');
    moneyBody.innerHTML = '';
    Object.entries(report.moneyTypes).forEach(([type, amount]) => {
        const pct = ((amount / report.total) * 100).toFixed(1);
        const row = `<tr><td>${type === 'Cash' ? 'Self Money' : 'House Money'}</td><td>$${amount.toFixed(2)}</td><td>${pct}%</td></tr>`;
        moneyBody.innerHTML += row;
    });
    
    // Recurring expenses (all time, not just this month)
    const recurring = getRecurringExpenses();
    if (recurring.length > 0) {
        document.getElementById('recurringSection').style.display = 'block';
        const recurringBody = document.getElementById('recurringBody');
        recurringBody.innerHTML = '';
        recurring.forEach(r => {
            const row = `<tr><td>${r.category}</td><td>${r.amount} ${r.currency}</td><td>${r.occurrences}</td><td>${r.frequency}</td></tr>`;
            recurringBody.innerHTML += row;
        });
    }
    
    // Daily spending pattern (all time)
    const dailyPattern = getDailySpendingPattern();
    document.getElementById('dailyPatternSection').style.display = 'block';
    const dailyBody = document.getElementById('dailyPatternBody');
    dailyBody.innerHTML = '';
    dailyPattern.forEach(d => {
        if (d.count > 0) {
            const row = `<tr><td>${d.day}</td><td>$${d.total.toFixed(2)}</td><td>${d.count}</td><td>$${d.average.toFixed(2)}</td></tr>`;
            dailyBody.innerHTML += row;
        }
    });
}

// Populate report month dropdown
function updateReportMonths() {
    const select = document.getElementById('reportMonth');
    const months = new Set(expenses.map(e => e.date.slice(0, 7)));
    const sortedMonths = Array.from(months).sort().reverse();
    
    select.innerHTML = '<option value="">Choose Month...</option>';
    sortedMonths.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = new Date(month + '-01').toLocaleDateString('default', { 
            year: 'numeric', 
            month: 'long' 
        });
        select.appendChild(option);
    });
}

// Update report months when data changes
const originalSaveAllData = saveAllData;
saveAllData = function() {
    originalSaveAllData();
    updateReportMonths();
};

// Category Management
function updateCategorySelects() {
    const selects = ['expenseCategory', 'editExpenseCategory'];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select category</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    });
}

function addCategoryFromModal() {
    const categoryInput = document.getElementById("categoryInput");
    const categoryName = categoryInput.value.trim();
    
    if (categoryName && !categories.includes(categoryName)) {
        categories.push(categoryName);
        saveAllData();
        updateCategoryList();
        updateCategorySelects();
        categoryInput.value = "";
    }
}

function updateCategoryList() {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = "";
    
    categories.forEach((category, index) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item d-flex justify-content-between align-items-center";
        
        const colorClass = `cat-color-${index % 10}`;
        const categoryBadge = document.createElement('span');
        categoryBadge.className = `category-badge ${colorClass}`;
        categoryBadge.textContent = category;

        const buttonGroup = document.createElement('div');
        buttonGroup.style.display = 'flex';
        buttonGroup.style.gap = '0.5rem';

        const upButton = document.createElement('button');
        upButton.innerHTML = '↑';
        upButton.className = 'btn btn-sm btn-dark';
        upButton.style.width = '35px';
        upButton.disabled = index === 0;
        upButton.onclick = () => moveCategory(index, -1);
        buttonGroup.appendChild(upButton);

        const downButton = document.createElement('button');
        downButton.innerHTML = '↓';
        downButton.className = 'btn btn-sm btn-dark';
        downButton.style.width = '35px';
        downButton.disabled = index === categories.length - 1;
        downButton.onclick = () => moveCategory(index, 1);
        buttonGroup.appendChild(downButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "✕";
        deleteButton.className = "btn btn-danger btn-sm";
        deleteButton.style.width = '35px';
        deleteButton.onclick = () => deleteCategory(index);
        buttonGroup.appendChild(deleteButton);

        listItem.appendChild(categoryBadge);
        listItem.appendChild(buttonGroup);
        categoryList.appendChild(listItem);
    });
}

function moveCategory(index, direction) {
    const newIndex = index + direction;
    [categories[index], categories[newIndex]] = [categories[newIndex], categories[index]];
    saveAllDataAndRefresh();
}

function deleteCategory(index) {
    const isUsed = expenses.some(expense => expense.category === categories[index]);
    
    if (isUsed) {
        const count = expenses.filter(e => e.category === categories[index]).length;
        if (!confirm(`This category is used in ${count} expense${count > 1 ? 's' : ''}. Delete anyway?`)) {
            return;
        }
    }
    
    categories.splice(index, 1);
    saveAllDataAndRefresh();
}

function saveAllDataAndRefresh() {
    saveAllData();
    updateCategoryList();
    updateCategorySelects();
    updateExpenseTable();
    updateCharts();
}

// Export functions
function downloadCSV() {
    let csvContent = "Date,Amount,Currency,Category,Money Type,Expense Type,Description\n";

    expenses.forEach(expense => {
        const moneyTypeDisplay = expense.moneyType === 'Cash' ? 'Self Money' : 'House Money';
        const row = [
            expense.date,
            expense.amount,
            expense.currency,
            expense.category,
            moneyTypeDisplay,
            expense.expenseType,
            `"${expense.note.replace(/"/g, '""')}"`
        ];
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luy-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function downloadPDF() {
    window.print();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        try {
            const newExpenses = json.map(row => {
                if (!row.Date || !row.Amount || !row.Category) {
                    throw new Error('Invalid row. Must have Date, Amount, and Category.');
                }
                
                const date = row.Date instanceof Date ? row.Date.toISOString().split('T')[0] : row.Date;

                return {
                    date: date,
                    amount: parseFloat(row.Amount),
                    currency: row.Currency || 'USD',
                    category: row.Category,
                    moneyType: row['Money Type'] || 'Cash',
                    expenseType: row['Expense Type'] || 'Cash',
                    note: row.Description || '',
                    id: Date.now() + Math.random()
                };
            });

            expenses.push(...newExpenses);
            saveAllData();
            updateExpenseTable();
            updateMonthFilter();
            updateDashboard();
            updateCharts();
            alert(`✅ Successfully imported ${newExpenses.length} expense${newExpenses.length > 1 ? 's' : ''}!`);
        } catch (error) {
            alert(`❌ Error importing data: ${error.message}`);
        }
    };
    reader.readAsArrayBuffer(file);
    event.target.value = '';
}

// Utility functions
function convertCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    const amountUSD = fromCurrency === 'USD' ? amount : amount / exchangeRates[fromCurrency];
    return toCurrency === 'USD' ? amountUSD : amountUSD * exchangeRates[toCurrency];
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function updateMonthFilter() {
    const filter = document.getElementById('filterMonth');
    const months = new Set(expenses.map(expense => expense.date.slice(0, 7)));
    const sortedMonths = Array.from(months).sort().reverse();
    
    filter.innerHTML = '<option value="">All Time</option>';
    sortedMonths.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = new Date(month + '-01').toLocaleDateString('default', { 
            year: 'numeric', 
            month: 'long' 
        });
        filter.appendChild(option);
    });
}

function toggleDarkMode() {
    alert('🌙 Dark mode coming soon! Stay tuned...');
}

function clearAllExpenses() {
    if (confirm('⚠️ Delete ALL expenses? This cannot be undone!')) {
        if (confirm('Are you absolutely sure? This will permanently delete all your expense data.')) {
            expenses = [];
            saveAllData();
            updateExpenseTable();
            updateDashboard();
            updateCharts();
            alert('✅ All expenses cleared!');
        }
    }
}

function openEditModal(index) {
    currentEditIndex = index;
    const expense = expenses[index];

    document.getElementById("editExpenseDate").value = expense.date;
    document.getElementById("editExpenseAmount").value = expense.amount;
    document.getElementById("editExpenseCurrency").value = expense.currency;
    document.getElementById("editExpenseCategory").value = expense.category;
    document.getElementById("editExpenseMoneyType").value = expense.moneyType;
    document.getElementById("editExpenseType").value = expense.expenseType;
    document.getElementById("editExpenseNote").value = expense.note;

    $('#editExpenseModal').modal('show');
}

function updateExpense(event) {
    event.preventDefault();

    const updatedExpense = {
        date: document.getElementById("editExpenseDate").value,
        amount: parseFloat(document.getElementById("editExpenseAmount").value),
        currency: document.getElementById("editExpenseCurrency").value,
        category: document.getElementById("editExpenseCategory").value,
        moneyType: document.getElementById("editExpenseMoneyType").value,
        expenseType: document.getElementById("editExpenseType").value,
        note: document.getElementById("editExpenseNote").value,
        id: expenses[currentEditIndex].id
    };

    expenses[currentEditIndex] = updatedExpense;
    saveAllData();
    updateExpenseTable();
    updateDashboard();
    updateCharts();

    $('#editExpenseModal').modal('hide');
}

function deleteExpense(index) {
    if (confirm('⚠️ Delete this expense?')) {
        expenses.splice(index, 1);
        saveAllData();
        updateExpenseTable();
        updateDashboard();
        updateCharts();
    }
}

function openCategoryModal() {
    updateCategoryList();
    $('#categoryModal').modal('show');
}

// -------------------- Advanced Analytics Functions --------------------

// Get expenses filtered by category
function getExpensesByCategory(category) {
    return expenses.filter(e => e.category === category).map(e => ({
        ...e,
        amountUSD: convertCurrency(e.amount, e.currency, 'USD')
    }));
}

// Get expenses filtered by money type (Cash or Bank)
function getExpensesByMoneyType(moneyType) {
    return expenses.filter(e => e.moneyType === moneyType).map(e => ({
        ...e,
        amountUSD: convertCurrency(e.amount, e.currency, 'USD')
    }));
}

// Get statistical analysis of all expenses
function getExpenseStats() {
    const amounts = expenses.map(e => convertCurrency(e.amount, e.currency, 'USD'));
    if (amounts.length === 0) {
        return {
            total: 0,
            count: 0,
            average: 0,
            median: 0,
            min: 0,
            max: 0,
            stdDev: 0,
            range: 0
        };
    }
    
    amounts.sort((a, b) => a - b);
    const total = amounts.reduce((s, a) => s + a, 0);
    const average = total / amounts.length;
    const median = amounts.length % 2 === 1 
        ? amounts[Math.floor(amounts.length / 2)]
        : (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2;
    const min = amounts[0];
    const max = amounts[amounts.length - 1];
    const variance = amounts.reduce((s, a) => s + Math.pow(a - average, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        total: parseFloat(total.toFixed(2)),
        count: amounts.length,
        average: parseFloat(average.toFixed(2)),
        median: parseFloat(median.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2)),
        stdDev: parseFloat(stdDev.toFixed(2)),
        range: parseFloat((max - min).toFixed(2))
    };
}

// Get expenses within a date range
function getExpensesByDateRange(startDate, endDate) {
    // startDate and endDate should be in 'YYYY-MM-DD' format
    return expenses.filter(e => {
        return e.date >= startDate && e.date <= endDate;
    }).map(e => ({
        ...e,
        amountUSD: convertCurrency(e.amount, e.currency, 'USD')
    })).sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Generate a professional monthly report
function generateMonthlyReport(monthKey) {
    // monthKey should be in 'YYYY-MM' format
    const monthExpenses = expenses.filter(e => e.date.startsWith(monthKey));
    
    if (monthExpenses.length === 0) {
        return {
            month: monthKey,
            total: 0,
            count: 0,
            average: 0,
            categories: {},
            moneyTypes: {},
            expenseTypes: {},
            highest: null,
            dateRange: `${monthKey}-01 to ${monthKey}-31`
        };
    }
    
    const total = monthExpenses.reduce((s, e) => s + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const categories = {};
    const moneyTypes = { Cash: 0, Bank: 0 };
    const expenseTypes = {};
    
    monthExpenses.forEach(e => {
        const usd = convertCurrency(e.amount, e.currency, 'USD');
        categories[e.category] = (categories[e.category] || 0) + usd;
        moneyTypes[e.moneyType || 'Cash'] += usd;
        expenseTypes[e.expenseType] = (expenseTypes[e.expenseType] || 0) + usd;
    });
    
    const highest = monthExpenses.reduce((max, e) => {
        const eUSD = convertCurrency(e.amount, e.currency, 'USD');
        return eUSD > convertCurrency(max.amount, max.currency, 'USD') ? e : max;
    });
    
    return {
        month: monthKey,
        total: parseFloat(total.toFixed(2)),
        count: monthExpenses.length,
        average: parseFloat((total / monthExpenses.length).toFixed(2)),
        categories: Object.fromEntries(Object.entries(categories).map(([k, v]) => [k, parseFloat(v.toFixed(2))])),
        moneyTypes: Object.fromEntries(Object.entries(moneyTypes).map(([k, v]) => [k, parseFloat(v.toFixed(2))])),
        expenseTypes: Object.fromEntries(Object.entries(expenseTypes).map(([k, v]) => [k, parseFloat(v.toFixed(2))])),
        highest: {
            date: highest.date,
            amount: highest.amount,
            currency: highest.currency,
            category: highest.category,
            note: highest.note
        }
    };
}

// Detect recurring expenses (same amount/category within a month)
function getRecurringExpenses() {
    const patterns = {};
    
    expenses.forEach(e => {
        const key = `${e.category}-${e.amount}-${e.currency}`;
        if (!patterns[key]) patterns[key] = [];
        patterns[key].push(e);
    });
    
    return Object.entries(patterns)
        .filter(([_, items]) => items.length >= 2)
        .map(([key, items]) => ({
            category: items[0].category,
            amount: items[0].amount,
            currency: items[0].currency,
            amountUSD: convertCurrency(items[0].amount, items[0].currency, 'USD'),
            occurrences: items.length,
            dates: items.map(i => i.date),
            frequency: items.length >= 4 ? 'Weekly' : items.length >= 2 ? 'Multiple' : 'Recurring'
        }))
        .sort((a, b) => b.occurrences - a.occurrences);
}

// Analyze which days of the week you spend the most
function getDailySpendingPattern() {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyTotals = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
    const dailyCounts = { Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0 };
    
    expenses.forEach(e => {
        const dayName = daysOfWeek[new Date(e.date).getDay()];
        const usd = convertCurrency(e.amount, e.currency, 'USD');
        dailyTotals[dayName] += usd;
        dailyCounts[dayName]++;
    });
    
    return daysOfWeek.map(day => ({
        day,
        total: parseFloat(dailyTotals[day].toFixed(2)),
        count: dailyCounts[day],
        average: dailyCounts[day] > 0 ? parseFloat((dailyTotals[day] / dailyCounts[day]).toFixed(2)) : 0
    }));
}

// Predict monthly total based on current spending pattern
function predictMonthlyTotal() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
    
    if (currentMonthExpenses.length === 0) {
        return {
            predictedTotal: 0,
            currentTotal: 0,
            daysInMonth: new Date(currentMonth + '-01').getMonth() === 11 ? 31 : new Date(currentMonth + '-01').getDate(),
            daysElapsed: new Date().getDate(),
            dailyAverage: 0,
            confidence: 'Low'
        };
    }
    
    const currentTotal = currentMonthExpenses.reduce((s, e) => s + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const dailyAverage = currentTotal / new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const predictedTotal = dailyAverage * daysInMonth;
    const confidence = new Date().getDate() >= 15 ? 'High' : new Date().getDate() >= 7 ? 'Medium' : 'Low';
    
    return {
        predictedTotal: parseFloat(predictedTotal.toFixed(2)),
        currentTotal: parseFloat(currentTotal.toFixed(2)),
        daysInMonth,
        daysElapsed: new Date().getDate(),
        dailyAverage: parseFloat(dailyAverage.toFixed(2)),
        confidence,
        projectedRemaining: parseFloat((predictedTotal - currentTotal).toFixed(2))
    };
}

// Close sidebar on mobile when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.querySelector('.mobile-toggle');
    
    if (window.innerWidth <= 992) {
        if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    }
});