// Optimized Luy Tracker JavaScript - FIXED VERSION

let expenses = [];
let currentEditIndex = null;
let categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Travel', 'Others'];
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';

const exchangeRates = { USD: 1, KHR: 4000 };
const categoryColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#C7CEEA', '#FF8B94', '#B4A7D6', '#95E1D3', '#F38181', '#AA96DA'];

let categoryChart, monthlyChart, moneyTypeChart, trendChart, categoryAnalyticsChart, expenseTypeChart;
let analyticsInitialized = false;

// Simple translations - NOW INCLUDING NAVIGATION KEYS
const translations = {
    en: {
        // NAV BAR (New additions)
        dashboard: 'Dashboard', analyticsNav: 'Analytics', reportsNav: 'Reports', categories: 'Categories',
        // CORE TEXT
        welcome: 'Welcome Back! 👋', welcomeSub: "Here's your financial overview", thisMonth: 'This Month',
        total: 'Total', dailyAvg: 'Daily Avg', largest: 'Largest', categoryBreakdown: 'Category Breakdown',
        monthlyTrend: 'Monthly Trend', addExpense: '➕ Add New Expense', date: 'Date', amount: 'Amount',
        currency: 'Currency', moneyType: 'Money Type', expenseType: 'Expense Type', category: 'Category',
        description: 'Description', selectType: 'Select type', selfMoney: 'Self Money', houseMoney: 'House Money',
        cash: 'Cash', bank: 'Bank', selectCategory: 'Select category', addExpenseBtn: 'Add Expense',
        recentTrans: 'Recent Transactions', search: 'Search...', allTime: 'All Time', actions: 'Actions',
        noExpenses: 'No expenses yet. Add your first expense above!', analytics: '📈 Analytics & Insights',
        analyticsSub: 'Detailed analysis of your spending patterns', totalSpent: 'Total Spent', median: 'Median',
        expenses: 'Expenses', moneyTypeChart: 'Money Type', trendChart: '12-Month Trend', categoryDist: 'Category Distribution',
        expenseTypeChart: 'Expense Type', monthlySummary: 'Monthly Summary', month: 'Month', avgDay: 'Avg/Day',
        transactions: 'Transactions', highest: 'Highest', reports: '📋 Detailed Reports', reportsSub: 'Advanced analytics and monthly breakdowns',
        generateReport: 'Generate Report', selectMonth: 'Select Month', chooseMonth: 'Choose Month...', generate: 'Generate',
        average: 'Average', count: 'Count', categoryBreakdownReport: 'Category Breakdown', manageCategories: 'Manage Categories',
        newCategory: 'New category', add: 'Add', editExpense: 'Edit', deleteBtn: 'Delete', updateExpense: 'Update Expense',
        imported: 'Imported', expense: 'expense',
        // Table headers for Dashboard/Edit
        tableDate: 'Date', tableAmount: 'Amount', tableCategory: 'Category', tableMoneyType: 'Money Type',
        tableType: 'Type', tableDescription: 'Description', tableActions: 'Actions',
        // Analytics Table Headers
        tableMonth: 'Month', tableTotal: 'Total', tableAvgDay: 'Avg/Day', tableTrans: 'Transactions', tableHighest: 'Highest'
    },
    km: {
        // NAV BAR (New additions)
        dashboard: 'ផ្ទាំងគ្រប់គ្រង', analyticsNav: 'វិភាគ', reportsNav: 'របាយការណ៍', categories: 'ប្រភេទ',
        // CORE TEXT
        welcome: 'សូមស្វាគមន៍! 👋', welcomeSub: 'នេះគឺជាការសង្ខេបហិរញ្ញវត្ថុរបស់អ្នក', thisMonth: 'ខែនេះ',
        total: 'សរុប', dailyAvg: 'មធ្យមភាគក្នុងមួយថ្ងៃ', largest: 'ធំបំផុត', categoryBreakdown: 'ការបែងចែកតាមប្រភេទ',
        monthlyTrend: 'ទំនោរប្រចាំខែ', addExpense: '➕ បន្ថែមការចំណាយថ្មី', date: 'កាលបរិច្ឆេទ', amount: 'ចំនួនទឹកប្រាក់',
        currency: 'រូបិយប័ណ្ណ', moneyType: 'ប្រភេទសាច់ប្រាក់', expenseType: 'ប្រភេទការចំណាយ', category: 'ប្រភេទ',
        description: 'ការពិពណ៌នា', selectType: 'ជ្រើសរើសប្រភេទ', selfMoney: 'ប្រាក់ផ្ទាល់ខ្លួន', houseMoney: 'ប្រាក់ផ្ទះ',
        cash: 'សាច់ប្រាក់', bank: 'ធនាគារ', selectCategory: 'ជ្រើសរើសប្រភេទ', addExpenseBtn: 'បន្ថែមការចំណាយ',
        recentTrans: 'ប្រតិបត្តិការថ្មីៗ', search: 'ស្វែងរក...', allTime: 'គ្រប់ពេលវេលា', actions: 'សកម្មភាព',
        noExpenses: 'មិនទាន់មានការចំណាយ។ បន្ថែមការចំណាយដំបូងរបស់អ្នក!', analytics: '📈 ការវិភាគ និងការយល់ដឹង',
        analyticsSub: 'ការវិភាគលម្អិតនៃទម្រង់ការចំណាយរបស់អ្នក', totalSpent: 'សរុបចំណាយ', median: 'មេដ្យាន',
        expenses: 'ការចំណាយ', moneyTypeChart: 'ប្រភេទប្រាក់', trendChart: 'ទំនោរ ១២ ខែ', categoryDist: 'ការចែកចាយតាមប្រភេទ',
        expenseTypeChart: 'ប្រភេទការចំណាយ', monthlySummary: 'សង្ខេបប្រចាំខែ', month: 'ខែ', avgDay: 'មធ្យម/ថ្ងៃ',
        transactions: 'ប្រតិបត្តិការ', highest: 'ខ្ពស់បំផុត', reports: '📋 របាយការណ៍លម្អិត', reportsSub: 'ការវិភាគកម្រិតខ្ពស់ និងការបែងចែកប្រចាំខែ',
        generateReport: 'បង្កើតរបាយការណ៍', selectMonth: 'ជ្រើសរើសខែ', chooseMonth: 'ជ្រើសរើសខែ...', generate: 'បង្កើត',
        average: 'មធ្យមភាគ', count: 'ចំនួន', categoryBreakdownReport: 'ការបែងចែកតាមប្រភេទ', manageCategories: 'គ្រប់គ្រងប្រភេទ',
        newCategory: 'ប្រភេទថ្មី', add: 'បន្ថែម', editExpense: 'កែសម្រួល', deleteBtn: 'លុប', updateExpense: 'ធ្វើបច្ចុប្បន្នភាពការចំណាយ',
        imported: 'នាំចូល', expense: 'ការចំណាយ',
        // Table headers for Dashboard/Edit
        tableDate: 'កាលបរិច្ឆេទ', tableAmount: 'ចំនួនទឹកប្រាក់', tableCategory: 'ប្រភេទ', tableMoneyType: 'ប្រភេទសាច់ប្រាក់',
        tableType: 'ប្រភេទ', tableDescription: 'ការពិពណ៌នា', tableActions: 'សកម្មភាព',
        // Analytics Table Headers
        tableMonth: 'ខែ', tableTotal: 'សរុប', tableAvgDay: 'មធ្យម/ថ្ងៃ', tableTrans: 'ប្រតិបត្តិការ', tableHighest: 'ខ្ពស់បំផុត'
    }
};

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    applySavedTheme();
    applySavedLanguage();
    loadAllData();
    initializeDate();
    updateDashboard();
    initializeCharts();
    setupEventListeners();
    updateReportMonths();
    applyLanguage(); // This must be called at the end
});

