// --- GLOBAL VARIABLES & DATA ---
let expenses = [];
let currentEditIndex = null;
let categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Education', 'Travel', 'Others'];
let currentLanguage = localStorage.getItem('language') || 'en';
let currentTheme = localStorage.getItem('theme') || 'light';

const exchangeRates = { USD: 1, KHR: 4000 };
const categoryColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#C7CEEA', '#FF8B94', '#B4A7D6', '#95E1D3', '#F38181', '#AA96DA'];

let categoryChart, monthlyChart, moneyTypeChart, trendChart, categoryAnalyticsChart, expenseTypeChart;
let analyticsInitialized = false;

// Translations
const translations = {
    en: {
        dashboard: 'Dashboard', analyticsNav: 'Analytics', reportsNav: 'Reports', categories: 'Categories',
        welcome: 'Welcome Back! 👋', welcomeSub: "Here's your financial overview", thisMonth: 'This Month Expense',
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
        transactions: 'Transactions', highest: 'Highest Expense', reports: '📋 Detailed Reports', reportsSub: 'Advanced analytics and monthly breakdowns',
        generateReport: 'Generate Report', selectMonth: 'Select Month', chooseMonth: 'Choose Month...', generate: 'Generate',
        average: 'Average', count: 'Expense Count', categoryBreakdownReport: 'Category Breakdown', manageCategories: 'Manage Categories',
        newCategory: 'New category', add: 'Add', editExpense: 'Edit', deleteBtn: 'Delete', updateExpense: 'Update Expense',
        imported: 'Imported', expense: 'expense',
        status: 'Status (Optional)', paid: 'Paid', needRefund: 'Need Refund', pending: 'Pending',
        tableDate: 'Date', tableAmount: 'Amount', tableCategory: 'Category', tableMoneyType: 'Money Type',
        tableType: 'Type', tableDescription: 'Description', tableStatus: 'Status', tableActions: 'Actions',
        tableMonth: 'Month', tableTotal: 'Total', tableAvgDay: 'Avg/Day', tableTrans: 'Transactions', tableHighest: 'Highest'
    },
    km: {
        dashboard: 'ផ្ទាំងគ្រប់គ្រង', analyticsNav: 'វិភាគ', reportsNav: 'របាយការណ៍', categories: 'ប្រភេទ',
        welcome: 'សូមស្វាគមន៍! 👋', welcomeSub: 'នេះគឺជារបាយការណ៏សង្ខេបហិរញ្ញវត្ថុរបស់អ្នក', thisMonth: 'ការចំណាយខែនេះ',
        total: 'ការចំណាយសរុប', dailyAvg: 'ការចំណាយជាមធ្យមក្នុង១ថ្ងៃ', largest: 'ការចំណាយច្រើនបំផុត', categoryBreakdown: 'ការបែងចែកតាមប្រភេទ',
        monthlyTrend: 'ទំនោរប្រចាំខែ', addExpense: '➕ បន្ថែមការចំណាយថ្មី', date: 'កាលបរិច្ឆេទ', amount: 'ចំនួនទឹកប្រាក់',
        currency: 'រូបិយប័ណ្ណ', moneyType: 'ប្រភេទសាច់ប្រាក់', expenseType: 'ប្រភេទការចំណាយ', category: 'ប្រភេទ',
        description: 'ការពិពណ៌នា', selectType: 'ជ្រើសរើសប្រភេទ', selfMoney: 'ប្រាក់ផ្ទាល់ខ្លួន', houseMoney: 'ប្រាក់ផ្ទះ',
        cash: 'សាច់ប្រាក់', bank: 'ធនាគារ', selectCategory: 'ជ្រើសរើសប្រភេទ', addExpenseBtn: 'បន្ថែមការចំណាយ',
        recentTrans: 'ប្រតិបត្តិការថ្មីៗ', search: 'ស្វែងរក...', allTime: 'គ្រប់ពេលវេលា', actions: 'សកម្មភាព',
        noExpenses: 'មិនទាន់មានការចំណាយ។ បន្ថែមការចំណាយដំបូងរបស់អ្នក!', analytics: '📈 ការវិភាគលម្អិតនៃការចំណាយ',
        analyticsSub: 'ការវិភាគលម្អិតនៃទម្រង់ការចំណាយរបស់អ្នក', totalSpent: 'សរុបចំណាយ', median: 'មេដ្យាន',
        expenses: 'ចំនួនដងការចំណាយ', moneyTypeChart: 'ប្រភេទប្រាក់', trendChart: 'ការចំណាយក្នុងរយះពេល១២ខែ', categoryDist: 'ការចំណាយតាមប្រភេទ',
        expenseTypeChart: 'ប្រភេទការចំណាយ', monthlySummary: 'សង្ខេបប្រចាំខែ', month: 'ខែ', avgDay: 'មធ្យម/ថ្ងៃ',
        transactions: 'ប្រតិបត្តិការ', highest: 'ការចំណាយខ្ពស់បំផុត', reports: '📋 របាយការណ៍លម្អិត', reportsSub: 'ការវិភាគកម្រិតខ្ពស់ និងការបែងចែកប្រចាំខែ',
        generateReport: 'បង្កើតរបាយការណ៍', selectMonth: 'ជ្រើសរើសខែ', chooseMonth: 'ជ្រើសរើសខែ...', generate: 'បង្កើត',
        average: 'ការចំណាយជាមធ្យម', count: 'ចំនួនការចំណាយ', categoryBreakdownReport: 'ការបែងចែកតាមប្រភេទ', manageCategories: 'គ្រប់គ្រងប្រភេទ',
        newCategory: 'ប្រភេទថ្មី', add: 'បន្ថែម', editExpense: 'កែសម្រួល', deleteBtn: 'លុប', updateExpense: 'ធ្វើបច្ចុប្បន្នភាពការចំណាយ',
        imported: 'នាំចូល', expense: 'ការចំណាយ',
        status: 'ស្ថានភាព (ជម្រើស)', paid: 'បានបង់', needRefund: 'ត្រូវការទូរទាត់', pending: 'កំពុងរង់ចាំ',
        tableDate: 'កាលបរិច្ឆេទ', tableAmount: 'ចំនួនទឹកប្រាក់', tableCategory: 'ប្រភេទ', tableMoneyType: 'ប្រភេទសាច់ប្រាក់',
        tableType: 'ប្រភេទ', tableDescription: 'ការពិពណ៌នា', tableStatus: 'ស្ថានភាព', tableActions: 'សកម្មភាព',
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
    applyLanguage();
});

