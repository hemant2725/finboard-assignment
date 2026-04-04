import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, Mail, User, MessageSquare, CheckCircle, ArrowUpRight, Loader2, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(content,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  //form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Request submitted!', {
      description: 'We\'ll get back to you within 24 hours.',
    });

    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 5000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative w-full py-12 sm:py-16 lg:py-24"
    >
      <div ref={contentRef} className="max-w-xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center space-y-5 lg:space-y-8">
          <div className="space-y-2 lg:space-y-3">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading font-bold text-text-primary">
              Ready to simplify your
              <span className="text-lime"> money?</span>
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Get early access to Dashboard. We&apos;ll reply within 24 hours.
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3 lg:space-y-4 text-left">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`pl-10 py-2.5 bg-dark-card border text-text-primary placeholder:text-text-secondary/50 rounded-xl text-sm ${
                    errors.name ? 'border-red-500/50' : 'border-white/[0.06] focus:border-lime/50'
                  }`}
                />
                {errors.name && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.name}</p>}
              </div>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <Input
                  type="email"
                  placeholder="Your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 py-2.5 bg-dark-card border text-text-primary placeholder:text-text-secondary/50 rounded-xl text-sm ${
                    errors.email ? 'border-red-500/50' : 'border-white/[0.06] focus:border-lime/50'
                  }`}
                />
                {errors.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{errors.email}</p>}
              </div>

              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-text-secondary" />
                <textarea
                  placeholder="Tell us about your financial goals (optional)"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-dark-card border border-white/[0.06] text-text-primary placeholder:text-text-secondary/50 rounded-xl focus:outline-none focus:border-lime/50 resize-none min-h-[90px] text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-lime text-dark-bg hover:bg-lime-light font-medium py-2.5 h-auto rounded-xl transition-all duration-300 hover:shadow-glow disabled:opacity-50 text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Request access
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="py-8 lg:py-12 text-center">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-lime/10 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-7 h-7 lg:w-8 lg:h-8 text-lime" />
              </div>
              <h3 className="text-lg lg:text-xl font-heading font-semibold text-text-primary mb-2">You&apos;re on the list!</h3>
              <p className="text-sm text-text-secondary">We&apos;ll be in touch soon.</p>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-4">
            {[
              { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/zorvynfintech/' },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-dark-elevated/50 border border-white/[0.04] flex items-center justify-center text-text-secondary hover:text-lime hover:border-lime/30 transition-all"
                onClick={() => toast.info(`${label}`, { description: `Follow us on ${label}!` })}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>

          <div className="pt-6 lg:pt-8 border-t border-white/[0.04]">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4">
              {['Privacy Policy', 'Terms of Service', 'Support'].map((item) => (
                <button
                  key={item}
                  onClick={() => toast.info(item, { description: `${item} page coming soon!` })}
                  className="text-[10px] lg:text-xs text-text-secondary hover:text-lime transition-colors flex items-center gap-0.5"
                >
                  {item}
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              ))}
            </div>
            <p className="text-[10px] lg:text-xs text-text-secondary/60">
              Copyright 2026 FinDashboard. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
