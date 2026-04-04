import { createDashboardSeed } from '@/api/mockData'; //used when localStorage data is empty (inital data at load time)
import type {
  CreateRecurringInput,
  CreateTransactionInput,
  DashboardData,
  RecurringItem,
  Transaction,
} from '@/types';

const STORAGE_KEY = 'fin-dashboard:mock-api'; //to store data in localStorage
const MIN_DELAY_MS = 250;
const MAX_DELAY_MS = 650;

function clone<T>(value: T): T { // it copies the data
  return JSON.parse(JSON.stringify(value));
}

function wait<T>(value: T, delay = MIN_DELAY_MS + Math.round(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS))) { // used to add random delay
  return new Promise<T>((resolve) => {
    globalThis.setTimeout(() => resolve(clone(value)), delay);
  }); // return cpoied value after delay
}

function generateId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }//this function generates a unique id

  return `${prefix}_${Math.random().toString(36).slice(2, 11)}`;
}

function readDashboard(): DashboardData {
  if (typeof window === 'undefined') {
    return createDashboardSeed();
  }//return fresh data(no localStorage data)

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    const seed = createDashboardSeed();
    writeDashboard(seed);
    return seed;
  }//if no data exists in browser storage then it creates default data and save it

  try {
    const parsed = JSON.parse(stored) as DashboardData;
    return {
      ...createDashboardSeed(),
      ...parsed,
      transactions: parsed.transactions ?? [],
      recurring: parsed.recurring ?? [],
    };
  } catch {
    const seed = createDashboardSeed();
    writeDashboard(seed);
    return seed;
  }
}

function writeDashboard(data: DashboardData) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}//saves data to localStorage

export const dashboardApi = {
  async fetchDashboard(): Promise<DashboardData> {
    return wait(readDashboard());
  },

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const dashboard = readDashboard(); //read current data
    const transaction: Transaction = { 
      ...input,
      id: generateId('txn'),
    };//create new transaction

    dashboard.transactions = [transaction, ...dashboard.transactions];//add to the top of list
    writeDashboard(dashboard);//save

    return wait(transaction);
  },
//update transaction by id
  async updateTransaction(input: Transaction): Promise<Transaction> {
    const dashboard = readDashboard();
    const exists = dashboard.transactions.some((transaction) => transaction.id === input.id);

    if (!exists) {
      throw new Error('Transaction not found.');
    }

    dashboard.transactions = dashboard.transactions.map((transaction) =>
      transaction.id === input.id ? input : transaction
    );
    writeDashboard(dashboard);

    return wait(input);
  },
//delete transaction by id
  async deleteTransaction(id: string): Promise<string> {
    const dashboard = readDashboard();
    const exists = dashboard.transactions.some((transaction) => transaction.id === id);

    if (!exists) {
      throw new Error('Transaction not found.');
    }

    dashboard.transactions = dashboard.transactions.filter((transaction) => transaction.id !== id);
    writeDashboard(dashboard);

    return wait(id);
  },

  async createRecurring(input: CreateRecurringInput): Promise<RecurringItem> { //create recurring item
    const dashboard = readDashboard();
    const recurring: RecurringItem = {
      ...input,
      id: generateId('rec'),
    };

    dashboard.recurring = [recurring, ...dashboard.recurring];
    writeDashboard(dashboard);

    return wait(recurring);
  },

  async deleteRecurring(id: string): Promise<string> { //delete recurring item by id
    const dashboard = readDashboard();
    const exists = dashboard.recurring.some((item) => item.id === id);

    if (!exists) {
      throw new Error('Recurring item not found.');
    }

    dashboard.recurring = dashboard.recurring.filter((item) => item.id !== id);
    writeDashboard(dashboard);

    return wait(id);
  },
};