function setupEventListeners() {
    // FIX: Changed "updateExpense" to "editExpense" (more descriptive)
    document.getElementById("expenseForm").addEventListener("submit", addExpense);
    document.getElementById("editExpenseForm").addEventListener("submit", updateExpense); 
    document.getElementById("filterMonth").addEventListener("change", updateCharts);
    document.getElementById("filterMonth").addEventListener("change", updateExpenseTable);
    document.getElementById("searchExpenses").addEventListener("input", updateExpenseTable);
    document.getElementById("downloadCSV").addEventListener("click", downloadCSV);
    document.getElementById("downloadPDF").addEventListener("click", downloadPDF);
    document.getElementById("importData").addEventListener("click", () => document.getElementById('importFile').click());
    document.getElementById("importFile").addEventListener("change", importData);
    
    // Category Modal Listeners
    const categoryInput = document.getElementById("categoryInput");
    const addCategoryBtn = document.getElementById("addCategory");
    if(categoryInput && addCategoryBtn) {
        addCategoryBtn.addEventListener("click", addCategoryFromModal);
        categoryInput.addEventListener("keypress", (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCategoryFromModal();
            }
        });
    }
}

function initializeDate() {
    const today = new Date().toISOString().split('T')[0];
    const expenseDate = document.getElementById("expenseDate");
    if (expenseDate) expenseDate.value = today;
}

// --- CORE APP LOGIC ---

function loadAllData() {
    const storedExpenses = localStorage.getItem("expenses");
    const storedCategories = localStorage.getItem("categories");
    
    if (storedExpenses) expenses = JSON.parse(storedExpenses);
    if (storedCategories) {
        const parsed = JSON.parse(storedCategories);
        if (parsed.length > 0) categories = parsed;
    }
    
    updateCategorySelects();
    updateExpenseTable();
    updateMonthFilter();
}

function saveAllData() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("categories", JSON.stringify(categories));
}

// FIX: This function was missing in the second half.
function convertCurrency(amt, from, to) {
    if (from === to) return amt;
    const rateFrom = exchangeRates[from] || 1;
    const rateTo = exchangeRates[to] || 1;
    // Conversion: (Amount / RateFrom) * RateTo
    return (amt / rateFrom) * rateTo; 
}

// FIX: This function was missing in the second half.
function addExpense(e) {
    e.preventDefault();
    const amountInput = document.getElementById("expenseAmount");
    const categoryInput = document.getElementById("expenseCategory");

    if (!amountInput.value || !categoryInput.value) return;

    const newExpense = {
        date: document.getElementById("expenseDate").value,
        amount: parseFloat(amountInput.value),
        currency: document.getElementById("expenseCurrency").value,
        category: categoryInput.value,
        moneyType: document.getElementById("expenseMoneyType").value,
        expenseType: document.getElementById("expenseType").value,
        note: document.getElementById("expenseNote").value,
        id: Date.now() + Math.random() // Unique ID
    };

    expenses.push(newExpense);
    saveAllData(); // FIX: Now ensures persistence
    
    document.getElementById("expenseForm").reset();
    initializeDate();
    updateDashboard();
    updateExpenseTable();
    updateMonthFilter();
    updateCharts();
}

