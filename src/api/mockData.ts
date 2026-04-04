import type {
  DashboardData,
  RecurringItem,
  SavingsGoal,
  Transaction,
} from '@/types';

function toIsoDate(date: Date) {
  return date.toISOString().split('T')[0];
}//to convert date in yyyy-mm-dd

function daysFromToday(offset: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return toIsoDate(date);
}//it will get todays date & add/subtract days

function monthsFromToday(offset: number, day = 1) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setMonth(date.getMonth() + offset, day);
  return toIsoDate(date);
}//set month by adding/subtracting months and set date to given day

function buildTransactions(): Transaction[] {
  return [
    { id: 'txn_1', date: daysFromToday(-1), amount: 4550, category: 'Salary', type: 'income', description: 'Monthly Salary', recipient: 'Acme Corp' },
    { id: 'txn_2', date: daysFromToday(-1), amount: 1245, category: 'Food', type: 'expense', description: 'Groceries', recipient: 'Blinkit' },
    { id: 'txn_3', date: daysFromToday(-2), amount: 850, category: 'Transport', type: 'expense', description: 'Ride share', recipient: 'Uber' },
    { id: 'txn_4', date: daysFromToday(-3), amount: 3200, category: 'Freelance', type: 'income', description: 'Client retainer', recipient: 'Upwork' },
    { id: 'txn_5', date: daysFromToday(-3), amount: 499, category: 'Entertainment', type: 'expense', description: 'Movie tickets', recipient: 'PVR' },
    { id: 'txn_6', date: daysFromToday(-4), amount: 2199, category: 'Shopping', type: 'expense', description: 'Wireless keyboard', recipient: 'Amazon' },
    { id: 'txn_7', date: daysFromToday(-5), amount: 999, category: 'Bills', type: 'expense', description: 'Electric bill', recipient: 'BESCOM' },
    { id: 'txn_8', date: daysFromToday(-6), amount: 650, category: 'Health', type: 'expense', description: 'Pharmacy', recipient: 'Apollo' },
    { id: 'txn_9', date: daysFromToday(-8), amount: 1450, category: 'Education', type: 'expense', description: 'Course renewal', recipient: 'Coursera' },
    { id: 'txn_10', date: daysFromToday(-10), amount: 1800, category: 'Investment', type: 'income', description: 'Mutual fund dividend', recipient: 'Groww' },
    { id: 'txn_11', date: monthsFromToday(-1, 27), amount: 4550, category: 'Salary', type: 'income', description: 'Monthly Salary', recipient: 'Acme Corp' },
    { id: 'txn_12', date: monthsFromToday(-1, 21), amount: 899, category: 'Software', type: 'expense', description: 'Design subscription', recipient: 'Figma' },
    { id: 'txn_13', date: monthsFromToday(-1, 17), amount: 1250, category: 'Food', type: 'expense', description: 'Dining out', recipient: 'Swiggy' },
    { id: 'txn_14', date: monthsFromToday(-2, 12), amount: 2100, category: 'Freelance', type: 'income', description: 'Landing page project', recipient: 'Direct client' },
    { id: 'txn_15', date: monthsFromToday(-2, 6), amount: 1550, category: 'Bills', type: 'expense', description: 'Internet bill', recipient: 'Airtel' },
  ];
}//it creates lists of transaction data

function buildRecurring(): RecurringItem[] {
  return [
    { id: 'rec_1', name: 'YouTube Premium', category: 'Entertainment', amount: 129, frequency: 'monthly', nextDate: daysFromToday(5) },
    { id: 'rec_2', name: 'Adobe Creative Cloud', category: 'Software', amount: 1799, frequency: 'monthly', nextDate: daysFromToday(12) },
    { id: 'rec_3', name: 'Netflix', category: 'Entertainment', amount: 649, frequency: 'monthly', nextDate: daysFromToday(3) },
    { id: 'rec_4', name: 'Gym Membership', category: 'Health', amount: 1199, frequency: 'monthly', nextDate: daysFromToday(9) },
  ];
}//cretaes monthly recurring(subscription) items

const savingsGoal: SavingsGoal = {
  name: 'Emergency Fund',
  target: 200000,
  current: 124500,
};//it presents financial goal tracking

export function createDashboardSeed(): DashboardData {
  return {
    transactions: buildTransactions(),
    recurring: buildRecurring(),
    monthlyBudget: 8000,
    savingsGoal,
  };
}//usable data for dashboard