import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from 'motion/react';
import { cn } from '../../lib/utils';
import { TOTAL_STEPS, processSteps, processImages } from './processData';

const placeholderImage = (text = 'Image') =>
  `https://placehold.co/600x400/14101C/D8B4E2?text=${encodeURIComponent(text)}`;

/* ===== Animation presets ===== */

const ANIMATION_PRESETS = {
  fadeInScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { type: 'spring', stiffness: 300, damping: 25, mass: 0.5 },
  },
  slideInRight: {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
    transition: { type: 'spring', stiffness: 300, damping: 25, mass: 0.5 },
  },
  slideInLeft: {
    initial: { opacity: 0, x: -24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
    transition: { type: 'spring', stiffness: 300, damping: 25, mass: 0.5 },
  },
};

const defaultImg =
  'rounded-xl border border-brand-accent/25 object-cover aspect-[4/3] shadow-2xl shadow-black/60';

/* ===== Small pieces ===== */

function IconCheck({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="currentColor"
      className={cn('h-3.5 w-3.5', className)}
      {...props}
    >
      <path d="m229.66 77.66-128 128a8 8 0 0 1-11.32 0l-56-56a8 8 0 0 1 11.32-11.32L96 188.69 218.34 66.34a8 8 0 0 1 11.32 11.32Z" />
    </svg>
  );
}

const StepImage = React.forwardRef(function StepImage(
  { src, alt, className, style, ...props },
  ref,
) {
  return (
    <img
      ref={ref}
      alt={alt}
      className={className}
      src={src}
      style={{ position: 'absolute', userSelect: 'none', maxWidth: 'unset', ...style }}
      onError={(e) => {
        e.currentTarget.src = placeholderImage(alt);
      }}
      {...props}
    />
  );
});
StepImage.displayName = 'StepImage';

const MotionStepImage = motion.create(StepImage);

