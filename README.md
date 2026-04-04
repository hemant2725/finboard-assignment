# FinDashboard

This project is about frontend phase of finance dashboard built with ReactJS, TypeScript, Vite, Tailwind CSS, and Context API.

## Project Summary

FinDashboard is a frontend only finance dashboard that simulates a realistic product flow while the business data flows through a single shared context:

- implemented a mock API layer
-  also has a persistent local storage
- make it centralized state management with Context API
- also tells derived summaries and analytics of the overall transaction
- role based access frontend simulation for viewer and admin


## Core Features

## Dashboard Overview
- Implemented a summary card which presents - Total Balance, Total Income, Total Expenses, Monthly Budget and Monthly Spent.
- Implemented a Bar and Pie Chart Visualization for Weekly and Monthly trends for the transactions analysis.

## Transaction Management
- Transaction List - Complete History with Dates, Amounts, Category and Type
- Adv Filtering - Search by description, category, or by recipient name
- Sorting - Sort by dtae, amount, or category
- Export Functionality - User can export thier transactions via CSV and JSON file
- Admin can perform operations such as add, edit, and delete

## Additional Features
- User can track and manage thier recurring expenses
- While fetching the data it handles gracefully using loading states
- Implemented a Proper Error Handling with error message and with retry options
- Implemented a Responsiveness across all devices

## Teck Stack
- Framework - ReactJS with TypeScript
- Building Tool - Vite
- Styling - Tailwind CSS
- State Management - Context API and useReducer
- Charts - Recharts
- Animations - GSAP
- Icons - Lucide React
- Fonts - Inter and Poppins

## Architecture
It follows a Layered Architecture:

- UI Sections - Navigations | Hero | Activity | Analytics | Recurring | Send Money | Cards | Security |
- DashboardsContext.tsx (Follows Single Source of Truth) - it has - reducer based state, role state, filters, loading error state, and analytics
- dashboard.ts (under src/api) - It has Mock API Layer to fetch/ create/ update/ delete data and persists data in localStorage
- mockData.ts (under src/api) - It contains default Transactions Data.

## Data Flow
## Application Load Flow
First App Loads ->
- DashboardProvider mounts means this is a global state container like a brain of the app
- refreshDashboard() calls automatically on load to get all the data
- dashboardApi.fetchDashboard() it simulates backend API call, but instead of server it checks localStorage
- localStorage checked for two cases : 
1 -> if Data exists - it loads existing data
2 -> if Data is empty - it create seed data from mockData.ts
- Data returned to DashboardContext and that context state updates
- UI updates automatically

## Mutation Flow
When a user interacts with UI
- The components calls a function in the central context
- The DashboardContext first checks the permission and validates the data 
- then it calls a API Layer (dashboardApi) which simulates a backend and saves the transaction in localStorage
- Once the data is saved, the context (reducer) updates the global state
- all the dependent sections rerender automatically

# For Example: Send Money Flow
1 -> You Send Money:
SendMoneySection
2 -> addTransaction() - it calls a funtion in central context
3 -> dashboardApi.createTransaction() - checks permission and calls a API Layer to create a Transaction
4 -> localStorage updated - saves the transaction in localStorage
5 -> state.transaction updated - the context updates the global state
6 -> Everything updates automatically (Hero / Transactions / Analytics / Recent History update)

## Storage and Persistence
Project stores the data in localStorage
fin-dashboard:mock-api
- transactions
- recurring
- monthlyBudget
- savingsGoal

fin-dashboard:role
- admin - performs add, create, delete operations
- viewer - only view

It means: 1 -> Data persists after refresh
2 -> Roles persists after refresh
3 -> Looks like real backend behavior

# State Management
All the logic presents in: (DashboardContext.tsx)

# Stored State
- transactions - all transactions record
- recurring - recurring payment items
- monthlyBudget - Users monthly budget limit
- savingsGoal - Targeted saving amount
- userRole - Current role as Admin or Viewer
- filters - such as search, category, type, date filters
- isLoading - loading state for initial fetch
- isSaving - loading state for mutations
- error - display error message

# Derived State
- summary - total balance, spent, etc.
- filteredTransactions - based on filters
- categorySpending - for the grouped data
- monthlyData - for the trends
- weeklySpendingData - for the analytics
- highestSpendingCategory - for the analytics
- monthlyComparison - for the analytics

# Role-Based UI
As a Viewer: 
- Read-only access to all dashboard data
- Cannot add, edit, or delete transactions
- Cannot send money

As a Admin:
- Full read access
- Can create, edit, and delete transactions all over the dashboard
- Can manage recurring items
- Can send money

# Transaction Features
It includes:
1. Filtering - Search by description, category, or recipient / Date Range Filter / Income or Expense type filter
2. Sorting - by date / by amount / by category
3. Export - CSV and JSON files

# Mock API Layer
It is implemented in dashboard.ts (src/api/)

- fetchDashboard() - retrieve all dashboard data
- createTransaction(data) - add new transaction
- updateTransaction(id, data) - modify exixting transaction
- deleteTransaction(id) - remove transaction
- createRecurring(data) - add recurring payments
- deleteRecurring(id) - remove recurring payments

This makes it easy to swap the mock layer for a real backend later without rewriting UI components.

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Install dependencies**
```bash
npm install
```

2. **Run the development server**
```bash
npm run dev
```

3. **Create a production build**
```bash
npm run build
```

4. **Preview the production build**
```bash
npm run preview
```
