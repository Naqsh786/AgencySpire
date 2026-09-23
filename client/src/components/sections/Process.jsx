import { useLayoutEffect, useRef, useState, useEffect, Fragment } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import DecorativeBackground from '../ui/DecorativeBackground';
import RibbonDecorations from '../ui/RibbonDecorations';
import {
  ProcessCarousel,
  ProcessStepsNavVertical,
  ProcessStepsNavPills,
} from '../ui/ProcessCarousel';
import { TOTAL_STEPS, processSteps } from '../ui/processData';

gsap.registerPlugin(ScrollTrigger);

const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/* ============ SHARED PIECES (module scope — stable across renders) ============ */

const SectionHeader = () => (
  <div>
    <div className="section-title-kdm mb-6">
      <h2 className="text-[2rem] font-display font-bold leading-[1.05] text-brand-text md:text-[2.5rem] lg:text-[3.2rem]">Our Methodology</h2>
    </div>
    <h3 className="max-w-5xl text-[2.25rem] font-display font-bold leading-[1.02] tracking-[-0.02em] text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem]">
      Built in <span className="font-light italic text-brand-accent">chapters.</span>
    </h3>
    <p className="mt-6 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
      A focused sequence from first question to lasting momentum — five chapters, one continuous climb.
    </p>
  </div>
);

const ChapterTracker = ({ ringRef, activeIndex }) => (
  <div className="mt-8 flex items-center gap-5">
    <div className="relative h-24 w-24 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="rgba(216,180,226,0.08)" strokeWidth="5" />
        <circle
          ref={ringRef}
          cx="60"
          cy="60"
          r={RING_RADIUS}
          fill="none"
          stroke="url(#processRingGradient)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE}
          style={{ transition: 'stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1)', filter: 'drop-shadow(0 0 6px rgba(216,180,226,0.5))' }}
        />
        <defs>
          <linearGradient id="processRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7a4fa0" />
            <stop offset="100%" stopColor="#D8B4E2" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          key={activeIndex}
          className="chapter-swap font-display text-2xl font-bold tabular-nums text-white"
        >
          0{activeIndex + 1}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-brand-accent/60">
          / 0{TOTAL_STEPS}
        </span>
      </div>
      <div className="pointer-events-none absolute -inset-2 rounded-full border border-dashed border-brand-accent/15 process-halo-spin" />
    </div>
    <div className="min-w-0">
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-brand-accent/60">Now reading</div>
      <div
        key={`label-${activeIndex}`}
        className="chapter-swap mt-1 font-display text-xl font-bold text-white"
      >
        {processSteps[activeIndex].name}
      </div>
    </div>
  </div>
);

