import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Toaster } from 'sonner';
import { DashboardProvider } from '@/context/DashboardContext';
import { Navigation } from '@/components/Navigation';
import { TransactionModal } from '@/components/TransactionModal';
import { HeroSection } from '@/sections/HeroSection';
import { ActivitySection } from '@/sections/ActivitySection';
import { SendMoneySection } from '@/sections/SendMoneySection';
import { CardsSection } from '@/sections/CardsSection';
import { TransactionsSection } from '@/sections/TransactionsSection';
import { AnalyticsSection } from '@/sections/AnalyticsSection';
import { RecurringSection } from '@/sections/RecurringSection';
import { SecuritySection } from '@/sections/SecuritySection';
import { CTASection } from '@/sections/CTASection';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  useEffect(() => {
    // Refresh ScrollTrigger on load
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, []);

  return (
    <DashboardProvider>
      <div className="relative min-h-screen overflow-x-hidden bg-dark-bg">
        <div className="site-ambient-glow" aria-hidden="true">
          <div className="site-glow site-glow-lime site-glow-top" />
          <div className="site-glow site-glow-blue site-glow-mid" />
          <div className="site-glow site-glow-lime site-glow-lower" />
          <div className="site-glow site-glow-orange site-glow-bottom" />
          <div className="site-gradient-wash" />
        </div>

        {/* Grain Overlay */}
        <div className="grain-overlay" />
        
        {/* Navigation */}
        <Navigation />
        
        {/* Main Content */}
        <main className="relative z-10">
          <div id="dashboard">
            <HeroSection />
          </div>
          <div id="features">
            <ActivitySection />
            <SendMoneySection />
            <CardsSection />
            <TransactionsSection />
            <AnalyticsSection />
            <RecurringSection />
          </div>
          <div id="security">
            <SecuritySection />
          </div>
          <div id="contact">
            <CTASection />
          </div>
        </main>
        
        {/* Transaction Modal */}
        <TransactionModal />
        
        {/* Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#0F0F14',
              border: '1px solid rgba(255,255,255,0.06)',
              color: '#F4F4F5',
              fontSize: '13px',
            },
            duration: 3000,
          }}
        />
      </div>
    </DashboardProvider>
  );
}

export default App;
