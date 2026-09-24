import { useEffect, useState, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import HomePage from './pages/HomePage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { CustomCursor } from './components/ui/CustomCursor';
import Preloader from './components/ui/Preloader';
import ScrollProgress from './components/ui/ScrollProgress';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);


const Contact = lazy(() => import('./pages/Contact'));
const ServiceCategory = lazy(() => import('./pages/ServiceCategory'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));

const SectionFallback = () => (
  <div className="flex h-[40vh] items-center justify-center bg-brand-bg">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-accent border-t-transparent" />
  </div>
);

let hasPreloaded = false;

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}


function AppContent() {
  const [loading, setLoading] = useState(() => !hasPreloaded);
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    lenis.on('scroll', (e) => {
      window.dispatchEvent(new CustomEvent('lenis-scroll', { detail: e }));
    });

    const handleScrollToTop = (e) => {
      const { offset } = e.detail || {};
      lenis.scrollTo(0, { offset: offset || 0, immediate: true });
    };
    window.addEventListener('agencyspire:scroll-to-top', handleScrollToTop);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener('agencyspire:scroll-to-top', handleScrollToTop);
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (loading) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      lenis?.start();
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [loading]);

  useEffect(() => {
    ScrollTrigger.config({ ignoreMobileResize: true });
    return () => { ScrollTrigger.killAll(); };
  }, []);

  useEffect(() => {
    if (loading) return;

    const lenis = lenisRef.current;
    
    if (location.hash) {
      const id = location.hash.slice(1);
      let attempts = 0;
      const tryScroll = () => {
        const el = document.getElementById(id);
        if (el) {
          if (lenis) {
            lenis.scrollTo(el, { offset: -80, duration: 1.2 });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        } else if (attempts < 120) {
          attempts++;
          requestAnimationFrame(tryScroll);
        }
      };
      setTimeout(tryScroll, 100);
    } else {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [location.pathname, location.hash, loading]);

  const handlePreloaderDone = () => {
    hasPreloaded = true;
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text cursor-default">
      {!hasPreloaded && loading && <Preloader onDone={handlePreloaderDone} duration={3000} />}
      <CustomCursor />
      <ScrollProgress lenisRef={lenisRef} />
      <Navbar />
      <AnimatePresence>
        <Suspense fallback={<SectionFallback />} key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
            <Route path="/services/:category" element={<PageTransition><ServiceCategory /></PageTransition>} />
            <Route path="/services/:category/:serviceId" element={<PageTransition><ServiceDetail /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
          </Routes>
        </Suspense>
      </AnimatePresence>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