function setupEventListeners() {
    document.getElementById("expenseForm").addEventListener("submit", addExpense);
    document.getElementById("editExpenseForm").addEventListener("submit", updateExpense);
    document.getElementById("filterMonth").addEventListener("change", updateCharts);
    document.getElementById("filterMonth").addEventListener("change", updateExpenseTable);
    document.getElementById("searchExpenses").addEventListener("input", updateExpenseTable);
    document.getElementById("downloadCSV").addEventListener("click", downloadCSV);
    document.getElementById("downloadPDF").addEventListener("click", downloadPDF);
    document.getElementById("importData").addEventListener("click", () => document.getElementById('importFile').click());
    document.getElementById("importFile").addEventListener("change", importData);
    
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

function convertCurrency(amt, from, to) {
    if (from === to) return amt;
    const rateFrom = exchangeRates[from] || 1;
    const rateTo = exchangeRates[to] || 1;
    return (amt / rateFrom) * rateTo;
}

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
        // Status is correctly saved on initial add
        status: document.getElementById("expenseStatus").value, 
        note: document.getElementById("expenseNote").value,
        id: Date.now() + Math.random()
    };

    expenses.push(newExpense);
    saveAllData();
    
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

    const updates = {
        '#navDashboard': t.dashboard, '#navAnalytics': t.analyticsNav, '#navReports': t.reportsNav, '#navCategories': t.categories,
        '#dashboard-page .welcome-section h2': t.welcome, '#dashboard-page .welcome-section p': t.welcomeSub,
        '.stats-grid .stat-card:nth-child(1) .stat-label': t.thisMonth, '.stats-grid .stat-card:nth-child(2) .stat-label': t.total,
        '.stats-grid .stat-card:nth-child(3) .stat-label': t.dailyAvg, '.stats-grid .stat-card:nth-child(4) .stat-label': t.largest,
        '.charts-grid .chart-card:nth-child(1) h3': t.categoryBreakdown, '.charts-grid .chart-card:nth-child(2) h3': t.monthlyTrend,
        '.add-expense-section h3': t.addExpense, '.add-expense-section .btn-submit': t.addExpenseBtn,
        'label[for="expenseDate"]': t.date, 'label[for="expenseAmount"]': t.amount,
        'label[for="expenseCurrency"]': t.currency, 'label[for="expenseMoneyType"]': t.moneyType,
        'label[for="expenseType"]': t.expenseType, 'label[for="expenseCategory"]': t.category,
        'label[for="expenseNote"]': t.description, 'label[for="expenseStatus"]': t.status,
        '.table-section .table-header h3': t.recentTrans, 
        '#dashboard-page .expense-table thead th:nth-child(1)': t.tableDate, '#dashboard-page .expense-table thead th:nth-child(2)': t.tableAmount,
        '#dashboard-page .expense-table thead th:nth-child(3)': t.tableCategory, '#dashboard-page .expense-table thead th:nth-child(4)': t.tableMoneyType,
        '#dashboard-page .expense-table thead th:nth-child(5)': t.tableType, '#dashboard-page .expense-table thead th:nth-child(6)': t.tableDescription,
        '#dashboard-page .expense-table thead th:nth-child(7)': t.tableStatus, '#dashboard-page .expense-table thead th:nth-child(8)': t.tableActions,
        '#analytics-page .welcome-section h2': t.analytics, '#analytics-page .welcome-section p': t.analyticsSub,
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
        '#reports-page .welcome-section h2': t.reports, '#reports-page .welcome-section p': t.reportsSub,
        '#reports-page .table-section .table-header h3': t.generateReport, '#reports-page label': t.selectMonth,
        '#reports-page .action-btn': t.generate, '#reportStats .stat-card:nth-child(1) .stat-label': t.total,
        '#reportStats .stat-card:nth-child(2) .stat-label': t.average, '#reportStats .stat-card:nth-child(3) .stat-label': t.count,
        '#reportStats .stat-card:nth-child(4) .stat-label': t.highest, '#categoryReport h3': t.categoryBreakdownReport,
        '#categoryModal .modal-title': t.manageCategories, '#categoryModal #addCategory': t.add,
        '#editExpenseModal .modal-title': t.editExpense, '#editExpenseModal button[type="submit"]': t.updateExpense,
        'label[for="editExpenseDate"]': t.date, 'label[for="editExpenseAmount"]': t.amount,
        'label[for="editExpenseCurrency"]': t.currency, 'label[for="editExpenseCategory"]': t.category,
        'label[for="editExpenseMoneyType"]': t.moneyType, 'label[for="editExpenseType"]': t.expenseType,
        'label[for="editExpenseNote"]': t.description, 'label[for="editExpenseStatus"]': t.status
    };

    Object.entries(updates).forEach(([selector, text]) => {
        document.querySelectorAll(selector).forEach(el => {
            if (el) {
                if (el.tagName === 'INPUT' && el.type === 'text') el.placeholder = text;
                else if (el.tagName !== 'SELECT') el.textContent = text;
            }
        });
    });
    
    // Update text content for SELECT options (Money Type, Expense Type)
    const typeSelects = {
        'expenseMoneyType': { 'Cash': t.selfMoney, 'Bank': t.houseMoney, '': t.selectType },
        'editExpenseMoneyType': { 'Cash': t.selfMoney, 'Bank': t.houseMoney, '': t.selectType },
        'expenseType': { 'Cash': t.cash, 'Bank': t.bank, '': t.selectType },
        'editExpenseType': { 'Cash': t.cash, 'Bank': t.bank, '': t.selectType },
        'expenseStatus': { 'Paid': `🟢 ${t.paid}`, 'Need Refund': `🔴 ${t.needRefund}`, 'Pending': `🟡 ${t.pending}` },
        'editExpenseStatus': { 'Paid': `🟢 ${t.paid}`, 'Need Refund': `🔴 ${t.needRefund}`, 'Pending': `🟡 ${t.pending}` }
    };
    
    Object.entries(typeSelects).forEach(([id, map]) => {
        const select = document.getElementById(id);
        if (select) {
            Array.from(select.options).forEach(opt => {
                if (map[opt.value]) {
                    opt.textContent = map[opt.value];
                }
            });
        }
    });

    const categorySelects = ['expenseCategory', 'editExpenseCategory'];
    categorySelects.forEach(id => {
        const select = document.getElementById(id);
        if (select && select.options.length > 0) {
            if (select.options[0].value === '') {
                select.options[0].textContent = t.selectCategory;
            }
        }
    });

    const reportMonthSelect = document.getElementById('reportMonth');
    if (reportMonthSelect && reportMonthSelect.options.length > 0) {
        reportMonthSelect.options[0].textContent = t.chooseMonth;
    }

    const searchInput = document.getElementById('searchExpenses');
    if (searchInput) searchInput.placeholder = t.search;
    const expenseNote = document.getElementById('expenseNote');
    if (expenseNote) expenseNote.placeholder = t.description;
    const categoryInput = document.getElementById('categoryInput');
    if (categoryInput) categoryInput.placeholder = t.newCategory;

    const langIcon = document.getElementById('langIcon');
    const langIcon2 = document.getElementById('langIcon2');
    const icon = currentLanguage === 'en' ? '🇬🇧' : '🇰🇭';
    if (langIcon) langIcon.textContent = icon;
    if (langIcon2) langIcon2.textContent = icon;
    
    localStorage.setItem('language', currentLanguage);

    updateExpenseTable();
    updateMonthlySummaryTable();
    if (document.getElementById('analytics-page').classList.contains('active') || document.getElementById('dashboard-page').classList.contains('active')) {
        updateCharts();
        if (analyticsInitialized) {
            updateAnalytics();
        }
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
        tableBody.innerHTML = `<tr><td colspan="8" class="empty-state"><div class="empty-icon">💸</div><p>${t.noExpenses}</p></td></tr>`;
        return;
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    filtered.forEach((expense) => {
        const originalIndex = expenses.findIndex(e => e.id === expense.id);
        const row = document.createElement("tr");
        row.className = "expense-row";
        
        // ⭐ FIX: Calculate and use the category index for the color class
        const categoryIndex = categories.indexOf(expense.category);
        const colorClass = `cat-color-${categoryIndex % categoryColors.length}`; // Use length of categoryColors array
        
        const moneyTypeDisplay = expense.moneyType === 'Cash' ? t.selfMoney : t.houseMoney;
        const expenseTypeDisplay = expense.expenseType === 'Cash' ? t.cash : t.bank;
        
        // Status Display Logic (treat status as optional)
        let statusDisplay = '';
        let statusClass = '';
        if (expense.status === 'Paid') {
            statusDisplay = `🟢 ${t.paid}`;
            statusClass = 'status-paid';
        } else if (expense.status === 'Need Refund') {
            statusDisplay = `🔴 ${t.needRefund}`;
            statusClass = 'status-need-refund';
        } else if (expense.status === 'Pending') {
            statusDisplay = `🟡 ${t.pending}`;
            statusClass = 'status-pending';
        } else {
            statusDisplay = '-';
            statusClass = '';
        }

        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>
                <strong>${expense.amount.toLocaleString()} ${expense.currency}</strong>
                ${expense.currency !== 'USD' ? `<br><small>($${convertCurrency(expense.amount, expense.currency, 'USD').toFixed(2)})</small>` : ''}
            </td>
            <td>
                <span class="category-badge ${colorClass}">${expense.category}</span>
            </td>
            <td>${moneyTypeDisplay}</td>
            <td>${expenseTypeDisplay}</td>
            <td>${expense.note || '-'}</td>
            <td><span class="status-badge ${statusClass}">${statusDisplay}</span></td>
            <td class="no-print">
                <button class="action-btn edit-btn" onclick="openEditModal(${originalIndex})">${t.editExpense}</button>
                <button class="action-btn danger delete-btn" onclick="deleteExpense(${originalIndex})">${t.deleteBtn}</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

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
    const t = translations[currentLanguage]; 
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

    // Money Type 
    const moneyTotals = { 'Cash': 0, 'Bank': 0 };
    expenses.forEach(e => {
        moneyTotals[e.moneyType] += convertCurrency(e.amount, e.currency, 'USD');
    });
    const t = translations[currentLanguage];
    
    moneyTypeChart.data.labels = [t.selfMoney, t.houseMoney];
    moneyTypeChart.data.datasets[0].data = [moneyTotals['Cash'], moneyTotals['Bank']];
    moneyTypeChart.update();

    // Expense Type 
    const typeTotals = { 'Cash': 0, 'Bank': 0 };
    expenses.forEach(e => typeTotals[e.expenseType] = (typeTotals[e.expenseType] || 0) + convertCurrency(e.amount, e.currency, 'USD'));
    
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
    const monthlyTotalsTrend = {};
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const key = date.toISOString().slice(0,7);
        monthKeys.push(key);
        monthlyTotalsTrend[key] = 0;
    }
    expenses.forEach(e => {
        const k = e.date.slice(0,7);
        if (monthlyTotalsTrend.hasOwnProperty(k)) monthlyTotalsTrend[k] += convertCurrency(e.amount, e.currency, 'USD');
    });
    trendChart.data.labels = monthKeys.map(k => new Date(k + '-02').toLocaleDateString(currentLanguage === 'km' ? 'km-KH' : 'en-US', { month: 'short', year: '2-digit' }));
    trendChart.data.datasets[0].data = monthKeys.map(k => monthlyTotalsTrend[k] || 0);
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

function addCategoryFromModal() {
    const input = document.getElementById("categoryInput");
    const name = input.value.trim();
    
    if (name && !categories.includes(name)) {
        categories.push(name);
        saveAllData(); 
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

// Export & Import
function downloadCSV() {
    const t = translations[currentLanguage];
    let csv = `${t.tableDate},${t.tableAmount},${t.currency},${t.tableCategory},${t.tableMoneyType},${t.tableType},${t.tableDescription},${t.status}\n`;
    expenses.forEach(e => {
        // Use translated display names for Money Type, Expense Type, and Status in the CSV
        const moneyType = e.moneyType === 'Cash' ? t.selfMoney : t.houseMoney;
        const expenseType = e.expenseType === 'Cash' ? t.cash : t.bank;
        const status = e.status; // Save internal value (Paid, Pending, Need Refund)
        const note = e.note ? `"${e.note.replace(/"/g, '""')}"` : '""';
        
        csv += `${e.date},${e.amount},${e.currency},${e.category},${moneyType},${expenseType},${note},${status}\n`;
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

function downloadPDF() {
    const title = 'Expense Report - Luy Tracker';
    
    // Select the necessary dashboard content
    const statsGrid = document.getElementById('statsGrid');
    const categoryChartContainer = document.getElementById('categoryChart').closest('.chart-card');
    const monthlyChartContainer = document.getElementById('monthlyChart').closest('.chart-card');
    const recentSection = document.getElementById('recentTransactionsSection');

    const statsHtml = statsGrid ? statsGrid.outerHTML : '';
    const categoryChartHtml = categoryChartContainer ? categoryChartContainer.outerHTML : '';
    const monthlyChartHtml = monthlyChartContainer ? monthlyChartContainer.outerHTML : '';
    const recentTableHtml = recentSection ? recentSection.outerHTML : '';

    // Guard clause: if no content to print, stop.
    if (!statsHtml && !recentTableHtml) {
        console.warn('No content found for PDF export.');
        alert('Cannot generate PDF: No data visible on the dashboard.');
        return;
    }

    // 1. Create a print container with absolute positioning far outside the visible area
    const printContainer = document.createElement('div');
    printContainer.id = 'luy-print-container';
    
    // Set minimal, off-screen style to prevent flicker/glitch
    printContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    `;

    // 2. Structure the content inside the container
    // We explicitly insert the stats, then the charts, then the full transactions table.
    printContainer.innerHTML = `
        <div class="container-fluid">
            <div id="print-stats" class="stats-grid">${statsHtml}</div>
            
            <div class="charts-grid">
                ${categoryChartHtml}
                ${monthlyChartHtml}
            </div>

            <div id="print-table" class="table-section">${recentTableHtml}</div>
        </div>
    `;
    
    // 3. Append the container to the body
    document.body.appendChild(printContainer);

    // 4. Trigger print. The content is off-screen, so the user only sees the print dialog.
    // The existing print.css (linked with media=print) will apply the correct styling.
    try {
        window.print();
    } catch (e) {
        console.warn('Print failed', e);
        alert('❌ PDF generation failed. Ensure printing permissions are granted.');
    }
    
    // 5. Clean up
    // Use a short timeout to ensure the print process has started before removal.
    setTimeout(() => {
        if (printContainer.parentNode) {
            printContainer.parentNode.removeChild(printContainer);
        }
    }, 500);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const t = translations[currentLanguage]; 
    const t_en = translations['en'];
    const t_km = translations['km'];

    const reader = new FileReader();
    reader.onload = function(ev) {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);
        
        if (json.length === 0) {
            alert('⚠️ File is empty!');
            return;
        }

        // --- Step 1: Detect Column Headers ---
        const firstRow = json[0];
        const headers = Object.keys(firstRow);
        
        const findColumn = (enKey, kmKey) => {
            const lowerKmKey = kmKey ? kmKey.toLowerCase() : null;
            const lowerEnKey = enKey.toLowerCase();
            
            if (firstRow[enKey] !== undefined) return enKey;
            
            const found = headers.find(h => {
                const lowerH = String(h).trim().toLowerCase();
                
                if (lowerKmKey && lowerH === lowerKmKey) return true;
                if (lowerH.includes(lowerEnKey)) return true;
                if (lowerKmKey && lowerH.includes(lowerKmKey)) return true;

                return false;
            });
            
            return found || enKey; 
        };

        const dateCol = findColumn('Date', t_km.tableDate);
        const amountCol = findColumn('Amount', t_km.tableAmount);
        const currencyCol = findColumn('Currency', t_km.currency);
        const categoryCol = findColumn('Category', t_km.tableCategory);
        const moneyTypeCol = findColumn('Money Type', t_km.tableMoneyType);
        const expenseTypeCol = findColumn('Type', t_km.tableType);
        const descCol = findColumn('Description', t_km.tableDescription);
        const statusCol = findColumn('Status', t_km.tableStatus || 'Status'); 
        
        try {
            const mapType = (val, typeKey) => {
                const original = String(val || '').trim();
                const lower = original.toLowerCase();
                
                // If the input is empty or null, return empty string for status, or the default Cash for types
                if (!original) return (typeKey === 'status') ? '' : 'Cash'; // ⭐️ FIXED: mapType returns '' for status if input is blank

                if (typeKey === 'money') {
                    if (lower.includes(t_en.houseMoney.toLowerCase()) || original.includes(t_km.houseMoney) || lower.includes('house') || lower.includes('bank')) {
                        return 'Bank'; 
                    }
                    return 'Cash'; 
                }

                if (typeKey === 'expense') {
                    if (lower.includes(t_en.bank.toLowerCase()) || original.includes(t_km.bank) || lower.includes('bank')) {
                        return 'Bank';
                    }
                    return 'Cash'; 
                }
                
                if (typeKey === 'status') {
                    if (lower.includes('refund') || original.includes(t_km.needRefund)) return 'Need Refund';
                    if (lower.includes('pending') || original.includes(t_km.pending)) return 'Pending';
                    return 'Paid'; 
                }
                
                return ''; // Should not be reached, but safety first
            };

            // --- Step 3: Process JSON Data ---
            const newExp = json.map(row => {
                if (!row[dateCol] || typeof row[amountCol] === 'undefined' || !row[categoryCol]) {
                     console.warn('Skipping row due to missing required data:', row);
                     return null; 
                }

                // Get the raw status value, defaulting to an empty string if null/undefined
                const rawStatus = row[statusCol] ? String(row[statusCol]).trim() : ''; 
                
                return {
                    date: row[dateCol] instanceof Date 
                        ? row[dateCol].toISOString().split('T')[0] 
                        : String(row[dateCol]).split('T')[0],
                        
                    amount: parseFloat(row[amountCol]),
                    currency: row[currencyCol] || 'USD',
                    category: String(row[categoryCol]),
                    moneyType: mapType(row[moneyTypeCol], 'money'),
                    expenseType: mapType(row[expenseTypeCol], 'expense'),
                    
                    // ⭐️ FIXED: If rawStatus is empty, save as empty string. Otherwise, map the status.
                    status: rawStatus ? mapType(rawStatus, 'status') : '',
                        
                    note: String(row[descCol] || ''),
                    id: Date.now() + Math.random()
                };
            }).filter(e => e !== null && !isNaN(e.amount)); 

            // --- Step 4: Finalize Import ---
            if (newExp.length > 0) {
                expenses.push(...newExp);
                
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

// --- EXPENSE CRUD FUNCTIONS (FIXED) ---
// Located in script.js (around line 1050, depending on previous edits)
// Located in script.js (inside openEditModal function)

function openEditModal(index) {
    const expense = expenses[index];
    if (!expense) return;
    
    // Get translations
    const t = translations[currentLanguage];

    // Store the index globally for the update function
    currentEditIndex = index;
    
    // Populate the form fields in the modal
    document.getElementById("editExpenseDate").value = expense.date;
    document.getElementById("editExpenseAmount").value = expense.amount;
    document.getElementById("editExpenseCurrency").value = expense.currency;
    
    updateCategorySelects(); 
    document.getElementById("editExpenseCategory").value = expense.category;
    
    document.getElementById("editExpenseMoneyType").value = expense.moneyType;
    document.getElementById("editExpenseType").value = expense.expenseType;
    
    // ⭐️ STATUS FIX: Ensure a blank option is available and prevent 'undefined' text
    const statusSelect = document.getElementById("editExpenseStatus");
    
    // 1. Define the placeholder text, using 'Select Status' as a fallback
    const statusPlaceholder = t.selectStatus || '--';

    // 2. Reset the select content using the robust placeholder
    statusSelect.innerHTML = `
        <option value="">${statusPlaceholder}</option> 
        <option value="Paid">${t.paid}</option>
        <option value="Pending">${t.pending}</option>
        <option value="Need Refund">${t.needRefund}</option>
    `;

    // 3. Set the current status value from the expense object, defaulting to blank string
    statusSelect.value = expense.status || ''; 
    
    document.getElementById("editExpenseNote").value = expense.note;

    // Show the modal
    applyLanguage(); 
    $('#editExpenseModal').modal('show'); 
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
    
    // ⭐ STATUS FIX: Save the new status from the modal
    expense.status = document.getElementById("editExpenseStatus").value;
    
    expense.note = document.getElementById("editExpenseNote").value;

    saveAllData();
    
    // Hide the modal
    $('#editExpenseModal').modal('hide'); 
    
    currentEditIndex = null;
    updateDashboard();
    updateExpenseTable();
    updateCharts();
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