function updateDashboard() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = expenses.filter(expense => expense.date.startsWith(currentMonth));
    const totalExpensesUSD = currentMonthExpenses.reduce((sum, expense) => sum + convertCurrency(expense.amount, expense.currency, 'USD'), 0);
    const allTimeTotalUSD = expenses.reduce((sum, expense) => sum + convertCurrency(expense.amount, expense.currency, 'USD'), 0);
    const dailyAverage = totalExpensesUSD / new Date().getDate();
    const largestExpense = Math.max(...currentMonthExpenses.map(expense => convertCurrency(expense.amount, expense.currency, 'USD')), 0);

    const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

    document.getElementById("totalExpenses").textContent = formatCurrency(totalExpensesUSD);
    document.getElementById("allTimeTotal").textContent = formatCurrency(allTimeTotalUSD);
    document.getElementById("dailyAverage").textContent = formatCurrency(dailyAverage);
    document.getElementById("largestExpense").textContent = formatCurrency(largestExpense);
}

// --- LANGUAGE AND THEME ---

function applyLanguage() {
    const t = translations[currentLanguage];
    document.body.setAttribute('data-language', currentLanguage);

    // 1. Static Text Updates
    const updates = {
        // FIX: Navigation Bar Translations (using IDs from suggested HTML update)
        '#navDashboard': t.dashboard,
        '#navAnalytics': t.analyticsNav,
        '#navReports': t.reportsNav,
        '#navCategories': t.categories,
        
        // --- Dashboard Page ---
        '#dashboard-page .welcome-section h2': t.welcome,
        '#dashboard-page .welcome-section p': t.welcomeSub,
        '.stats-grid .stat-card:nth-child(1) .stat-label': t.thisMonth,
        '.stats-grid .stat-card:nth-child(2) .stat-label': t.total,
        '.stats-grid .stat-card:nth-child(3) .stat-label': t.dailyAvg,
        '.stats-grid .stat-card:nth-child(4) .stat-label': t.largest,
        '.charts-grid .chart-card:nth-child(1) h3': t.categoryBreakdown,
        '.charts-grid .chart-card:nth-child(2) h3': t.monthlyTrend,
        '.add-expense-section h3': t.addExpense,
        '.add-expense-section .btn-submit': t.addExpenseBtn,
        '.table-section .table-header h3': t.recentTrans,

        // Form Labels
        'label[for="expenseDate"]': t.date,
        'label[for="expenseAmount"]': t.amount,
        'label[for="expenseCurrency"]': t.currency,
        'label[for="expenseMoneyType"]': t.moneyType,
        'label[for="expenseType"]': t.expenseType,
        'label[for="expenseCategory"]': t.category,
        'label[for="expenseNote"]': t.description,
        
        // Expense Table Headers (Dashboard)
        '#dashboard-page .expense-table thead th:nth-child(1)': t.tableDate,
        '#dashboard-page .expense-table thead th:nth-child(2)': t.tableAmount,
        '#dashboard-page .expense-table thead th:nth-child(3)': t.tableCategory,
        '#dashboard-page .expense-table thead th:nth-child(4)': t.tableMoneyType,
        '#dashboard-page .expense-table thead th:nth-child(5)': t.tableType,
        '#dashboard-page .expense-table thead th:nth-child(6)': t.tableDescription,
        '#dashboard-page .expense-table thead th:nth-child(7)': t.tableActions,
        
        // --- Analytics Page ---
        '#analytics-page .welcome-section h2': t.analytics,
        '#analytics-page .welcome-section p': t.analyticsSub,
        '#analytics-page .stats-grid .stat-card:nth-child(1) .stat-label': t.totalSpent,
        '#analytics-page .stats-grid .stat-card:nth-child(2) .stat-label': t.median,
        '#analytics-page .stats-grid .stat-card:nth-child(3) .stat-label': t.expenses,
        '#analytics-page .charts-grid .chart-card:nth-child(1) h3': t.moneyTypeChart,
        '#analytics-page .charts-grid .chart-card:nth-child(2) h3': t.trendChart,
        '#analytics-page .charts-grid .chart-card:nth-child(3) h3': t.categoryDist,
        '#analytics-page .charts-grid .chart-card:nth-child(4) h3': t.expenseTypeChart,
        '#analytics-page .table-section .table-header h3': t.monthlySummary,
        '#analytics-page .expense-table thead th:nth-child(1)': t.tableMonth,
        '#analytics-page .expense-table thead th:nth-child(2)': t.tableTotal,
        '#analytics-page .expense-table thead th:nth-child(3)': t.tableAvgDay,
        '#analytics-page .expense-table thead th:nth-child(4)': t.tableTrans,
        '#analytics-page .expense-table thead th:nth-child(5)': t.tableHighest,

        // --- Reports Page ---
        '#reports-page .welcome-section h2': t.reports,
        '#reports-page .welcome-section p': t.reportsSub,
        '#reports-page .table-section .table-header h3': t.generateReport,
        '#reports-page label': t.selectMonth, 
        '#reports-page .action-btn': t.generate,
        '#reportStats .stat-card:nth-child(1) .stat-label': t.total,
        '#reportStats .stat-card:nth-child(2) .stat-label': t.average,
        '#reportStats .stat-card:nth-child(3) .stat-label': t.count,
        '#reportStats .stat-card:nth-child(4) .stat-label': t.highest,
        '#categoryReport h3': t.categoryBreakdownReport,
        
        // --- Modals ---
        '#categoryModal .modal-title': t.manageCategories,
        '#categoryModal #addCategory': t.add,
        '#editExpenseModal .modal-title': t.editExpense,
        '#editExpenseModal button[type="submit"]': t.updateExpense,
        'label[for="editExpenseDate"]': t.date,
        'label[for="editExpenseAmount"]': t.amount,
        'label[for="editExpenseCurrency"]': t.currency,
        'label[for="editExpenseCategory"]': t.category,
        'label[for="editExpenseMoneyType"]': t.moneyType,
        'label[for="editExpenseType"]': t.expenseType,
        'label[for="editExpenseNote"]': t.description,
        
    };

    // Apply static text updates
    Object.entries(updates).forEach(([selector, text]) => {
        document.querySelectorAll(selector).forEach(el => { // Use querySelectorAll to catch all mobile/desktop instances
            if (el) {
                if (el.tagName === 'INPUT' && el.type === 'text') el.placeholder = text;
                else if (el.tagName !== 'SELECT') el.textContent = text;
            }
        });
    });
    
    // 2. Dynamic Update for SELECT Options
    
    // Money Type Selects
    const moneyTypeSelects = ['expenseMoneyType', 'editExpenseMoneyType'];
    moneyTypeSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            Array.from(select.options).forEach(opt => {
                if (opt.value === '') opt.textContent = t.selectType;
                else if (opt.value === 'Cash') opt.textContent = t.selfMoney;
                else if (opt.value === 'Bank') opt.textContent = t.houseMoney;
            });
        }
    });

    // Expense Type Selects
    const expenseTypeSelects = ['expenseType', 'editExpenseType'];
    expenseTypeSelects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            Array.from(select.options).forEach(opt => {
                if (opt.value === '') opt.textContent = t.selectType;
                else if (opt.value === 'Cash') opt.textContent = t.cash;
                else if (opt.value === 'Bank') opt.textContent = t.bank;
            });
        }
    });

    // Category Select (The 'Select category' option)
    const categorySelects = ['expenseCategory', 'editExpenseCategory'];
    categorySelects.forEach(id => {
        const select = document.getElementById(id);
        if (select && select.options.length > 0) {
            if (select.options[0].value === '') {
                select.options[0].textContent = t.selectCategory;
            }
        }
    });

    // Report Month Select (The 'Choose Month...' option)
    const reportMonthSelect = document.getElementById('reportMonth');
    if (reportMonthSelect && reportMonthSelect.options.length > 0) {
        reportMonthSelect.options[0].textContent = t.chooseMonth;
    }

    // Update placeholders/buttons not covered by generic loops
    const searchInput = document.getElementById('searchExpenses');
    if (searchInput) searchInput.placeholder = t.search;
    const expenseNote = document.getElementById('expenseNote');
    if (expenseNote) expenseNote.placeholder = t.description;
    const categoryInput = document.getElementById('categoryInput');
    if (categoryInput) categoryInput.placeholder = t.newCategory;

    // Update language icons
    const langIcon = document.getElementById('langIcon');
    const langIcon2 = document.getElementById('langIcon2');
    const icon = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
    if (langIcon) langIcon.textContent = icon;
    if (langIcon2) langIcon2.textContent = icon;
    
    localStorage.setItem('language', currentLanguage);

    // Refresh the table and summary to re-render dynamic content with new language
    updateExpenseTable();
    updateMonthlySummaryTable();
    // Chart labels need update only if analytic page is active
    if (document.getElementById('analytics-page').classList.contains('active') || document.getElementById('dashboard-page').classList.contains('active')) {
        updateCharts();
        updateAnalytics();
    }
}

