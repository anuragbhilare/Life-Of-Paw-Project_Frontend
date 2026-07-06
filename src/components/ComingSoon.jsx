import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const ComingSoon = ({ title = "Under Construction", subtitle = "This collection is currently being curated by our sanctuary designers." }) => {
  return (
    <div className="relative min-h-[85vh] bg-[#F8F5F0] flex items-center justify-center overflow-hidden py-24 px-6">
     
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-[#D4A017]/40 pointer-events-none" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-[#D4A017]/40 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-[#D4A017]/40 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-[#D4A017]/40 pointer-events-none" />

      
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

      <div className="max-w-2xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
         
          <span className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-semibold mb-6">
            <Sparkles size={12} />
            Life of Paw — Exclusive
          </span>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1B4332] font-bold tracking-tight mb-6 leading-tight">
            {title}
          </h1>

    
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-[#D4A017]" />
            <Heart size={14} className="text-[#9B2226] fill-[#9B2226]" />
            <div className="w-12 h-[1px] bg-[#D4A017]" />
          </div>

          <p className="text-stone-600 font-sans text-base sm:text-lg leading-relaxed mb-12 max-w-lg">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center font-sans">
            <Link
              to="/"
              className="flex items-center gap-2 border border-[#1B4332] text-[#1B4332] hover:bg-[#1B4332] hover:text-white px-8 py-3 rounded-full text-sm tracking-widest uppercase font-bold transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <ArrowLeft size={16} />
              Return Home
            </Link>
            
            <Link
              to="/donate"
              className="bg-[#9B2226] border border-[#D4A017]/30 text-white hover:bg-[#D4A017]/95 hover:text-[#1B4332] px-8 py-3 rounded-full text-sm tracking-widest uppercase font-bold shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Donate Now
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
