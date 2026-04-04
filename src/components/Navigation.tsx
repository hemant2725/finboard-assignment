import { useState, useEffect } from 'react';
import { Menu, X, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/context/DashboardContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { state, setUserRole } = useDashboard();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = ['dashboard', 'features', 'security', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRoleChange = (role: string) => {
    setUserRole(role as 'viewer' | 'admin');
    setIsMobileMenuOpen(false);
    toast.info(`Switched to ${role} mode`, {
      description: role === 'admin' 
        ? 'You can now add, edit, and delete transactions' 
        : 'You can only view data',
    });
  };

  const navLinks = [
    { label: 'Dashboard', href: '#dashboard', id: 'dashboard' },
    { label: 'Features', href: '#features', id: 'features' },
    { label: 'Security', href: '#security', id: 'security' },
    { label: 'Contact', href: '#contact', id: 'contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled 
          ? 'bg-dark-bg/95 backdrop-blur-xl border-b border-white/[0.04] shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-14 lg:h-20">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('#dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="FinDashboard Logo"
              className="w-7 h-7 lg:w-8 lg:h-8 object-contain rounded-md" 
            />
            <span className="text-base lg:text-lg font-heading font-semibold text-text-primary">
              FinDashboard
            </span>
          </button>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeSection === link.id
                    ? 'text-lime bg-lime/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Role Switcher (Desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <Select value={state.userRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[100px] lg:w-[120px] bg-dark-card border-white/[0.06] text-text-primary text-xs lg:text-sm h-8 lg:h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={8}
                  className="z-[220] bg-dark-card border-white/10"
                >
                  <SelectItem value="viewer" className="text-text-primary text-xs lg:text-sm cursor-pointer">
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      Viewer
                    </span>
                  </SelectItem>
                  <SelectItem value="admin" className="text-text-primary text-xs lg:text-sm cursor-pointer">
                    <span className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" />
                      Admin
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => scrollToSection('#contact')}
              className="hidden sm:flex bg-lime text-dark-bg hover:bg-lime-light font-medium px-3 lg:px-4 py-2 h-8 lg:h-9 rounded-lg text-xs lg:text-sm transition-all duration-300 hover:shadow-glow"
            >
              Get early access
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-text-primary h-8 w-8 hover:bg-white/5"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-dark-bg/98 backdrop-blur-xl border-b border-white/[0.04]">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                  activeSection === link.id
                    ? 'text-lime bg-lime/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
            
            <div className="pt-3 mt-3 border-t border-white/[0.04]">
              <p className="text-xs text-text-secondary mb-2 px-4 uppercase tracking-wider">Role</p>
              <div className="px-4">
                <Select value={state.userRole} onValueChange={handleRoleChange}>
                  <SelectTrigger className="w-full bg-dark-card border-white/[0.06] text-text-primary text-sm h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={8}
                    className="z-[220] bg-dark-card border-white/10"
                  >
                    <SelectItem value="viewer" className="text-text-primary">
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Viewer
                      </span>
                    </SelectItem>
                    <SelectItem value="admin" className="text-text-primary">
                      <span className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-lime" /> 
                        Admin
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="pt-3 px-4">
              <Button 
                onClick={() => scrollToSection('#contact')}
                className="w-full bg-lime text-dark-bg hover:bg-lime-light font-medium py-3 h-auto rounded-xl"
              >
                Get early access
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}