import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from 'motion/react';
import { ArrowUpRight, ArrowRight, ChevronDown, Check, Sparkles, MoveRight } from 'lucide-react';
import { CATEGORY_DATA } from '../data/categoryData';

/* ───────── Shared UI Pieces ───────── */

function GradientLine({ color }) {
  return (
    <div className="relative h-[1px] w-full overflow-hidden z-10">
      <div className="absolute inset-0"
        style={{ background: `linear-gradient(90deg, transparent 5%, ${color}40 30%, ${color}80 50%, ${color}40 70%, transparent 95%)` }}
      />
      <div className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
          animation: 'lineShimmer 3s ease-in-out infinite',
        }}
      />
    </div>
  );
}

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

function PortfolioCard({ item, index, color }) {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 150, y: 150 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });
    setTilt({ 
      x: (x - rect.width / 2) * 0.05, 
      y: (y - rect.height / 2) * 0.05 
    });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="perspective-1000">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        animate={{ rotateX: -tilt.y, rotateY: tilt.x }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        transition={{ delay: index * 0.1, duration: 0.5, type: 'spring', stiffness: 100, damping: 20 }}
        className="group relative rounded-[2rem] border border-white/[0.08] overflow-hidden cursor-pointer h-full"
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          boxShadow: `0 20px 40px -20px ${color}20`
        }}
      >
        {/* Dynamic Hover Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10 mix-blend-screen"
          style={{
            background: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, ${color}30, transparent 70%)`,
          }}
        />
        
        {/* Inner glass border */}
        <div className="absolute inset-3 z-20 rounded-[1.2rem] border border-white/[0.05] pointer-events-none transition-colors duration-500 group-hover:border-white/[0.1]" />

        <div className="aspect-[4/3] overflow-hidden relative m-3 rounded-[1.2rem]">
          <div className="absolute inset-0 z-10 transition-opacity duration-500 opacity-60 group-hover:opacity-10"
            style={{ background: `linear-gradient(180deg, transparent 0%, #0A0A0B 100%)` }}
          />
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30 transition-transform duration-500 scale-50 group-hover:scale-100"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <ArrowUpRight className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 relative z-30 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-white/10 mb-5 inline-block backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.03)', color: `${color}ee` }}
          >
            {item.type}
          </span>
          <h3 className="font-display text-xl md:text-2xl font-bold text-white transition-all duration-300 group-hover:translate-x-2">
            {item.title}
          </h3>
        </div>
      </motion.div>
    </div>
  );
}

function FaqItem({ faq, index, color }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-white/[0.08] last:border-0 group"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-6 py-8 text-left transition-all"
      >
        <span className="font-display text-lg md:text-xl font-semibold text-white/70 group-hover:text-white transition-colors duration-300">
          {faq.q}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0, backgroundColor: open ? `${color}30` : `${color}10` }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
          style={{ borderColor: `${color}30`, boxShadow: open ? `0 0 20px ${color}30` : 'none' }}
        >
          <span className="text-lg font-light transition-colors" style={{ color: open ? '#fff' : color }}>+</span>
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-8 text-white/50 text-[15px] leading-relaxed max-w-3xl pr-12 font-medium">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

