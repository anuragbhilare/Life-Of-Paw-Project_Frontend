import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion, AnimatePresence } from 'framer-motion';
import logoImage from '../assets/LifeOfPawLogo-2.png';

const MainLayout = ({ children }) => {
  const [showLoading, setShowLoading] = useState(true); 
  const timerRef = useRef(null);
  const location = useLocation();
  const isFirstMount = useRef(true);

  const runSplash = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowLoading(true);
    timerRef.current = setTimeout(() => {
      setShowLoading(false);
    }, 1800); 
  };

  useEffect(() => {
    runSplash();

    const handleTriggerSplash = () => {
      runSplash();
    };

    window.addEventListener('trigger-splash', handleTriggerSplash);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener('trigger-splash', handleTriggerSplash);
    };
  }, []);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const shouldTriggerSplash = sessionStorage.getItem('triggerHomeSplash') === 'true';
    if (shouldTriggerSplash) {
      sessionStorage.removeItem('triggerHomeSplash');
      runSplash();
    }
  }, [location]);

  useEffect(() => {
    if (showLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLoading]);

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col relative font-sans text-stone-800 antialiased selection:bg-[#D4A017] selection:text-[#1B4332]">
      <AnimatePresence>
        {showLoading && (
          <motion.div
            key="global-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full h-screen fixed inset-0 z-[9999] bg-gradient-to-tr from-[#ffffff] via-[#ffffff] to-[#ffffff] flex items-center justify-center pointer-events-auto"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.12)_0%,transparent_60%)] pointer-events-none" />
            
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

            <div className="flex flex-col items-center justify-center relative">
              <div className="w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] flex items-center justify-center relative">
                <div className="absolute inset-0 border-2 border-dashed border-[#D4A017]/40 rounded-full animate-spin-slow pointer-events-none" />
                <div className="absolute inset-4 border border-[#D4A017]/20 rounded-full pointer-events-none" />
                
                <div className="w-[180px] h-[180px] sm:w-[440px] sm:h-[440px] flex items-center justify-center overflow-hidden">
                  <motion.img
                    src={logoImage}
                    alt="Life of Paw Logo"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-full max-h-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.4)]"
                  />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="mt-6 text-center z-10"
              >
                <span className="font-serif text-lg sm:text-xl font-bold tracking-[0.15em] text-[#8e0000] block">
                  Life of Paw | Animal Care Alliance
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Navbar />

      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;
