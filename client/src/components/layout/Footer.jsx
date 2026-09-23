import { memo } from 'react';
import { Mail, MapPin, Camera, MessageCircle, Briefcase, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FooterBackgroundGradient, TextHoverEffect } from "../ui/hover-footer";

const Footer = () => {
  const navigate = useNavigate();

  // Same-page section pe smooth scroll, cross-page pe navigate + scroll.
  // mailto:/http links untouched chhorte hain (browser handle karega).
  const goTo = (path, hash) => (e) => {
    if (!path.startsWith("/")) return;
    e.preventDefault();
    if (hash) {
      const scrollTo = () => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
        else setTimeout(scrollTo, 50);
      };
      if (window.location.pathname === path) {
        scrollTo();
      } else {
        navigate(path);
        setTimeout(scrollTo, 100);
      }
    } else if (window.location.pathname !== path) {
      navigate(path);
    }
  };

  const footerLinks = [
    {
      title: "Explore",
      links: [
        { label: "Work", href: "/#work" },
        { label: "Services", href: "/services" },
        { label: "About", href: "/#about" },
        { label: "Process", href: "/#process" },
      ],
    },
    {
      title: "Connect",
      links: [
        { label: "Careers", href: "mailto:hello@aetheriatech.com?subject=Careers%20at%20Aetheria" },
        { label: "Contact", href: "/contact" },
        {
          label: "Start a Project",
          href: "/contact",
          pulse: true,
        },
      ],
    },
  ];

  const contactInfo = [
    {
      icon: <Mail size={18} className="text-brand-accent" />,
      text: "hello@aetheriatech.com",
      href: "mailto:hello@aetheriatech.com",
    },
    {
      icon: <MapPin size={18} className="text-brand-accent" />,
      text: "New York, NY",
    },
  ];

  const socialLinks = [
    { icon: <Briefcase size={20} />, label: "LinkedIn", href: "https://www.linkedin.com/company/aetheriatech" },
    { icon: <Camera size={20} />, label: "Instagram", href: "https://www.instagram.com/aetheriatech" },
    { icon: <MessageCircle size={20} />, label: "Twitter", href: "https://twitter.com/aetheriatech" },
    { icon: <Globe size={20} />, label: "Website", href: "/" },
  ];

  return (
    <footer className="relative h-fit overflow-hidden mt-12">
      {/* Diagonal top cut */}
      <div className="absolute top-0 left-0 w-full h-20 z-10 pointer-events-none">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 20L0 80Z" fill="var(--color-section-charcoal)" />
          <path d="M0 80L1440 80L1440 30L0 80Z" stroke="rgba(216,180,226,0.1)" strokeWidth="1" />
        </svg>
      </div>

      <div className="bg-[var(--color-section-charcoal)] rounded-t-[3rem] border-t border-brand-accent/20 relative pt-24">
        <div className="max-w-7xl mx-auto p-6 sm:p-10 md:p-14 z-40 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">
            {/* Brand section */}
            <div className="flex flex-col space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 shape-hex bg-brand-accent flex items-center justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-bg"></span>
                </div>
                <span className="text-brand-text text-3xl font-display font-bold tracking-tight">Aetheria</span>
              </div>
              <p className="text-base text-gray-200 leading-relaxed max-w-sm font-medium">
                We design, build, automate and grow digital businesses â€” combining strategy, design, engineering and AI into one connected process.
              </p>
            </div>

            {/* Footer link sections */}
            {footerLinks.map((section) => (
              <div key={section.title}>
                <h4 className="text-white text-xl font-display font-bold mb-6 flex items-center gap-3">
                  <div className="w-2 h-2 shape-diamond bg-brand-accent/60" />
                  {section.title}
                </h4>
                <ul className="space-y-4">
                  {section.links.map((link) => {
                    const [path, hash] = link.href.split("#");
                    return (
                      <li key={link.label} className="relative w-fit">
                        <a
                          href={link.href}
                          onClick={goTo(path || "/", hash ? `#${hash}` : undefined)}
                          className="text-base text-gray-200 hover:text-brand-accent transition-colors duration-300 font-medium flex items-center gap-2 group"
                        >
                          <span className="w-1 h-1 rounded-full bg-brand-accent/30 group-hover:bg-brand-accent transition-colors" />
                          {link.label}
                        </a>
                        {link.pulse && (
                          <span className="absolute top-1 -right-4 w-2.5 h-2.5 shape-diamond bg-brand-accent animate-pulse"></span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* Contact section */}
            <div>
              <h4 className="text-white text-xl font-display font-bold mb-6 flex items-center gap-3">
                <div className="w-2 h-2 shape-hex bg-brand-accent/60" />
                Contact Us
              </h4>
              <ul className="space-y-4">
                {contactInfo.map((item, i) => (
                  <li key={i} className="flex items-center space-x-3 text-base text-gray-200 font-medium">
                    {item.href ? (
                      <a
                        href={item.href}
                        className="hover:text-brand-accent transition-colors duration-300 flex items-center gap-3"
                      >
                        {item.icon}
                        {item.text}
                      </a>
                    ) : (
                      <span className="hover:text-brand-accent transition-colors duration-300 flex items-center gap-3">
                        {item.icon}
                        {item.text}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="border-t border-brand-accent/15 my-8" />

          {/* Footer bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center text-base space-y-4 md:space-y-0">
            <div className="flex space-x-6 text-gray-200">
              {socialLinks.map(({ icon, label, href }) => {
                const external = href.startsWith("http");
                return (
                  <a
                    key={label}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: goTo("/") })}
                    aria-label={label}
                    className="hover:text-brand-accent transition-all hover:scale-110 duration-300 hover:drop-shadow-[0_0_8px_rgba(216,180,226,0.5)]"
                  >
                    {icon}
                  </a>
                );
              })}
            </div>

            <p className="text-center md:text-left text-gray-200 font-medium">
              &copy; {new Date().getFullYear()} Aetheria Tech. All rights reserved.
            </p>
          </div>
        </div>

        {/* Text hover effect — large outlined AETHERIA */}
        <div className="lg:flex hidden h-[28rem] -mt-36 -mb-20">
          <TextHoverEffect text="Aetheria" className="z-50" />
        </div>

        <FooterBackgroundGradient />
      </div>
    </footer>
  );
};

export default memo(Footer);
