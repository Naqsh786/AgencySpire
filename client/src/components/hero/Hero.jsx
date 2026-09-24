import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ArrowRight } from 'lucide-react';
import RibbonDecorations from '../ui/RibbonDecorations';
import ParticleButton from '../ui/ParticleButton';
import QuantumNebula from '../ui/quantum-nebula';

const Hero = () => {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const textRef = useRef(null);
  const ctaRef = useRef(null);
  const imageRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      
      gsap.set('.hero-line-inner', { yPercent: 120, rotation: 5, transformOrigin: "0% 100%", opacity: 0 });
      gsap.set([textRef.current, ctaRef.current], { opacity: 0, y: 30 });
      gsap.set('.hero-eyebrow', { opacity: 0, x: -20 });
      gsap.set('.hero-bg-light', { opacity: 0, scale: 0.8 });
      gsap.set('.hero-blob', { opacity: 0, scale: 0.3 });
      gsap.set('.hero-tilt-img', { opacity: 0, scale: 0.8, y: 40 });
      
      tl.to('.hero-bg-light', { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' })
      .to('.hero-blob', { opacity: 1, scale: 1, duration: 1.5, stagger: 0.2, ease: 'elastic.out(1, 0.5)' }, '-=1.5')
      .to('.hero-tilt-img', { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=1')
      .to('.hero-eyebrow', { opacity: 1, x: 0, duration: 1 }, '-=1.5')
      .to('.hero-line-inner', { yPercent: 0, rotation: 0, opacity: 1, duration: 1.2, stagger: 0.1 }, '-=1')
      .to(textRef.current, { opacity: 1, y: 0, duration: 1 }, '-=0.8')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 1 }, '-=0.8');
      
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  // KDM-style 3D tilt on right image
  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    imageRef.current.style.transform = `rotateY(${x * 15}deg) rotateX(${y * -15}deg) scale(1.05)`;
  };

  const handleMouseLeave = () => {
    if (!imageRef.current) return;
    imageRef.current.style.transform = 'rotateY(0deg) rotateX(0deg) scale(1)';
  };

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-screen flex items-center overflow-hidden bg-brand-bg pt-20"
    >
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <QuantumNebula />
      </div>
      
      {/* Main ambient glow */}
      <div className="hero-bg-light absolute top-1/3 left-0 w-[800px] h-[800px] bg-brand-accent/20 rounded-full blur-[150px] pointer-events-none z-0" />
      
      {/* Floating blobs */}
      <div className="hero-blob absolute top-[15%] right-[10%] w-64 h-64 bg-brand-accent/10 shape-blob blur-[60px] pointer-events-none z-0" />
      
      {/* Unique decorative elements — reduced */}
      <RibbonDecorations twinkles orbs />
      
      {/* Floating vector elements — KDM style */}
      <div className="absolute top-[25%] right-[5%] w-3 h-3 bg-brand-accent/40 rounded-full animate-float-v pointer-events-none z-0 hidden lg:block" />
      <div className="absolute top-[60%] right-[20%] w-2 h-2 bg-brand-accent/30 rounded-full animate-float-h pointer-events-none z-0 hidden lg:block" />
      <div className="absolute top-[40%] left-[3%] w-4 h-4 border border-brand-accent/20 rotate-45 animate-float-v pointer-events-none z-0 hidden lg:block" />
      
      {/* Content */}
      <div className="container mx-auto px-6 md:px-12 relative z-10 pointer-events-none">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Text */}
          <div>
            <div className="hero-eyebrow mb-8">
              <div className="ribbon-tag">
                Creative Technology Partner
              </div>
            </div>
            
            <h1 ref={headlineRef} className="text-[2.75rem] sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-display font-bold leading-[0.9] tracking-tight mb-6 sm:mb-8">
              <div className="overflow-hidden pb-3">
                <div className="hero-line-inner">WE BUILD</div>
              </div>
              <div className="overflow-hidden pb-3">
                <div className="hero-line-inner">WHAT'S</div>
              </div>
              <div className="overflow-hidden pb-3">
                <div className="hero-line-inner text-brand-accent relative">
                  NEXT.
                  <span className="absolute -bottom-2 left-0 w-3/4 h-[3px] bg-gradient-to-r from-brand-accent/60 to-transparent" />
                </div>
              </div>
            </h1>
            
            <p ref={textRef} className="text-base sm:text-xl md:text-2xl text-brand-text-muted max-w-xl mb-8 sm:mb-12 font-body font-normal leading-relaxed text-balance">
              Brands, digital experiences, technology and growth — built under one roof.
            </p>
            
            {/* KDM-style CTA buttons */}
            <div ref={ctaRef} className="flex flex-col items-start sm:flex-row sm:items-center gap-6 pointer-events-auto">
              <ParticleButton href="#contact">
                Let's Talk
                <ArrowRight size={16} />
              </ParticleButton>
              <a href="#work" className="btn-kdm btn-kdm-outline">
                See Our Work
                <span className="btn-kdm-icon">
                  <ArrowRight size={16} />
                </span>
              </a>
            </div>
          </div>

          {/* Right: 3D tilt image (desktop) / static card (mobile) */}
          <div className="flex justify-center items-center hero-tilt pointer-events-auto">
            {/* Desktop 3D tilt */}
            <div 
              ref={imageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="hero-tilt-img hidden lg:block relative w-[400px] h-[400px] transition-transform duration-300 ease-out cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-brand-accent/5 rounded-[3rem] rotate-12 border border-brand-accent/15 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80"
                  alt="agencyspire workspace"
                  className="h-full w-full object-cover opacity-60"
                  loading="eager"
                />
              </div>
              <div className="absolute inset-4 bg-gradient-to-tl from-brand-surface/80 to-brand-bg/60 rounded-[2.5rem] -rotate-6 border border-brand-accent/10 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                  alt="agencyspire team collaboration"
                  className="h-full w-full object-cover opacity-90"
                  loading="eager"
                />
              </div>
              <div className="absolute inset-8 bg-gradient-to-br from-brand-accent/10 to-transparent rounded-[2rem] rotate-3 pointer-events-none" />
              <div className="absolute inset-0 rounded-[3rem] opacity-0 hover:opacity-100 transition-opacity duration-500 shadow-[0_0_60px_rgba(216,180,226,0.3)]" />
            </div>
            {/* Mobile static card */}
            <div className="lg:hidden relative w-[280px] sm:w-[340px] aspect-square rounded-[2rem] border border-brand-accent/15 overflow-hidden shadow-[0_0_40px_rgba(216,180,226,0.15)]">
              <img
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=70"
                alt="agencyspire workspace"
                className="h-full w-full object-cover opacity-50"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="ribbon-tag mb-3">Creative Technology</div>
                <p className="text-sm text-brand-text-muted">Design, build, automate & grow — under one roof.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* KDM-style curved bottom divider */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-10">
        <svg viewBox="0 0 1440 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" style={{ height: '100px' }} preserveAspectRatio="none">
          <path d="M0 140L1440 140L1440 60C1200 120 960 0 720 60C480 120 240 20 0 80Z" fill="#14101C" />
          <path d="M0 140L1440 140L1440 70C1200 130 960 10 720 70C480 130 240 30 0 90Z" stroke="rgba(216,180,226,0.08)" strokeWidth="1" fill="none" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