function applySavedLanguage() {
    const saved = localStorage.getItem('language') || 'en';
    if (saved !== currentLanguage) {
        currentLanguage = saved;
    }
}

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'km' : 'en';
    document.body.setAttribute('data-language', currentLanguage);
    applyLanguage();
}

// --- TABLE & DATA RENDERING ---

function updateExpenseTable() {
    const tableBody = document.getElementById("expenseTableBody");
    const searchTerm = document.getElementById("searchExpenses").value.toLowerCase();
    const filterMonth = document.getElementById("filterMonth").value;
    const t = translations[currentLanguage];
    
    let filtered = expenses.filter(expense => {
        const matchesSearch = expense.note.toLowerCase().includes(searchTerm) || 
                             expense.category.toLowerCase().includes(searchTerm);
        const matchesMonth = !filterMonth || expense.date.startsWith(filterMonth);
        return matchesSearch && matchesMonth;
    });

    tableBody.innerHTML = "";

    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state"><div class="empty-icon">💸</div><p>${t.noExpenses}</p></td></tr>`;
        return;
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    filtered.forEach((expense) => {
        const originalIndex = expenses.findIndex(e => e.id === expense.id);
        const row = document.createElement("tr");
        row.className = "expense-row";
        
        const categoryIndex = categories.indexOf(expense.category);
        const colorClass = `cat-color-${categoryIndex % 10}`; 
        
        const moneyTypeDisplay = expense.moneyType === 'Cash' ? t.selfMoney : t.houseMoney;
        const expenseTypeDisplay = expense.expenseType === 'Cash' ? t.cash : t.bank;

        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>
                <strong>${expense.amount.toLocaleString()} ${expense.currency}</strong>
                ${expense.currency !== 'USD' ? `<br><small>($${convertCurrency(expense.amount, expense.currency, 'USD').toFixed(2)})</small>` : ''}
            </td>
            <td>
                <span class="badge ${colorClass}">${expense.category}</span>
            </td>
            <td>${moneyTypeDisplay}</td>
            <td>${expenseTypeDisplay}</td>
            <td>${expense.note || '-'}</td>
            <td class="no-print">
                <button class="action-btn edit-btn" onclick="openEditModal(${originalIndex})">${t.editExpense}</button>
                <button class="action-btn danger delete-btn" onclick="deleteExpense(${originalIndex})">${t.deleteBtn || 'Delete'}</button> 
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Analytics
function updateMonthlySummaryTable() {
    const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))].sort().reverse();
    const body = document.getElementById('monthlySummaryBody');
    const t = translations[currentLanguage]; 
    
    if (!body) return;
    
    if (!months.length) {
        body.innerHTML = `<tr><td colspan="5" class="text-center">${t.noExpenses}</td></tr>`;
        return;
    }
    
    body.innerHTML = '';
    months.forEach(month => {
        const monthExp = expenses.filter(e => e.date.startsWith(month));
        const total = monthExp.reduce((s, e) => s + convertCurrency(e.amount, e.currency, 'USD'), 0);
        const dateObj = new Date(month + '-01');
        const daysInMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate(); 
        const avgDay = total / daysInMonth;
        const highest = Math.max(...monthExp.map(e => convertCurrency(e.amount, e.currency, 'USD')), 0);
        
        const monthName = new Date(month + '-01').toLocaleDateString(currentLanguage === 'km' ? 'km-KH' : 'en-US', { year: 'numeric', month: 'long' });

        body.innerHTML += `<tr>
            <td>${monthName}</td>
            <td>$${total.toFixed(2)}</td>
            <td>$${avgDay.toFixed(2)}</td>
            <td>${monthExp.length}</td>
            <td>$${highest.toFixed(2)}</td>
        </tr>`;
    });
}

