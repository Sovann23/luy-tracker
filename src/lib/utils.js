import { exchangeRates } from './constants';

export function convertCurrency(amount, from, to) {
  if (from === to) return amount;
  const fromRate = exchangeRates[from] || 1;
  const toRate = exchangeRates[to] || 1;
  return (amount / fromRate) * toRate;
}

export function formatDate(dateStr, language) {
  return new Date(dateStr).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatMonth(monthKey, language) {
  return new Date(`${monthKey}-01`).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
    year: 'numeric',
    month: 'long'
  });
}

export function getMonthKeys(numMonths) {
  const keys = [];
  for (let i = numMonths - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    keys.push(d.toISOString().slice(0, 7));
  }
  return keys;
}

export function getStatusLabel(status, t) {
  if (status === 'Paid') return t.paid;
  if (status === 'Need Refund') return t.needRefund;
  if (status === 'Pending') return t.pending;
  return '-';
}

export function getStatusClass(status) {
  if (status === 'Paid') return 'status-paid';
  if (status === 'Need Refund') return 'status-need-refund';
  if (status === 'Pending') return 'status-pending';
  return '';
}
