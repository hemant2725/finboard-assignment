import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Repeat, Target, Plus, Trash2, Edit3, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

export function RecurringSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { state, addRecurringItem, deleteRecurringItem, isLoading, error, refreshDashboard } = useDashboard();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecurring, setNewRecurring] = useState({ name: '', amount: '', category: 'Entertainment' });
  const canManageRecurring = state.userRole === 'admin';

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(content,
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
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!canManageRecurring && showAddModal) {
      setShowAddModal(false);
    }
  }, [canManageRecurring, showAddModal]);

  //helper to format next payment date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const daysLeft = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return 'Overdue';
    if (daysLeft === 0) return 'Today';
    if (daysLeft === 1) return 'Tomorrow';
    return `In ${daysLeft} days`;
  };

  const goalProgress = state.savingsGoal.target > 0
    ? (state.savingsGoal.current / state.savingsGoal.target) * 100
    : 0;
  const totalMonthly = state.recurring.reduce((sum, recurringItem) => sum + recurringItem.amount, 0);

  const deleteRecurring = async (id: string) => {
    if (confirm('Are you sure you want to remove this recurring payment?')) {
      try {
        await deleteRecurringItem(id);
        toast.success('Recurring payment removed');
      } catch (deleteError) {
        toast.error(deleteError instanceof Error ? deleteError.message : 'Unable to remove recurring payment');
      }
    }
  };

  //add new recurring item using form
  const addRecurring = async () => {
    if (!newRecurring.name || !newRecurring.amount) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await addRecurringItem({
        name: newRecurring.name,
        amount: parseFloat(newRecurring.amount),
        category: newRecurring.category as any,
        frequency: 'monthly',
        nextDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setNewRecurring({ name: '', amount: '', category: 'Entertainment' });
      setShowAddModal(false);
      toast.success('Recurring payment added');
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : 'Unable to add recurring payment');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Entertainment': 'bg-purple-500/10 text-purple-400',
      'Software': 'bg-blue-500/10 text-blue-400',
      'Health': 'bg-green-500/10 text-green-400',
      'Bills': 'bg-orange-500/10 text-orange-400',
    };
    return colors[category] || 'bg-gray-500/10 text-gray-400';
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-24 bg-dark-bg"
    >
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="text-center lg:text-left space-y-4 lg:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold leading-tight text-text-primary">
              Automate the
              <span className="text-lime"> predictable.</span>
            </h2>

            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto lg:mx-0 leading-relaxed">
              Track subscriptions and recurring bills in one place. Add savings goals
              and watch progress without extra spreadsheets.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {canManageRecurring && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-lime text-dark-bg hover:bg-lime-light font-medium px-5 lg:px-6 py-2.5 lg:py-3 h-auto rounded-xl transition-all duration-300 hover:shadow-glow text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Recurring
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 max-w-xs mx-auto lg:mx-0">
              <div className="p-2.5 rounded-lg bg-dark-elevated/30 text-center">
                <Repeat className="w-4 h-4 text-lime mx-auto mb-1" />
                <p className="text-lg font-heading font-bold text-text-primary">{isLoading ? '...' : state.recurring.length}</p>
                <p className="text-[10px] text-text-secondary">Subscriptions</p>
              </div>
              <div className="p-2.5 rounded-lg bg-dark-elevated/30 text-center">
                <CreditCard className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                <p className="text-lg font-heading font-bold text-orange-400">{formatCurrency(totalMonthly)}</p>
                <p className="text-[10px] text-text-secondary">Monthly</p>
              </div>
            </div>
          </div>

          <div className="lg:justify-self-end w-full">
            <div className="glass-card rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 w-full max-w-lg mx-auto card-shadow">
              <div className="flex items-center justify-between mb-3 lg:mb-4">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0">
                    <Repeat className="w-4 h-4 lg:w-5 lg:h-5 text-lime" />
                  </div>
                  <div>
                    <h3 className="text-sm lg:text-lg font-heading font-semibold text-text-primary">Recurring</h3>
                    <p className="text-[10px] lg:text-xs text-text-secondary">
                      {error ? 'Sync issue' : isLoading ? 'Loading...' : 'Subscriptions & bills'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] lg:text-xs text-text-secondary uppercase tracking-wider">Monthly</p>
                  <p className="text-base lg:text-xl font-heading font-semibold font-tabular text-orange-400">
                    {formatCurrency(totalMonthly)}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4 lg:mb-5">
                {isLoading ? (
                  <div className="rounded-xl border border-white/[0.04] bg-dark-elevated/40 px-4 py-8 text-center">
                    <p className="text-sm text-text-secondary">Loading recurring payments...</p>
                  </div>
                ) : error ? (
                  <div className="rounded-xl border border-white/[0.04] bg-dark-elevated/40 px-4 py-8 text-center">
                    <p className="text-sm text-text-secondary">Unable to load recurring items.</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void refreshDashboard()}
                      className="mt-3 text-xs text-lime hover:bg-lime/10"
                    >
                      Retry
                    </Button>
                  </div>
                ) : state.recurring.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/[0.08] bg-dark-elevated/20 px-4 py-8 text-center">
                    <p className="text-sm text-text-secondary">No recurring payments yet.</p>
                    <p className="mt-1 text-[11px] text-text-secondary/60">
                      {canManageRecurring ? 'Add a subscription to start tracking bills.' : 'Switch to admin to add subscriptions.'}
                    </p>
                  </div>
                ) : (
                  state.recurring.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 lg:p-2.5 rounded-lg bg-dark-elevated/50 border border-white/[0.04] group hover:border-lime/20 transition-colors"
                    >
                      <div className="flex items-center gap-2 lg:gap-2.5 min-w-0">
                        <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-semibold ${getCategoryColor(item.category)}`}>
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] lg:text-xs font-medium text-text-primary truncate">{item.name}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] lg:text-[10px] text-text-secondary">{item.category}</span>
                            <span className="text-[9px] text-text-secondary/50">|</span>
                            <span className="text-[9px] lg:text-[10px] text-lime">{formatDate(item.nextDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="text-[11px] lg:text-xs font-heading font-semibold font-tabular text-text-primary">
                          {formatCurrency(item.amount)}
                        </p>
                        {canManageRecurring && (
                          <button
                            onClick={() => void deleteRecurring(item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {canManageRecurring && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(true)}
                  className="w-full mb-4 lg:mb-5 border-dashed border-white/10 text-text-secondary hover:text-lime hover:border-lime/30 hover:bg-lime/5 text-xs h-9"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add recurring payment
                </Button>
              )}

              <div className="pt-3 lg:pt-4 border-t border-white/[0.04]">
                <div className="flex items-center justify-between mb-2 lg:mb-3">
                  <div className="flex items-center gap-2 lg:gap-2.5">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0">
                      <Target className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-lime" />
                    </div>
                    <div>
                      <p className="text-[11px] lg:text-xs font-medium text-text-primary">{state.savingsGoal.name}</p>
                      <p className="text-[9px] lg:text-[10px] text-text-secondary">
                        {formatCurrency(state.savingsGoal.current)} of {formatCurrency(state.savingsGoal.target)}
                      </p>
                    </div>
                  </div>
                  {canManageRecurring && (
                    <button
                      onClick={() => toast.info('Edit Goal', { description: 'Goal editing coming soon!' })}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Edit3 className="w-3 h-3 text-text-secondary" />
                    </button>
                  )}
                </div>

                <div className="h-2 lg:h-2.5 rounded-full bg-dark-elevated overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-lime to-lime-dark transition-all duration-1000"
                    style={{ width: `${Math.min(goalProgress, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-text-secondary">{Math.round(goalProgress)}% saved</span>
                  <span className="text-[10px] text-lime">
                    {formatCurrency(state.savingsGoal.target - state.savingsGoal.current)} to go
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {canManageRecurring && showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-card border border-white/10 rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">Add Recurring Payment</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Name</label>
                <input
                  type="text"
                  value={newRecurring.name}
                  onChange={(e) => setNewRecurring({ ...newRecurring, name: e.target.value })}
                  placeholder="e.g., Spotify"
                  className="w-full px-3 py-2 bg-dark-elevated border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-lime/50"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Amount</label>
                <input
                  type="number"
                  value={newRecurring.amount}
                  onChange={(e) => setNewRecurring({ ...newRecurring, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-dark-elevated border border-white/[0.06] rounded-lg text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-lime/50"
                />
              </div>
              <div>
                <label className="text-xs text-text-secondary mb-1 block">Category</label>
                <select
                  value={newRecurring.category}
                  onChange={(e) => setNewRecurring({ ...newRecurring, category: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-elevated border border-white/[0.06] rounded-lg text-sm text-text-primary focus:outline-none focus:border-lime/50"
                >
                  {['Entertainment', 'Software', 'Health', 'Bills', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
                className="flex-1 border-white/10 text-text-primary hover:bg-white/5 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void addRecurring()}
                className="flex-1 bg-lime text-dark-bg hover:bg-lime-light text-xs"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
