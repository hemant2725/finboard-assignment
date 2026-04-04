import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { dashboardApi } from '@/api/dashboard';
import type {
  CategorySpending,
  CreateRecurringInput,
  CreateTransactionInput,
  DashboardData,
  FilterState,
  FinancialSummary,
  MonthlyData,
  RecurringItem,
  SavingsGoal,
  Transaction,
  UserRole,
  WeeklySpendingDatum,
} from '@/types';

const USER_ROLE_STORAGE_KEY = 'fin-dashboard:role';

//default filters for transactions
const initialFilters: FilterState = {
  search: '',
  category: 'all',
  type: 'all',
  dateRange: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
};

const emptySavingsGoal: SavingsGoal = {
  name: 'Emergency Fund',
  target: 0,
  current: 0,
};

interface State extends DashboardData {
  userRole: UserRole;
  filters: FilterState;
  isAddModalOpen: boolean;
  editingTransaction: Transaction | null;
  isLoading: boolean;
  isSaving: boolean;
  hasLoaded: boolean;
  error: string | null;
}

//below is reducer actions, all state updates
type Action =
  | { type: 'LOAD_DASHBOARD_START' }
  | { type: 'LOAD_DASHBOARD_SUCCESS'; payload: DashboardData }
  | { type: 'LOAD_DASHBOARD_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'START_MUTATION' }
  | { type: 'END_MUTATION' }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_RECURRING'; payload: RecurringItem }
  | { type: 'DELETE_RECURRING'; payload: string }
  | { type: 'SET_USER_ROLE'; payload: UserRole }
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SET_ADD_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_EDITING_TRANSACTION'; payload: Transaction | null };

  //initial global state
const initialState: State = {
  transactions: [],
  recurring: [],
  monthlyBudget: 0,
  savingsGoal: emptySavingsGoal,
  userRole: 'viewer',
  filters: initialFilters,
  isAddModalOpen: false,
  editingTransaction: null,
  isLoading: true,
  isSaving: false,
  hasLoaded: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    //fetching dashboard data
    case 'LOAD_DASHBOARD_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOAD_DASHBOARD_SUCCESS':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        hasLoaded: true,
        error: null,
      };
    case 'LOAD_DASHBOARD_ERROR':
      return {
        ...state,
        isLoading: false,
        hasLoaded: true,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
      //mutation (add/update/delete) operations
    case 'START_MUTATION':
      return {
        ...state,
        isSaving: true,
        error: null,
      };
    case 'END_MUTATION':
      return {
        ...state,
        isSaving: false,
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((transaction) =>
          transaction.id === action.payload.id ? action.payload : transaction
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter((transaction) => transaction.id !== action.payload),
      };
    case 'ADD_RECURRING':
      return {
        ...state,
        recurring: [action.payload, ...state.recurring],
      };
    case 'DELETE_RECURRING':
      return {
        ...state,
        recurring: state.recurring.filter((item) => item.id !== action.payload),
      };
      //role switch
    case 'SET_USER_ROLE':
      return {
        ...state,
        userRole: action.payload,
        isAddModalOpen: action.payload === 'admin' ? state.isAddModalOpen : false,
        editingTransaction: action.payload === 'admin' ? state.editingTransaction : null,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    case 'SET_ADD_MODAL_OPEN':
      return {
        ...state,
        isAddModalOpen: action.payload,
      };
    case 'SET_EDITING_TRANSACTION':
      return {
        ...state,
        editingTransaction: action.payload,
      };
    default:
      return state;
  }
}

interface DashboardContextType {
  state: State;
  summary: FinancialSummary;
  filteredTransactions: Transaction[];
  categorySpending: CategorySpending[];
  monthlyData: MonthlyData[];
  weeklySpendingData: WeeklySpendingDatum[];
  setUserRole: (role: UserRole) => void;
  addTransaction: (transaction: CreateTransactionInput) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addRecurringItem: (item: CreateRecurringInput) => Promise<void>;
  deleteRecurringItem: (id: string) => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  setAddModalOpen: (open: boolean) => void;
  setEditingTransaction: (transaction: Transaction | null) => void;
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  highestSpendingCategory: CategorySpending | null;
  monthlyComparison: { current: number; previous: number; change: number };
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while syncing dashboard data.';
}
//normalize date
function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}
//compare only date
function isSameDay(date: Date, compareTo: Date) {
  return (
    date.getFullYear() === compareTo.getFullYear() &&
    date.getMonth() === compareTo.getMonth() &&
    date.getDate() === compareTo.getDate()
  );
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  //cenral state management using reducer
  const [state, dispatch] = useReducer(reducer, initialState);
  //function to load role from localStorage
  useEffect(() => {
    const storedRole = window.localStorage.getItem(USER_ROLE_STORAGE_KEY);
    if (storedRole === 'viewer' || storedRole === 'admin') {
      dispatch({ type: 'SET_USER_ROLE', payload: storedRole });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(USER_ROLE_STORAGE_KEY, state.userRole);
  }, [state.userRole]);

  const refreshDashboard = useCallback(async () => {
    dispatch({ type: 'LOAD_DASHBOARD_START' });

    try {
      const dashboard = await dashboardApi.fetchDashboard();
      dispatch({ type: 'LOAD_DASHBOARD_SUCCESS', payload: dashboard });
    } catch (error) {
      dispatch({ type: 'LOAD_DASHBOARD_ERROR', payload: getErrorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  const setUserRole = useCallback((role: UserRole) => {
    dispatch({ type: 'SET_USER_ROLE', payload: role });
  }, []);

  //CRUD operations (everything goes through API + reducer)
  const addTransaction = useCallback(
    async (transaction: CreateTransactionInput) => {
      if (state.userRole !== 'admin') {
        throw new Error('Only admins can create transactions.');
      }

      dispatch({ type: 'START_MUTATION' });

      try {
        const createdTransaction = await dashboardApi.createTransaction(transaction);
        dispatch({ type: 'ADD_TRANSACTION', payload: createdTransaction });
      } catch (error) {
        dispatch({ type: 'LOAD_DASHBOARD_ERROR', payload: getErrorMessage(error) });
        throw error;
      } finally {
        dispatch({ type: 'END_MUTATION' });
      }
    },
    [state.userRole]
  );

  const updateTransaction = useCallback(
    async (transaction: Transaction) => {
      if (state.userRole !== 'admin') {
        throw new Error('Only admins can update transactions.');
      }

      dispatch({ type: 'START_MUTATION' });

      try {
        const updatedTransaction = await dashboardApi.updateTransaction(transaction);
        dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTransaction });
      } catch (error) {
        dispatch({ type: 'LOAD_DASHBOARD_ERROR', payload: getErrorMessage(error) });
        throw error;
      } finally {
        dispatch({ type: 'END_MUTATION' });
      }
    },
    [state.userRole]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (state.userRole !== 'admin') {
        throw new Error('Only admins can delete transactions.');
      }

      dispatch({ type: 'START_MUTATION' });

      try {
        const deletedId = await dashboardApi.deleteTransaction(id);
        dispatch({ type: 'DELETE_TRANSACTION', payload: deletedId });
      } catch (error) {
        dispatch({ type: 'LOAD_DASHBOARD_ERROR', payload: getErrorMessage(error) });
        throw error;
      } finally {
        dispatch({ type: 'END_MUTATION' });
      }
    },
    [state.userRole]
  );

  const addRecurringItem = useCallback(async (item: CreateRecurringInput) => {
    if (state.userRole !== 'admin') {
      throw new Error('Only admins can manage recurring items.');
    }

    dispatch({ type: 'START_MUTATION' });

    try {
      const createdRecurring = await dashboardApi.createRecurring(item);
      dispatch({ type: 'ADD_RECURRING', payload: createdRecurring });
    } catch (error) {
      dispatch({ type: 'LOAD_DASHBOARD_ERROR', payload: getErrorMessage(error) });
      throw error;
    } finally {
      dispatch({ type: 'END_MUTATION' });
    }
  }, [state.userRole]);

  const deleteRecurringItem = useCallback(async (id: string) => {
    if (state.userRole !== 'admin') {
      throw new Error('Only admins can manage recurring items.');
    }

    dispatch({ type: 'START_MUTATION' });

    try {
      const deletedId = await dashboardApi.deleteRecurring(id);
      dispatch({ type: 'DELETE_RECURRING', payload: deletedId });
    } catch (error) {
      dispatch({ type: 'LOAD_DASHBOARD_ERROR', payload: getErrorMessage(error) });
      throw error;
    } finally {
      dispatch({ type: 'END_MUTATION' });
    }
  }, [state.userRole]);

  const setFilters = useCallback((filters: Partial<FilterState>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const setAddModalOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_ADD_MODAL_OPEN', payload: open });
  }, []);

  const setEditingTransaction = useCallback((transaction: Transaction | null) => {
    dispatch({ type: 'SET_EDITING_TRANSACTION', payload: transaction });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const summary = useMemo<FinancialSummary>(() => {
    const totalIncome = state.transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const totalExpenses = state.transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const now = new Date();
    const monthlySpent = state.transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.type === 'expense' &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      totalBalance: totalIncome - totalExpenses,
      totalIncome,
      totalExpenses,
      monthlyBudget: state.monthlyBudget,
      monthlySpent,
    };
  }, [state.monthlyBudget, state.transactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...state.transactions];

    if (state.filters.search) {
      const search = state.filters.search.toLowerCase();
      result = result.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(search) ||
          transaction.category.toLowerCase().includes(search) ||
          transaction.recipient?.toLowerCase().includes(search)
      );
    }

    if (state.filters.category !== 'all') {
      result = result.filter((transaction) => transaction.category === state.filters.category);
    }

    if (state.filters.type !== 'all') {
      result = result.filter((transaction) => transaction.type === state.filters.type);
    }

    if (state.filters.dateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();

      switch (state.filters.dateRange) {
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }

      result = result.filter((transaction) => new Date(transaction.date) >= cutoff);
    }

    result.sort((left, right) => {
      let comparison = 0;

      switch (state.filters.sortBy) {
        case 'date':
          comparison = new Date(right.date).getTime() - new Date(left.date).getTime();
          break;
        case 'amount':
          comparison = right.amount - left.amount;
          break;
        case 'category':
          comparison = left.category.localeCompare(right.category);
          break;
      }

      return state.filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }, [state.filters, state.transactions]);

  const categorySpending = useMemo<CategorySpending[]>(() => {
    const expenses = state.transactions.filter((transaction) => transaction.type === 'expense');
    const total = expenses.reduce((sum, transaction) => sum + transaction.amount, 0);
    const categoryTotals = new Map<string, number>();

    expenses.forEach((transaction) => {
      categoryTotals.set(
        transaction.category,
        (categoryTotals.get(transaction.category) || 0) + transaction.amount
      );
    });

    return Array.from(categoryTotals.entries())
      .map(([category, amount]) => ({
        category: category as CategorySpending['category'],
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((left, right) => right.amount - left.amount);
  }, [state.transactions]);

  const monthlyData = useMemo<MonthlyData[]>(() => {
    const months: MonthlyData[] = [];
    const now = new Date();

    for (let index = 5; index >= 0; index -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const monthTransactions = state.transactions.filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getFullYear() === date.getFullYear()
        );
      });

      const income = monthTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      const expense = monthTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((sum, transaction) => sum + transaction.amount, 0);

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        income,
        expense,
        balance: income - expense,
      });
    }

    return months;
  }, [state.transactions]);

  const weeklySpendingData = useMemo<WeeklySpendingDatum[]>(() => {
    const today = startOfDay(new Date());

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));

      const matchingTransactions = state.transactions.filter((transaction) => {
        const transactionDate = startOfDay(new Date(transaction.date));
        return transaction.type === 'expense' && isSameDay(transactionDate, date);
      });

      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        date: date.toISOString(),
        amount: matchingTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
        transactionCount: matchingTransactions.length,
      };
    });
  }, [state.transactions]);

  const highestSpendingCategory = useMemo(() => {
    return categorySpending.length > 0 ? categorySpending[0] : null;
  }, [categorySpending]);

  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const currentMonth = state.transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.type === 'expense' &&
          transactionDate.getMonth() === now.getMonth() &&
          transactionDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonth = state.transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date);
        return (
          transaction.type === 'expense' &&
          transactionDate.getMonth() === previousMonthDate.getMonth() &&
          transactionDate.getFullYear() === previousMonthDate.getFullYear()
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const change = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth) * 100 : 0;

    return {
      current: currentMonth,
      previous: previousMonth,
      change,
    };
  }, [state.transactions]);

  //it passes to all state and functions, prevents unnecessary rerenders 
  const value = useMemo<DashboardContextType>(
    () => ({
      state,
      summary,
      filteredTransactions,
      categorySpending,
      monthlyData,
      weeklySpendingData,
      setUserRole,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addRecurringItem,
      deleteRecurringItem,
      setFilters,
      setAddModalOpen,
      setEditingTransaction,
      refreshDashboard,
      clearError,
      isLoading: state.isLoading,
      isSaving: state.isSaving,
      error: state.error,
      highestSpendingCategory,
      monthlyComparison,
    }),
    [
      addRecurringItem,
      addTransaction,
      categorySpending,
      clearError,
      deleteRecurringItem,
      deleteTransaction,
      filteredTransactions,
      highestSpendingCategory,
      monthlyComparison,
      monthlyData,
      refreshDashboard,
      setAddModalOpen,
      setEditingTransaction,
      setFilters,
      setUserRole,
      state,
      summary,
      updateTransaction,
      weeklySpendingData,
    ]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}
//cleaner hook to use context
export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }

  return context;
}
