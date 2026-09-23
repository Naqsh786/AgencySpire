import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, Mail, ArrowRight, Sparkles, ShieldCheck, Zap, Star } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
  const sectionRef = useRef(null);
  const glowRef = useRef(null);
  const headlineRef = useRef(null);
  const cardRef = useRef(null);
  const beamRef = useRef(null);
  const magneticRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion();

  /* ===== Scroll reveal ===== */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const ctx = gsap.context(() => {
      const revealItems = section.querySelectorAll('[data-cta-reveal]');

      gsap.set(revealItems, { y: 40, autoAlpha: 0 });
      if (headlineRef.current) {
        gsap.set(headlineRef.current.querySelectorAll('.cta-word'), { yPercent: 110, opacity: 0 });
      }

      const intro = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });

      intro
        .to(revealItems, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.12, ease: 'power3.out' })
        .to(
          headlineRef.current ? headlineRef.current.querySelectorAll('.cta-word') : [],
          { yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.06, ease: 'power4.out' },
          '-=0.7'
        );

      // Ambient glow parallax
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          yPercent: 25,
          scale: 1.15,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // Slow breathing scale on the glass card
      if (cardRef.current && !reduced) {
        gsap.to(cardRef.current, {
          yPercent: -1.5,
          duration: 5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });
      }
    }, section);

    return () => ctx.revert();
  }, [reduced]);

  /* ===== Mouse spotlight + border beam follow + magnetic button ===== */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return undefined;

    // Reduce effects on mobile for performance
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    let raf = null;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        section.style.setProperty('--cta-mx', `${x}px`);
        section.style.setProperty('--cta-my', `${y}px`);
        section.style.setProperty('--cta-glow-opacity', '1');

        // Border beam angle follows the cursor relative to card center
        const card = cardRef.current;
        const beam = beamRef.current;
        if (card && beam) {
          const cr = card.getBoundingClientRect();
          const cx = cr.left + cr.width / 2;
          const cy = cr.top + cr.height / 2;
          const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
          beam.style.setProperty('--beam-angle', `${angle + 90}deg`);
        }

        // On mobile, simplify aurora orb positions for performance
        if (isMobile) {
          const orbs = section.querySelectorAll('.cta-bg-orb');
          orbs.forEach((orb, i) => {
            const speed = (i + 1) * 0.3;
            orb.style.transform = `translate(${(x - rect.width/2) * 0.02}px, ${(y - rect.height/2) * 0.02 * speed}px)`;
          });
        }
      });
    };

    const onLeave = () => {
      section.style.setProperty('--cta-glow-opacity', '0');
      if (isMobile) {
        const orbs = section.querySelectorAll('.cta-bg-orb');
        orbs.forEach((orb) => {
          orb.style.transform = '';
        });
      }
    };

    section.addEventListener('mousemove', onMove);
    section.addEventListener('mouseleave', onLeave);
    return () => {
      section.removeEventListener('mousemove', onMove);
      section.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* ===== Magnetic primary button ===== */
  useEffect(() => {
    const btn = magneticRef.current;
    if (!btn || reduced) return undefined;
    if (window.matchMedia('(pointer: coarse)').matches) return undefined;

    const strength = 0.32;
    let raf = null;

    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = btn.getBoundingClientRect();
        const relX = (e.clientX - (rect.left + rect.width / 2)) * strength;
        const relY = (e.clientY - (rect.top + rect.height / 2)) * strength;
        btn.style.transform = `translate(${relX}px, ${relY}px)`;
        btn.querySelector('[data-magnetic-inner]')?.style.setProperty(
          'transform',
          `translate(${relX * 0.35}px, ${relY * 0.35}px)`
        );
      });
    };

    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      btn.style.transform = '';
      btn.querySelector('[data-magnetic-inner]')?.style.setProperty('transform', '');
    };

    const wrap = btn.parentElement;
    const hoverZone = wrap?.querySelector('[data-magnetic-zone]');
    const target = hoverZone || btn;
    target.addEventListener('mousemove', onMove);
    target.addEventListener('mouseleave', onLeave);
    return () => {
      target.removeEventListener('mousemove', onMove);
      target.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('hello@aetheriatech.com');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="contact" ref={sectionRef} data-nav-theme="light" className="cta-section cta-section-light relative isolate overflow-hidden">
      {/* ===== BACKGROUND LAYERS — light theme, no grid lines ===== */}

      {/* Top wave — transitions from Process dark plum into the light CTA */}
      <div className="pointer-events-none absolute top-0 left-0 z-20 w-full">
        <svg viewBox="0 0 1440 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ height: '70px' }} preserveAspectRatio="none">
          <path d="M0 0L1440 0L1440 34C1200 72 960 8 720 30C480 52 240 78 0 44Z" fill="#150e20" />
          <path d="M0 0L1440 0L1440 42C1200 80 960 16 720 38C480 60 240 86 0 52Z" stroke="rgba(216,180,226,0.12)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Animated aurora orbs — drifting plum/lavender clouds (parallax target) */}
      <div ref={glowRef} className="cta-bg pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div className="cta-bg-orb cta-bg-orb-1" />
        <div className="cta-bg-orb cta-bg-orb-2" />
        <div className="cta-bg-orb cta-bg-orb-3" />
      </div>

      {/* Rotating conic aurora */}
      <div className="pointer-events-none absolute inset-[-25%] z-0 opacity-50"
        style={{
          background: 'conic-gradient(from 0deg, rgba(216,180,226,0) 0%, rgba(216,180,226,0.1) 22%, rgba(122,79,160,0.08) 45%, rgba(216,180,226,0.1) 68%, rgba(122,79,160,0.06) 85%, rgba(216,180,226,0) 100%)',
          filter: 'blur(70px)',
          animation: 'cta-conic-spin 30s linear infinite',
        }}
      />

      {/* Soft radial vignette — keeps edges airy, focuses the center */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(122,79,160,0.08) 100%)',
        }}
      />

      {/* Film grain */}
      <div className="cta-bg-noise cta-bg-noise-light pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      {/* Cursor-following spotlight — lifts the section when the mouse moves */}
      <div
        className="cta-cursor-glow pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      {/* Shooting stars */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="cta-shooting-star cta-shooting-star-1" />
        <div className="cta-shooting-star cta-shooting-star-2" />
        <div className="cta-shooting-star cta-shooting-star-3" />
      </div>

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 mx-auto flex min-h-[720px] max-w-5xl flex-col items-center justify-center px-4 sm:px-6 py-24 sm:py-28 md:py-32 text-center md:min-h-[820px] md:px-12">
        {/* Glass card with animated border beam */}
        <div
          ref={cardRef}
          className="cta-glass-card cta-glass-card-light relative rounded-[2rem] px-6 py-12 sm:rounded-[2.25rem] sm:px-8 sm:py-14 md:rounded-[2.75rem] md:px-16 md:py-20"
        >
          {/* Conic border beam layer */}
          <div ref={beamRef} className="cta-beam cta-beam-light" aria-hidden="true" />

          {/* Card top sheen */}
          <div
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
            aria-hidden="true"
          />

          {/* Availability badge */}
          <div data-cta-reveal className="mb-10 inline-flex items-center gap-3 rounded-full border border-[#a06cd5]/30 bg-white/60 px-5 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#674a70] backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#a06cd5] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#a06cd5]" />
            </span>
            Accepting Projects for Q3/Q4
          </div>

          {/* Eyebrow */}
          <div data-cta-reveal className="mb-6 inline-flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.35em] text-[#a06cd5]">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#a06cd5]/60" />
            <Sparkles size={14} />
            Final Move
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#a06cd5]/60" />
          </div>

          {/* Headline — word-by-word masked reveal */}
          <h2
            ref={headlineRef}
            className="max-w-4xl text-[2.5rem] sm:text-4xl md:text-5xl lg:text-7xl xl:text-[6.5rem] font-display font-bold leading-[0.95] tracking-[-0.04em] text-[#25152d]"
          >
            <span className="inline-block overflow-hidden pb-3 align-bottom">
              <span className="cta-word inline-block">Have</span>
            </span>{' '}
            <span className="inline-block overflow-hidden pb-3 align-bottom">
              <span className="cta-word inline-block">something</span>
            </span>
            <br className="hidden md:block" />
            <span className="relative inline-block overflow-hidden pb-3 align-bottom">
              <span className="cta-word cta-word-ambitious relative inline-block font-light italic">
                ambitious
                <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-gradient-to-r from-[#a06cd5]/70 via-[#a06cd5]/30 to-transparent" />
              </span>
            </span>{' '}
            <span className="inline-block overflow-hidden pb-3 align-bottom">
              <span className="cta-word inline-block">in</span>
            </span>{' '}
            <span className="inline-block overflow-hidden pb-3 align-bottom">
              <span className="cta-word inline-block">mind?</span>
            </span>
          </h2>

          {/* Subtext */}
          <p data-cta-reveal className="mt-10 max-w-xl text-lg leading-relaxed text-[#674a70] md:text-xl">
            Let's turn the right idea into something people can use, remember and grow with.
          </p>

          {/* CTA buttons */}
          <div data-cta-reveal className="mt-12 sm:mt-14 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row sm:gap-6">
            {/* Primary — magnetic purple gradient button */}
            <div className="relative inline-flex" data-magnetic-wrap>
              <a
                href="mailto:hello@aetheriatech.com"
                ref={magneticRef}
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full px-8 py-4 sm:px-10 sm:py-5 font-display text-sm font-bold uppercase tracking-[0.15em] text-white transition-shadow duration-500 will-change-transform min-h-[52px] sm:min-h-0"
                style={{
                  background: 'linear-gradient(135deg, #a06cd5 0%, #7a4fa0 55%, #5b346d 100%)',
                  boxShadow: '0 12px 40px rgba(160,108,213,0.45), inset 0 1px 1px rgba(255,255,255,0.35)',
                }}
              >
                <span data-magnetic-inner className="relative z-10 flex items-center gap-3 will-change-transform">
                  Let's Build It
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
                {/* Shine sweep */}
                <span className="absolute top-0 -inset-full h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transition-all duration-700 group-hover:left-[125%]" />
              </a>
              {/* Larger invisible hover zone for the magnetic pull */}
              <span
                data-magnetic-zone
                className="pointer-events-auto absolute -inset-5 rounded-full"
                aria-hidden="true"
              />
            </div>

            {/* Secondary — copy email */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center justify-center gap-3 rounded-full border border-[#a06cd5]/25 bg-white/70 px-6 py-4 sm:px-8 sm:py-5 font-mono text-sm tracking-[0.1em] text-[#674a70] backdrop-blur-md transition-all duration-300 hover:border-[#a06cd5]/50 hover:bg-white hover:text-[#25152d] min-h-[52px] sm:min-h-0"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-[#a06cd5]" />
                  <span className="text-[#a06cd5]">Email Copied!</span>
                </>
              ) : (
                <>
                  <Mail size={16} className="text-[#a06cd5]" />
                  hello@aetheriatech.com
                </>
              )}
            </button>
          </div>

          {/* Trust points */}
          <div data-cta-reveal className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-[#674a70]/15 pt-8 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#674a70]/80">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={15} className="text-[#a06cd5]" />
              NDA Protected
            </div>
            <div className="flex items-center gap-2.5">
              <Zap size={15} className="text-[#a06cd5]" />
              Response within 24 Hours
            </div>
            <div className="flex items-center gap-2.5">
              <Star size={15} className="text-[#a06cd5]" />
              No Obligation Consultation
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="pointer-events-none absolute bottom-0 left-0 z-10 w-full">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ height: '60px' }} preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 10 0 50Z" fill="var(--color-section-charcoal)" />
          <path d="M0 80L1440 80L1440 50C1200 90 960 10 720 50C480 90 240 20 0 60Z" stroke="rgba(216,180,226,0.15)" strokeWidth="1" fill="none" />
        </svg>
      </div>
    </section>
  );
};

export default CTA;
