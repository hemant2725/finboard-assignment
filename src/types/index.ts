export type UserRole = 'viewer' | 'admin';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Bills' 
  | 'Salary' 
  | 'Freelance' 
  | 'Investment' 
  | 'Health' 
  | 'Education'
  | 'Software'
  | 'Other';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  description: string;
  recipient?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyBudget: number;
  monthlySpent: number;
}

export interface CategorySpending {
  category: TransactionCategory;
  amount: number;
  percentage: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface WeeklySpendingDatum {
  day: string;
  amount: number;
  date: string;
  fullDate: string;
  transactionCount: number;
}

export interface SavingsGoal {
  name: string;
  target: number;
  current: number;
}

export interface RecurringItem {
  id: string;
  name: string;
  category: TransactionCategory;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextDate: string;
}

export interface FilterState {
  search: string;
  category: TransactionCategory | 'all';
  type: TransactionType | 'all';
  dateRange: 'all' | 'week' | 'month' | 'year';
  sortBy: 'date' | 'amount' | 'category';
  sortOrder: 'asc' | 'desc';
}

export interface DashboardData {
  transactions: Transaction[];
  recurring: RecurringItem[];
  monthlyBudget: number;
  savingsGoal: SavingsGoal;
}

export type CreateTransactionInput = Omit<Transaction, 'id'>;

export type CreateRecurringInput = Omit<RecurringItem, 'id'>;
