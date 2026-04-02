import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Chart } from 'chart.js/auto';
import * as XLSX from 'xlsx';
import { categoryColors, defaultCategories, translations } from './lib/constants';
import {
  convertCurrency,
  formatDate,
  formatMonth,
  getMonthKeys,
  getStatusClass,
  getStatusLabel
} from './lib/utils';

const today = new Date().toISOString().split('T')[0];

const defaultForm = {
  date: today,
  amount: '',
  currency: 'USD',
  category: '',
  moneyType: '',
  expenseType: '',
  status: '',
  note: ''
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function Icon({ name, className = '' }) {
  return <i className={`bi bi-${name} ${className}`.trim()} aria-hidden="true" />;
}

function getExpenseMonthKey(expenseDate) {
  if (!expenseDate) return '';
  const raw = String(expenseDate);
  if (/^\d{4}-\d{2}/.test(raw)) return raw.slice(0, 7);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 7);
}

export default function App() {
  const [expenses, setExpenses] = useState(() => loadJSON('expenses', []));
  const [categories, setCategories] = useState(() => {
    const saved = loadJSON('categories', defaultCategories);
    return Array.isArray(saved) && saved.length ? saved : defaultCategories;
  });
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [filterMonth, setFilterMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState(defaultForm);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm);

  const [reportScope, setReportScope] = useState('month');
  const [reportMonth, setReportMonth] = useState('');
  const [reportData, setReportData] = useState(null);
  const [printOverrideRows, setPrintOverrideRows] = useState(null);

  const importRef = useRef(null);
  const categoryChartRef = useRef(null);
  const monthlyChartRef = useRef(null);
  const moneyTypeChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const categoryAnalyticsChartRef = useRef(null);
  const expenseTypeChartRef = useRef(null);
  const reportCategoryChartRef = useRef(null);
  const reportStatusChartRef = useRef(null);
  const reportMoneyTypeChartRef = useRef(null);

  const categoryChartInst = useRef(null);
  const monthlyChartInst = useRef(null);
  const moneyTypeChartInst = useRef(null);
  const trendChartInst = useRef(null);
  const categoryAnalyticsChartInst = useRef(null);
  const expenseTypeChartInst = useRef(null);
  const reportCategoryChartInst = useRef(null);
  const reportStatusChartInst = useRef(null);
  const reportMoneyTypeChartInst = useRef(null);

  const t = translations[language] || translations.en;

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.body.setAttribute('data-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') document.body.setAttribute('data-theme', 'dark');
    else document.body.removeAttribute('data-theme');
  }, [theme]);

  useEffect(() => {
    function onClickOutside() {
      setMobileMenuOpen(false);
    }
    if (mobileMenuOpen) {
      document.addEventListener('click', onClickOutside);
    }
    return () => document.removeEventListener('click', onClickOutside);
  }, [mobileMenuOpen]);

  const monthOptions = useMemo(() => {
    return [...new Set(expenses.map((e) => getExpenseMonthKey(e.date)).filter(Boolean))]
      .sort()
      .reverse();
  }, [expenses]);

  const dashboardFilteredExpenses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return expenses
      .filter((e) => {
        const searchMatch =
          !search ||
          (e.note || '').toLowerCase().includes(search) ||
          (e.category || '').toLowerCase().includes(search);
        const monthMatch = !filterMonth || e.date.startsWith(filterMonth);
        return searchMatch && monthMatch;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [expenses, filterMonth, searchTerm]);

  const normalizedPrintRows = useMemo(() => {
    if (!printOverrideRows) return null;
    if (reportScope === 'month' && reportMonth) {
      return printOverrideRows.filter((e) => getExpenseMonthKey(e.date) === reportMonth);
    }
    return printOverrideRows;
  }, [printOverrideRows, reportMonth, reportScope]);

  const dashboardStats = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
    const totalMonth = monthExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const totalAll = expenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const dailyAvg = totalMonth / new Date().getDate();
    const largest = Math.max(0, ...monthExpenses.map((e) => convertCurrency(e.amount, e.currency, 'USD')));
    return { totalMonth, totalAll, dailyAvg, largest };
  }, [expenses]);

  const displayDashboardStats = useMemo(() => {
    if (!normalizedPrintRows) return dashboardStats;

    const total = normalizedPrintRows.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const largest = Math.max(0, ...normalizedPrintRows.map((e) => convertCurrency(e.amount, e.currency, 'USD')));

    let divisor = 1;
    if (reportScope === 'month' && reportMonth) {
      const year = Number(reportMonth.slice(0, 4));
      const month = Number(reportMonth.slice(5, 7));
      divisor = new Date(year, month, 0).getDate();
    } else {
      const uniqueDays = new Set(normalizedPrintRows.map((e) => e.date)).size;
      divisor = Math.max(1, uniqueDays);
    }

    return {
      totalMonth: total,
      totalAll: total,
      dailyAvg: total / divisor,
      largest
    };
  }, [dashboardStats, normalizedPrintRows, reportMonth, reportScope]);

  const analyticsStats = useMemo(() => {
    const amounts = expenses.map((e) => convertCurrency(e.amount, e.currency, 'USD')).sort((a, b) => a - b);
    const total = amounts.reduce((sum, n) => sum + n, 0);
    const median = amounts.length
      ? amounts.length % 2
        ? amounts[Math.floor(amounts.length / 2)]
        : (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2
      : 0;
    return { total, median, count: expenses.length };
  }, [expenses]);

  const monthlySummary = useMemo(() => {
    return monthOptions.map((month) => {
      const monthExpenses = expenses.filter((e) => e.date.startsWith(month));
      const total = monthExpenses.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'USD'), 0);
      const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
      const avgDay = total / daysInMonth;
      const highest = Math.max(0, ...monthExpenses.map((e) => convertCurrency(e.amount, e.currency, 'USD')));
      return { month, total, avgDay, count: monthExpenses.length, highest };
    });
  }, [expenses, monthOptions]);

  useEffect(() => {
    if (!categoryChartRef.current || !monthlyChartRef.current) return;

    if (!categoryChartInst.current) {
      categoryChartInst.current = new Chart(categoryChartRef.current, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, spacing: 0, hoverOffset: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    if (!monthlyChartInst.current) {
      monthlyChartInst.current = new Chart(monthlyChartRef.current, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Expenses',
            data: [],
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
      });
    }

    const source = normalizedPrintRows || expenses.filter((e) => !filterMonth || e.date.startsWith(filterMonth));
    const totals = {};
    categories.forEach((c) => {
      totals[c] = 0;
    });

    source.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + convertCurrency(e.amount, e.currency, 'USD');
    });

    const labels = [];
    const values = [];
    const colors = [];
    categories.forEach((c, idx) => {
      if (totals[c] > 0) {
        labels.push(c);
        values.push(totals[c]);
        colors.push(categoryColors[idx % categoryColors.length]);
      }
    });

    categoryChartInst.current.data.labels = labels;
    categoryChartInst.current.data.datasets[0].data = values;
    categoryChartInst.current.data.datasets[0].backgroundColor = colors;
    categoryChartInst.current.update();

    const lastSeven = getMonthKeys(7);
    const monthlyTotals = Object.fromEntries(lastSeven.map((m) => [m, 0]));
    expenses.forEach((e) => {
      const key = e.date.slice(0, 7);
      if (monthlyTotals[key] !== undefined) {
        monthlyTotals[key] += convertCurrency(e.amount, e.currency, 'USD');
      }
    });

    monthlyChartInst.current.data.labels = lastSeven.map((m) =>
      new Date(`${m}-02`).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', { month: 'short', year: '2-digit' })
    );
    monthlyChartInst.current.data.datasets[0].data = lastSeven.map((m) => monthlyTotals[m] || 0);
    monthlyChartInst.current.update();
  }, [categories, expenses, filterMonth, language, normalizedPrintRows]);

  useEffect(() => {
    if (activePage !== 'analytics') return;
    if (!moneyTypeChartRef.current || !trendChartRef.current || !categoryAnalyticsChartRef.current || !expenseTypeChartRef.current) return;

    if (!moneyTypeChartInst.current) {
      moneyTypeChartInst.current = new Chart(moneyTypeChartRef.current, {
        type: 'doughnut',
        data: { labels: [t.selfMoney, t.houseMoney], datasets: [{ data: [], backgroundColor: ['#10B981', '#3B82F6'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    if (!trendChartInst.current) {
      trendChartInst.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#8B5CF6', fill: true, backgroundColor: 'rgba(139, 92, 246, 0.15)' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    if (!categoryAnalyticsChartInst.current) {
      categoryAnalyticsChartInst.current = new Chart(categoryAnalyticsChartRef.current, {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: categoryColors }] },
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }
      });
    }

    if (!expenseTypeChartInst.current) {
      expenseTypeChartInst.current = new Chart(expenseTypeChartRef.current, {
        type: 'doughnut',
        data: { labels: [t.cash, t.bank], datasets: [{ data: [], backgroundColor: ['#F59E0B', '#EC4899'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    const moneyTotals = { Cash: 0, Bank: 0 };
    const typeTotals = { Cash: 0, Bank: 0 };
    const catTotals = {};
    categories.forEach((c) => {
      catTotals[c] = 0;
    });

    expenses.forEach((e) => {
      const usd = convertCurrency(e.amount, e.currency, 'USD');
      moneyTotals[e.moneyType] = (moneyTotals[e.moneyType] || 0) + usd;
      typeTotals[e.expenseType] = (typeTotals[e.expenseType] || 0) + usd;
      catTotals[e.category] = (catTotals[e.category] || 0) + usd;
    });

    moneyTypeChartInst.current.data.labels = [t.selfMoney, t.houseMoney];
    moneyTypeChartInst.current.data.datasets[0].data = [moneyTotals.Cash || 0, moneyTotals.Bank || 0];
    moneyTypeChartInst.current.update();

    expenseTypeChartInst.current.data.labels = [t.cash, t.bank];
    expenseTypeChartInst.current.data.datasets[0].data = [typeTotals.Cash || 0, typeTotals.Bank || 0];
    expenseTypeChartInst.current.update();

    const catLabels = [];
    const catData = [];
    const catColors = [];
    categories.forEach((c, i) => {
      if (catTotals[c] > 0) {
        catLabels.push(c);
        catData.push(catTotals[c]);
        catColors.push(categoryColors[i % categoryColors.length]);
      }
    });

    categoryAnalyticsChartInst.current.data.labels = catLabels;
    categoryAnalyticsChartInst.current.data.datasets[0].data = catData;
    categoryAnalyticsChartInst.current.data.datasets[0].backgroundColor = catColors;
    categoryAnalyticsChartInst.current.update();

    const trendMonths = getMonthKeys(12);
    const trendTotals = Object.fromEntries(trendMonths.map((m) => [m, 0]));
    expenses.forEach((e) => {
      const k = e.date.slice(0, 7);
      if (trendTotals[k] !== undefined) trendTotals[k] += convertCurrency(e.amount, e.currency, 'USD');
    });

    trendChartInst.current.data.labels = trendMonths.map((m) =>
      new Date(`${m}-02`).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', { month: 'short', year: '2-digit' })
    );
    trendChartInst.current.data.datasets[0].data = trendMonths.map((m) => trendTotals[m] || 0);
    trendChartInst.current.update();
  }, [activePage, categories, expenses, language, t.bank, t.cash, t.houseMoney, t.selfMoney]);

  useEffect(() => {
    if (activePage !== 'reports' || !reportData) return;
    if (!reportCategoryChartRef.current || !reportStatusChartRef.current || !reportMoneyTypeChartRef.current) return;

    if (!reportCategoryChartInst.current) {
      reportCategoryChartInst.current = new Chart(reportCategoryChartRef.current, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], backgroundColor: [] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    if (!reportStatusChartInst.current) {
      reportStatusChartInst.current = new Chart(reportStatusChartRef.current, {
        type: 'bar',
        data: { labels: [], datasets: [{ data: [], backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#94A3B8'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }

    if (!reportMoneyTypeChartInst.current) {
      reportMoneyTypeChartInst.current = new Chart(reportMoneyTypeChartRef.current, {
        type: 'pie',
        data: { labels: [t.selfMoney, t.houseMoney], datasets: [{ data: [], backgroundColor: ['#3B82F6', '#10B981'] }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
    }

    reportCategoryChartInst.current.data.labels = reportData.categories.map((c) => c.category);
    reportCategoryChartInst.current.data.datasets[0].data = reportData.categories.map((c) => c.amount);
    reportCategoryChartInst.current.data.datasets[0].backgroundColor = reportData.categories.map(
      (_, i) => categoryColors[i % categoryColors.length]
    );
    reportCategoryChartInst.current.update();

    reportStatusChartInst.current.data.labels = [t.paid, t.pending, t.needRefund, 'Unknown'];
    reportStatusChartInst.current.data.datasets[0].data = [
      reportData.statusTotals.Paid || 0,
      reportData.statusTotals.Pending || 0,
      reportData.statusTotals['Need Refund'] || 0,
      reportData.statusTotals.Unknown || 0
    ];
    reportStatusChartInst.current.update();

    reportMoneyTypeChartInst.current.data.labels = [t.selfMoney, t.houseMoney];
    reportMoneyTypeChartInst.current.data.datasets[0].data = [
      reportData.moneyTypeTotals.Cash || 0,
      reportData.moneyTypeTotals.Bank || 0
    ];
    reportMoneyTypeChartInst.current.update();
  }, [activePage, reportData, t.houseMoney, t.needRefund, t.paid, t.pending, t.selfMoney]);

  useEffect(() => {
    return () => {
      [
        categoryChartInst,
        monthlyChartInst,
        moneyTypeChartInst,
        trendChartInst,
        categoryAnalyticsChartInst,
        expenseTypeChartInst,
        reportCategoryChartInst,
        reportStatusChartInst,
        reportMoneyTypeChartInst
      ].forEach((ref) => {
        if (ref.current) {
          ref.current.destroy();
          ref.current = null;
        }
      });
    };
  }, []);

  function addExpense(e) {
    e.preventDefault();
    if (!form.amount || !form.category) return;

    const newExpense = {
      ...form,
      amount: Number.parseFloat(form.amount),
      id: Date.now() + Math.random()
    };

    setExpenses((prev) => [...prev, newExpense]);
    setForm({ ...defaultForm, date: new Date().toISOString().split('T')[0] });
  }

  function openEdit(expense) {
    setEditingId(expense.id);
    setEditForm({
      date: expense.date,
      amount: expense.amount,
      currency: expense.currency,
      category: expense.category,
      moneyType: expense.moneyType,
      expenseType: expense.expenseType,
      status: expense.status || '',
      note: expense.note || ''
    });
    setShowEditModal(true);
  }

  function updateExpense(e) {
    e.preventDefault();
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === editingId
          ? { ...item, ...editForm, amount: Number.parseFloat(editForm.amount) }
          : item
      )
    );
    setShowEditModal(false);
    setEditingId(null);
  }

  function deleteExpense(id) {
    if (!window.confirm('⚠️ Delete expense?')) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  function clearAllExpenses() {
    if (!window.confirm('⚠️ Delete ALL expenses?') || !window.confirm('Confirm permanent deletion?')) return;
    setExpenses([]);
  }

  function addCategory() {
    const name = newCategory.trim();
    if (!name || categories.includes(name)) return;
    setCategories((prev) => [...prev, name]);
    setNewCategory('');
  }

  function moveCategory(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= categories.length) return;
    const next = [...categories];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setCategories(next);
  }

  function removeCategory(index) {
    const category = categories[index];
    const used = expenses.filter((e) => e.category === category).length;
    if (used && !window.confirm(`Category used in ${used} expense(s). Delete?`)) return;
    setCategories((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

  function toggleLanguage() {
    setLanguage((prev) => (prev === 'en' ? 'km' : 'en'));
  }

  function downloadCSV() {
    let csv = `${t.tableDate},${t.tableAmount},${t.currency},${t.tableCategory},${t.tableMoneyType},${t.tableType},${t.tableDescription},${t.status}\n`;
    expenses.forEach((e) => {
      const moneyType = e.moneyType === 'Cash' ? t.selfMoney : t.houseMoney;
      const expenseType = e.expenseType === 'Cash' ? t.cash : t.bank;
      const note = e.note ? `"${String(e.note).replace(/"/g, '""')}"` : '""';
      csv += `${e.date},${e.amount},${e.currency},${e.category},${moneyType},${expenseType},${note},${e.status || ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `luy-tracker-expenses-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPDF() {
    if (reportScope === 'month' && !reportMonth) {
      window.alert(t.selectMonth);
      return;
    }
    const rowsToPrint = getReportRows();

    if (!rowsToPrint.length) {
      window.alert(t.noExpenses);
      return;
    }

    flushSync(() => {
      setPrintOverrideRows(rowsToPrint);
    });
    document.body.classList.add('print-prep');

    try {
      if (categoryChartInst.current) {
        categoryChartInst.current.options.animation = false;
        categoryChartInst.current.options.elements = {
          ...(categoryChartInst.current.options.elements || {}),
          arc: {
            ...((categoryChartInst.current.options.elements && categoryChartInst.current.options.elements.arc) || {}),
            borderWidth: 0,
            borderAlign: 'inner'
          }
        };
        categoryChartInst.current.resize();
        categoryChartInst.current.update('none');
      }
      if (monthlyChartInst.current) {
        monthlyChartInst.current.options.animation = false;
        monthlyChartInst.current.resize();
        monthlyChartInst.current.update('none');
      }
    } catch (error) {
      console.error('Chart prep failed before print', error);
    }

    const cleanup = () => {
      setPrintOverrideRows(null);
      document.body.classList.remove('print-prep');
    };
    // Keep selected print rows stable during preview. Some browsers fire
    // afterprint too early, which can reset data before preview snapshot.
    setTimeout(cleanup, 60000);
    window.print();
  }

  function getReportRows() {
    if (reportScope === 'all') {
      return [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    if (!reportMonth) return [];
    return expenses
      .filter((e) => getExpenseMonthKey(e.date) === reportMonth)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function onImportClick() {
    importRef.current?.click();
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws);

        if (!json.length) {
          window.alert('⚠️ File is empty!');
          return;
        }

        const headers = Object.keys(json[0]);
        const findColumn = (enKey, kmKey) => {
          const found = headers.find((h) => {
            const value = String(h).trim().toLowerCase();
            return value === enKey.toLowerCase() || (kmKey && value === String(kmKey).toLowerCase()) || value.includes(enKey.toLowerCase());
          });
          return found || enKey;
        };

        const dateCol = findColumn('Date', translations.km.tableDate);
        const amountCol = findColumn('Amount', translations.km.tableAmount);
        const currencyCol = findColumn('Currency', translations.km.currency);
        const categoryCol = findColumn('Category', translations.km.tableCategory);
        const moneyTypeCol = findColumn('Money Type', translations.km.tableMoneyType);
        const expenseTypeCol = findColumn('Type', translations.km.tableType);
        const descCol = findColumn('Description', translations.km.tableDescription);
        const statusCol = findColumn('Status', translations.km.tableStatus);

        const mapType = (value, type) => {
          const raw = String(value || '').trim();
          const lower = raw.toLowerCase();
          if (!raw) return type === 'status' ? '' : 'Cash';
          if (type === 'money') return lower.includes('bank') || lower.includes('house') ? 'Bank' : 'Cash';
          if (type === 'expense') return lower.includes('bank') ? 'Bank' : 'Cash';
          if (lower.includes('refund')) return 'Need Refund';
          if (lower.includes('pending')) return 'Pending';
          return 'Paid';
        };

        const imported = json
          .map((row) => {
            if (!row[dateCol] || row[amountCol] === undefined || !row[categoryCol]) return null;
            const rawStatus = row[statusCol] ? String(row[statusCol]).trim() : '';
            return {
              date: row[dateCol] instanceof Date ? row[dateCol].toISOString().split('T')[0] : String(row[dateCol]).split('T')[0],
              amount: Number.parseFloat(row[amountCol]),
              currency: row[currencyCol] || 'USD',
              category: String(row[categoryCol]),
              moneyType: mapType(row[moneyTypeCol], 'money'),
              expenseType: mapType(row[expenseTypeCol], 'expense'),
              status: rawStatus ? mapType(rawStatus, 'status') : '',
              note: String(row[descCol] || ''),
              id: Date.now() + Math.random()
            };
          })
          .filter((item) => item && !Number.isNaN(item.amount));

        if (!imported.length) {
          window.alert('⚠️ No valid expenses found in the imported file.');
          return;
        }

        setExpenses((prev) => [...prev, ...imported]);
        setCategories((prev) => {
          const next = [...prev];
          imported.forEach((item) => {
            if (!next.includes(item.category)) next.push(item.category);
          });
          return next;
        });

        window.alert(`✅ ${t.imported} ${imported.length} ${t.expense}(s)!`);
      } catch (error) {
        window.alert(`❌ Error processing file: ${error.message}`);
      }
    };

    reader.readAsArrayBuffer(file);
    event.target.value = '';
  }

  function generateReport() {
    if (reportScope === 'month' && !reportMonth) {
      window.alert(t.selectMonth);
      return;
    }
    const reportRows = getReportRows();
    if (!reportRows.length) {
      window.alert(t.noExpenses);
      return;
    }

    const total = reportRows.reduce((sum, e) => sum + convertCurrency(e.amount, e.currency, 'USD'), 0);
    const avg = reportRows.length ? total / reportRows.length : 0;
    const highest = reportRows.length
      ? Math.max(...reportRows.map((e) => convertCurrency(e.amount, e.currency, 'USD')))
      : 0;

    const catTotals = {};
    const statusTotals = { Paid: 0, Pending: 0, 'Need Refund': 0, Unknown: 0 };
    const moneyTypeTotals = { Cash: 0, Bank: 0 };

    reportRows.forEach((e) => {
      const usd = convertCurrency(e.amount, e.currency, 'USD');
      moneyTypeTotals[e.moneyType] = (moneyTypeTotals[e.moneyType] || 0) + usd;
      catTotals[e.category] = (catTotals[e.category] || 0) + convertCurrency(e.amount, e.currency, 'USD');
      if (!e.status) statusTotals.Unknown += usd;
      else statusTotals[e.status] = (statusTotals[e.status] || 0) + usd;
    });

    setReportData({
      total,
      avg,
      count: reportRows.length,
      highest,
      rows: reportRows,
      categories: Object.entries(catTotals)
        .sort((a, b) => b[1] - a[1])
        .map(([category, amount]) => ({
          category,
          amount,
          pct: total ? (amount / total) * 100 : 0
        })),
      statusTotals,
      moneyTypeTotals
    });
  }

  return (
    <>
      <nav className="top-navbar">
        <div className="container-fluid">
          <div className="navbar-content">
            <div className="brand">
              <h1><Icon name="wallet2" className="mr-2 icon-orange" />Luy Tracker</h1>
              <p>Smart Money Management</p>
            </div>
            <div className="nav-actions">
              <button className="nav-btn" onClick={() => setActivePage('dashboard')}><Icon name="grid-1x2-fill" className="icon-blue" /><span>{t.dashboard}</span></button>
              <button className="nav-btn" onClick={() => setActivePage('analytics')}><Icon name="bar-chart-line-fill" className="icon-teal" /><span>{t.analyticsNav}</span></button>
              <button className="nav-btn" onClick={() => setActivePage('reports')}><Icon name="file-earmark-text-fill" className="icon-purple" /><span>{t.reportsNav}</span></button>
              <button className="nav-btn" onClick={() => setShowCategoryModal(true)}><Icon name="folder-fill" className="icon-orange" /><span>{t.categories}</span></button>
              <button className="nav-btn" onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun-fill' : 'moon-stars-fill'} className="icon-pink" /></button>
              <button className="nav-btn" onClick={toggleLanguage}>
                <span>{language === 'en' ? '🇬🇧' : '🇰🇭'}</span>
              </button>
            </div>
            <button className="mobile-menu-btn" onClick={(e) => { e.stopPropagation(); setMobileMenuOpen((v) => !v); }}>☰</button>
          </div>
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <button className="mobile-nav-btn" onClick={() => { setActivePage('dashboard'); setMobileMenuOpen(false); }}><Icon name="grid-1x2-fill" className="mr-2 icon-blue" />{t.dashboard}</button>
        <button className="mobile-nav-btn" onClick={() => { setActivePage('analytics'); setMobileMenuOpen(false); }}><Icon name="bar-chart-line-fill" className="mr-2 icon-teal" />{t.analyticsNav}</button>
        <button className="mobile-nav-btn" onClick={() => { setActivePage('reports'); setMobileMenuOpen(false); }}><Icon name="file-earmark-text-fill" className="mr-2 icon-purple" />{t.reportsNav}</button>
        <button className="mobile-nav-btn" onClick={() => { setShowCategoryModal(true); setMobileMenuOpen(false); }}><Icon name="folder-fill" className="mr-2 icon-orange" />{t.categories}</button>
        <button className="mobile-nav-btn" onClick={toggleTheme}><Icon name={theme === 'dark' ? 'sun-fill' : 'moon-stars-fill'} className="mr-2 icon-pink" />Theme</button>
        <button className="mobile-nav-btn" onClick={toggleLanguage}>
          <span className="mr-2">{language === 'en' ? '🇬🇧' : '🇰🇭'}</span>
          Language
        </button>
      </div>

      <div className="main-container">
        <div id="dashboard-page" className={`page-content ${activePage === 'dashboard' ? 'active' : ''}`}>
          <div className="container-fluid">
            <div className="welcome-section">
              <h2>{t.welcome}</h2>
              <p>{t.welcomeSub}</p>
            </div>

            <div className="stats-grid" id="statsGrid">
              <div className="stat-card gradient-blue"><div className="stat-icon"><Icon name="calendar2-check-fill" className="icon-blue" /></div><div className="stat-info"><div className="stat-label">{t.thisMonth}</div><div className="stat-value">${displayDashboardStats.totalMonth.toFixed(2)}</div></div></div>
              <div className="stat-card gradient-green"><div className="stat-icon"><Icon name="cash-stack" className="icon-green" /></div><div className="stat-info"><div className="stat-label">{t.total}</div><div className="stat-value">${displayDashboardStats.totalAll.toFixed(2)}</div></div></div>
              <div className="stat-card gradient-purple"><div className="stat-icon"><Icon name="calendar-week-fill" className="icon-purple" /></div><div className="stat-info"><div className="stat-label">{t.dailyAvg}</div><div className="stat-value">${displayDashboardStats.dailyAvg.toFixed(2)}</div></div></div>
              <div className="stat-card gradient-orange"><div className="stat-icon"><Icon name="trophy-fill" className="icon-orange" /></div><div className="stat-info"><div className="stat-label">{t.largest}</div><div className="stat-value">${displayDashboardStats.largest.toFixed(2)}</div></div></div>
            </div>

            <div className="charts-grid">
              <div className="chart-card"><div className="chart-header"><h3>{t.categoryBreakdown}</h3></div><div className="chart-body"><canvas ref={categoryChartRef} /></div></div>
              <div className="chart-card"><div className="chart-header"><h3>{t.monthlyTrend}</h3></div><div className="chart-body"><canvas ref={monthlyChartRef} /></div></div>
            </div>

            <div className="add-expense-section">
              <div className="section-header"><h3>{t.addExpense}</h3></div>
              <form onSubmit={addExpense}>
                <div className="form-grid">
                  <div className="form-group"><label>{t.date}</label><input className="form-input" type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} required /></div>
                  <div className="form-group"><label>{t.amount}</label><input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required /></div>
                  <div className="form-group"><label>{t.currency}</label><select className="form-input" value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}><option value="USD">USD ($)</option><option value="KHR">Riel (៛)</option></select></div>
                  <div className="form-group"><label>{t.moneyType}</label><select className="form-input" value={form.moneyType} onChange={(e) => setForm((p) => ({ ...p, moneyType: e.target.value }))} required><option value="">{t.selectType}</option><option value="Cash">{t.selfMoney}</option><option value="Bank">{t.houseMoney}</option></select></div>
                  <div className="form-group"><label>{t.expenseType}</label><select className="form-input" value={form.expenseType} onChange={(e) => setForm((p) => ({ ...p, expenseType: e.target.value }))} required><option value="">{t.selectType}</option><option value="Cash">{t.cash}</option><option value="Bank">{t.bank}</option></select></div>
                  <div className="form-group"><label>{t.category}</label><select className="form-input" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required><option value="">{t.selectCategory}</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                </div>
                <div className="form-group"><label>{t.status}</label><select className="form-input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}><option value="">--</option><option value="Paid">{t.paid}</option><option value="Pending">{t.pending}</option><option value="Need Refund">{t.needRefund}</option></select></div>
                <div className="form-group"><label>{t.description}</label><textarea className="form-input" rows="3" value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} placeholder={t.description} /></div>
                <button type="submit" className="btn-submit">{t.addExpenseBtn}</button>
              </form>
            </div>

            <div className="table-section" id="recentTransactionsSection">
              <div className="table-header">
                <h3>{t.recentTrans}</h3>
                <div className="table-filters">
                  <input className="filter-input" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.search} />
                  <select className="filter-input" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                    <option value="">{t.allTime}</option>
                    {monthOptions.map((m) => <option key={m} value={m}>{formatMonth(m, language)}</option>)}
                  </select>
                </div>
              </div>
              <div className="table-responsive">
                <table className="expense-table dashboard-table">
                  <thead>
                    <tr>
                      <th>{t.tableDate}</th>
                      <th>{t.tableAmount}</th>
                      <th>{t.tableCategory}</th>
                      <th>{t.tableMoneyType}</th>
                      <th>{t.tableType}</th>
                      <th>{t.tableDescription}</th>
                      <th>{t.tableStatus}</th>
                      <th className="no-print">{t.tableActions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!((normalizedPrintRows || dashboardFilteredExpenses).length) && (
                      <tr>
                        <td colSpan="8" className="empty-state"><div className="empty-icon"><Icon name="inbox" className="icon-indigo" /></div><p>{t.noExpenses}</p></td>
                      </tr>
                    )}
                    {(normalizedPrintRows || dashboardFilteredExpenses).map((expense) => {
                      const index = categories.indexOf(expense.category);
                      return (
                        <tr key={expense.id} className="expense-row">
                          <td>{formatDate(expense.date, language)}</td>
                          <td>
                            <strong>{expense.amount.toLocaleString()} {expense.currency}</strong>
                            {expense.currency !== 'USD' && <><br /><small>(${convertCurrency(expense.amount, expense.currency, 'USD').toFixed(2)})</small></>}
                          </td>
                          <td><span className={`category-badge cat-color-${(index < 0 ? 0 : index) % categoryColors.length}`}>{expense.category}</span></td>
                          <td>{expense.moneyType === 'Cash' ? t.selfMoney : t.houseMoney}</td>
                          <td>{expense.expenseType === 'Cash' ? t.cash : t.bank}</td>
                          <td>{expense.note || '-'}</td>
                          <td>
                            <span className={`status-badge ${getStatusClass(expense.status)}`}>
                              {expense.status && (
                                <span className={`status-dot ${
                                  expense.status === 'Paid'
                                    ? 'icon-green'
                                    : expense.status === 'Pending'
                                      ? 'icon-orange'
                                      : 'icon-red'
                                }`}
                                />
                              )}
                              {getStatusLabel(expense.status, t)}
                            </span>
                          </td>
                          <td className="no-print actions-cell">
                            <div className="action-btns">
                              <button className="action-btn edit-btn" onClick={() => openEdit(expense)}>{t.editExpense}</button>
                              <button className="action-btn danger delete-btn" onClick={() => deleteExpense(expense.id)}>{t.deleteBtn}</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <button id="downloadCSV" className="action-btn" onClick={downloadCSV}><Icon name="filetype-csv" className="mr-2" />CSV</button>
                <button id="importData" className="action-btn" onClick={onImportClick}><Icon name="upload" className="mr-2" />Import</button>
                <input ref={importRef} type="file" style={{ display: 'none' }} accept=".xlsx,.xls,.csv" onChange={importData} />
                <button className="action-btn danger" onClick={clearAllExpenses}><Icon name="trash3-fill" className="mr-2" />Clear All</button>
              </div>
            </div>
          </div>
        </div>

        <div id="analytics-page" className={`page-content ${activePage === 'analytics' ? 'active' : ''}`}>
          <div className="container-fluid">
            <div className="welcome-section"><h2>{t.analytics}</h2><p>{t.analyticsSub}</p></div>
            <div className="stats-grid">
              <div className="stat-card gradient-teal"><div className="stat-icon"><Icon name="currency-dollar" className="icon-teal" /></div><div className="stat-info"><div className="stat-label">{t.totalSpent}</div><div className="stat-value">${analyticsStats.total.toFixed(2)}</div></div></div>
              <div className="stat-card gradient-pink"><div className="stat-icon"><Icon name="graph-up-arrow" className="icon-pink" /></div><div className="stat-info"><div className="stat-label">{t.median}</div><div className="stat-value">${analyticsStats.median.toFixed(2)}</div></div></div>
              <div className="stat-card gradient-indigo"><div className="stat-icon"><Icon name="list-check" className="icon-indigo" /></div><div className="stat-info"><div className="stat-label">{t.expenses}</div><div className="stat-value">{analyticsStats.count}</div></div></div>
            </div>
            <div className="charts-grid">
              <div className="chart-card"><div className="chart-header"><h3>{t.moneyTypeChart}</h3></div><div className="chart-body"><canvas ref={moneyTypeChartRef} /></div></div>
              <div className="chart-card"><div className="chart-header"><h3>{t.trendChart}</h3></div><div className="chart-body"><canvas ref={trendChartRef} /></div></div>
              <div className="chart-card"><div className="chart-header"><h3>{t.categoryDist}</h3></div><div className="chart-body"><canvas ref={categoryAnalyticsChartRef} /></div></div>
              <div className="chart-card"><div className="chart-header"><h3>{t.expenseTypeChart}</h3></div><div className="chart-body"><canvas ref={expenseTypeChartRef} /></div></div>
            </div>
            <div className="table-section">
              <div className="table-header"><h3>{t.monthlySummary}</h3></div>
              <div className="table-responsive">
                <table className="expense-table">
                  <thead><tr><th>{t.tableMonth}</th><th>{t.tableTotal}</th><th>{t.tableAvgDay}</th><th>{t.tableTrans}</th><th>{t.tableHighest}</th></tr></thead>
                  <tbody>
                    {!monthlySummary.length && <tr><td colSpan="5" className="text-center">{t.noExpenses}</td></tr>}
                    {monthlySummary.map((row) => (
                      <tr key={row.month}>
                        <td>{formatMonth(row.month, language)}</td>
                        <td>${row.total.toFixed(2)}</td>
                        <td>${row.avgDay.toFixed(2)}</td>
                        <td>{row.count}</td>
                        <td>${row.highest.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div id="reports-page" className={`page-content ${activePage === 'reports' ? 'active' : ''}`}>
          <div className="container-fluid">
            <div className="welcome-section"><h2>{t.reports}</h2><p>{t.reportsSub}</p></div>
            <div className="table-section">
              <div className="table-header"><h3>{t.generateReport}</h3></div>
              <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Scope</label>
                  <select className="form-input" style={{ width: '220px' }} value={reportScope} onChange={(e) => setReportScope(e.target.value)}>
                    <option value="month">Specific Month</option>
                    <option value="all">All Records</option>
                  </select>
                </div>
                {reportScope === 'month' && (
                  <div>
                    <label style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t.selectMonth}</label>
                    <select
                      className="form-input"
                      style={{ width: '220px' }}
                      value={reportMonth}
                      onChange={(e) => {
                        setReportScope('month');
                        setReportMonth(e.target.value);
                      }}
                    >
                      <option value="">{t.chooseMonth}</option>
                      {monthOptions.map((m) => <option key={m} value={m}>{formatMonth(m, language)}</option>)}
                    </select>
                  </div>
                )}
                <button className="action-btn" onClick={generateReport} style={{ width: 'auto' }}><Icon name="bar-chart-fill" className="mr-2" />{t.generate}</button>
                <button className="action-btn" onClick={downloadPDF} style={{ width: 'auto' }}><Icon name="file-earmark-pdf-fill" className="mr-2" />PDF</button>
              </div>
            </div>

            {reportData && (
              <>
                <div id="reportStats" className="stats-grid">
                  <div className="stat-card gradient-blue"><div className="stat-icon"><Icon name="cash-coin" className="icon-blue" /></div><div className="stat-info"><div className="stat-label">{t.total}</div><div className="stat-value">${reportData.total.toFixed(2)}</div></div></div>
                  <div className="stat-card gradient-green"><div className="stat-icon"><Icon name="calculator-fill" className="icon-green" /></div><div className="stat-info"><div className="stat-label">{t.average}</div><div className="stat-value">${reportData.avg.toFixed(2)}</div></div></div>
                  <div className="stat-card gradient-purple"><div className="stat-icon"><Icon name="list-ol" className="icon-purple" /></div><div className="stat-info"><div className="stat-label">{t.count}</div><div className="stat-value">{reportData.count}</div></div></div>
                  <div className="stat-card gradient-orange"><div className="stat-icon"><Icon name="trophy-fill" className="icon-orange" /></div><div className="stat-info"><div className="stat-label">{t.highest}</div><div className="stat-value">${reportData.highest.toFixed(2)}</div></div></div>
                </div>

                <div className="charts-grid">
                  <div id="categoryReport" className="chart-card" style={{ marginBottom: '2rem' }}>
                    <div className="chart-header"><h3>{t.categoryBreakdownReport}</h3></div>
                    <div className="chart-body"><canvas ref={reportCategoryChartRef} /></div>
                  </div>
                  <div className="chart-card" style={{ marginBottom: '2rem' }}>
                    <div className="chart-header"><h3>Status Breakdown</h3></div>
                    <div className="chart-body"><canvas ref={reportStatusChartRef} /></div>
                  </div>
                  <div className="chart-card" style={{ marginBottom: '2rem' }}>
                    <div className="chart-header"><h3>{t.moneyTypeChart}</h3></div>
                    <div className="chart-body"><canvas ref={reportMoneyTypeChartRef} /></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showCategoryModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t.manageCategories}</h5>
                <button type="button" className="close" onClick={() => setShowCategoryModal(false)}><span>&times;</span></button>
              </div>
              <div className="modal-body category-modal-body">
                <div className="input-group mb-3">
                  <input className="form-control" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder={t.newCategory} onKeyDown={(e) => e.key === 'Enter' && addCategory()} />
                  <div className="input-group-append"><button className="btn btn-primary" onClick={addCategory}>{t.add}</button></div>
                </div>
                <ul className="list-group category-list" style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {categories.map((cat, i) => (
                    <li key={cat} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className={`category-badge cat-color-${i % 10}`}>{cat}</span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-dark" disabled={i === 0} onClick={() => moveCategory(i, -1)}>↑</button>
                        <button className="btn btn-sm btn-dark" disabled={i === categories.length - 1} onClick={() => moveCategory(i, 1)}>↓</button>
                        <button className="btn btn-danger btn-sm" onClick={() => removeCategory(i)}>✕</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t.editExpense}</h5>
                <button type="button" className="close" onClick={() => setShowEditModal(false)}><span>&times;</span></button>
              </div>
              <div className="modal-body">
                <form onSubmit={updateExpense}>
                  <div className="row">
                    <div className="col-md-4 mb-3"><label>{t.date}</label><input type="date" className="form-control" value={editForm.date} onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))} required /></div>
                    <div className="col-md-4 mb-3"><label>{t.amount}</label><input type="number" min="0" step="0.01" className="form-control" value={editForm.amount} onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))} required /></div>
                    <div className="col-md-4 mb-3"><label>{t.currency}</label><select className="form-control" value={editForm.currency} onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))}><option value="USD">USD ($)</option><option value="KHR">Riel (៛)</option></select></div>
                  </div>
                  <div className="row">
                    <div className="col-md-3 mb-3"><label>{t.category}</label><select className="form-control" value={editForm.category} onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div className="col-md-3 mb-3"><label>{t.moneyType}</label><select className="form-control" value={editForm.moneyType} onChange={(e) => setEditForm((p) => ({ ...p, moneyType: e.target.value }))}><option value="Cash">{t.selfMoney}</option><option value="Bank">{t.houseMoney}</option></select></div>
                    <div className="col-md-3 mb-3"><label>{t.expenseType}</label><select className="form-control" value={editForm.expenseType} onChange={(e) => setEditForm((p) => ({ ...p, expenseType: e.target.value }))}><option value="Cash">{t.cash}</option><option value="Bank">{t.bank}</option></select></div>
                    <div className="col-md-3 mb-3"><label>{t.status}</label><select className="form-control" value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}><option value="">--</option><option value="Paid">{t.paid}</option><option value="Pending">{t.pending}</option><option value="Need Refund">{t.needRefund}</option></select></div>
                  </div>
                  <div className="mb-3"><label>{t.description}</label><textarea className="form-control" rows="3" value={editForm.note} onChange={(e) => setEditForm((p) => ({ ...p, note: e.target.value }))} /></div>
                  <button type="submit" className="btn btn-primary btn-block">{t.updateExpense}</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
