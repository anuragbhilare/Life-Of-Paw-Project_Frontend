import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('user_session')) || JSON.parse(sessionStorage.getItem('activeUser'));
    if (user) {
      setActiveUser(user);
    } else {
      setActiveUser(null);
    }
  }, [location]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Our Mission', path: '/#mission' },
    { name: 'Why Adopt?', path: '/why-adopt' },
    { name: 'Animals', path: '/rescue-animals' },
    { name: 'Organizations', path: '/organizations' },
    { name: 'Community', path: '/community' },
  ];

  const handleNavClick = (path) => {
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
          isScrolled
            ? 'bg-[#1B4332]/95 backdrop-blur-md py-3 shadow-xl border-b border-[#D4A017]/30'
            : 'bg-gradient-to-b from-black/70 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 h-16 flex justify-between items-center relative">
          
          <div className="absolute left-6 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 z-10">
            <Link 
              to="/" 
              onClick={() => {
                sessionStorage.setItem('triggerHomeSplash', 'true');
                window.dispatchEvent(new CustomEvent('trigger-splash'));
              }}
              className="flex items-center group shrink-0"
            >
              <img
                src="/logo.png"
                alt="Life of Paw"
                className="h-35 sm:h-39 w-auto object-contain brightness-0 invert hover:scale-[1.03] transition-transform duration-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
              />
            </Link>
          </div>

          <div className="w-40 sm:w-48 lg:w-56 shrink-0 pointer-events-none" />

          <div className="hidden lg:flex items-center gap-x-4 xl:gap-x-6 ml-auto mr-4 xl:mr-8 min-w-max">
            {navItems.map((item) => (
              <span key={item.name}>
                {item.path.startsWith('/#') ? (
                  <a
                    href={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className="font-sans text-xs tracking-widest uppercase font-bold text-[#F8F5F0]/90 hover:text-[#D4A017] transition-colors duration-300 relative py-1 group cursor-pointer whitespace-nowrap"
                  >
                    {item.name}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#D4A017] transition-all duration-300 group-hover:w-full" />
                  </a>
                ) : (
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (item.path === '/') {
                        sessionStorage.setItem('triggerHomeSplash', 'true');
                        window.dispatchEvent(new CustomEvent('trigger-splash'));
                      }
                    }}
                    className={({ isActive }) =>
                      `font-sans text-xs tracking-widest uppercase font-bold transition-colors duration-300 relative py-1 group whitespace-nowrap ${
                        isActive
                          ? 'text-[#D4A017]'
                          : 'text-[#F8F5F0]/90 hover:text-[#D4A017]'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.name}
                        <span
                          className={`absolute bottom-0 left-0 h-[1px] bg-[#D4A017] transition-all duration-300 ${
                            isActive ? 'w-full' : 'w-0 group-hover:w-full'
                          }`}
                        />
                      </>
                    )}
                  </NavLink>
                )}
              </span>
            ))}

            {activeUser ? (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `font-sans text-xs tracking-widest uppercase font-bold transition-colors duration-300 relative py-1 flex items-center gap-2 group ${
                    isActive ? 'text-[#D4A017]' : 'text-[#F8F5F0] hover:text-[#D4A017]'
                  }`
                }
              >
                <div className="w-6 h-6 rounded-full bg-[#D4A017] text-[#1B4332] flex items-center justify-center text-[10px] font-extrabold shadow-md hover:bg-white hover:text-[#1B4332] transition-colors duration-300">
                  {activeUser.fullName ? activeUser.fullName.charAt(0).toUpperCase() : 'P'}
                </div>
                <span>My Profile</span>
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#D4A017]/60 bg-transparent hover:bg-[#D4A017]/10 text-[#F8F5F0] hover:text-[#D4A017] font-sans text-[10px] tracking-[0.2em] uppercase font-bold transition-all duration-300 group whitespace-nowrap min-w-max"
              >
                <User size={13} className="text-[#D4A017] shrink-0" />
                <span className="whitespace-nowrap">Login / Join</span>
              </NavLink>
            )}
          </div>

          <div className="hidden lg:flex items-center shrink-0">
            <Link
              to="/donate"
              className="relative overflow-hidden group bg-[#7b0016] text-white px-6 py-2.5 rounded-full border border-[#D4A017]/40 shadow-[0_4px_20px_rgba(123,0,22,0.25)] hover:shadow-[0_4px_30px_rgba(212,160,23,0.3)] transition-all duration-500 hover:-translate-y-0.5"
            >
              <span className="relative z-10 flex items-center gap-2 font-sans text-xs tracking-[0.2em] uppercase font-bold">
                <Heart size={13} className="fill-current animate-pulse text-[#D4A017]" />
                Donate Now
              </span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-[#D4A017]/20 to-transparent transition-transform duration-1000 ease-out" />
            </Link>
          </div>

          <div className="flex lg:hidden items-center space-x-4 ml-auto">
            <Link
              to="/donate"
              className="bg-[#7b0016] p-2 rounded-full border border-[#D4A017]/30 text-white hover:bg-[#D4A017]/95 transition-colors duration-300"
            >
              <Heart size={16} className="fill-current text-[#D4A017]" />
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#F8F5F0] hover:text-[#D4A017] transition-colors p-1"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-[#1B4332] pt-28 px-8 flex flex-col justify-between pb-12 border-b border-[#D4A017]/40 overflow-y-auto"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#D4A017_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
            <div className="flex flex-col space-y-6 relative z-10">
              <div className="w-12 h-[1px] bg-[#D4A017] mb-2" />
              {navItems.map((item, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={item.name}
                >
                  {item.path.startsWith('/#') ? (
                    <a
                      href={item.path}
                      onClick={() => {
                        handleNavClick(item.path);
                        setIsOpen(false);
                      }}
                      className="font-serif text-3xl tracking-wide text-[#F8F5F0] hover:text-[#D4A017] block transition-colors py-2 font-medium"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `font-serif text-3xl tracking-wide block transition-colors py-2 font-medium ${
                          isActive ? 'text-[#D4A017]' : 'text-[#F8F5F0] hover:text-[#D4A017]'
                        }`
                      }
                      onClick={() => {
                        if (item.path === '/') {
                          sessionStorage.setItem('triggerHomeSplash', 'true');
                          window.dispatchEvent(new CustomEvent('trigger-splash'));
                        }
                        setIsOpen(false);
                      }}
                    >
                      {item.name}
                    </NavLink>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-6 relative z-10 w-full"
            >
              <div className="h-[1px] bg-[#D4A017]/25 w-full" />
              <div className="flex flex-col gap-4">
                {activeUser ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-3 border border-[#D4A017]/40 py-3 rounded-full text-center text-sm font-sans tracking-widest uppercase font-bold text-[#F8F5F0] bg-[#1B4332] hover:bg-[#D4A017]/10 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#D4A017] text-[#1B4332] flex items-center justify-center text-[9px] font-extrabold shrink-0">
                      {activeUser.fullName ? activeUser.fullName.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <span>My Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 border border-[#D8D2C4]/20 py-3 rounded-full text-center text-sm font-sans tracking-widest uppercase font-bold text-[#F8F5F0] hover:bg-[#D4A017]/10 transition-colors"
                  >
                    <User size={16} className="text-[#D4A017]" />
                    Login / Register
                  </Link>
                )}
                <Link
                  to="/donate"
                  onClick={() => setIsOpen(false)}
                  className="bg-[#7b0016] border border-[#D4A017]/40 py-4 rounded-full text-center text-sm font-sans tracking-[0.2em] uppercase font-bold text-white shadow-xl flex items-center justify-center gap-2"
                >
                  <Heart size={14} className="fill-[#D4A017] text-[#D4A017]" />
                  Donate To Save Lives
                </Link>
              </div>
              <div className="text-center mt-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4A017]/80">
                  LIFE of PAW
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