function AnimatedStepImage({ preset = 'fadeInScale', delay = 0, ...props }) {
  const presetConfig = ANIMATION_PRESETS[preset];
  return (
    <MotionStepImage
      {...props}
      {...presetConfig}
      transition={{ ...presetConfig.transition, delay }}
    />
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

/* ===== Step image compositions ===== */

function renderStepImages(step) {
    switch (step) {
      case 0:
        return (
          <div className="relative h-full w-full">
            <AnimatedStepImage
              alt="Discovery workshop"
              className={cn(defaultImg, 'left-0 top-[12%] w-[48%] sm:left-0 sm:top-[10%] sm:w-[52%] md:left-0 md:top-[10%] md:w-[52%]')}
              src={processImages.step1img1}
              preset="slideInLeft"
            />
            <AnimatedStepImage
              alt="Team collaboration"
              className={cn(defaultImg, 'right-0 top-[38%] w-[48%] sm:right-0 sm:top-[38%] sm:w-[58%] md:right-0 md:top-[44%] md:w-[44%]')}
              src={processImages.step1img2}
              preset="slideInRight"
              delay={0.1}
            />
          </div>
        );
      case 1:
        return (
          <div className="relative h-full w-full">
            <AnimatedStepImage
              alt="Strategy session"
              className={cn(defaultImg, 'left-0 top-[16%] w-[48%] sm:left-0 sm:top-[14%] sm:w-[52%] md:left-0 md:top-[14%] md:w-[52%]')}
              src={processImages.step2img1}
              preset="fadeInScale"
            />
            <AnimatedStepImage
              alt="Roadmap planning"
              className={cn(defaultImg, 'right-0 top-[46%] w-[48%] sm:right-0 sm:top-[44%] sm:w-[44%] md:right-0 md:top-[44%] md:w-[44%]')}
              src={processImages.step2img2}
              preset="fadeInScale"
              delay={0.1}
            />
          </div>
        );
      case 2:
        return (
          <AnimatedStepImage
            alt="Interface design"
            className={cn(defaultImg, 'left-0 top-[20%] w-[84%] sm:left-0 sm:top-[18%] sm:w-[90%] md:left-0 md:top-[18%] md:w-[90%]')}
            src={processImages.step3img}
            preset="fadeInScale"
          />
        );
      case 3:
        return (
          <AnimatedStepImage
            alt="Engineering build"
            className={cn(defaultImg, 'left-0 top-[20%] w-[84%] sm:left-0 sm:top-[18%] sm:w-[90%] md:left-0 md:top-[18%] md:w-[90%]')}
            src={processImages.step4img}
            preset="fadeInScale"
          />
        );
      case 4:
        return (
          <AnimatedStepImage
            alt="Launch analytics"
            className={cn(defaultImg, 'left-0 top-[20%] w-[84%] sm:left-0 sm:top-[18%] sm:w-[90%] md:left-0 md:top-[18%] md:w-[90%]')}
            src={processImages.step5img}
            preset="fadeInScale"
          />
        );
      default:
        return null;
    }
  }

/* ===== Main carousel card ===== */

export function ProcessCarousel({ step: controlledStep, className }) {
  const isControlled = typeof controlledStep === 'number';
  const [internalStep, setInternalStep] = useState(0);
  const step = isControlled ? controlledStep : internalStep;

  // Auto-cycle only when uncontrolled (mobile)
  useEffect(() => {
    if (isControlled) return undefined;
    const timerId = setTimeout(
      () => setInternalStep((p) => (p + 1) % TOTAL_STEPS),
      5000,
    );
    return () => clearTimeout(timerId);
  }, [internalStep, isControlled]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const isMobile = useIsMobile();

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const active = processSteps[step];

  return (
    <motion.div
      className={cn('process-spot-card group relative w-full rounded-3xl', className)}
      onMouseMove={handleMouseMove}
      style={{
        '--x': useMotionTemplate`${mouseX}px`,
        '--y': useMotionTemplate`${mouseY}px`,
      }}
    >
      <div className="process-beam relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-accent/20 bg-[#0b0910]/90 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="m-4 sm:m-6 md:m-9 flex min-h-[360px] sm:min-h-[420px] flex-col gap-6 sm:gap-8 md:min-h-[440px] lg:min-h-[460px] lg:flex-row lg:gap-6">
          {/* Step text */}
          <div className="relative z-10 flex w-full flex-col justify-center lg:w-2/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className="flex w-full flex-col gap-3 sm:gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="flex items-center gap-2 sm:gap-3 font-mono text-[0.6rem] sm:text-[0.65rem] font-semibold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-brand-accent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="h-px w-5 sm:w-6 bg-brand-accent/50" />
                  Chapter 0{step + 1} — {active.name}
                </motion.div>
                <motion.h3
                  className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white md:text-3xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {active.title}
                </motion.h3>
                <motion.p
                  className="text-xs sm:text-sm leading-relaxed text-brand-text-muted md:text-base"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {active.description}
                </motion.p>
                <motion.div
                  className="mt-2 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                >
                  {processSteps.map((s, i) => (
                    <span
                      key={s.id}
                      className={cn(
                        'h-1 rounded-full transition-all duration-500',
                        i === step
                          ? 'w-8 bg-brand-accent shadow-[0_0_10px_rgba(216,180,226,0.6)]'
                          : i < step
                            ? 'w-3 bg-brand-accent/40'
                            : 'w-3 bg-white/10',
                      )}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Step images */}
          <div className="relative min-h-[260px] flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${step}`}
                className="absolute inset-0"
                {...ANIMATION_PRESETS.fadeInScale}
              >
                {renderStepImages(step)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ===== Vertical steps nav (desktop sidebar) ===== */

export function ProcessStepsNavVertical({ current, onChange }) {
  const progress = (current / (TOTAL_STEPS - 1)) * 100;
  return (
    <nav aria-label="Process steps" className="relative">
      {/* Track + progress line */}
      <div className="absolute bottom-6 left-[17px] top-6 w-px bg-white/[0.07]" />
      <div
        className="absolute left-[17px] top-6 w-px bg-gradient-to-b from-brand-accent to-[#a06cd5] shadow-[0_0_10px_rgba(216,180,226,0.5)] transition-all duration-500"
        style={{ height: `calc((100% - 3rem) * ${progress / 100})` }}
      />
      <ol className="relative space-y-1">
        {processSteps.map((s, i) => {
          const isCompleted = current > i;
          const isCurrent = current === i;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onChange(i)}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left transition-all duration-300',
                  isCurrent ? 'bg-brand-accent/[0.08]' : 'hover:bg-white/[0.03]',
                )}
              >
                <span
                  className={cn(
                    'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold transition-all duration-300',
                    isCurrent
                      ? 'scale-110 border-brand-accent bg-brand-accent text-brand-bg shadow-[0_0_20px_rgba(216,180,226,0.45)]'
                      : isCompleted
                        ? 'border-brand-accent/50 bg-brand-accent/15 text-brand-accent'
                        : 'border-white/10 bg-white/[0.04] text-white/30',
                  )}
                >
                  {isCompleted ? <IconCheck /> : <span>0{i + 1}</span>}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block font-display text-sm font-semibold transition-colors duration-300',
                      isCurrent ? 'text-white' : isCompleted ? 'text-white/60' : 'text-white/35',
                    )}
                  >
                    {s.name}
                  </span>
                  <span
                    className={cn(
                      'block truncate font-mono text-[9px] uppercase tracking-[0.2em] transition-colors duration-300',
                      isCurrent ? 'text-brand-accent/70' : 'text-white/20',
                    )}
                  >
                    {s.title}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/* ===== Horizontal pills nav (mobile) ===== */

export function ProcessStepsNavPills({ current, onChange }) {
  return (
    <nav aria-label="Process steps" className="flex flex-wrap justify-center gap-2 px-2">
      {processSteps.map((s, i) => {
        const isCompleted = current > i;
        const isCurrent = current === i;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-300',
              isCurrent
                ? 'bg-brand-accent text-brand-bg shadow-[0_0_20px_rgba(216,180,226,0.3)]'
                : 'bg-white/[0.05] text-white/60 hover:bg-white/10',
            )}
          >
            <span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                isCompleted
                  ? 'bg-brand-accent text-brand-bg'
                  : isCurrent
                    ? 'bg-brand-bg/20 text-brand-bg'
                    : 'bg-white/10 text-white/50',
              )}
            >
              {isCompleted ? <IconCheck className="h-3 w-3" /> : i + 1}
            </span>
            {s.name}
          </button>
        );
      })}
    </nav>
  );
}