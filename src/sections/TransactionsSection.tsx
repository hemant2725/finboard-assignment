import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Receipt,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  Calendar,
  X,
  ChevronDown,
  FileSpreadsheet,
  FileJson,
  Eye,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboard } from '@/context/DashboardContext';
import { formatCurrency } from '@/lib/currency';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

const categories = ['all', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Salary', 'Freelance', 'Investment', 'Health', 'Education', 'Software', 'Other'];
//categories for filtering transactions
const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

export function TransactionsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const {
    filteredTransactions,
    setFilters,
    state,
    deleteTransaction,
    setEditingTransaction,
    setAddModalOpen,
    isLoading,
    error,
    refreshDashboard,
  } = useDashboard();

  const { filters } = state;
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        content,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted');
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : 'Failed to delete transaction');
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setAddModalOpen(true);
  };

  const handleView = (transaction: any) => {
    toast.info(transaction.description, {
      description: `${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)} | ${transaction.category} | ${formatDate(transaction.date)}`,
    });
  };

  //export transactions to CSV and JSON
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Recipient'];
    const rows = filteredTransactions.map((transaction) => [
      transaction.date,
      transaction.description,
      transaction.category,
      transaction.type,
      transaction.amount,
      transaction.recipient || '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finDashboard_transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredTransactions.length} transactions to CSV`);
  };

  const exportToJSON = () => {
    const json = JSON.stringify(filteredTransactions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finDashboard_transactions_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredTransactions.length} transactions to JSON`);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      type: 'all',
      dateRange: 'all',
      sortBy: 'date',
      sortOrder: 'desc',
    });
    toast.info('Filters cleared');
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'all' ||
    filters.type !== 'all' ||
    filters.dateRange !== 'all';

  const toggleSortOrder = () => {
    setFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <section
      ref={sectionRef}
      id="transactions"
      className="relative w-full py-12 sm:py-16 lg:py-24 bg-dark-bg"
    >
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="text-center lg:text-left space-y-4 lg:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold leading-tight text-text-primary">
              A history you can
              <span className="text-lime"> actually read.</span>
            </h2>

            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto lg:mx-0 leading-relaxed">
              Search by name or category. Income and expenses are labeled instantly so
              you never lose track of a transaction.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {state.userRole === 'admin' && (
                <Button
                  onClick={() => setAddModalOpen(true)}
                  className="bg-lime text-dark-bg hover:bg-lime-light font-medium px-5 lg:px-6 py-2.5 lg:py-3 h-auto rounded-xl transition-all duration-300 hover:shadow-glow text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
              <div className="p-2.5 rounded-lg bg-dark-elevated/30 text-center">
                <p className="text-lg font-heading font-bold text-text-primary">{filteredTransactions.length}</p>
                <p className="text-[10px] text-text-secondary">Transactions</p>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-elevated/30 text-center">
                <p className="text-lg font-heading font-bold text-lime">
                  {formatCurrency(filteredTransactions.filter((transaction) => transaction.type === 'income').reduce((sum, transaction) => sum + transaction.amount, 0))}
                </p>
                <p className="text-[10px] text-text-secondary">Income</p>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-elevated/30 text-center">
                <p className="text-lg font-heading font-bold text-orange-400">
                  {formatCurrency(filteredTransactions.filter((transaction) => transaction.type === 'expense').reduce((sum, transaction) => sum + transaction.amount, 0))}
                </p>
                <p className="text-[10px] text-text-secondary">Expenses</p>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-elevated/30 text-center">
                <p className="text-lg font-heading font-bold text-blue-400">{categories.length - 1}</p>
                <p className="text-[10px] text-text-secondary">Categories</p>
              </div>
            </div>
          </div>

          <div className="lg:justify-self-end w-full">
            <div className="glass-card rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 w-full max-w-lg mx-auto card-shadow">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0">
                    <Receipt className="w-4 h-4 lg:w-5 lg:h-5 text-lime" />
                  </div>
                  <div>
                    <h3 className="text-sm lg:text-lg font-heading font-semibold text-text-primary">Transactions</h3>
                    <p className="text-[10px] lg:text-xs text-text-secondary">
                      {error ? 'Sync issue' : isLoading ? 'Loading...' : `${filteredTransactions.length} total`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/10 hover:bg-white/5 h-8 lg:h-9 px-2"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-dark-card border-white/10" align="end">
                      <DropdownMenuItem onClick={exportToCSV} className="text-text-primary text-xs">
                        <FileSpreadsheet className="w-3.5 h-3.5 mr-2" />
                        Export as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportToJSON} className="text-text-primary text-xs">
                        <FileJson className="w-3.5 h-3.5 mr-2" />
                        Export as JSON
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
                    <Input
                      placeholder="Search transactions..."
                      value={filters.search}
                      onChange={(event) => setFilters({ search: event.target.value })}
                      className="pl-8 py-2 text-xs bg-dark-elevated border-white/[0.06] text-text-primary placeholder:text-text-secondary/50 h-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`border-white/10 hover:bg-white/5 h-9 w-9 ${showFilters ? 'bg-lime/10 border-lime/30' : ''}`}
                  >
                    <Filter className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSortOrder}
                    className="border-white/10 hover:bg-white/5 h-9 w-9"
                    title={filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  >
                    <ArrowUpDown className={`w-3.5 h-3.5 ${filters.sortOrder === 'asc' ? 'rotate-180' : ''} transition-transform`} />
                  </Button>
                </div>

                {showFilters && (
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-dark-elevated/50 border border-white/[0.04]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-white/10 text-[10px] h-7 px-2">
                          {filters.category === 'all' ? 'Category' : filters.category}
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-dark-card border-white/10 max-h-48 overflow-y-auto">
                        {categories.map((category) => (
                          <DropdownMenuItem
                            key={category}
                            onClick={() => setFilters({ category: category as any })}
                            className={`capitalize text-[11px] ${filters.category === category ? 'text-lime' : 'text-text-primary'}`}
                          >
                            {category}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-white/10 text-[10px] h-7 px-2">
                          {filters.type === 'all' ? 'Type' : filters.type}
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-dark-card border-white/10">
                        {['all', 'income', 'expense'].map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onClick={() => setFilters({ type: type as any })}
                            className={`capitalize text-[11px] ${filters.type === type ? 'text-lime' : 'text-text-primary'}`}
                          >
                            {type}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-white/10 text-[10px] h-7 px-2">
                          {dateRanges.find((range) => range.value === filters.dateRange)?.label || 'Date'}
                          <Calendar className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-dark-card border-white/10">
                        {dateRanges.map((range) => (
                          <DropdownMenuItem
                            key={range.value}
                            onClick={() => setFilters({ dateRange: range.value as any })}
                            className={`text-[11px] ${filters.dateRange === range.value ? 'text-lime' : 'text-text-primary'}`}
                          >
                            {range.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="border-white/10 text-[10px] h-7 px-2">
                          Sort: {filters.sortBy}
                          <ChevronDown className="w-3 h-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-dark-card border-white/10">
                        {['date', 'amount', 'category'].map((sort) => (
                          <DropdownMenuItem
                            key={sort}
                            onClick={() => setFilters({ sortBy: sort as any })}
                            className={`capitalize text-[11px] ${filters.sortBy === sort ? 'text-lime' : 'text-text-primary'}`}
                          >
                            {sort}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-[10px] h-7 px-2"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 max-h-60 sm:max-h-72 lg:max-h-80 overflow-y-auto scrollbar-hide">
                {isLoading ? (
                  <div className="text-center py-8 lg:py-12">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-dark-elevated flex items-center justify-center mx-auto mb-3 animate-pulse">
                      <Search className="w-5 h-5 lg:w-6 lg:h-6 text-text-secondary" />
                    </div>
                    <p className="text-sm text-text-secondary">Loading transactions...</p>
                    <p className="text-[10px] text-text-secondary/60 mt-1">Pulling the latest mock API data</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 lg:py-12">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-dark-elevated flex items-center justify-center mx-auto mb-3">
                      <X className="w-5 h-5 lg:w-6 lg:h-6 text-red-400" />
                    </div>
                    <p className="text-sm text-text-secondary">Unable to load transactions</p>
                    <p className="text-[10px] text-text-secondary/60 mt-1">{error}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void refreshDashboard()}
                      className="mt-3 text-lime hover:bg-lime/10 text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 lg:py-12">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-dark-elevated flex items-center justify-center mx-auto mb-3">
                      <Search className="w-5 h-5 lg:w-6 lg:h-6 text-text-secondary" />
                    </div>
                    <p className="text-sm text-text-secondary">No transactions found</p>
                    <p className="text-[10px] text-text-secondary/60 mt-1">Try adjusting your filters</p>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="mt-3 text-lime hover:bg-lime/10 text-xs"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredTransactions.slice(0, 10).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-2 lg:p-2.5 rounded-lg bg-dark-elevated/50 border border-white/[0.04] hover:border-lime/20 transition-colors group"
                    >
                      <div className="flex items-center gap-2 lg:gap-2.5 min-w-0">
                        <button
                          onClick={() => handleView(transaction)}
                          className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            transaction.type === 'income' ? 'bg-lime/10' : 'bg-orange-500/10'
                          }`}
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-lime" />
                          ) : (
                            <TrendingDown className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-orange-400" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className="text-[11px] lg:text-xs font-medium text-text-primary truncate">{transaction.description}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-text-secondary">{transaction.category}</span>
                            <span className="text-[10px] text-text-secondary/50">|</span>
                            <span className="text-[10px] text-text-secondary">{formatDate(transaction.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 lg:gap-2 flex-shrink-0">
                        <span className={`text-[11px] lg:text-xs font-heading font-semibold font-tabular ${
                          transaction.type === 'income' ? 'text-lime' : 'text-text-primary'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="w-3.5 h-3.5 text-text-secondary" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-dark-card border-white/10" align="end">
                            <DropdownMenuItem onClick={() => handleView(transaction)} className="text-text-primary text-[11px]">
                              <Eye className="w-3 h-3 mr-2" />
                              View
                            </DropdownMenuItem>
                            {state.userRole === 'admin' && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(transaction)} className="text-text-primary text-[11px]">
                                  <Pencil className="w-3 h-3 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => void handleDelete(transaction.id)} className="text-red-400 text-[11px]">
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </div>


              {filteredTransactions.length > 10 && !isLoading && !error && (
                <Button
                  variant="ghost"
                  onClick={() => toast.info('Full History', { description: 'View all transactions feature coming soon!' })}
                  className="w-full mt-3 text-[11px] lg:text-xs text-text-secondary hover:text-lime hover:bg-lime/10"
                >
                  View all {filteredTransactions.length} transactions
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