const ServiceDetail = () => {
  const { category, serviceId } = useParams();
  const catData = CATEGORY_DATA[category];
  const service = catData?.services.find(s => s.id === serviceId);

  const heroRef = useRef(null);
  const iconRef = useRef(null);
  const [iconTransform, setIconTransform] = useState({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const orbY = useTransform(scrollYProgress, [0, 1], [0, -250]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('agencyspire:scroll-to-top'));
  }, [category, serviceId]);

  const handleMouse = useCallback((e) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  const handleIconMouseMove = useCallback((e) => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setIconTransform({ x: x * 0.2, y: y * 0.2, rotateX: -y * 0.3, rotateY: x * 0.3 });
  }, []);

  const handleIconMouseLeave = useCallback(() => {
    setIconTransform({ x: 0, y: 0, rotateX: 0, rotateY: 0 });
  }, []);

  if (!catData || !service) {
    return (
      <div className="min-h-screen bg-[#0a090d] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold text-white mb-4">Service Not Found</h1>
          <Link to="/" className="text-brand-accent hover:underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const Icon = catData.icon;

  return (
    <div className="min-h-screen relative selection:bg-brand-accent/30 selection:text-white" onMouseMove={handleMouse}
      style={{
        background: `
          radial-gradient(circle at 15% 5%, ${catData.color}15 0%, transparent 45%),
          radial-gradient(circle at 85% 15%, ${catData.color}10 0%, transparent 40%),
          radial-gradient(circle at 50% 50%, ${catData.color}08 0%, transparent 50%),
          radial-gradient(circle at 20% 80%, ${catData.color}05 0%, transparent 60%),
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
            style={{ background: `radial-gradient(circle, ${catData.orbColor}, transparent 70%)` }}
          />
        </motion.div>
      </div>

      {/* Premium Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${catData.color} 1px, transparent 1px),
            linear-gradient(to bottom, ${catData.color} 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
        }}
      />

      {/* ════════ HERO (Premium Layout) ════════ */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-[70vh] flex items-center z-10">
        <FloatingOrbs color={catData.color} />

        <motion.div style={{ y: heroContentY }} className="relative max-w-4xl mx-auto px-6 md:px-12 w-full text-center">
          {/* Glowing Badge Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-12 border border-white/10"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(10px)' }}
          >
            <Link to={`/services/${category}`} className="text-white/40 hover:text-white transition-colors font-display text-[11px] uppercase tracking-[0.2em]">{catData.title}</Link>
            <span className="w-1 h-1 rounded-full" style={{ background: catData.color }} />
            <span style={{ color: `${catData.color}` }} className="font-display text-[11px] uppercase tracking-[0.2em] font-bold">{service.name}</span>
          </motion.div>

          {/* Icon & Title */}
          <div className="overflow-hidden mb-6 flex flex-col items-center">
            <motion.h1
              initial={{ y: '110%', rotateZ: 5 }}
              animate={{ y: 0, rotateZ: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] font-black tracking-tighter text-white leading-[0.9]"
            >
              <motion.span 
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="block text-transparent bg-clip-text pb-4" 
                style={{ backgroundImage: `linear-gradient(270deg, ${catData.color}, #ffffff, ${catData.color})`, backgroundSize: '200% auto' }}
              >
                {service.name}
              </motion.span>
            </motion.h1>
          </div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-white/50 text-lg md:text-xl font-medium leading-relaxed font-body"
          >
            {service.longDesc}
          </motion.p>
        </motion.div>
      </section>

      <GradientLine color={catData.color} />

      {/* ════════ SERVICE DETAILS ════════ */}
      <section className="relative py-24 md:py-40 z-10">
        <FloatingOrbs color={catData.color} />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Features */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 mb-8"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: catData.color, boxShadow: `0 0 10px ${catData.color}` }} />
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] font-medium text-white/70">
                  What's Included
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-4xl md:text-5xl font-black text-white tracking-tight mb-8"
              >
                Core <span className="italic font-light text-transparent bg-clip-text" style={{ backgroundImage: catData.gradient }}>Features</span>
              </motion.h2>

              <div className="space-y-4">
                {service.features.map((feature, idx) => (
                  <motion.div 
                    key={feature} 
                    initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
                    whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, x: 10, backgroundColor: 'rgba(255,255,255,0.06)' }}
                    transition={{ delay: 0.1 + (idx * 0.08), type: 'spring', stiffness: 100, damping: 20 }}
                    className="group/feature flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.03] transition-colors cursor-default relative overflow-hidden"
                    style={{ backdropFilter: 'blur(10px)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover/feature:translate-x-full transition-transform duration-1000" />
                    <div className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 group-hover/feature:scale-110 group-hover/feature:rotate-12"
                      style={{ background: `${catData.color}20`, boxShadow: `0 0 20px ${catData.color}40` }}
                    >
                      <Check className="w-5 h-5" style={{ color: catData.color }} />
                    </div>
                    <span className="relative z-10 text-white/80 text-lg font-medium tracking-wide group-hover/feature:text-white transition-colors">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Visual or related info - Magnetic Hover 3D Glass */}
            <div className="relative perspective-1000">
              <motion.div
                ref={iconRef}
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true }}
                animate={{
                  x: iconTransform.x,
                  y: iconTransform.y,
                  rotateX: iconTransform.rotateX,
                  rotateY: iconTransform.rotateY,
                }}
                onMouseMove={handleIconMouseMove}
                onMouseLeave={handleIconMouseLeave}
                transition={{ 
                  duration: 0.5, 
                  type: "spring", 
                  stiffness: 150, 
                  damping: 15 
                }}
                className="relative p-10 rounded-3xl border border-white/[0.08] flex items-center justify-center overflow-hidden aspect-square cursor-pointer group"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(30px)',
                  WebkitBackdropFilter: 'blur(30px)',
                  boxShadow: `0 30px 60px -20px ${catData.color}40, inset 0 1px 0 rgba(255,255,255,0.1), inset 0 0 20px rgba(255,255,255,0.02)`
                }}
              >
                {/* Reactive Glow matching mouse */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] blur-[100px] rounded-full pointer-events-none opacity-30 group-hover:opacity-60 transition-opacity duration-500"
                  style={{ background: catData.color }}
                />
                
                {/* Inner glass ring */}
                <div className="absolute inset-4 rounded-[1.5rem] border border-white/5 bg-white/[0.01]" />
                
                <Icon className="w-32 h-32 relative z-10 transition-transform duration-500 group-hover:scale-110" style={{ color: catData.color, filter: `drop-shadow(0 0 30px ${catData.color}80)` }} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <GradientLine color={catData.color} />

      {/* ════════ PORTFOLIO PREVIEW ════════ */}
      {catData.portfolio && (
        <section className="relative py-24 md:py-40 z-10">
          <FloatingOrbs color={catData.color} />
          
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="mb-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center gap-3 mb-6"
              >
                <div className="h-px w-8" style={{ background: `${catData.color}50` }} />
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">
                  Featured Work
                </span>
                <div className="h-px w-8" style={{ background: `${catData.color}50` }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-5xl md:text-6xl font-black text-white tracking-tight"
              >
                Related <span className="italic font-light text-transparent bg-clip-text" style={{ backgroundImage: catData.gradient }}>Projects.</span>
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {catData.portfolio.map((item, i) => (
                <PortfolioCard key={item.title} item={item} index={i} color={catData.color} />
              ))}
            </div>
          </div>
        </section>
      )}

      {catData.portfolio && <GradientLine color={catData.color} />}

      {/* ════════ FAQ (Glassmorphism) ════════ */}
      {catData.faqs && (
        <section className="relative py-24 md:py-40 z-10">
          <FloatingOrbs color={catData.color} />
          
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            <div className="mb-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center justify-center gap-3 mb-6"
              >
                <div className="h-px w-8" style={{ background: `${catData.color}50` }} />
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/60">
                  Insights
                </span>
                <div className="h-px w-8" style={{ background: `${catData.color}50` }} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-5xl md:text-6xl font-black text-white tracking-tight"
              >
                Common <span className="italic font-light text-transparent bg-clip-text" style={{ backgroundImage: catData.gradient }}>Questions.</span>
              </motion.h2>
            </div>

            <div className="rounded-3xl border border-white/[0.08] p-6 md:p-12 relative overflow-hidden"
              style={{ 
                background: 'rgba(255,255,255,0.02)',
                backdropFilter: 'blur(20px)',
                boxShadow: `0 30px 60px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`
              }}
            >
              <div className="absolute top-0 right-0 w-96 h-96 blur-[100px] opacity-20 pointer-events-none" style={{ background: catData.color }} />
              
              <div className="relative z-10">
                {catData.faqs.map((faq, i) => (
                  <FaqItem key={i} faq={faq} index={i} color={catData.color} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {catData.faqs && <GradientLine color={catData.color} />}

      {/* ════════ CTA (Floating Premium Card) ════════ */}
      <section className="relative z-10 py-24 md:py-40 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, type: "spring" }}
            className="relative rounded-[3rem] border border-white/[0.1] overflow-hidden p-12 md:p-24 text-center group"
            style={{
              background: `
                radial-gradient(ellipse at 50% 0%, ${catData.color}25 0%, transparent 70%),
                linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)
              `,
              backdropFilter: 'blur(30px)',
              boxShadow: `0 40px 80px -20px ${catData.color}25, inset 0 2px 20px rgba(255,255,255,0.05)`
            }}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 pointer-events-none" />
            
            <FloatingOrbs color={catData.color} />

            <div className="relative z-10 max-w-3xl mx-auto">
              <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-white/20 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-[10deg]"
                style={{ background: catData.gradient, boxShadow: `0 20px 40px ${catData.color}40, inset 0 2px 10px rgba(255,255,255,0.5)` }}
              >
                <Icon className="w-10 h-10 text-white" />
              </div>

              <h2 className="font-display text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1]">
                Let's build something <span className="italic font-light text-transparent bg-clip-text" style={{ backgroundImage: catData.gradient }}>extraordinary.</span>
              </h2>
              
              <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto mb-12 font-medium">
                Ready to elevate your {service.name.toLowerCase()}? Partner with AgencySpire and turn your vision into a digital masterpiece.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link
                  to="/contact"
                  className="relative inline-flex items-center justify-center gap-3 rounded-full px-10 py-5 font-display text-[16px] font-bold overflow-hidden transition-all duration-300 hover:scale-105"
                  style={{ background: '#fff', color: '#000', boxShadow: `0 15px 30px -10px #fff` }}
                >
                  <span className="relative z-10 flex items-center gap-2">Get Started <MoveRight className="w-5 h-5" /></span>
                </Link>
                <Link
                  to={`/services/${category}`}
                  className="inline-flex items-center justify-center gap-3 rounded-full px-10 py-5 font-display text-[16px] font-bold border border-white/10 text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                >
                  Back to {catData.title}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServiceDetail;
