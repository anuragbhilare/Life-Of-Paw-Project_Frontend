import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, MapPin, Phone, ArrowUp, Heart } from 'lucide-react';

const Footer = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: <Github size={18} />, url: 'https://github.com/anuragbhilare', label: 'GitHub' },
    { icon: <Linkedin size={18} />, url: 'https://www.linkedin.com/in/anuragbhilare19', label: 'LinkedIn' },
    { icon: <Mail size={18} />, url: 'mailto:anuragbhilare8@gmail.com', label: 'Email' }
  ];

  return (
    <footer className="relative bg-[#143225] text-[#F8F5F0] overflow-hidden border-t-2 border-[#D4A017]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />

      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:32px_32px]" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-[#D4A017]/20">
          
          <div className="flex flex-col space-y-6">
            <div>
              <span className="font-serif text-3xl tracking-widest text-[#F8F5F0] font-bold block">
                <span className="text-[#ffffff] font-serif font-light">LIFE OF</span><span className="text-[#D4A017] font-serif font-light"> PAW</span>
              </span>
              <span className="text-[11px] uppercase tracking-[0.3em] text-[#D4A017] font-semibold mt-1 block">
                EVERY PAW DESERVES A FUTURE
              </span>
            </div>
            <p className="text-sm text-[#F8F5F0]/80 font-sans leading-relaxed">
              We operate under the profound belief that compassion is the ultimate form of art. By restoring dignity, rehabilitation, and finding loving homes for neglected paws, we refine the tapestry of society.
            </p>
            {/* Social Grid */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  {...(social.url.startsWith('mailto:') ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  className="w-10 h-10 rounded-full border border-[#D4A017]/30 flex items-center justify-center text-[#F8F5F0] hover:text-[#D4A017] hover:border-[#D4A017] hover:bg-[#F8F5F0]/5 transition-all duration-300 transform hover:-translate-y-1"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-6 lg:pl-8">
            <h4 className="font-serif text-lg tracking-widest text-[#D4A017] uppercase font-bold">
              Navigation
            </h4>
            <ul className="flex flex-col space-y-3 font-sans text-sm font-semibold">
              <li>
                <Link to="/" className="text-[#F8F5F0]/85 hover:text-[#D4A017] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] opacity-60" />
                  Home
                </Link>
              </li>
              <li>
                <a href="/#mission" className="text-[#F8F5F0]/85 hover:text-[#D4A017] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] opacity-60" />
                  Our Mission
                </a>
              </li>
              <li>
                <Link to="/rescue-animals" className="text-[#F8F5F0]/85 hover:text-[#D4A017] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] opacity-60" />
                  Adopt Animals
                </Link>
              </li>
              <li>
                <Link to="/organizations" className="text-[#F8F5F0]/85 hover:text-[#D4A017] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] opacity-60" />
                  Partner Organizations
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-[#F8F5F0]/85 hover:text-[#D4A017] transition-colors duration-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A017] opacity-60" />
                  Community Hub
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-6">
            <h4 className="font-serif text-lg tracking-widest text-[#D4A017] uppercase font-bold">
              CONTACT US
            </h4>
            <ul className="flex flex-col space-y-4 font-sans text-sm text-[#F8F5F0]/80">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#D4A017] shrink-0 mt-0.5" />
                <span>Pune, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#D4A017] shrink-0" />
                <span className="font-semibold">+91 75585 80815</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#D4A017] shrink-0" />
                <a href="mailto:anuragbhilare8@gmail.com" className="font-semibold hover:text-[#D4A017] hover:underline transition-colors duration-350">
                  anuragbhilare8@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-6">
            <h4 className="font-serif text-lg tracking-widest text-[#D4A017] uppercase font-bold">
              MEET THE DEVELOPER
            </h4>
            <p className="text-sm text-[#F8F5F0]/80 leading-relaxed font-sans">
              Designed & Developed by Anurag Bhilare. Life of Paw is a full-stack animal rescue and adoption platform built with React, Tailwind CSS, Spring Boot, and PostgreSQL to streamline rescue, organization, and adoption workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <a
                href="https://www.linkedin.com/in/anuragbhilare19"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#F8F5F0] text-[#1B4332] font-semibold text-xs uppercase tracking-wider py-2.5 px-5 rounded-full transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 transform"
              >
                <span>LinkedIn</span>
                <span className="text-[10px]">↗</span>
              </a>
              <a
                href="https://github.com/anuragbhilare"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-transparent hover:bg-[#F8F5F0]/10 border border-[#F8F5F0]/30 hover:border-[#D4A017] text-[#F8F5F0] hover:text-[#D4A017] font-semibold text-xs uppercase tracking-wider py-2.5 px-5 rounded-full transition-all duration-300 hover:-translate-y-0.5 transform"
              >
                <span>GitHub</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>

        </div>
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs tracking-wider uppercase font-semibold text-[#F8F5F0]/60">
          <p className="flex items-center gap-1.5 font-sans">
            &copy; {new Date().getFullYear()} Life of Paw
            <Heart size={11} className="fill-[#9B2226] text-[#9B2226] inline" />
            EVERY RESCUE DESERVES A SECOND CHANCE.
          </p>

          {/* <div className="flex items-center space-x-6 font-sans">
            <a href="#" className="hover:text-[#D4A017] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#D4A017] transition-colors">Terms of Service</a>
            
            <button
              onClick={handleScrollToTop}
              className="w-8 h-8 rounded-full border border-[#D4A017]/30 flex items-center justify-center hover:border-[#D4A017] hover:text-[#D4A017] transition-colors"
              aria-label="Back to top"
            >
              <ArrowUp size={14} />
            </button>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