// Charts
function initializeCharts() {
    const catCtx = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(catCtx, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 } } }
            }
        }
    });

    const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Expenses',
                data: [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } },
            plugins: { legend: { display: false } }
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
    const filtered = expenses.filter(e => !filterMonth || e.date.startsWith(filterMonth));

    const totals = {};
    categories.forEach(c => totals[c] = 0);
    filtered.forEach(e => {
        const usd = convertCurrency(e.amount, e.currency, 'USD');
        totals[e.category] = (totals[e.category] || 0) + usd;
    });

    const labels = [], data = [], colors = [];
    categories.forEach(c => {
        if (totals[c] > 0) {
            labels.push(c);
            data.push(totals[c]);
            colors.push(categoryColors[categories.indexOf(c) % categoryColors.length]);
        }
    });

    categoryChart.data.labels = labels;
    categoryChart.data.datasets[0].data = data;
    categoryChart.data.datasets[0].backgroundColor = colors;
    categoryChart.update();
}

function updateMonthlyChart() {
    const monthKeys = [];
    const monthlyTotals = {};
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toISOString().slice(0, 7);
        monthKeys.push(key);
        monthlyTotals[key] = 0;
    }

    expenses.forEach(e => {
        const key = e.date.slice(0, 7);
        if (monthlyTotals.hasOwnProperty(key)) {
            monthlyTotals[key] += convertCurrency(e.amount, e.currency, 'USD');
        }
    });

    monthlyChart.data.labels = monthKeys.map(k => new Date(k + '-02').toLocaleDateString(currentLanguage === 'km' ? 'km-KH' : 'default', { month: 'short', year: '2-digit' }));
    monthlyChart.data.datasets[0].data = monthKeys.map(k => monthlyTotals[k] || 0);
    monthlyChart.update();
}

