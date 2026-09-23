import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Code2, Palette, Bot, Megaphone, Box, ChevronDown } from 'lucide-react';
import MagneticButton from '../ui/MagneticButton';

const SERVICE_CATEGORIES = [
  { label: 'Development', href: '/services/development', icon: Code2, color: '#a06cd5' },
  { label: 'Design', href: '/services/design', icon: Palette, color: '#D8B4E2' },
  { label: 'AI & Automation', href: '/services/ai-automation', icon: Bot, color: '#7a4fa0' },
  { label: 'Marketing', href: '/services/marketing', icon: Megaphone, color: '#c49bda' },
  { label: '3D', href: '/services/3d', icon: Box, color: '#D8B4E2' },
];

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '#', dropdown: true },
  { label: 'Work', href: '/#work' },
  { label: 'Process', href: '/#process' },
  { label: 'Contact', href: '/contact' },
];

const LiquidGlassNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dropdownTimeout = useRef(null);
  const navRef = useRef(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const NAV_PROBE_Y = 44;
    let raf = null;

    const check = () => {
      setScrolled(window.scrollY > 40);
      let light = false;
      document.querySelectorAll('[data-nav-theme="light"]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= NAV_PROBE_Y && r.bottom >= NAV_PROBE_Y) light = true;
      });
      setOnLight(light);
    };

    const onScroll = (e) => {
      if (e.detail) check();
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        check();
      });
    };

    check();
    window.addEventListener('lenis-scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('lenis-scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', check);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
    setIsOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  return (
    <>
      {/* ===== DESKTOP NAVBAR ===== */}
      <motion.nav
        ref={navRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.6, delay: isHome ? 0.3 : 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 hidden md:block',
          'transition-all duration-500',
          scrolled ? 'pt-3' : 'pt-5'
        )}
      >
        <div className="mx-auto max-w-6xl px-8">
          <div
            className="relative flex items-center rounded-full px-6 py-3 transition-all duration-500"
            style={{
              background: onLight
                ? 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 50%, rgba(247,243,250,0.8) 100%)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
              boxShadow: onLight
                ? '0 0 0 1px rgba(91,52,109,0.18), inset 0 1px 1px rgba(255,255,255,0.9), 0 8px 32px rgba(91,52,109,0.18), 0 2px 8px rgba(91,52,109,0.1)'
                : '0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(30px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(30px) saturate(1.8)',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: onLight
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(216,180,226,0.08) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(255,255,255,0.03) 100%)',
              }}
            />

            <Link
              to="/"
              className={cn(
                'relative z-10 flex items-center gap-3 rounded-full px-5 py-3 transition-colors',
                onLight ? 'hover:bg-[#5b346d]/8' : 'hover:bg-white/[0.06]'
              )}
            >
              <div className="relative flex h-9 w-9 items-center justify-center">
                <div
                  className="h-5 w-5 rotate-45 rounded-[3px]"
                  style={{
                    background: 'linear-gradient(135deg, #f5e0ff 0%, #D8B4E2 55%, #a06cd5 100%)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 3px 6px rgba(160,108,213,0.4)',
                  }}
                >
                  <div
                    className="absolute inset-1 rounded-[1px]"
                    style={{ background: onLight ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,11,0.4)' }}
                  />
                </div>
              </div>
              <span
                className={cn(
                  'font-display text-lg font-semibold tracking-tight transition-colors',
                  onLight ? 'text-[#25152d]' : 'text-white/90'
                )}
              >
                Aetheria
              </span>
            </Link>

            <div className="relative z-10 flex flex-1 items-center justify-center gap-1 sm:gap-2">
              {NAV_LINKS.map((link) =>
                link.dropdown ? (
                  /* ── Services Dropdown ── */
                  <div
                    key={link.label}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={cn(
                        'flex items-center gap-1 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 font-display text-sm font-medium transition-all min-w-[44px]',
                        onLight
                          ? 'text-[#674a70] hover:text-[#25152d] hover:bg-[#5b346d]/8'
                          : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                      )}
                    >
                      {link.label}
                      <motion.div
                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 rounded-2xl overflow-hidden"
                          style={{
                            background: onLight
                              ? 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,243,250,0.95) 100%)'
                              : 'linear-gradient(180deg, rgba(20,18,25,0.97) 0%, rgba(15,13,18,0.98) 100%)',
                            boxShadow: onLight
                              ? '0 0 0 1px rgba(91,52,109,0.15), 0 20px 60px rgba(91,52,109,0.25), 0 4px 16px rgba(91,52,109,0.12)'
                              : '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6), 0 4px 16px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(40px) saturate(1.8)',
                            WebkitBackdropFilter: 'blur(40px) saturate(1.8)',
                          }}
                        >
                          <div className="p-2">
                            {SERVICE_CATEGORIES.map((cat, i) => {
                              const CatIcon = cat.icon;
                              return (
                                <motion.div
                                  key={cat.label}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.04, duration: 0.3 }}
                                >
                                  <Link
                                    to={cat.href}
                                    onClick={() => setDropdownOpen(false)}
                                    className={cn(
                                      'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 group',
                                      onLight
                                        ? 'hover:bg-[#5b346d]/8'
                                        : 'hover:bg-white/[0.06]'
                                    )}
                                  >
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                                      style={{ background: `${cat.color}18` }}
                                    >
                                      <CatIcon className="w-4 h-4" style={{ color: cat.color }} />
                                    </div>
                                    <span className={cn(
                                      'font-display text-sm font-medium transition-colors',
                                      onLight
                                        ? 'text-[#674a70] group-hover:text-[#25152d]'
                                        : 'text-white/60 group-hover:text-white'
                                    )}>
                                      {cat.label}
                                    </span>
                                  </Link>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={cn(
                      'rounded-full px-4 sm:px-5 py-2.5 sm:py-3 font-display text-sm font-medium transition-all min-w-[44px] text-center',
                      onLight
                        ? 'text-[#674a70] hover:text-[#25152d] hover:bg-[#5b346d]/8'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            <MagneticButton strength={0.2}>
              <Link
                to="/contact"
                className={cn(
                  'relative z-10 shrink-0 rounded-full px-8 py-3 font-display text-sm font-semibold transition-all block',
                  onLight
                    ? 'text-white hover:shadow-[0_0_24px_rgba(160,108,213,0.5)]'
                    : 'text-brand-bg hover:shadow-[0_0_20px_rgba(216,180,226,0.3)]'
                )}
                style={{
                  background: onLight
                    ? 'linear-gradient(135deg, #a06cd5, #5b346d)'
                    : 'linear-gradient(135deg, #D8B4E2, #a06cd5)',
                }}
              >
                Get Started
              </Link>
            </MagneticButton>
          </div>
        </div>
      </motion.nav>

      {/* ===== MOBILE NAVBAR ===== */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.6, delay: isHome ? 0.3 : 0 }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 md:hidden',
          'transition-all duration-500',
          isOpen ? 'pt-3' : 'pt-4'
        )}
      >
        <div className="mx-4">
          <div
            className="relative flex items-center justify-between rounded-full px-3 py-3.5 transition-all duration-500"
            style={{
              background: onLight
                ? 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 50%, rgba(247,243,250,0.8) 100%)'
                : isOpen
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.07) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.08) 100%)',
              boxShadow: onLight
                ? '0 0 0 1px rgba(91,52,109,0.18), inset 0 1px 1px rgba(255,255,255,0.9), 0 8px 32px rgba(91,52,109,0.18), 0 2px 8px rgba(91,52,109,0.1)'
                : '0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 1px rgba(255,255,255,0.1), inset 0 -1px 1px rgba(255,255,255,0.05), 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(20px) saturate(1.8)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
              borderRadius: isOpen && !onLight ? '28px' : '999px',
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 rounded-[inherit]"
              style={{
                background: onLight
                  ? 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(216,180,226,0.08) 100%)'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(255,255,255,0.03) 100%)',
              }}
            />

            <Link to="/" className="relative z-10 flex items-center gap-2 rounded-full px-4 py-2">
              <div className="relative flex h-7 w-7 items-center justify-center">
                <div
                  className="h-4 w-4 rotate-45 rounded-[2px]"
                  style={{
                    background: 'linear-gradient(135deg, #f5e0ff 0%, #D8B4E2 55%, #a06cd5 100%)',
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 2px 4px rgba(160,108,213,0.4)',
                  }}
                >
                  <div
                    className="absolute inset-0.5 rounded-[1px]"
                    style={{ background: onLight ? 'rgba(255,255,255,0.55)' : 'rgba(10,10,11,0.4)' }}
                  />
                </div>
              </div>
              <span
                className={cn(
                  'font-display text-base font-semibold tracking-tight transition-colors',
                  onLight ? 'text-[#25152d]' : 'text-white/90'
                )}
              >
                Aetheria
              </span>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                'relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors',
                onLight ? 'bg-[#5b346d]/10 hover:bg-[#5b346d]/20' : 'bg-white/[0.06] hover:bg-white/[0.1]'
              )}
              aria-label="Toggle menu"
            >
              <div className="flex flex-col items-center gap-[5px]">
                <motion.div
                  className={cn('h-[2px] w-4 rounded-full', onLight ? 'bg-[#25152d]/80' : 'bg-white/70')}
                  animate={isOpen ? { rotate: 45, y: 3.5 } : { rotate: 0, y: 0 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
                <motion.div
                  className={cn('h-[2px] w-4 rounded-full', onLight ? 'bg-[#25152d]/80' : 'bg-white/70')}
                  animate={isOpen ? { rotate: -45, y: -3.5 } : { rotate: 0, y: 0 }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ top: '72px' }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(180deg, rgba(10,10,11,0.95) 0%, rgba(10,10,11,0.98) 100%)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
              }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              className="relative mx-4 mt-2 overflow-hidden rounded-3xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 1px rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex flex-col gap-1 p-3">
                {NAV_LINKS.map((link, i) =>
                  link.dropdown ? (
                    /* ── Mobile Services Accordion ── */
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: 'spring', bounce: 0.15 }}
                    >
                      <button
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        className="flex items-center justify-between w-full rounded-2xl px-5 py-4 font-display text-base font-medium text-white/60 transition-all hover:bg-white/[0.06] hover:text-white min-h-[52px]"
                      >
                        <div className="flex items-center">
                          <span className="mr-3 font-mono text-[10px] text-brand-accent/50">0{i + 1}</span>
                          {link.label}
                        </div>
                        <motion.div
                          animate={{ rotate: mobileServicesOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-white/40" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {mobileServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pl-10 pb-2 space-y-0.5">
                              {SERVICE_CATEGORIES.map((cat) => {
                                const CatIcon = cat.icon;
                                return (
                                  <Link
                                    key={cat.label}
                                    to={cat.href}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all hover:bg-white/[0.06] min-h-[48px]"
                                  >
                                    <div
                                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                      style={{ background: `${cat.color}18` }}
                                    >
                                      <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                                    </div>
                                    <span className="font-display text-sm text-white/50">{cat.label}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, type: 'spring', bounce: 0.15 }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center rounded-2xl px-5 py-4 font-display text-base font-medium text-white/60 transition-all hover:bg-white/[0.06] hover:text-white min-h-[52px]"
                      >
                        <span className="mr-3 font-mono text-[10px] text-brand-accent/50">0{i + 1}</span>
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                )}
              </div>

              <div className="border-t border-white/[0.06] p-3">
                <MagneticButton strength={0.15}>
                  <Link
                    to="/contact"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center rounded-2xl px-5 py-4 font-display text-sm font-semibold text-brand-bg transition-all block min-h-[52px]"
                    style={{
                      background: 'linear-gradient(135deg, #D8B4E2, #a06cd5)',
                      boxShadow: '0 4px 20px rgba(216,180,226,0.25)',
                    }}
                  >
                    Get Started
                  </Link>
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiquidGlassNavbar;
