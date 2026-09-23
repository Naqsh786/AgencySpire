import { useRef, useEffect, useState, memo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import RibbonDecorations from '../ui/RibbonDecorations';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 5000, label: 'Clients Served', prefix: '', suffix: '+' },
  { value: 100, label: 'Accuracy Delivered', prefix: '', suffix: '%' },
  { value: 24, label: 'Support & Partnership', prefix: '', suffix: '/7' }
];

const AnimatedCounter = ({ target, suffix, prefix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const end = target;
          const duration = 2000;
          const increment = end / (duration / 16);
          
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="text-5xl md:text-7xl font-display font-bold text-white">
      {prefix}{count}{suffix}
    </span>
  );
};

const StatsRow = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current.querySelectorAll('.stat-item'),
        { y: 40, opacity: 0, scale: 0.9 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} data-nav-theme="light" className="stats-section relative overflow-hidden">
      {/* Diagonal top */}
      <div className="absolute top-0 left-0 w-full h-20 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 0L0 80Z" fill="#1a1025" />
        </svg>
      </div>

      <div className="stats-content container mx-auto px-4 sm:px-6 md:px-12 relative z-10 py-20 sm:py-24 md:py-32">
        <div className="why-choose-intro mx-auto mb-12 sm:mb-16 max-w-5xl text-center">
          <div className="section-title-kdm mb-8 justify-center">
            <h2 className="text-[2.2rem] sm:text-[2.6rem] font-display font-bold leading-[0.98] tracking-[-0.04em] text-[#25152d] md:text-[3.6rem] lg:text-[4.6rem]">Why Choose Us</h2>
          </div>
          <h3 className="mx-auto max-w-5xl text-[2.2rem] sm:text-[2.8rem] font-display font-bold leading-[0.94] tracking-[-0.045em] text-[#25152d] sm:text-5xl md:text-7xl lg:text-[6.4rem]">Built Around <span className="font-light italic text-[#674a70]">Your Ambition.</span></h3>
          <p className="mx-auto mt-6 sm:mt-8 max-w-3xl text-base sm:text-lg font-body leading-relaxed text-[#674a70] md:text-xl lg:text-2xl">Four reasons why leading brands choose us to design, build and grow their next generation of digital products.</p>
        </div>
        {/* Unique decorative elements */}
<RibbonDecorations orbs twinkles laserLine />
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
          
          {stats.map((stat, i) => (
            <div key={i} className="stat-item">
              {/* Enhanced KDM-style gradient border card with subtle glow */}
              <div className="gradient-border-card p-6 sm:p-8 md:p-10 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[240px] hover:scale-110 transition-all duration-500 hover:shadow-[0_0_30px_rgba(216,180,226,0.3)]">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                <div className="stats-label text-brand-text-muted font-mono tracking-widest uppercase text-xs sm:text-sm md:text-sm mt-3 sm:mt-4 font-semibold">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
          
        </div>
      </div>

      {/* SVG Curve divider at bottom */}
      <div className="absolute bottom-0 left-0 w-full z-10 pointer-events-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ height: '80px' }} preserveAspectRatio="none">
          <path d="M0 120L1440 120L1440 60C1200 120 960 0 720 60C480 120 240 20 0 80Z" fill="#0E0D12" />
          <path d="M0 120L1440 120L1440 70C1200 130 960 10 720 70C480 130 240 30 0 90Z" stroke="rgba(216,180,226,0.1)" strokeWidth="1" fill="none" />
        </svg>
      </div>
    </section>
  );
};

export default memo(StatsRow);
