import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, ArrowUp, Send, Heart } from 'lucide-react';

const Footer = () => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: <Facebook size={18} />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <Instagram size={18} />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <Twitter size={18} />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <Mail size={18} />, url: 'mailto:contact@lifeofpaw.org', label: 'Email' }
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
                  target="_blank"
                  rel="noopener noreferrer"
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
                <span>Life of Paw Rescue Network,<br />Pune, Maharashtra, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#D4A017] shrink-0" />
                <span className="font-semibold">+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#D4A017] shrink-0" />
                <span className="font-semibold">support@lifeofpaw.org</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col space-y-6">
            <h4 className="font-serif text-lg tracking-widest text-[#D4A017] uppercase font-bold">
              The Paw Journal
            </h4>
            <p className="text-sm text-[#F8F5F0]/80 leading-relaxed font-sans">
              Join our community and receive inspiring rescue journeys, adoption success stories, and important updates from partner organizations.
            </p>
            <form className="flex flex-col space-y-3 font-sans" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-[#F8F5F0]/10 text-white placeholder-white/50 border border-[#D4A017]/30 hover:border-[#D4A017]/60 focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] rounded-full py-3 pl-5 pr-12 text-sm transition-all outline-none"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 w-10 h-10 rounded-full bg-[#D4A017] text-[#1B4332] flex items-center justify-center hover:bg-[#F8F5F0] hover:text-[#1B4332] transition-colors duration-300"
                  aria-label="Subscribe"
                >
                  <Send size={14} className="fill-current" />
                </button>
              </div>
            </form>
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
