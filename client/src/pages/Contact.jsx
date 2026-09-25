import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '../validation/contact.schema.js';

const FORM_FIELDS = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name', required: true, half: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'hello@example.com', required: true, half: true },
  { name: 'company', label: 'Company', type: 'text', placeholder: 'Your company', half: true },
  { name: 'service', label: 'Service', type: 'select', half: true, options: [
    { value: '', label: 'Select a service' },
    { value: 'development', label: 'Development' },
    { value: 'design', label: 'Design' },
    { value: 'ai-automation', label: 'AI & Automation' },
    { value: 'marketing', label: 'Marketing' },
    { value: '3d', label: '3D' },
  ]},
  { name: 'budget', label: 'Budget Range', type: 'select', options: [
    { value: '', label: 'Select budget range' },
    { value: '5k-15k', label: '$5k - $15k' },
    { value: '15k-50k', label: '$15k - $50k' },
    { value: '50k-100k', label: '$50k - $100k' },
    { value: '100k+', label: '$100k+' },
  ]},
  { name: 'message', label: 'Tell us about your project', type: 'textarea', placeholder: 'Describe your project, goals, and timeline...' },
];

const CONTACT_INFO = [
  { icon: Mail, label: 'hello@agencyspire.com', href: 'mailto:hello@agencyspire.com', clickable: true },
  { icon: Phone, label: '+1 (234) 567-890', href: 'tel:+1234567890', clickable: true },
  { icon: MapPin, label: 'New York, NY', clickable: false },
];

function FormField({ field, register, error, index }) {
  const [focused, setFocused] = useState(false);

  const baseClasses = "w-full rounded-xl border bg-white/60 px-5 py-4 font-display text-sm text-[#25152d] outline-none transition-all duration-300 placeholder-[#674a70]/60";
  const borderClasses = focused
    ? "border-[#a06cd5]/50 shadow-[0_0_20px_rgba(160,108,213,0.15)]"
    : "border-[#25152d]/10 hover:border-[#25152d]/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className={field.half ? 'md:col-span-1' : 'md:col-span-2'}
    >
      <label className="block font-display text-sm font-medium text-[#674a70] mb-2">{field.label}</label>
      {field.type === 'select' ? (
        <select
          {...register(field.name)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${baseClasses} ${borderClasses} appearance-none`}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white">{opt.label}</option>
          ))}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          {...register(field.name)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={5}
          className={`${baseClasses} ${borderClasses} resize-none`}
          placeholder={field.placeholder}
        />
      ) : (
        <input
          type={field.type}
          {...register(field.name)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${baseClasses} ${borderClasses}`}
          placeholder={field.placeholder}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
    </motion.div>
  );
}

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to send');
      }
      setSubmitted(true);
      reset();
    } catch (e) {
      setApiError('Unable to send your message right now. Please try again.');
    }
  };

  return (
    <div className="min-h-screen stats-section" data-nav-theme="light">
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden z-10">
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block font-mono text-xs uppercase tracking-[0.35em] text-[#a06cd5] mb-6 font-bold"
          >
            Get in Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display text-5xl md:text-7xl lg:text-[6.5rem] font-black tracking-tight text-[#25152d] mb-6 leading-[0.9]"
          >
            Let's build
            <br />
            <span className="font-light italic text-[#674a70]">something great.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-xl mx-auto text-lg text-[#674a70] font-medium"
          >
            Tell us about your project. We'll get back to you within 24 hours.
          </motion.p>
        </div>
      </section>

      <section className="relative pb-24 md:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl border border-[#25152d]/10 bg-white/60 p-12 text-center shadow-lg"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#D8B4E2] to-[#a06cd5] mb-6"
                    >
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </motion.div>
                    <h3 className="font-display text-2xl font-bold text-[#25152d] mb-3">Message Sent!</h3>
                    <p className="text-[#674a70]">We'll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {FORM_FIELDS.map((field, i) => (
                        <FormField
                          key={field.name}
                          field={field}
                          register={register}
                          error={errors[field.name]}
                          index={i}
                        />
                      ))}
                    </div>
                    <input type="text" {...register('website')} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                    {apiError && <p className="text-sm text-red-600">{apiError}</p>}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(160,108,213,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-3 rounded-full px-8 py-4 font-display text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #a06cd5, #5b346d)' }}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                        <Send className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 space-y-6"
            >
              <div className="rounded-2xl border border-[#25152d]/10 bg-white/60 p-8 shadow-md">
                <h3 className="font-display text-lg font-bold text-[#25152d] mb-6">Contact Info</h3>
                <div className="space-y-4">
                  {CONTACT_INFO.map((item) => {
                    const Icon = item.icon;
                    const Wrapper = item.clickable ? 'a' : 'div';
                    return (
                      <motion.div
                        key={item.label}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      >
                        <Wrapper
                          {...(item.clickable ? { href: item.href } : {})}
                          className="flex items-center gap-4 text-[#674a70] hover:text-[#a06cd5] transition-colors group"
                        >
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#25152d]/5 group-hover:bg-[#a06cd5]/10 transition-colors">
                            <Icon className="w-5 h-5 text-[#25152d] group-hover:text-[#a06cd5] transition-colors" />
                          </div>
                          <span className="font-display text-sm font-medium">{item.label}</span>
                        </Wrapper>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {[
                { title: 'Response Time', desc: 'We typically respond within 24 hours on business days. For urgent inquiries, reach us directly via email.' },
                { title: 'Office Hours', desc: 'Monday — Friday: 9:00 AM — 6:00 PM (EST)\nSaturday — Sunday: Closed' },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ borderColor: 'rgba(160,108,213,0.3)', backgroundColor: 'rgba(255,255,255,0.8)' }}
                  className="rounded-2xl border border-[#25152d]/10 bg-white/60 p-8 transition-all shadow-md"
                >
                  <h3 className="font-display text-lg font-bold text-[#25152d] mb-3">{card.title}</h3>
                  <p className="text-[#674a70] text-sm leading-relaxed whitespace-pre-line font-medium">{card.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