// Analytics
function initializeAnalyticsCharts() {
    const moneyCtx = document.getElementById('moneyTypeChart').getContext('2d');
    const t = translations[currentLanguage]; // Get translations here
    moneyTypeChart = new Chart(moneyCtx, {
        type: 'doughnut',
        data: { labels: [t.selfMoney, t.houseMoney], datasets: [{ data: [], backgroundColor: ['#10B981','#3B82F6'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    const trendCtx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: { labels: [], datasets: [{ label: t.expenses, data: [], borderColor: '#8B5CF6', fill: true }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    const catCtx = document.getElementById('categoryAnalyticsChart').getContext('2d');
    categoryAnalyticsChart = new Chart(catCtx, {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: categoryColors }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
    });

    const typeCtx = document.getElementById('expenseTypeChart').getContext('2d');
    expenseTypeChart = new Chart(typeCtx, {
        type: 'doughnut',
        data: { labels: [t.cash, t.bank], datasets: [{ data: [], backgroundColor: ['#F59E0B','#EC4899'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    analyticsInitialized = true;
}

function updateAnalytics() {
    const total = expenses.reduce((s, e) => s + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const amounts = expenses.map(e => convertCurrency(e.amount, e.currency, 'USD')).sort((a,b) => a-b);
    const median = amounts.length % 2 === 0
        ? amounts.length === 0 ? 0 : (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2
        : amounts.length === 0 ? 0 : amounts[Math.floor(amounts.length / 2)];

    document.getElementById('statTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('statMedian').textContent = `$${median.toFixed(2)}`;
    document.getElementById('statCount').textContent = expenses.length;

    // Money Type (needs translation for labels in the chart)
    const moneyTotals = { 'Cash': 0, 'Bank': 0 };
    expenses.forEach(e => {
        moneyTotals[e.moneyType] += convertCurrency(e.amount, e.currency, 'USD');
    });
    const t = translations[currentLanguage];
    
    // Ensure labels are set here for language changes
    moneyTypeChart.data.labels = [t.selfMoney, t.houseMoney];
    moneyTypeChart.data.datasets[0].data = [moneyTotals['Cash'], moneyTotals['Bank']];
    moneyTypeChart.update();

    // Expense Type (needs translation for labels in the chart)
    const typeTotals = { 'Cash': 0, 'Bank': 0 };
    expenses.forEach(e => typeTotals[e.expenseType] = (typeTotals[e.expenseType] || 0) + convertCurrency(e.amount, e.currency, 'USD'));
    
    // Ensure labels are set here for language changes
    expenseTypeChart.data.labels = [t.cash, t.bank];
    expenseTypeChart.data.datasets[0].data = [typeTotals['Cash'], typeTotals['Bank']];
    expenseTypeChart.update();

    // Category
    const catTotals = {};
    categories.forEach(c => catTotals[c] = 0);
    expenses.forEach(e => catTotals[e.category] = (catTotals[e.category] || 0) + convertCurrency(e.amount, e.currency, 'USD'));
    const catLabels = [], catData = [], catColors = [];
    categories.forEach((c, i) => {
        if (catTotals[c] > 0) {
            catLabels.push(c);
            catData.push(catTotals[c]);
            catColors.push(categoryColors[i % categoryColors.length]);
        }
    });
    categoryAnalyticsChart.data.labels = catLabels;
    categoryAnalyticsChart.data.datasets[0].data = catData;
    categoryAnalyticsChart.data.datasets[0].backgroundColor = catColors;
    categoryAnalyticsChart.update();

    // 12-month trend
    const monthKeys = [];
    const monthlyTotals = {};
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toISOString().slice(0,7);
        monthKeys.push(key);
        monthlyTotals[key] = 0;
    }
    expenses.forEach(e => {
        const k = e.date.slice(0,7);
        if (monthlyTotals.hasOwnProperty(k)) monthlyTotals[k] += convertCurrency(e.amount, e.currency, 'USD');
    });
    trendChart.data.labels = monthKeys.map(k => new Date(k + '-02').toLocaleDateString(currentLanguage === 'km' ? 'km-KH' : 'en-US', { month: 'short', year: '2-digit' }));
    trendChart.data.datasets[0].data = monthKeys.map(k => monthlyTotals[k] || 0);
    trendChart.update();

    updateMonthlySummaryTable();
}

// Reports
function updateReportMonths() {
    const select = document.getElementById('reportMonth');
    const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))].sort().reverse();
    const t = translations[currentLanguage];
    
    select.innerHTML = `<option value="">${t.chooseMonth}</option>`;
    months.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = new Date(m + '-01').toLocaleDateString(currentLanguage === 'km' ? 'km-KH' : 'en-US', { year: 'numeric', month: 'long' });
        select.appendChild(opt);
    });
}

function generateReport() {
    const monthKey = document.getElementById('reportMonth').value;
    if (!monthKey) return alert(translations[currentLanguage].selectMonth);
    
    const monthExp = expenses.filter(e => e.date.startsWith(monthKey));
    const total = monthExp.reduce((s, e) => s + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const avg = monthExp.length ? total / monthExp.length : 0;
    const highest = monthExp.length ? Math.max(...monthExp.map(e => convertCurrency(e.amount, e.currency, 'USD'))) : 0;
    
    document.getElementById('reportStats').style.display = 'grid';
    document.getElementById('reportTotal').textContent = `$${total.toFixed(2)}`;
    document.getElementById('reportAvg').textContent = `$${avg.toFixed(2)}`;
    document.getElementById('reportCount').textContent = monthExp.length;
    document.getElementById('reportHighest').textContent = `$${highest.toFixed(2)}`;
    
    // Category breakdown
    const catTotals = {};
    monthExp.forEach(e => catTotals[e.category] = (catTotals[e.category] || 0) + convertCurrency(e.amount, e.currency, 'USD'));
    const catBody = document.getElementById('reportCategoryBody');
    catBody.innerHTML = '';
    Object.entries(catTotals).sort((a, b) => b[1] - a[1]).forEach(([cat, amt]) => {
        const pct = ((amt / total) * 100).toFixed(1);
        catBody.innerHTML += `<tr><td>${cat}</td><td>$${amt.toFixed(2)}</td><td>${pct}%</td></tr>`;
    });
    document.getElementById('categoryReport').style.display = 'block';
}

// Category Management
function updateCategorySelects() {
    ['expenseCategory', 'editExpenseCategory'].forEach(id => {
        const select = document.getElementById(id);
        const t = translations[currentLanguage];
        select.innerHTML = `<option value="">${t.selectCategory}</option>`;
        categories.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            select.appendChild(opt);
        });
    });
}

// FIX: This function was missing in the second half.
function addCategoryFromModal() {
    const input = document.getElementById("categoryInput");
    const name = input.value.trim();
    
    if (name && !categories.includes(name)) {
        categories.push(name);
        saveAllData(); // FIX: Ensures categories persist
        updateCategoryList();
        updateCategorySelects();
        input.value = "";
    }
}

function updateCategoryList() {
    const list = document.getElementById("categoryList");
    list.innerHTML = "";
    const t = translations[currentLanguage];
    
    categories.forEach((cat, i) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        
        const badge = document.createElement('span');
        badge.className = `category-badge cat-color-${i % 10}`;
        badge.textContent = cat;

        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display:flex;gap:0.5rem';

        const up = document.createElement('button');
        up.innerHTML = '↑';
        up.className = 'btn btn-sm btn-dark';
        up.disabled = i === 0;
        up.onclick = () => moveCategory(i, -1);
        
        const down = document.createElement('button');
        down.innerHTML = '↓';
        down.className = 'btn btn-sm btn-dark';
        down.disabled = i === categories.length - 1;
        down.onclick = () => moveCategory(i, 1);
        
        const del = document.createElement("button");
        del.textContent = "✕";
        del.className = "btn btn-danger btn-sm";
        del.onclick = () => deleteCategory(i);

        btnGroup.append(up, down, del);
        li.append(badge, btnGroup);
        list.appendChild(li);
    });
}

function moveCategory(i, dir) {
    [categories[i], categories[i + dir]] = [categories[i + dir], categories[i]];
    saveAllData();
    updateCategoryList();
    updateCategorySelects();
    updateExpenseTable();
    updateCharts();
}

function deleteCategory(i) {
    const used = expenses.filter(e => e.category === categories[i]).length;
    if (used && !confirm(`Category used in ${used} expense(s). Delete?`)) return;
    
    categories.splice(i, 1);
    saveAllData();
    updateCategoryList();
    updateCategorySelects();
    updateExpenseTable();
    updateCharts();
}

// Export & Import Fixes

// FIX: CSV export function
function downloadCSV() {
    const t = translations[currentLanguage];
    let csv = `${t.tableDate},${t.tableAmount},${t.currency},${t.tableCategory},${t.tableMoneyType},${t.tableType},${t.tableDescription}\n`;
    expenses.forEach(e => {
        // Use translated display names for Money Type and Expense Type in the CSV
        const moneyType = e.moneyType === 'Cash' ? t.selfMoney : t.houseMoney;
        const expenseType = e.expenseType === 'Cash' ? t.cash : t.bank;
        const note = e.note ? `"${e.note.replace(/"/g, '""')}"` : '""';
        
        csv += `${e.date},${e.amount},${e.currency},${e.category},${moneyType},${expenseType},${note}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luy-tracker-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// FIX: PDF download function
function downloadPDF() {
    window.print();
}

// FIX: Import function
function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        const t = translations[currentLanguage];

        try {
            const newExp = json.map(row => {
                const mapType = (val) => {
                    const lower = String(val).toLowerCase().trim();
                    // Maps translated display names back to internal keys ('Cash'/'Bank')
                    if (lower.includes('bank') || lower.includes('house money') || lower.includes(t.bank.toLowerCase())) return 'Bank';
                    return 'Cash'; 
                };

                if (!row.Date || typeof row.Amount === 'undefined' || !row.Category) throw new Error('Invalid data: Missing Date, Amount, or Category');
                
                return {
                    date: row.Date instanceof Date ? row.Date.toISOString().split('T')[0] : String(row.Date).split('T')[0],
                    amount: parseFloat(row.Amount),
                    currency: row.Currency || 'USD',
                    category: String(row.Category),
                    moneyType: mapType(row['Money Type'] || 'Cash'),
                    expenseType: mapType(row['Expense Type'] || 'Cash'),
                    note: String(row.Description || ''),
                    id: Date.now() + Math.random()
                };
            }).filter(e => e !== null && !isNaN(e.amount)); // Filter out null/invalid entries

            if (newExp.length > 0) {
                expenses.push(...newExp);
                // Also update categories if new ones were imported
                const newCategories = [...new Set(newExp.map(e => e.category))];
                newCategories.forEach(c => {
                    if (!categories.includes(c)) categories.push(c);
                });
                
                saveAllData();
                updateCategorySelects();
                updateExpenseTable();
                updateDashboard();
                updateCharts();
                alert(`✅ ${t.imported} ${newExp.length} ${t.expense}(s)!`);
            } else {
                alert(`⚠️ No valid expenses found in the imported file.`);
            }
        } catch (err) {
            alert(`❌ Error processing file: ${err.message}. Ensure it is a valid CSV/Excel file.`);
            console.error(err);
        }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
}

// Utilities
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(currentLanguage === 'km' ? 'km-KH' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateMonthFilter() {
    const filter = document.getElementById('filterMonth');
    const months = [...new Set(expenses.map(e => e.date.slice(0, 7)))].sort().reverse();
    const t = translations[currentLanguage];
    
    filter.innerHTML = `<option value="">${t.allTime}</option>`;
    months.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = new Date(m + '-01').toLocaleDateString(currentLanguage === 'km' ? 'km-KH' : 'en-US', { year: 'numeric', month: 'long' });
        filter.appendChild(opt);
    });
}

function clearAllExpenses() {
    const t = translations[currentLanguage];
    if (confirm('⚠️ Delete ALL expenses?') && confirm('Confirm permanent deletion?')) {
        expenses = [];
        saveAllData();
        updateExpenseTable();
        updateDashboard();
        updateCharts();
        alert('✅ Cleared!');
    }
}

function openEditModal(i) {
    currentEditIndex = i;
    const e = expenses[i];
    document.getElementById("editExpenseDate").value = e.date;
    document.getElementById("editExpenseAmount").value = e.amount;
    document.getElementById("editExpenseCurrency").value = e.currency;
    document.getElementById("editExpenseCategory").value = e.category;
    document.getElementById("editExpenseMoneyType").value = e.moneyType;
    document.getElementById("editExpenseType").value = e.expenseType;
    document.getElementById("editExpenseNote").value = e.note;
    applyLanguage(); 
    $('#editExpenseModal').modal('show');
}

function updateExpense(e) {
    e.preventDefault();
    expenses[currentEditIndex] = {
        date: document.getElementById("editExpenseDate").value,
        amount: parseFloat(document.getElementById("editExpenseAmount").value),
        currency: document.getElementById("editExpenseCurrency").value,
        category: document.getElementById("editExpenseCategory").value,
        moneyType: document.getElementById("editExpenseMoneyType").value,
        expenseType: document.getElementById("editExpenseType").value,
        note: document.getElementById("editExpenseNote").value,
        id: expenses[currentEditIndex].id
    };
    saveAllData();
    updateExpenseTable();
    updateDashboard();
    updateCharts();
    $('#editExpenseModal').modal('hide');
}

function deleteExpense(i) {
    if (confirm('⚠️ Delete expense?')) {
        expenses.splice(i, 1);
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
// --- MISSING EXPENSE CRUD FUNCTIONS ---

function deleteExpense(index) {
    if (confirm("Are you sure you want to delete this expense?")) {
        expenses.splice(index, 1);
        saveAllData();
        updateDashboard();
        updateExpenseTable();
        updateMonthFilter();
        updateCharts();
    }
}

function openEditModal(index) {
    const expense = expenses[index];
    if (!expense) return;

    // Store the index globally for the update function
    currentEditIndex = index;
    
    // Populate the form fields in the modal
    document.getElementById("editExpenseDate").value = expense.date;
    document.getElementById("editExpenseAmount").value = expense.amount;
    document.getElementById("editExpenseCurrency").value = expense.currency;
    
    // Ensure category selects are populated before selecting the value
    updateCategorySelects(); 
    document.getElementById("editExpenseCategory").value = expense.category;
    
    document.getElementById("editExpenseMoneyType").value = expense.moneyType;
    document.getElementById("editExpenseType").value = expense.expenseType;
    document.getElementById("editExpenseNote").value = expense.note;

    // Show the modal (Requires Bootstrap or custom modal function)
    $('#editExpenseModal').modal('show'); 
    
    // If you don't use Bootstrap/jQuery, you need a custom function:
    // document.getElementById('editExpenseModal').style.display = 'block';
    // document.getElementById('editExpenseModal').classList.add('show');
}


function updateExpense(e) {
    e.preventDefault();
    if (currentEditIndex === null) return;

    const expense = expenses[currentEditIndex];
    
    expense.date = document.getElementById("editExpenseDate").value;
    expense.amount = parseFloat(document.getElementById("editExpenseAmount").value);
    expense.currency = document.getElementById("editExpenseCurrency").value;
    expense.category = document.getElementById("editExpenseCategory").value;
    expense.moneyType = document.getElementById("editExpenseMoneyType").value;
    expense.expenseType = document.getElementById("editExpenseType").value;
    expense.note = document.getElementById("editExpenseNote").value;

    saveAllData();
    
    // Hide the modal (Requires Bootstrap or custom modal function)
    $('#editExpenseModal').modal('hide'); 
    
    // If you don't use Bootstrap/jQuery, you need a custom function:
    // document.getElementById('editExpenseModal').style.display = 'none';
    // document.getElementById('editExpenseModal').classList.remove('show');
    
    currentEditIndex = null;
    updateDashboard();
    updateExpenseTable();
    updateCharts();
}

// Page Navigation
function showPage(page) {
    document.querySelectorAll('.page-content').forEach(el => el.classList.remove('active'));
    const p = document.getElementById(`${page}-page`);
    if (p) p.classList.add('active');
    
    if (page === 'analytics') {
        if (!analyticsInitialized) initializeAnalyticsCharts();
        updateAnalytics();
    }
}

// Theme
function applySavedTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') document.body.setAttribute('data-theme', 'dark');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const curr = document.body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = curr === 'dark' ? 'light' : 'dark';
    if (next === 'dark') document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
    localStorage.setItem('theme', next);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = next === 'dark' ? '☀️' : '🌙';
}

// Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('active');
}

// Close mobile menu on outside click
document.addEventListener('click', function(e) {
    const menu = document.getElementById('mobileMenu');
    const btn = document.querySelector('.mobile-menu-btn');
    if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove('active');
    }
});