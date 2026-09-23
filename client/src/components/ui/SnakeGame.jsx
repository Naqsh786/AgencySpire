import { useState, useEffect, useRef, useCallback } from 'react';

const GRID = 20;
const CELL = 24;

const DIR_UP = { x: 0, y: -1 };
const DIR_DOWN = { x: 0, y: 1 };
const DIR_LEFT = { x: -1, y: 0 };
const DIR_RIGHT = { x: 1, y: 0 };

const getInitialSnake = () => [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const getRandomFood = (snake) => {
  let f;
  let tries = 0;
  do {
    f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    tries++;
  } while (snake.some(s => s.x === f.x && s.y === f.y) && tries < 200);
  return f;
};

const SnakeGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [snake, setSnake] = useState(getInitialSnake);
  const [food, setFood] = useState(() => getRandomFood(getInitialSnake()));
  const [dir, setDir] = useState(DIR_RIGHT);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(window.localStorage.getItem('snake-hs-v3') || '0', 10); } catch { return 0; }
  });

  // Refs for game loop â€” always current, no stale closures
  const dirRef = useRef(DIR_RIGHT);
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(0);
  const intervalRef = useRef(null);
  const touchRef = useRef(null);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const eatCtxRef = useRef(null);
  const dieCtxRef = useRef(null);

  // Keep refs in sync with state via effect to avoid render-phase writes
  useEffect(() => {
    snakeRef.current = snake;
    foodRef.current = food;
    scoreRef.current = score;
    isPlayingRef.current = isPlaying;
    isPausedRef.current = isPaused;
  });

  const playEat = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!eatCtxRef.current) eatCtxRef.current = new Ctx();
      const ctx = eatCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g).connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      o.start();
      o.stop(ctx.currentTime + 0.15);
    } catch {
      // audio not supported
    }
  }, []);

  const playDie = useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!dieCtxRef.current) dieCtxRef.current = new Ctx();
      const ctx = dieCtxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g).connect(ctx.destination);
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(200, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start();
      o.stop(ctx.currentTime + 0.4);
    } catch {
      // audio not supported
    }
  }, []);

  const handleStart = useCallback(() => {
    const s = getInitialSnake();
    const f = getRandomFood(s);
    setSnake(s);
    snakeRef.current = s;
    setFood(f);
    foodRef.current = f;
    setDir(DIR_RIGHT);
    dirRef.current = DIR_RIGHT;
    setScore(0);
    scoreRef.current = 0;
    setIsGameOver(false);
    setIsPaused(false);
    isPausedRef.current = false;
    setIsPlaying(true);
    isPlayingRef.current = true;
  }, []);

  const handleDirection = useCallback((newDir) => {
    if (!isPlayingRef.current || isPausedRef.current) return;
    // Prevent reversing
    if (newDir.x === -dirRef.current.x && newDir.y === -dirRef.current.y) return;
    dirRef.current = newDir;
    setDir(newDir);
  }, []);

  const togglePause = useCallback(() => {
    if (!isPlayingRef.current || isGameOver) return;
    const next = !isPausedRef.current;
    isPausedRef.current = next;
    setIsPaused(next);
  }, [isGameOver]);

  const gameOver = useCallback(() => {
    playDie();
    setIsPlaying(false);
    isPlayingRef.current = false;
    setIsGameOver(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHighScore(prev => {
      const next = Math.max(prev, scoreRef.current);
      try { window.localStorage.setItem('snake-hs-v3', String(next)); } catch { /* localStorage blocked */ }
      return next;
    });
  }, [playDie]);

  // Game loop â€” simple and reliable
  useEffect(() => {
    if (!isPlaying || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const moveSnake = () => {
      const s = snakeRef.current;
      const f = foodRef.current;
      const d = dirRef.current;
      const head = s[0];
      const newHead = { x: head.x + d.x, y: head.y + d.y };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
        gameOver();
        return;
      }

      // Self collision
      if (s.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        gameOver();
        return;
      }

      const newSnake = [newHead, ...s];

      if (newHead.x === f.x && newHead.y === f.y) {
        playEat();
        const newScore = scoreRef.current + 10;
        scoreRef.current = newScore;
        setScore(newScore);
        const newFood = getRandomFood(newSnake);
        setFood(newFood);
        foodRef.current = newFood;
      } else {
        newSnake.pop();
      }

      setSnake(newSnake);
      snakeRef.current = newSnake;
    };

    intervalRef.current = setInterval(moveSnake, 130);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, isPaused, gameOver, playEat]);

  // Keyboard â€” uses refs so no stale closures
  useEffect(() => {
    const onKey = (e) => {
      // Space/Enter to start or restart
      if (!isPlayingRef.current) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleStart();
        }
        return;
      }

      // Space/P to pause/resume
      if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePause();
        return;
      }

      // Arrow keys / WASD
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); handleDirection(DIR_UP); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); handleDirection(DIR_DOWN); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); handleDirection(DIR_LEFT); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); handleDirection(DIR_RIGHT); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleStart, handleDirection, togglePause]);

  // Touch / swipe controls on the game board
  const onTouchStart = (e) => {
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) {
      // Tap â€” start game if not playing
      if (!isPlayingRef.current) handleStart();
      touchRef.current = null;
      return;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) handleDirection(DIR_RIGHT);
      else handleDirection(DIR_LEFT);
    } else {
      if (dy > 0) handleDirection(DIR_DOWN);
      else handleDirection(DIR_UP);
    }
    touchRef.current = null;
  };

  // Click on board to start
  const onBoardClick = () => {
    if (!isPlayingRef.current) handleStart();
  };

  const gw = GRID * CELL;
  const isNewHigh = score > 0 && score >= highScore;
  const showOverlay = !isPlaying;

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 select-none" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* HUD */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">Score</div>
          <div className="font-display text-2xl font-bold tabular-nums text-white">{score}</div>
        </div>
        <div className="h-7 w-px bg-white/10" />
        <div className="text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">Length</div>
          <div className="font-display text-2xl font-bold tabular-nums text-brand-accent">{snake.length}</div>
        </div>
        <div className="h-7 w-px bg-white/10" />
        <div className="text-center">
          <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">Best</div>
          <div className="font-display text-2xl font-bold tabular-nums text-brand-accent/60">{highScore}</div>
        </div>
        {isPlaying && (
          <div className="h-7 w-px bg-white/10" />
        )}
        {isPlaying && (
          <button
            onClick={togglePause}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent transition-all duration-300 hover:border-brand-accent/60 hover:bg-brand-accent/20"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
        )}
      </div>

      {/* Grid */}
      <div
        className="relative overflow-hidden rounded-2xl border-2 border-brand-accent/20 bg-[#08070c] cursor-pointer touch-none"
        style={{
          width: gw + 8,
          height: gw + 8,
          boxShadow: '0 0 50px rgba(216,180,226,0.1), inset 0 0 30px rgba(0,0,0,0.5)',
          maxWidth: 'calc(100vw - 32px)',
          maxHeight: 'calc(100vw - 32px)',
        }}
        onClick={onBoardClick}
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -inset-20 bg-brand-accent/[0.04] blur-3xl" />

        {/* Grid lines */}
        <svg className="absolute inset-0 opacity-[0.05]" width={gw + 8} height={gw + 8}>
          {[...Array(GRID + 1)].map((_, i) => (
            <g key={i}>
              <line x1={i * CELL + 4} y1={4} x2={i * CELL + 4} y2={gw + 4} stroke="#D8B4E2" strokeWidth="0.4" />
              <line x1={4} y1={i * CELL + 4} x2={gw + 4} y2={i * CELL + 4} stroke="#D8B4E2" strokeWidth="0.4" />
            </g>
          ))}
        </svg>

        {/* Snake body */}
        {snake.map((seg, i) => {
          const isHead = i === 0;
          const progress = i / Math.max(snake.length, 1);
          const shrink = Math.min(progress * 3, 4);
          const rotateDeg = isHead
            ? (dir.x === 1 ? 0 : dir.x === -1 ? 180 : dir.y === 1 ? 90 : -90)
            : 0;
          return (
            <div
              key={`s-${i}`}
              className="absolute"
              style={{
                width: CELL - 2 - shrink,
                height: CELL - 2 - shrink,
                left: seg.x * CELL + 3 + shrink / 2,
                top: seg.y * CELL + 3 + shrink / 2,
                borderRadius: isHead ? '8px' : `${Math.max(3, 6 - progress * 4)}px`,
                background: isHead
                  ? 'linear-gradient(135deg, #f5e0ff 0%, #D8B4E2 30%, #c89ae0 60%, #8b5fb0 100%)'
                  : `linear-gradient(135deg, rgba(216,180,226,${0.9 - progress * 0.5}), rgba(160,108,213,${0.7 - progress * 0.4}))`,
                boxShadow: isHead
                  ? '0 0 20px rgba(216,180,226,0.7), 0 0 8px rgba(160,108,213,0.6), inset 0 1px 3px rgba(255,255,255,0.2)'
                  : i < 5
                    ? `0 0 ${10 - i * 2}px rgba(216,180,226,${0.3 - i * 0.05})`
                    : 'none',
                zIndex: snake.length - i,
                transition: 'left 0.06s linear, top 0.06s linear',
              }}
            >
              {/* Head highlight */}
              {isHead && (
                <div className="absolute inset-0 overflow-hidden rounded-[8px]">
                  <div className="absolute left-1.5 top-1 h-2.5 w-3 rounded-full bg-white/25 blur-[2px]" />
                </div>
              )}
              {/* Eyes */}
              {isHead && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: `rotate(${rotateDeg}deg)` }}
                >
                  <div className="absolute flex gap-[7px]">
                    <div className="h-[5px] w-[5px] rounded-full bg-[#08070c]" style={{ marginTop: '-4px' }} />
                    <div className="h-[5px] w-[5px] rounded-full bg-[#08070c]" style={{ marginTop: '-4px' }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Food */}
        <div
          className="absolute pointer-events-none"
          style={{ width: CELL - 4, height: CELL - 4, left: food.x * CELL + 4, top: food.y * CELL + 4 }}
        >
          <div
            className="absolute -inset-3 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(216,180,226,0.35), transparent 70%)',
              animation: 'food-spin 1.5s ease-in-out infinite',
            }}
          />
          <div
            className="relative h-full w-full rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #fff, #f5e0ff 20%, #D8B4E2 50%, #a06cd5 85%)',
              boxShadow: '0 0 20px rgba(216,180,226,0.7), 0 0 10px rgba(160,108,213,0.5), inset 0 1px 4px rgba(255,255,255,0.3)',
              animation: 'food-spin 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Pause overlay */}
        {isPaused && isPlaying && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#08070c]/80 backdrop-blur-md">
            <div className="font-display text-3xl font-bold tracking-tight text-brand-accent drop-shadow-[0_0_25px_rgba(216,180,226,0.4)] sm:text-4xl">
              Paused
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-[0.2em] text-white/40 sm:text-[11px]">
              SPACE or P to resume
            </div>
            <button
              onClick={togglePause}
              type="button"
              className="group mt-5 flex items-center gap-2.5 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-7 py-2.5 font-display text-sm font-semibold text-brand-accent transition-all duration-300 hover:border-brand-accent/60 hover:bg-brand-accent/20 hover:shadow-[0_0_40px_rgba(216,180,226,0.25)] active:scale-95"
            >
              Resume
              <span className="transition-transform group-hover:translate-x-1">▶</span>
            </button>
          </div>
        )}

        {/* Overlay */}
        {showOverlay && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#08070c]/90 backdrop-blur-lg">
            {isGameOver ? (
              <>
                <div className="font-display text-3xl font-bold text-red-400/90 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)] sm:text-4xl">
                  Game Over
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">Score</div>
                    <div className="font-display text-2xl font-bold text-white">{score}</div>
                  </div>
                  <div className="h-7 w-px bg-white/10" />
                  <div className="text-center">
                    <div className="font-mono text-[8px] uppercase tracking-wider text-white/25">Length</div>
                    <div className="font-display text-2xl font-bold text-brand-accent">{snake.length}</div>
                  </div>
                </div>
                {isNewHigh && (
                  <div className="mt-3 font-mono text-[10px] font-bold tracking-[0.2em] text-brand-accent drop-shadow-[0_0_10px_rgba(216,180,226,0.5)]">
                    â˜… NEW HIGH SCORE â˜…
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="absolute h-32 w-32 rounded-full border border-brand-accent/10" style={{ animation: 'food-spin 8s linear infinite reverse' }} />
                <div className="absolute h-48 w-48 rounded-full border border-brand-accent/[0.06]" style={{ animation: 'food-spin 12s linear infinite' }} />
                <div className="mb-3 flex gap-2">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-brand-accent/60"
                      style={{ animation: `dot-blink 1.4s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
                <div className="font-display text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_25px_rgba(216,180,226,0.4)] sm:text-4xl">
                  Snake
                </div>
                <div className="mt-2 font-mono text-[10px] tracking-[0.2em] text-white/30 sm:text-[11px]">
                  EAT. GROW. SURVIVE.
                </div>
              </>
            )}
            <button
              onClick={handleStart}
              type="button"
              className="group mt-6 flex items-center gap-2.5 rounded-full border border-brand-accent/40 bg-brand-accent/10 px-7 py-2.5 font-display text-sm font-semibold text-brand-accent transition-all duration-300 hover:border-brand-accent/60 hover:bg-brand-accent/20 hover:shadow-[0_0_40px_rgba(216,180,226,0.25)] active:scale-95"
            >
              {isGameOver ? 'Play Again' : 'Start Game'}
            </button>
            <div className="mt-3 font-mono text-[8px] tracking-wider text-white/15">
              {isGameOver ? 'SPACE or ENTER to restart' : 'SPACE or ENTER to start'}
            </div>
          </div>
        )}
      </div>

      {/* D-pad — always visible for easy control */}
      <div className="flex flex-col items-center gap-1.5 sm:gap-1">
        <button
          onClick={() => handleDirection(DIR_UP)}
          type="button"
          className="flex h-14 w-14 sm:h-11 sm:w-11 items-center justify-center rounded-2xl sm:rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition-all duration-200 hover:border-brand-accent/50 hover:bg-brand-accent/15 hover:text-brand-accent active:border-brand-accent/70 active:bg-brand-accent/25 active:text-brand-accent active:scale-95 text-xl"
          aria-label="Move up"
        >▲</button>
        <div className="flex gap-1.5 sm:gap-1">
          <button
            onClick={() => handleDirection(DIR_LEFT)}
            type="button"
            className="flex h-14 w-14 sm:h-11 sm:w-11 items-center justify-center rounded-2xl sm:rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition-all duration-200 hover:border-brand-accent/50 hover:bg-brand-accent/15 hover:text-brand-accent active:border-brand-accent/70 active:bg-brand-accent/25 active:text-brand-accent active:scale-95 text-xl"
            aria-label="Move left"
          >◀</button>
          <button
            onClick={() => handleDirection(DIR_DOWN)}
            type="button"
            className="flex h-14 w-14 sm:h-11 sm:w-11 items-center justify-center rounded-2xl sm:rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition-all duration-200 hover:border-brand-accent/50 hover:bg-brand-accent/15 hover:text-brand-accent active:border-brand-accent/70 active:bg-brand-accent/25 active:text-brand-accent active:scale-95 text-xl"
            aria-label="Move down"
          >▼</button>
          <button
            onClick={() => handleDirection(DIR_RIGHT)}
            type="button"
            className="flex h-14 w-14 sm:h-11 sm:w-11 items-center justify-center rounded-2xl sm:rounded-xl border border-white/10 bg-white/[0.04] text-white/50 transition-all duration-200 hover:border-brand-accent/50 hover:bg-brand-accent/15 hover:text-brand-accent active:border-brand-accent/70 active:bg-brand-accent/25 active:text-brand-accent active:scale-95 text-xl"
            aria-label="Move right"
          >▶</button>
        </div>
      </div>

      {/* Desktop hints */}
      <div className="hidden sm:flex items-center gap-3">
        <span className="font-mono text-[8px] text-white/15">WASD / Arrows to move</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span className="font-mono text-[8px] text-white/15">SPACE to pause</span>
        <span className="w-1 h-1 rounded-full bg-white/20" />
        <span className="font-mono text-[8px] text-white/15">Click board to start</span>
      </div>
      {/* Mobile hint */}
      <div className="sm:hidden font-mono text-[9px] text-white/20 tracking-wider">
        Swipe to move · Tap to pause
      </div>
    </div>
  );
};

export default SnakeGame;