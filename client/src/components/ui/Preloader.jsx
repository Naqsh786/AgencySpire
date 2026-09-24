import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

/* Bloop-style preloader, AgencySpire theme. Exactly 3000ms:
   enter (0s) → exitText (1.25s) → blob cover (1.65s) → fade (2.25s) → gone (3s).

   Perf rules: transform/opacity animations ONLY (GPU-composited, no
   filter/blur repaints), counter throttled to 10fps, blob promoted to
   its own layer with will-change. ScrollTrigger.refresh is NOT called
   here — App defers it until after unmount so the fade never stutters. */

const EASE_EXPO = [0.16, 1, 0.3, 1];
const EASE_INOUT = [0.44, 0, 0.56, 1];

const TITLE = 'AgencySpire';
const SUBTITLE = 'Creative Technology';

const BLOB_PATH =
  'M 11.605 1198.824 C 117.81 2048.365 715.599 1194.746 966.065 1533.064 C 1216.53 1871.381 1493.524 1794.135 1781.626 1451.023 C 2069.727 1107.911 2087.799 844.701 1896.563 817.836 C 1705.326 790.972 2032.184 57.703 1287.972 4.679 C 543.76 -48.345 -94.6 349.283 11.605 1198.824 Z';

/* Counter — throttled to 10fps updates (not per-rAF-frame renders) */
const Counter = ({ to, ms }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      const p = Math.min(1, (performance.now() - start) / ms);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p >= 1) window.clearInterval(id);
    }, 100);
    return () => window.clearInterval(id);
  }, [to, ms]);

  return <span className="tabular-nums">{String(value).padStart(3, '0')}</span>;
};

const Preloader = ({ onDone, duration = 3000 }) => {
  const total = Math.min(3000, Math.max(2200, duration));
  const [phase, setPhase] = useState('enter');

  /* Stable callback ref — the timer must never restart if the parent
     re-renders mid-sequence. */
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  /* Scale for the blob to fully cover the viewport (with margin) */
  const [coverScale] = useState(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Math.max(w / 2022, h / 1751) * 1.12;
  });
  const smallScale = 14 / 2022;

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase('exitText'), total - 1750),
      window.setTimeout(() => setPhase('blob'), total - 1350),
      window.setTimeout(() => setPhase('fade'), total - 750),
      window.setTimeout(() => {
        setPhase('gone');
        onDoneRef.current?.();
      }, total),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [total]);

  if (phase === 'gone') return null;

  const isEnter = phase === 'enter';

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ background: '#0A0A0B' }}
      initial={{ opacity: 1 }}
      animate={phase === 'fade' ? { opacity: 0, transition: { duration: 0.7, ease: EASE_INOUT } } : { opacity: 1 }}
      aria-hidden="true"
    >
      {/* Ambient glow — one slow breath, pure opacity/scale */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmax] w-[70vmax] rounded-full"
        style={{
          x: '-50%',
          y: '-50%',
          background:
            'radial-gradient(circle, rgba(216,180,226,0.13) 0%, rgba(122,79,160,0.05) 40%, transparent 70%)',
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={
          isEnter
            ? { opacity: 0.8, scale: 1, transition: { duration: 1.1, ease: 'easeOut' } }
            : { opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } }
        }
      />

      {/* The Bloop figure — tiny dot that swells, then covers the screen.
          will-change keeps it on its own compositor layer while scaling. */}
      <motion.svg
        viewBox="0 0 2022 1751"
        width="2022"
        height="1751"
        className="absolute left-1/2 top-1/2 max-w-none"
        style={{ x: '-50%', y: '-50%', willChange: 'transform' }}
        initial={{ scale: 0, rotate: -4 }}
        animate={
          isEnter
            ? { scale: smallScale, rotate: -4 }
            : phase === 'exitText'
              ? { scale: smallScale * 1.8, rotate: -4 }
              : phase === 'blob'
                ? { scale: coverScale, rotate: 0 }
                : { scale: coverScale * 1.06, rotate: 0 }
        }
        transition={
          isEnter
            ? { type: 'spring', stiffness: 300, damping: 22, delay: 0.3 }
            : phase === 'exitText'
              ? { duration: 0.4, ease: EASE_INOUT }
              : phase === 'blob'
                ? { duration: 0.55, ease: EASE_EXPO }
                : { duration: 0.7, ease: EASE_INOUT }
        }
      >
        <defs>
          <linearGradient id="preloaderBlob" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e0ff" />
            <stop offset="45%" stopColor="#D8B4E2" />
            <stop offset="100%" stopColor="#5b346d" />
          </linearGradient>
        </defs>
        <path d={BLOB_PATH} fill="url(#preloaderBlob)" />
      </motion.svg>

      {/* Name — slides in from the left edge (transform/opacity only) */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.h1
          className="font-display text-5xl font-black tracking-tight text-white md:text-8xl"
          initial={{ x: '-60vw', opacity: 0 }}
          animate={
            isEnter
              ? { x: '0vw', opacity: 1, transition: { duration: 0.9, ease: EASE_EXPO } }
              : { opacity: 0, y: -20, scale: 0.96, transition: { duration: 0.35, ease: EASE_INOUT } }
          }
        >
          {TITLE}
        </motion.h1>

        {/* Subtitle — mirrors from the right edge */}
        <motion.p
          className="font-mono text-[0.65rem] uppercase tracking-[0.45em] text-brand-accent md:text-sm"
          initial={{ x: '60vw', opacity: 0 }}
          animate={
            isEnter
              ? { x: '0vw', opacity: 1, transition: { duration: 0.9, delay: 0.15, ease: EASE_EXPO } }
              : { opacity: 0, y: 20, scale: 0.96, transition: { duration: 0.35, ease: EASE_INOUT } }
          }
        >
          {SUBTITLE}
        </motion.p>
      </div>

      {/* Progress bar + counter — completes as the text exits */}
      <motion.div
        className="absolute inset-x-0 bottom-14 z-10 flex flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={
          isEnter
            ? { opacity: 1, transition: { duration: 0.4, delay: 0.25 } }
            : { opacity: 0, transition: { duration: 0.25 } }
        }
      >
        <div className="h-px w-44 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full w-full"
            style={{
              background: 'linear-gradient(90deg, #D8B4E2, #f5e0ff, #a06cd5)',
              boxShadow: '0 0 12px rgba(216,180,226,0.7)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: '0%' }}
            transition={{ duration: (total - 1750) / 1000, ease: [0.65, 0, 0.35, 1] }}
          />
        </div>
        <span className="font-mono text-[0.6rem] tracking-[0.35em] text-white/40">
          <Counter to={100} ms={total - 1750} />%
        </span>
      </motion.div>
    </motion.div>
  );
};

export default Preloader;
