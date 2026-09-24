import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue } from 'motion/react';
import { Sparkles, MoveRight } from 'lucide-react';
import { CATEGORY_DATA } from '../data/categoryData';

/* ───────── Shared UI Pieces ───────── */

function FloatingOrbs({ color }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            background: `${color}${20 + (i % 3) * 15}`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: `0 0 ${Math.random() * 10 + 5}px ${color}40`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.6, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}

/* ───────── Simple Service Link Card ───────── */

function ServiceLinkCard({ service, index, color, gradient, categorySlug }) {
  return (
    <Link to={`/services/${categorySlug}/${service.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: index * 0.1, duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
        className="group relative rounded-3xl border border-white/[0.08] overflow-hidden cursor-pointer transition-all duration-500 hover:border-white/[0.2] hover:-translate-y-2 hover:shadow-2xl h-full flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Dynamic Hover Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle 300px at 50% 50%, ${color}10, transparent 70%)`,
          }}
        />

        {/* Top Animated Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-20 group-hover:opacity-100 transition-all duration-700"
          style={{ background: gradient }}
        />

        {/* Main content */}
        <div className="relative z-10 p-8 md:p-10 flex flex-col flex-1">
          <div className="flex items-center gap-4 mb-5">
            <span className="font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-widest transition-colors duration-500 group-hover:bg-white/10"
              style={{ background: `${color}15`, color: `${color}e6`, border: `1px solid ${color}25` }}
            >
              {service.icon}
            </span>
          </div>
          
          <h3 className="font-display text-2xl md:text-3xl font-bold text-white/90 group-hover:text-white transition-colors duration-300 mb-4">
            {service.name}
          </h3>
          
          <p className="text-white/50 text-[15px] font-medium leading-relaxed max-w-lg mb-8 flex-1">
            {service.desc}
          </p>

          <div className="flex items-center gap-3 font-display font-semibold text-sm mt-auto" style={{ color: color }}>
            <span>Explore Details</span>
            <MoveRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

const ServiceCategory = () => {
  const { category } = useParams();
  const data = CATEGORY_DATA[category];
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const numberY = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const numberOpacity = useTransform(scrollYProgress, [0, 0.8], [0.08, 0]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('agencyspire:scroll-to-top'));
  }, [category]);

  const handleMouse = useCallback((e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a090d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">Category Not Found</h1>
          <Link to="/" className="text-brand-accent hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative selection:bg-brand-accent/30 selection:text-white" onMouseMove={handleMouse}
      style={{
        background: `
          radial-gradient(circle at 15% 5%, ${data.color}15 0%, transparent 45%),
          radial-gradient(circle at 85% 15%, ${data.color}10 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, ${data.color}08 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, ${data.color}05 0%, transparent 60%),
          linear-gradient(180deg, #07060a 0%, #0a090d 25%, #050408 50%, #0a090d 75%, #07060a 100%)
        `
      }}
    >
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Cinematic Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          style={{ y: orbY }}
          className="absolute -top-[20%] -left-[10%] w-[1000px] h-[1000px] rounded-full mix-blend-screen"
          animate={{ x: [0, 80, 0], scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full blur-[180px] opacity-[0.07]"
            style={{ background: `radial-gradient(circle, ${data.orbColor}, transparent 70%)` }}
          />
        </motion.div>
        <motion.div
          className="absolute top-[20%] -right-[20%] w-[1200px] h-[1200px] rounded-full mix-blend-screen"
          animate={{ x: [0, -100, 0], scale: [1, 0.8, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-full h-full rounded-full blur-[200px] opacity-[0.05]"
            style={{ background: `radial-gradient(circle, ${data.orbColor}, transparent 70%)` }}
          />
        </motion.div>
      </div>

      {/* Premium Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${data.color} 1px, transparent 1px),
            linear-gradient(to bottom, ${data.color} 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
        }}
      />

      {/* ════════ HERO ════════ */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex items-center z-10">
        <FloatingOrbs color={data.color} />

        {/* Giant background letter with Parallax */}
        <motion.div
          style={{ y: numberY, opacity: numberOpacity }}
          className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none mix-blend-overlay"
        >
          <span className="font-display text-[25rem] md:text-[40rem] font-black leading-none tracking-tighter"
            style={{ color: 'transparent', WebkitTextStroke: `2px ${data.color}30`, textShadow: `0 0 100px ${data.color}20` }}
          >
            {data.title.charAt(0)}
          </span>
        </motion.div>

        <motion.div style={{ y: heroContentY }} className="relative max-w-7xl mx-auto px-6 md:px-12 w-full">
          {/* Glowing Badge Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-12 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
          >
            <Link to="/" className="text-white/40 hover:text-white transition-colors font-display text-[11px] uppercase tracking-[0.2em]">Home</Link>
            <span className="w-1 h-1 rounded-full" style={{ background: data.color }} />
            <span style={{ color: `${data.color}` }} className="font-display text-[11px] uppercase tracking-[0.2em] font-bold">{data.title}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
            <div className="lg:col-span-7">
              {/* Title */}
              <div className="overflow-hidden mb-6">
                <motion.h1
                  initial={{ y: '110%', rotateZ: 5 }}
                  animate={{ y: 0, rotateZ: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                  className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-white leading-[0.9]"
                >
                  <span className="block italic font-light text-transparent bg-clip-text pb-2" style={{ backgroundImage: data.gradient }}>
                    {data.title}
                  </span>
                  Services.
                </motion.h1>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="mt-6 max-w-xl text-white/50 text-lg md:text-xl font-medium leading-relaxed font-body"
              >
                {data.description}
              </motion.p>
            </div>

            {/* Right side: Highlights */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ delay: 0.4, duration: 1, type: "spring" }}
                className="grid grid-cols-1 gap-4 perspective-1000"
              >
                {data.highlights.map((h, i) => (
                  <motion.div
                    key={h.label}
                    whileHover={{ scale: 1.05, x: 10, rotateY: -5 }}
                    className="relative p-6 rounded-3xl border border-white/[0.08] flex items-center justify-between overflow-hidden"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.02)',
                      backdropFilter: 'blur(20px)',
                      marginLeft: `${i * 1.5}rem`,
                      boxShadow: `0 20px 40px -20px ${data.color}20`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/[0.02]" />
                    <div className="relative z-10">
                      <div className="font-mono text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: `${data.color}aa` }}>{h.label}</div>
                      <div className="font-display text-4xl font-black text-white tracking-tight">{h.value}</div>
                    </div>
                    <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center border border-white/10" style={{ background: `${data.color}15` }}>
                      <Sparkles className="w-5 h-5" style={{ color: data.color }} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════ SERVICES GRID (Simple Links) ════════ */}
      <section id="services-list" className="relative py-12 md:py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight"
            >
              Choose a <span className="italic font-light text-transparent bg-clip-text" style={{ backgroundImage: data.gradient }}>Service</span>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-[120px] rounded-full pointer-events-none opacity-10"
              style={{ background: data.color }}
            />
            
            {data.services.map((service, i) => (
              <ServiceLinkCard 
                key={service.name} 
                service={service} 
                index={i} 
                color={data.color} 
                gradient={data.gradient}
                categorySlug={category}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer Spacing */}
      <div className="h-32"></div>

    </div>
  );
};

export default ServiceCategory;
