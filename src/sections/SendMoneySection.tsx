import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, ArrowRight, CheckCircle, History, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import { INR_SYMBOL } from '@/lib/currency';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

interface Recipient {
  id: string;
  name: string;
  handle: string;
  avatar: string;
}
//mock recipients for transfer
const recipients: Recipient[] = [
  { id: '1', name: 'Hemant Singh', handle: '@hemant.s', avatar: 'H' },
  { id: '2', name: 'Aman', handle: '@aman.t', avatar: 'A' },
  { id: '3', name: 'Parth', handle: '@parth.s', avatar: 'P' },
  { id: '4', name: 'Aditya', handle: '@aditya.s', avatar: 'A' },
];

const quickAmounts = ['50', '100', '250', '500', '1000'];

export function SendMoneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { state, addTransaction, isSaving } = useDashboard();
  const [amount, setAmount] = useState('425.00');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient>(recipients[0]);
  const [showRecipientDropdown, setShowRecipientDropdown] = useState(false);

  const recentTransfers = useMemo(
    () =>
      state.transactions
        .filter(
          (transaction) =>
            transaction.type === 'expense' &&
            transaction.description.startsWith('Transfer to ')
        )
        .slice(0, 3)
        .map((transaction) => ({
          id: transaction.id,
          amount: transaction.amount,
          recipient: transaction.recipient ?? transaction.description.replace('Transfer to ', ''),
          date: new Date(transaction.date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          }),
        })),
    [state.transactions]
  );

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    //animate section on scroll using gsap
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

  //handler for send button click
  const handleSend = async () => {
    const numAmount = parseFloat(amount);

    if (state.userRole !== 'admin') {
      toast.error('Switch to admin mode to record a transfer');
      return;
    }

    //validation for amount input
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    //limit transfer amount to 10,000 for demo purposes
    if (numAmount > 10000) {
      toast.error(`Maximum transfer amount is ${INR_SYMBOL}10,000`);
      return;
    }

    setIsSending(true);

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      await addTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: numAmount,
        category: 'Other',
        type: 'expense',
        description: `Transfer to ${selectedRecipient.name}`,
        recipient: selectedRecipient.name,
      });

      setSent(true);

      //show success with transfer details
      toast.success('Transfer completed!', {
        description: `${INR_SYMBOL}${amount} sent to ${selectedRecipient.name}`,
      });

      window.setTimeout(() => {
        setSent(false);
        setAmount('');
      }, 3000);
    } catch (sendError) {
      toast.error(sendError instanceof Error ? sendError.message : 'Unable to complete transfer');
    } finally {
      setIsSending(false);
    }
  };

  //format amount for only numbers and 2 decimal places 
  const formatDisplayAmount = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return cleaned;
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-12 sm:py-16 lg:py-24 bg-dark-bg"
    >
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-center lg:text-left space-y-4 lg:space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold leading-tight text-text-primary">
              Send money without
              <span className="text-lime"> the friction.</span>
            </h2>

            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto lg:mx-0 leading-relaxed">
              Enter an amount, pick a recipient, confirm. Transfers settle fast without
              the usual fees hiding in the fine print.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button variant="outline" className="group">
                How it Works{' '}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 max-w-sm mx-auto lg:mx-0">
              {[
                { label: 'Instant', desc: 'Transfers' },
                { label: `${INR_SYMBOL}0`, desc: 'Fees' },
                { label: '24/7', desc: 'Support' },
              ].map((item, i) => (
                <div key={i} className="text-center p-2 rounded-lg bg-dark-elevated/30">
                  <p className="text-sm font-semibold text-lime">{item.label}</p>
                  <p className="text-[10px] text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end w-full">
            <div className="glass-card rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-7 w-full max-w-md mx-auto card-shadow">
              <div className="flex items-center gap-2 lg:gap-3 mb-5 lg:mb-6">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-lime/10 flex items-center justify-center flex-shrink-0">
                  <Send className="w-4 h-4 lg:w-5 lg:h-5 text-lime" />
                </div>
                <div>
                  <h3 className="text-sm lg:text-lg font-heading font-semibold text-text-primary">Send Money</h3>
                  <p className="text-[10px] lg:text-xs text-text-secondary">Fast & secure transfers</p>
                </div>
              </div>

              <div className="mb-4 lg:mb-5">
                <label className="text-xs lg:text-sm text-text-secondary mb-2 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-xl lg:text-2xl text-text-secondary font-light">{INR_SYMBOL}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(formatDisplayAmount(e.target.value))}
                    placeholder="0.00"
                    className="w-full bg-dark-elevated border border-white/[0.06] rounded-xl lg:rounded-2xl py-3 lg:py-4 pl-9 lg:pl-10 pr-3 lg:pr-4 text-2xl lg:text-3xl font-heading font-semibold font-tabular text-text-primary focus:outline-none focus:border-lime/50 transition-colors placeholder:text-text-secondary/30"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs rounded-lg border transition-all ${
                        amount === amt
                          ? 'bg-lime/20 border-lime/50 text-lime'
                          : 'bg-dark-elevated border-white/[0.06] text-text-secondary hover:text-lime hover:border-lime/30'
                      }`}
                    >
                      {INR_SYMBOL}{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 lg:mb-5">
                <label className="text-xs lg:text-sm text-text-secondary mb-2 block">To</label>
                <div className="relative">
                  <button
                    onClick={() => setShowRecipientDropdown(!showRecipientDropdown)}
                    className="w-full flex items-center gap-2 lg:gap-3 p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-dark-elevated border border-white/[0.04] hover:border-lime/30 transition-colors text-left"
                  >
                    <div className="w-9 h-9 lg:w-11 lg:h-11 rounded-full bg-gradient-to-br from-lime/30 to-lime/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm lg:text-base font-semibold text-lime">{selectedRecipient.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm lg:font-medium text-text-primary truncate">{selectedRecipient.name}</p>
                      <p className="text-[10px] lg:text-xs text-text-secondary">{selectedRecipient.handle}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${showRecipientDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showRecipientDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-white/10 rounded-xl overflow-hidden z-20 shadow-xl">
                      {recipients.map((recipient) => (
                        <button
                          key={recipient.id}
                          onClick={() => {
                            setSelectedRecipient(recipient);
                            setShowRecipientDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2 lg:gap-3 p-2.5 lg:p-3 hover:bg-white/5 transition-colors ${
                            selectedRecipient.id === recipient.id ? 'bg-lime/10' : ''
                          }`}
                        >
                          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-lime/30 to-lime/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs lg:text-sm font-semibold text-lime">{recipient.avatar}</span>
                          </div>
                          <div className="text-left">
                            <p className="text-xs lg:text-sm font-medium text-text-primary">{recipient.name}</p>
                            <p className="text-[10px] text-text-secondary">{recipient.handle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-3 lg:py-4 border-t border-white/[0.04] mb-4 lg:mb-5">
                <span className="text-xs lg:text-sm text-text-secondary">Transfer Fee</span>
                <span className="text-base lg:text-lg font-heading font-semibold font-tabular text-lime">{INR_SYMBOL}0.00</span>
              </div>

              <Button
                onClick={() => void handleSend()}
                disabled={isSending || isSaving || sent || !amount}
                className={`w-full font-medium py-3 lg:py-4 h-auto rounded-xl transition-all duration-300 disabled:opacity-50 text-sm lg:text-base ${
                  sent
                    ? 'bg-lime text-dark-bg'
                    : 'bg-lime text-dark-bg hover:bg-lime-light hover:shadow-glow'
                }`}
              >
                {sent ? (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    Sent Successfully!
                  </span>
                ) : isSending || isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-dark-bg/30 border-t-dark-bg rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Money
                  </span>
                )}
              </Button>

              {state.userRole !== 'admin' && (
                <p className="mt-2 text-[10px] text-text-secondary text-center">
                  Switch to admin mode to record transfers in transaction history.
                </p>
              )}

              
              {recentTransfers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <History className="w-3 h-3 text-text-secondary" />
                    <span className="text-[10px] text-text-secondary">Recent</span>
                  </div>
                  <div className="space-y-1.5">
                    {recentTransfers.map((transfer) => (
                      <div key={transfer.id} className="flex justify-between items-center text-xs gap-3">
                        <div className="min-w-0">
                          <span className="block text-text-secondary truncate">To {transfer.recipient}</span>
                          <span className="block text-[10px] text-text-secondary/60">{transfer.date}</span>
                        </div>
                        <span className="font-tabular text-text-primary">
                          {INR_SYMBOL}{transfer.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}