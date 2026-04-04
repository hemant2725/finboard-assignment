import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CreditCard, ArrowRight, Lock, Unlock, Copy, Eye, EyeOff, RefreshCw, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

interface Card {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  frozen: boolean;
  onlineEnabled: boolean;
  weeklyLimit: number;
  weeklySpent: number;
  color: string;
}

export function CardsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<Card[]>([
    {
      id: '1',
      number: '0123 4567 8901 2345',
      holder: 'Hemant Singh',
      expiry: '09/28',
      cvv: '***',
      frozen: false,
      onlineEnabled: true,
      weeklyLimit: 4000,
      weeklySpent: 2600,
      color: 'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    },
  ]);
  const [activeCard] = useState(0);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

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

  const currentCard = cards[activeCard];
//toggle freeze state of the card and show notification
  const handleFreezeToggle = () => {
    const newFrozen = !currentCard.frozen;
    setCards(prev => prev.map((c, i) => i === activeCard ? { ...c, frozen: newFrozen } : c));
    toast.info(newFrozen ? 'Card frozen' : 'Card unfrozen', {
      description: newFrozen ? 'Your card has been temporarily frozen' : 'Your card is now active',
    });
  };

  //toggle online payment state
  const handleOnlineToggle = () => {
    const newOnline = !currentCard.onlineEnabled;
    setCards(prev => prev.map((c, i) => i === activeCard ? { ...c, onlineEnabled: newOnline } : c));
    toast.info(newOnline ? 'Online payments enabled' : 'Online payments disabled');
  };

  const copyCardNumber = () => {
    navigator.clipboard.writeText(currentCard.number.replace(/\s/g, ''));
    toast.success('Card number copied to clipboard');
  };

  const copyCVV = () => {
    navigator.clipboard.writeText('123');
    toast.success('CVV copied to clipboard');
  };

  const replaceCard = () => {
    toast.info('Replace Card', { description: 'This feature will be available soon!' });
  };

  const addNewCard = () => {
    toast.info('Add New Card', { description: 'This feature will be available soon!' });
  };

  const weeklyPercentage = Math.min((currentCard.weeklySpent / currentCard.weeklyLimit) * 100, 100);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-24 bg-dark-bg"
    >
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="order-2 lg:order-1">
            <div className="glass-card rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-7 w-full max-w-lg mx-auto card-shadow">
              <div className="flex items-center justify-between mb-4 lg:mb-5">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-4 h-4 lg:w-5 lg:h-5 text-lime" />
                  </div>
                  <div>
                    <h3 className="text-sm lg:text-lg font-heading font-semibold text-text-primary">My Cards</h3>
                    <p className="text-[10px] lg:text-xs text-text-secondary">{cards.length} active</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addNewCard}
                  className="h-8 px-2 text-lime hover:bg-lime/10"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  <span className="text-xs">Add</span>
                </Button>
              </div>

              <div
                className={`relative mb-4 lg:mb-5 rounded-xl lg:rounded-2xl p-5 lg:p-6 overflow-hidden transition-all duration-500 ${
                  currentCard.frozen ? 'opacity-60 grayscale' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                }}
              >
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 right-0 w-40 lg:w-48 h-40 lg:h-48 bg-lime/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-28 lg:w-32 h-28 lg:h-32 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6 lg:mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-6 lg:w-10 lg:h-7 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded" />
                      <span className="text-[10px] text-white/50">Debit</span>
                    </div>
                    {currentCard.frozen && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-400 text-[10px]">
                        <Lock className="w-3 h-3" />
                        Frozen
                      </div>
                    )}
                  </div>

                  <div className="mb-5 lg:mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-lg sm:text-xl lg:text-2xl font-heading font-tabular tracking-wider text-white/90">
                        {showCardNumber ? currentCard.number : '**** **** **** ' + currentCard.number.slice(-4)}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setShowCardNumber(!showCardNumber)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        title={showCardNumber ? 'Hide number' : 'Show number'}
                      >
                        {showCardNumber ? <EyeOff className="w-3 h-3 text-white/70" /> : <Eye className="w-3 h-3 text-white/70" />}
                      </button>
                      <button
                        onClick={copyCardNumber}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                        title="Copy card number"
                      >
                        <Copy className="w-3 h-3 text-white/70" />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Card Holder</p>
                      <p className="text-xs lg:text-sm font-medium text-white/90 tracking-wider">{currentCard.holder}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">Expires</p>
                      <p className="text-xs lg:text-sm font-medium text-white/90 font-tabular">{currentCard.expiry}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/50 uppercase tracking-wider mb-0.5">CVV</p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs lg:text-sm font-medium text-white/90 font-tabular">{showCVV ? '123' : '***'}</p>
                        <button
                          onClick={() => setShowCVV(!showCVV)}
                          className="p-0.5 rounded hover:bg-white/10 transition-colors"
                        >
                          {showCVV ? <EyeOff className="w-3 h-3 text-white/50" /> : <Eye className="w-3 h-3 text-white/50" />}
                        </button>
                        <button
                          onClick={copyCVV}
                          className="p-0.5 rounded hover:bg-white/10 transition-colors"
                        >
                          <Copy className="w-3 h-3 text-white/50" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 lg:space-y-3">
                <div className="flex items-center justify-between p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-dark-elevated/50 border border-white/[0.04]">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 ${currentCard.frozen ? 'bg-red-500/10' : 'bg-lime/10'}`}>
                      {currentCard.frozen ? <Lock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-red-400" /> : <Unlock className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-lime" />}
                    </div>
                    <div>
                      <span className="text-xs lg:text-sm text-text-primary block">{currentCard.frozen ? 'Frozen' : 'Active'}</span>
                      <span className="text-[10px] text-text-secondary">{currentCard.frozen ? 'Tap to unfreeze' : 'Tap to freeze'}</span>
                    </div>
                  </div>
                  <Switch
                    checked={!currentCard.frozen}
                    onCheckedChange={handleFreezeToggle}
                    className="border-white/10 data-[state=checked]:bg-lime data-[state=checked]:border-lime/30 data-[state=unchecked]:bg-red-500/25 data-[state=unchecked]:border-red-500/30"
                  />
                </div>

                <div className="flex items-center justify-between p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-dark-elevated/50 border border-white/[0.04]">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 ${currentCard.onlineEnabled ? 'bg-blue-500/10' : 'bg-gray-500/10'}`}>
                      <CreditCard className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${currentCard.onlineEnabled ? 'text-blue-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <span className="text-xs lg:text-sm text-text-primary block">Online Payments</span>
                      <span className="text-[10px] text-text-secondary">{currentCard.onlineEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  <Switch
                    checked={currentCard.onlineEnabled}
                    onCheckedChange={handleOnlineToggle}
                    className="border-white/10 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-400/30 data-[state=unchecked]:bg-white/10 data-[state=unchecked]:border-white/10"
                  />
                </div>

                <div className="p-2.5 lg:p-3 rounded-xl lg:rounded-2xl bg-dark-elevated/50 border border-white/[0.04]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs lg:text-sm text-text-secondary">Weekly Limit</span>
                    <span className="text-xs lg:text-sm font-medium font-tabular text-text-primary">
                      {formatCurrency(currentCard.weeklyLimit)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-dark-elevated overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        weeklyPercentage > 80 ? 'bg-red-500' : weeklyPercentage > 50 ? 'bg-orange-400' : 'bg-lime'
                      }`}
                      style={{ width: `${weeklyPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-text-secondary">{formatCurrency(currentCard.weeklySpent)} spent</span>
                    <span className="text-[10px] text-text-secondary">{Math.round(weeklyPercentage)}%</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={replaceCard}
                    className="flex-1 border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 text-xs h-9"
                  >
                    <RefreshCw className="w-3 h-3 mr-1.5" />
                    Replace
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info('Settings', { description: 'Card settings coming soon!' })}
                    className="flex-1 border-white/10 text-text-secondary hover:text-text-primary hover:bg-white/5 text-xs h-9"
                  >
                    <Settings className="w-3 h-3 mr-1.5" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-right space-y-4 lg:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold leading-tight text-text-primary">
              Cards that keep you
              <span className="text-lime"> in control.</span>
            </h2>

            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto lg:ml-auto lg:mr-0 leading-relaxed">
              Freeze, unfreeze, or replace instantly. Set spending limits per card
              and get notified the moment a charge hits.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
             
              <Button variant="outline" className="group">
              Manage cards{" "}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {['Instant freeze/unfreeze', 'Spending limits', 'Real-time notifications'].map((feature, i) => (
                <div key={i} className="flex items-center gap-2 justify-center lg:justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime" />
                  <span className="text-xs text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
