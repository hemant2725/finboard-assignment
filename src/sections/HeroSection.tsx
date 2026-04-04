import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Wallet, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { summary, isLoading, error } = useDashboard();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    setIsVisible(true);

    const ctx = gsap.context(() => {
      gsap.fromTo(content.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.2
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  //smooth scroll for nav buttons
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  //smooth scroll for contact button
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  //calculate budget usage percentage
  const budgetPercentage = summary.monthlyBudget > 0
    ? Math.min((summary.monthlySpent / summary.monthlyBudget) * 100, 100)
    : 0;

  const renderMetric = (value: number) => {
    if (isLoading || error) return '--';
    return formatCurrency(value);
  };

  return (
    <section
      ref={sectionRef}
      id="dashboard"
      className="relative w-full min-h-screen bg-dark-bg pt-20 lg:pt-24 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-lime/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div ref={contentRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-12rem)]">
          <div className="space-y-5 lg:space-y-7 text-center lg:text-left">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime/10 border border-lime/20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Sparkles className="w-3.5 h-3.5 text-lime" />
              <span className="text-xs font-medium text-lime">Financial Dashboard</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold leading-[1.1] text-text-primary">
              All your balances in{' '}
              <span className="text-lime">one glance.</span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-text-secondary max-w-md mx-auto lg:mx-0 leading-relaxed">
              Connect accounts, cards, and wallets. FinDashboard shows a unified balance
              with instant updates, no spreadsheets needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                onClick={scrollToFeatures}
                className="bg-lime text-dark-bg hover:bg-lime-light font-medium px-5 lg:px-6 py-2.5 lg:py-3 h-auto rounded-xl transition-all duration-300 hover:shadow-glow group text-sm lg:text-base"
              >
                Explore Dashboard
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                onClick={scrollToContact}
                className="border-white/10 text-text-primary hover:bg-white/5 hover:border-lime/50 font-medium px-5 lg:px-6 py-2.5 lg:py-3 h-auto rounded-xl transition-all duration-300 text-sm lg:text-base"
              >
                Get Early Access
              </Button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-6 pt-4">
              <div className="text-center lg:text-left">
                <p className="text-2xl lg:text-3xl font-heading font-bold text-lime">{renderMetric(summary.totalBalance)}</p>
                <p className="text-xs text-text-secondary">Total Balance</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl lg:text-3xl font-heading font-bold text-text-primary">{renderMetric(summary.totalIncome)}</p>
                <p className="text-xs text-text-secondary">Total Income</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-2xl lg:text-3xl font-heading font-bold text-orange-400">{renderMetric(summary.totalExpenses)}</p>
                <p className="text-xs text-text-secondary">Total Expenses</p>
              </div>
            </div>
          </div>

          <div className="lg:justify-self-end">
            <div className="glass-card rounded-2xl lg:rounded-3xl p-5 lg:p-7 w-full max-w-md mx-auto card-shadow hover:border-lime/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-5 lg:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                  <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Overview
                  </span>
                </div>
                <span className="text-[10px] text-text-secondary">
                  {error ? 'Sync issue' : isLoading ? 'Syncing' : 'Live'}
                </span>
              </div>

              <div className="space-y-3 lg:space-y-4">
                <div className="flex flex-col items-start gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-dark-elevated/50 border border-white/[0.04] hover:border-lime/20 transition-colors cursor-pointer group min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between"
                  onClick={() => toast.info('Total Balance', { description: 'Your current total across all accounts' })}
                >
                  <div className="flex w-full min-w-0 items-center gap-2 lg:gap-3 min-[480px]:w-auto">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0 group-hover:bg-lime/20 transition-colors">
                      <Wallet className="w-4 h-4 lg:w-5 lg:h-5 text-lime" />
                    </div>
                    <span className="min-w-0 truncate text-xs lg:text-sm text-text-secondary">Total Balance</span>
                  </div>
                  <span className="w-full text-left text-base font-heading font-semibold font-tabular text-text-primary min-[480px]:w-auto min-[480px]:shrink-0 min-[480px]:pl-3 min-[480px]:text-right lg:text-lg">
                    {renderMetric(summary.totalBalance)}
                  </span>
                </div>

                <div className="flex flex-col items-start gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-dark-elevated/50 border border-white/[0.04] hover:border-blue-500/30 transition-colors cursor-pointer group min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between"
                  onClick={() => toast.info('Monthly Budget', { description: 'Your set budget for this month' })}
                >
                  <div className="flex w-full min-w-0 items-center gap-2 lg:gap-3 min-[480px]:w-auto">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                      <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400" />
                    </div>
                    <span className="min-w-0 truncate text-xs lg:text-sm text-text-secondary">Monthly Budget</span>
                  </div>
                  <span className="w-full text-left text-base font-heading font-semibold font-tabular text-text-primary min-[480px]:w-auto min-[480px]:shrink-0 min-[480px]:pl-3 min-[480px]:text-right lg:text-lg">
                    {renderMetric(summary.monthlyBudget)}
                  </span>
                </div>

                <div className="flex flex-col items-start gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-dark-elevated/50 border border-white/[0.04] hover:border-orange-500/30 transition-colors cursor-pointer group min-[480px]:flex-row min-[480px]:items-center min-[480px]:justify-between"
                  onClick={() => toast.info('Monthly Spent', { description: 'Amount spent this month' })}
                >
                  <div className="flex w-full min-w-0 items-center gap-2 lg:gap-3 min-[480px]:w-auto">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                      <TrendingDown className="w-4 h-4 lg:w-5 lg:h-5 text-orange-400" />
                    </div>
                    <span className="min-w-0 truncate text-xs lg:text-sm text-text-secondary">Monthly Spent</span>
                  </div>
                  <span className="w-full text-left text-base font-heading font-semibold font-tabular text-text-primary min-[480px]:w-auto min-[480px]:shrink-0 min-[480px]:pl-3 min-[480px]:text-right lg:text-lg">
                    {renderMetric(summary.monthlySpent)}
                  </span>
                </div>
              </div>

              <div className="mt-5 lg:mt-6 pt-4 lg:pt-5 border-t border-white/[0.04]">
                <div className="flex justify-between text-xs lg:text-sm mb-2">
                  <span className="text-text-secondary">Budget Usage</span>
                  <span className={`font-medium ${budgetPercentage > 80 ? 'text-red-400' : budgetPercentage > 50 ? 'text-orange-400' : 'text-lime'}`}>
                    {Math.round(budgetPercentage)}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-dark-elevated overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      budgetPercentage > 80 ? 'bg-red-500' : budgetPercentage > 50 ? 'bg-orange-400' : 'bg-gradient-to-r from-lime to-lime-dark'
                    }`}
                    style={{ width: `${budgetPercentage}%` }}
                  />
                </div>
                {budgetPercentage > 80 && (
                  <p className="text-[10px] text-red-400 mt-2">Budget alert: you&apos;re close to your monthly limit.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 animate-bounce">
          
        </div>
      </div>
    </section>
  );
}