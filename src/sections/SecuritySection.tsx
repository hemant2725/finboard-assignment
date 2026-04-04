import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Lock, Eye, HeadphonesIcon, ShieldCheck, Fingerprint, Server, ChevronRight, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const securityFeatures = [
  {
    icon: Lock,
    title: 'Encryption',
    description: 'Your data is encrypted at rest and in transit with modern AES-256 standards. Bank-level security for your peace of mind.',
    color: 'lime',
    details: ['AES-256 encryption', 'TLS 1.3 protocol', 'End-to-end security'],
  },
  {
    icon: Eye,
    title: 'Privacy Control',
    description: 'Turn features on or off. You decide what\'s shared and when. Full transparency in every action we take.',
    color: 'blue',
    details: ['Granular permissions', 'Data export', 'Account deletion'],
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    description: 'Real help, fast. Chat or email with humans who actually troubleshoot. No bots, no waiting forever.',
    color: 'purple',
    details: ['Live chat', 'Email support', 'Phone support'],
  },
  {
    icon: ShieldCheck,
    title: 'Fraud Protection',
    description: 'Advanced algorithms detect suspicious activity and alert you instantly. Your money stays safe.',
    color: 'green',
    details: ['Real-time alerts', 'Transaction monitoring', 'Chargeback protection'],
  },
  {
    icon: Fingerprint,
    title: 'Biometric Auth',
    description: 'Secure your account with fingerprint or face recognition. Quick access without compromising security.',
    color: 'orange',
    details: ['Face ID', 'Touch ID', 'PIN backup'],
  },
  {
    icon: Server,
    title: 'Secure Backups',
    description: 'Your data is backed up across multiple secure locations. Never lose your financial history.',
    color: 'pink',
    details: ['Daily backups', 'Multi-region', '99.99% uptime'],
  },
];

export function SecuritySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const cards = cardsRef.current;

    if (!section || !headline || !cards) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(headline,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headline,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          }
        }
      );

      const cardElements = cards.querySelectorAll('.security-card');
      gsap.fromTo(cardElements,
        { y: 40, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cards,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const getColorClass = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      lime: { bg: 'bg-lime/10', text: 'text-lime', border: 'border-lime/30' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
      green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
      orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    };
    return colors[color] || colors.lime;
  };

  return (
    <section
      ref={sectionRef}
      id="security"
      className="relative w-full py-12 sm:py-16 lg:py-24 bg-dark-bg"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Headline */}
        <h2 
          ref={headlineRef}
          className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold text-center text-text-primary mb-10 lg:mb-16"
        >
          Built to protect your
          <span className="text-lime"> peace of mind.</span>
        </h2>

        {/* Cards Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            const colors = getColorClass(feature.color);
            const isExpanded = expandedCard === index;
            
            return (
              <div 
                key={index}
                onClick={() => setExpandedCard(isExpanded ? null : index)}
                className={`security-card glass-card rounded-xl lg:rounded-2xl p-4 lg:p-5 card-shadow cursor-pointer transition-all duration-300 ${
                  isExpanded ? `border ${colors.border}` : 'hover:border-lime/20'
                }`}
              >
                <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center mb-3 lg:mb-4 ${colors.bg}`}>
                  <Icon className={`w-5 h-5 lg:w-5 lg:h-5 ${colors.text}`} />
                </div>
                
                <h3 className="text-sm lg:text-base font-heading font-semibold text-text-primary mb-1.5 lg:mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-[11px] lg:text-xs text-text-secondary leading-relaxed mb-2">
                  {feature.description}
                </p>

                {/* Expandable details */}
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-2 border-t border-white/[0.04] mt-2">
                    <ul className="space-y-1">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                          <Check className={`w-3 h-3 ${colors.text}`} />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className={`flex items-center gap-1 mt-2 text-[10px] ${colors.text} transition-all ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
                  <span>Learn more</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-10 lg:mt-14 flex flex-wrap justify-center gap-4 lg:gap-6">
          {['SOC 2 Certified', 'GDPR Compliant', 'PCI DSS Level 1'].map((badge, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-elevated/50 border border-white/[0.04]">
              <ShieldCheck className="w-3.5 h-3.5 text-lime" />
              <span className="text-[10px] lg:text-xs text-text-secondary">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
