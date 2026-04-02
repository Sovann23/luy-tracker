export const exchangeRates = { USD: 1, KHR: 4000 };

export const defaultCategories = [
  'Food',
  'Transport',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Education',
  'Travel',
  'Others'
];

export const categoryColors = [
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#A8E6CF', '#C7CEEA',
  '#FF8B94', '#B4A7D6', '#95E1D3', '#F38181', '#AA96DA'
];

export const translations = {
  en: {
    dashboard: 'Dashboard', analyticsNav: 'Analytics', reportsNav: 'Reports', categories: 'Categories',
    welcome: 'Welcome Back! 👋', welcomeSub: "Here\'s your financial overview", thisMonth: 'This Month Expense',
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
    total: 'ការចំណាយសរុប', dailyAvg: 'ការចំណាយជាមធ្យមក្នុង១ថ្ងៃ', largest: 'ការចំណាយច្រើនបំផុត', categoryBreakdown: 'ការចំណាយទៅតាមប្រភេទ',
    monthlyTrend: 'ទំនោរការចំណាយប្រចាំខែ', addExpense: '➕ បន្ថែមការចំណាយថ្មី', date: 'កាលបរិច្ឆេទ', amount: 'ចំនួនទឹកប្រាក់',
    currency: 'រូបិយប័ណ្ណ', moneyType: 'ប្រភេទសាច់ប្រាក់', expenseType: 'ប្រភេទការចំណាយ', category: 'ប្រភេទ',
    description: 'ការពិពណ៌នា', selectType: 'ជ្រើសរើសប្រភេទ', selfMoney: 'ប្រាក់ផ្ទាល់ខ្លួន', houseMoney: 'ប្រាក់ផ្ទះ',
    cash: 'សាច់ប្រាក់', bank: 'ធនាគារ', selectCategory: 'ជ្រើសរើសប្រភេទ', addExpenseBtn: 'បន្ថែមការចំណាយ',
    recentTrans: 'ប្រតិបត្តិការថ្មីៗ', search: 'ស្វែងរក...', allTime: 'គ្រប់ពេលវេលា', actions: 'សកម្មភាព',
    noExpenses: 'មិនទាន់មានការចំណាយ។ បន្ថែមការចំណាយដំបូងរបស់អ្នក!', analytics: '📈 ការវិភាគលម្អិតនៃការចំណាយ',
    analyticsSub: 'ការវិភាគលម្អិតនៃទម្រង់ការចំណាយរបស់អ្នក', totalSpent: 'សរុបចំណាយ', median: 'មេដ្យាន',
    expenses: 'ចំនួនដងនៃការចំណាយ', moneyTypeChart: 'ប្រភេទប្រាក់', trendChart: 'ការចំណាយក្នុងរយះពេល១២ខែ', categoryDist: 'ការចំណាយតាមប្រភេទ',
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
