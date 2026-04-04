import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BarChart3,
  ArrowRight,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  IndianRupee,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { formatCompactCurrency, formatCurrency } from '@/lib/currency';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

export function AnalyticsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  //toggle between charts
  const [activeChart, setActiveChart] = useState<'trend' | 'breakdown'>('trend');
  //dashboard data
  const {
    summary,
    monthlyData,
    categorySpending,
    isLoading,
    error,
    refreshDashboard,
    highestSpendingCategory,
    monthlyComparison,
  } = useDashboard();

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    //simple animation on scroll
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

  //reshape monthlyData for charts
  const chartData = monthlyData.map((datum) => ({
    name: datum.month,
    income: datum.income,
    expense: datum.expense,
  }));

  //colors for pie chart slices
  const pieColors = ['#B6FF2E', '#3b82f6', '#f97316', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b'];
  const pieData = categorySpending.slice(0, 7).map((category, index) => ({
    name: category.category,
    value: category.amount,
    percentage: category.percentage,
    color: pieColors[index % pieColors.length],
  }));

  //determine spending trends 
  const comparisonDirection =
    monthlyComparison.change > 0 ? 'up' : monthlyComparison.change < 0 ? 'down' : 'flat';
  const comparisonTone =
    comparisonDirection === 'up'
      ? 'text-orange-400'
      : comparisonDirection === 'down'
        ? 'text-lime'
        : 'text-text-primary';

        //insight text
  const observation = highestSpendingCategory
    ? `${highestSpendingCategory.category} is your highest spending category at ${highestSpendingCategory.percentage}% of total expenses.`
    : 'Add a few expenses to unlock category-level spending insights.';
  const recommendation =
    comparisonDirection === 'up'
      ? 'Spending is trending higher than last month. Review your largest category before it compounds.'
      : comparisonDirection === 'down'
        ? 'Spending is lower than last month. Consider moving the difference into savings.'
        : 'Spending is stable month over month, which is a good baseline for planning ahead.';

        //refresh chart on data change
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-card border border-white/10 rounded-lg p-2.5 shadow-card">
          <p className="text-xs font-medium text-text-primary mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-[10px]" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  //custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-dark-card border border-white/10 rounded-lg p-2 shadow-card">
          <p className="text-xs font-medium text-text-primary">{data.name}</p>
          <p className="text-[10px] text-lime">
            {formatCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }

    return null;
  };

  //placeholder for export functionality
  const exportChart = () => {
    toast.info('Export Chart', { description: 'Chart export feature coming soon!' });
  };

  return (
    <section ref={sectionRef} className="relative w-full py-12 sm:py-16 lg:py-24 bg-dark-bg">
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="order-2 lg:order-1">
            <div className="glass-card rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 w-full max-w-lg mx-auto card-shadow">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-lime" />
                  </div>
                  <div>
                    <h3 className="text-sm lg:text-lg font-heading font-semibold text-text-primary">Analytics</h3>
                    <p className="text-[10px] lg:text-xs text-text-secondary">Financial insights</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveChart('trend')}
                    className={`h-7 lg:h-8 px-2 ${activeChart === 'trend' ? 'bg-lime/10 text-lime' : 'text-text-secondary'}`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveChart('breakdown')}
                    className={`h-7 lg:h-8 px-2 ${activeChart === 'breakdown' ? 'bg-lime/10 text-lime' : 'text-text-secondary'}`}
                  >
                    <PieChart className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={exportChart}
                    className="h-7 lg:h-8 px-2 text-text-secondary hover:text-lime"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="h-40 sm:h-44 lg:h-52 mb-3 lg:mb-4">
                {isLoading ? (
                  <div className="h-full rounded-xl border border-white/[0.04] bg-dark-elevated/30 flex items-center justify-center text-xs text-text-secondary">
                    Loading analytics...
                  </div>
                ) : error ? (
                  <div className="h-full rounded-xl border border-white/[0.04] bg-dark-elevated/30 flex flex-col items-center justify-center gap-2 px-4 text-center">
                    <p className="text-xs text-text-secondary">Could not load analytics data.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void refreshDashboard()}
                      className="border-white/10 text-[11px] h-7 px-3"
                    >
                      Retry
                    </Button>
                  </div>
                ) : activeChart === 'trend' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#B6FF2E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#B6FF2E" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A1A1AA', fontSize: 9 }} />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#A1A1AA', fontSize: 9 }}
                        tickFormatter={(value) => formatCompactCurrency(value)}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="income" stroke="#B6FF2E" strokeWidth={2} fillOpacity={1} fill="url(#incomeGradient)" name="Income" />
                      <Area type="monotone" dataKey="expense" stroke="#fb923c" strokeWidth={2} fillOpacity={1} fill="url(#expenseGradient)" name="Expense" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {activeChart === 'trend' ? (
                <div className="flex items-center justify-center gap-4 lg:gap-6 pt-2 lg:pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-lime" />
                    <span className="text-[10px] lg:text-xs text-text-secondary">Income</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="text-[10px] lg:text-xs text-text-secondary">Expense</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-1.5 lg:gap-2 pt-2 lg:pt-3 border-t border-white/[0.04]">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[9px] lg:text-[10px] text-text-secondary">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 lg:mt-4 pt-2 lg:pt-3 border-t border-white/[0.04]">
                <p className="text-[10px] lg:text-xs text-text-secondary uppercase tracking-wider mb-2">Top Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {categorySpending.slice(0, 4).map((category) => (
                    <button
                      key={category.category}
                      onClick={() =>
                        toast.info(category.category, {
                          description: `${formatCurrency(category.amount)} spent (${category.percentage}%)`,
                        })
                      }
                      className="px-2 lg:px-2.5 py-1 rounded-full bg-dark-elevated border border-white/[0.04] text-[10px] lg:text-xs text-text-primary hover:border-lime/30 transition-colors"
                    >
                      {category.category} <span className="text-lime ml-0.5">{category.percentage}%</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-right space-y-4 lg:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold leading-tight text-text-primary">
              Insights that help
              <span className="text-lime"> you decide.</span>
            </h2>

            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto lg:ml-auto lg:mr-0 leading-relaxed">
              Spot trends before they become problems. Compare months, see top categories,
              and plan ahead with numbers you trust.
            </p>

            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              <div className="p-3 rounded-xl bg-dark-elevated/50 border border-white/[0.04] text-center">
                <IndianRupee className="w-4 h-4 text-lime mx-auto mb-1" />
                <p className="text-xs text-text-secondary mb-1">Income</p>
                <p className="text-sm font-semibold text-lime">{formatCurrency(summary.totalIncome)}</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-elevated/50 border border-white/[0.04] text-center">
                <TrendingDown className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <p className="text-xs text-text-secondary mb-1">Expenses</p>
                <p className="text-sm font-semibold text-orange-400">{formatCurrency(summary.totalExpenses)}</p>
              </div>

              <div className="p-3 rounded-xl bg-dark-elevated/50 border border-white/[0.04] text-center">
                <Calendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-text-secondary mb-1">Net</p>
                <p className={`text-sm font-semibold ${summary.totalBalance >= 0 ? 'text-lime' : 'text-red-400'}`}>
                  {formatCurrency(summary.totalBalance)}
                </p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/[0.04] max-w-md mx-auto lg:ml-auto lg:mr-0 text-left">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-text-secondary">Insights</p>
                  <h3 className="text-base font-heading font-semibold text-text-primary mt-1">
                    What stands out this month
                  </h3>
                </div>
                <div className={`text-xs font-semibold ${comparisonTone}`}>
                  {comparisonDirection === 'up' && 'Spending Up'}
                  {comparisonDirection === 'down' && 'Spending Down'}
                  {comparisonDirection === 'flat' && 'Stable'}
                </div>
              </div>

              {isLoading ? (
                <p className="text-sm text-text-secondary">Loading insights...</p>
              ) : error ? (
                <div className="space-y-3">
                  <p className="text-sm text-text-secondary">Insights are temporarily unavailable.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refreshDashboard()}
                    className="border-white/10 text-xs"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-xl bg-dark-elevated/40 border border-white/[0.04] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Highest Category</p>
                      <p className="text-sm font-semibold text-text-primary">
                        {highestSpendingCategory?.category ?? 'No expense data yet'}
                      </p>
                      <p className="text-[11px] text-lime mt-1">
                        {highestSpendingCategory
                          ? `${highestSpendingCategory.percentage}% of expenses`
                          : 'Add expenses to unlock this insight'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-dark-elevated/40 border border-white/[0.04] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Month Comparison</p>
                      <p className={`text-sm font-semibold ${comparisonTone}`}>
                        {monthlyComparison.previous > 0
                          ? `${Math.abs(monthlyComparison.change).toFixed(1)}% ${comparisonDirection === 'up' ? 'higher' : comparisonDirection === 'down' ? 'lower' : 'change'}`
                          : 'No prior month baseline'}
                      </p>
                      <p className="text-[11px] text-text-secondary mt-1">
                        {formatCurrency(monthlyComparison.current)} this month
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-lime/5 border border-lime/10 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-lime mb-1">Observation</p>
                    <p className="text-sm text-text-primary">{observation}</p>
                  </div>

                  <div className="rounded-xl bg-dark-elevated/40 border border-white/[0.04] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-text-secondary mb-1">Recommendation</p>
                    <p className="text-sm text-text-primary">{recommendation}</p>
                  </div>
                </div>
              )}
            </div>

            
            <Button variant="outline" className="group">
              View Full Analytics{" "}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
