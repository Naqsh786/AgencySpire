import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SnakeGame from '../ui/SnakeGame';

gsap.registerPlugin(ScrollTrigger);

const agencySlides = [
  { name: 'Brand Systems', description: 'Identity systems that give ambitious companies a clear, memorable point of view.', image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1400&q=75' },
  { name: 'Digital Products', description: 'Thoughtful interfaces that turn complex ideas into effortless digital experiences.', image: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1400&q=75' },
  { name: 'AI Workflows', description: 'Intelligent automation that gives teams more time to focus on meaningful work.', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1400&q=75' },
  { name: 'Growth Platforms', description: 'Scalable foundations built to support the next stage of your business.', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=75' },
  { name: 'Creative Direction', description: 'A sharper creative point of view, from the first idea to the final interaction.', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=75' },
  { name: 'Long-Term Impact', description: 'Digital work that keeps improving, performing and creating value after launch.', image: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1400&q=75' },
];

const WhyUs = () => {
  const sectionRef = useRef(null);
  const s1Ref = useRef(null);
  const s2Ref = useRef(null);

  useGSAP(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const s1 = s1Ref.current;
      const track = s1?.querySelector('.scene-01-track');
      if (s1 && track) {
        const distance = () => {
          const slides = track.querySelectorAll('.scene-01-slide');
          const lastSlide = slides[slides.length - 1];
          if (!lastSlide) return 0;
          return Math.max(0, lastSlide.offsetLeft + lastSlide.offsetWidth / 2 - window.innerWidth / 2);
        };
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: s1,
            pin: s1,
            start: 'top top',
            end: () => `+=${distance()}`,
            pinSpacing: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
      }
    });

    const fontsReady = document.fonts?.ready;
    fontsReady?.then(() => ScrollTrigger.refresh());
    const images = section.querySelectorAll('img');
    const refreshAfterImage = () => ScrollTrigger.refresh();
    images.forEach((image) => image.addEventListener('load', refreshAfterImage, { once: true }));
    window.addEventListener('load', ScrollTrigger.refresh);
    return () => {
      images.forEach((image) => image.removeEventListener('load', refreshAfterImage));
      window.removeEventListener('load', ScrollTrigger.refresh);
      mm.revert();
    };
  }, { scope: sectionRef });

  return (
    <section
      id="why-us"
      ref={sectionRef}
      className="relative z-10 isolate text-brand-text"
      style={{ background: 'var(--color-brand-bg)' }}
    >
      <DecorativeBackdrop />

      {/* ============ SCENE 01: ONE TEAM ============ */}
      <section
        ref={s1Ref}
        className="why-us-scene why-us-scene-01 relative z-10 h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="relative z-10 h-full w-full">
          <div className="scene-01-slides relative h-full min-h-screen w-full overflow-hidden bg-brand-bg/50">
            <div className="scene-01-track flex h-full w-max items-center gap-6 px-[10vw] lg:gap-10">
            {agencySlides.map((slide, index) => (
              <article key={slide.name} className="scene-01-slide relative h-[72vh] min-h-[440px] w-[82vw] max-w-[1180px] shrink-0 snap-start overflow-hidden rounded-[1.5rem] border border-brand-accent/25 p-5 shadow-2xl md:p-10 lg:h-[74vh] lg:w-[78vw]" style={{ willChange: 'transform, opacity' }}>
                <div className="absolute inset-0 overflow-hidden">
                  <img src={slide.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" className="scene-01-slide-image h-full w-full object-cover opacity-65" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/20 to-brand-bg/5" />
                </div>
                <div className="relative z-10 flex h-full flex-col justify-end pb-4 md:pb-8">
                  <span className="scene-01-slide-number font-mono text-xs tracking-[0.3em] text-brand-accent">0{index + 1} / 06</span>
                  <h4 className="mt-3 max-w-3xl text-3xl font-display font-bold leading-[0.98] text-white md:text-6xl">{slide.name}</h4>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 md:text-lg">{slide.description}</p>
                </div>
              </article>
            ))}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-accent/10 via-transparent to-brand-bg/40" />
          </div>
        </div>
      </section>

      {/* ============ SCENE 02: SNAKE GAME ============ */}
      <section
        ref={s2Ref}
        className="why-us-scene why-us-scene-02 relative z-10 flex flex-col items-center justify-center overflow-hidden py-12 sm:py-16 md:py-24"
      >
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <defs>
              <pattern id="tech-grid-full" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(216,180,226,0.08)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#tech-grid-full)" />
          </svg>
        </div>

        {/* Mobile title */}
        <h2 className="relative z-10 mb-6 sm:mb-8 text-center text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-white sm:hidden">
          Take a <span className="italic font-light text-brand-accent">break.</span>
        </h2>

        <div className="relative z-10 w-full max-w-md sm:max-w-lg">
          <SnakeGame />
        </div>
      </section>

    </section>
  );
};

// Subtle decorative backdrop
const DecorativeBackdrop = () => (
  <>
    <div
      aria-hidden="true"
      className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none z-0"
    />
    <div
      aria-hidden="true"
      className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-brand-accent/4 rounded-full blur-[100px] pointer-events-none z-0"
    />
  </>
);

export default WhyUs;