const ChapterMarquee = () => (
  <div className="overflow-hidden border-y border-brand-accent/10 bg-brand-bg/40 py-2.5 backdrop-blur-sm">
    <div className="process-marquee-track">
      {[0, 1].map((dup) => (
        <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
          {processSteps.map((step) => (
            <Fragment key={`${dup}-${step.id}`}>
              <span className="mx-6 font-mono text-[10px] uppercase tracking-[0.35em] text-brand-accent/60">
                {step.name}
              </span>
              <span className="h-1 w-1 rotate-45 bg-brand-accent/40" />
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  </div>
);

const Process = () => {
  const sectionRef = useRef(null);
  const desktopRef = useRef(null);
  const ringRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /* Scroll-driven chapters — scroll position maps to step 1 → 5 */
  useLayoutEffect(() => {
    const section = sectionRef.current;
    const desktop = desktopRef.current;
    if (!section || !desktop) return undefined;
    let refreshFrame;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: desktop,
        start: 'top top',
        end: '+=500%',
        pin: true,
        scrub: 0.5,
        refreshPriority: -10,
        anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.min(
            TOTAL_STEPS - 1,
            Math.floor(self.progress * TOTAL_STEPS),
          );
          setActiveIndex(idx);

          if (ringRef.current) {
            ringRef.current.style.strokeDashoffset = String(
              RING_CIRCUMFERENCE * (1 - self.progress),
            );
          }
        },
      });
    }, section);
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(refreshFrame);
      ctx.revert();
    };
  }, []);

  /* Mouse spotlight across the whole section */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const handleMove = (e) => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--mx', `${e.clientX - rect.left}px`);
      section.style.setProperty('--my', `${e.clientY - rect.top}px`);
    };

    section.addEventListener('mousemove', handleMove);
    return () => section.removeEventListener('mousemove', handleMove);
  }, []);

  /* ============ RENDER ============ */

  return (
    <section id="process" ref={sectionRef} className="process-section relative overflow-hidden text-brand-text">
      {/* ===== BACKGROUND LAYERS ===== */}
      <div className="process-grid absolute inset-0 z-0" />
      <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
        <span className="process-stroke-giant select-none text-[20vw] leading-none">PROCESS</span>
      </div>
      <div className="process-spotlight absolute inset-0 z-0" />

      <DecorativeBackground type="glow" color="brand-accent" position="bottom-left" opacity="opacity-20" />
      <RibbonDecorations orbs twinkles laserLine />

      {/* Floating accent orbs */}
      <div className="pointer-events-none absolute right-[8%] top-[12%] hidden h-2 w-2 rounded-full bg-brand-accent/50 animate-float-v lg:block" />
      <div className="pointer-events-none absolute left-[45%] top-[8%] hidden h-1.5 w-1.5 rounded-full bg-brand-accent/30 animate-float-h lg:block" />
      <div className="pointer-events-none absolute bottom-[18%] left-[38%] hidden h-2.5 w-2.5 rotate-45 border border-brand-accent/25 animate-float-v lg:block" />

      {/* ============ DESKTOP — scroll drives the chapters ============ */}
      <div ref={desktopRef} className="hidden min-h-screen lg:block">
        <div className="container relative z-10 mx-auto grid h-screen min-h-screen grid-cols-12 items-center gap-10 px-6 pb-20 pt-10 md:px-12">
          {/* LEFT: header + vertical steps nav + CTA */}
          <div className="col-span-4">
            <SectionHeader />
            <div className="mt-8">
              <ProcessStepsNavVertical current={activeIndex} onChange={setActiveIndex} />
            </div>
            <a
              href="#contact"
              className="group mt-7 inline-flex items-center gap-3 border-b border-brand-accent/40 pb-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand-accent transition-colors hover:text-white"
            >
              Start your chapter
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          {/* RIGHT: the carousel card with aurora + giant numeral behind */}
          <div className="relative col-span-8">
            <div className="process-aurora" />

            {/* Giant chapter numeral behind the card */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span
                key={`num-${activeIndex}`}
                className="chapter-swap process-num-giant text-[14rem] xl:text-[17rem]"
              >
                0{activeIndex + 1}
              </span>
            </div>

            <div className="relative z-10">
              <ProcessCarousel step={activeIndex} onChange={setActiveIndex} />
            </div>
          </div>
        </div>

        {/* Bottom chapter marquee */}
        <div className="absolute bottom-0 left-0 z-20 w-full">
          <ChapterMarquee />
        </div>
      </div>

      {/* ============ MOBILE — auto-cycling carousel ============ */}
      <div className="relative z-10 lg:hidden">
        <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24">
          <SectionHeader />
          <ChapterTracker ringRef={ringRef} activeIndex={activeIndex} />

          <div className="relative mt-8 sm:mt-10">
            <div className="process-aurora" />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span
                key={`m-num-${activeIndex}`}
                className="chapter-swap process-num-giant text-[8rem]"
              >
                0{activeIndex + 1}
              </span>
            </div>
            <div className="relative z-10">
              <ProcessCarousel onChange={setActiveIndex} />
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <ProcessStepsNavPills current={activeIndex} onChange={setActiveIndex} />
          </div>

          <a
            href="#contact"
            className="group mt-8 sm:mt-10 inline-flex items-center gap-3 border-b border-brand-accent/40 pb-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand-accent transition-colors hover:text-white min-h-[44px]"
          >
            Start your chapter
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        <ChapterMarquee />
      </div>
    </section>
  );
};

export default Process;