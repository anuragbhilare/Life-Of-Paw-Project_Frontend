import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Heart, Sparkles, AlertCircle, HelpCircle, Check, ArrowRight } from 'lucide-react';
import logoimage from '../assets/LifeOfPawLogo-2.png';
import whyadopt1 from '../assets/whyadopt1.jpg';
import whyadopt2 from '../assets/whyadopt2.jpg';

const CounterCard = ({ countTarget, suffix = '', label, subtitle, delay }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const rawVal = countTarget.replace(/[,%+]/g, '');
    const numericTarget = parseInt(rawVal, 10);
    if (isNaN(numericTarget)) {
      return; 
    }

    let start = 0;
    const duration = 1.8; 
    const totalFrames = Math.round(duration * 60);
    const increment = Math.ceil(numericTarget / totalFrames);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      start += increment;
      if (frame >= totalFrames || start >= numericTarget) {
        setCount(numericTarget);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, countTarget]);

  const displayValue = isNaN(parseInt(countTarget.replace(/[,%+]/g, ''), 10))
    ? countTarget
    : count.toLocaleString() + suffix;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.1, delay }}
      whileHover={{ y: -8, rotateX: 3, rotateY: -3, scale: 1.02 }}
      className="relative bg-white/40 backdrop-blur-md border border-[#D8D2C4]/40 rounded-3xl p-8 shadow-xl flex flex-col justify-between h-72 text-left overflow-hidden transition-all duration-300"
    >
      <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#7B0016]" />
      
      <div>
        <span className="font-serif text-3xl sm:text-4xl text-[#1B4332] font-black tracking-tight block mb-2">
          {displayValue}
        </span>
        <h4 className="font-sans text-xs tracking-widest uppercase font-extrabold text-[#7B0016] mb-4">
          {label}
        </h4>
      </div>
      
      <p className="text-stone-600 font-sans text-xs sm:text-sm leading-relaxed mt-auto">
        {subtitle}
      </p>
    </motion.div>
  );
};

const AccordionItem = ({ myth, fact, isOpen, onClick }) => {
  return (
    <div className="border-b border-[#D8D2C4]/60 py-6">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center text-left py-2 focus:outline-none group"
      >
        <h3 className="font-serif text-lg sm:text-xl text-[#1B4332] font-bold group-hover:text-[#7B0016] transition-colors duration-300 flex items-start">
          <span className="text-[#7B0016] font-sans font-extrabold mr-3 shrink-0 mt-0.5 text-xs tracking-wider">MYTH:</span>
          <span className="italic">"{myth}"</span>
        </h3>
        <span className="text-[#D4A017] text-2xl font-light ml-4 shrink-0 transition-transform duration-300">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4 pt-3 text-stone-600 font-sans text-sm sm:text-base leading-relaxed pl-6 border-l-2 border-[#D4A017]/60 mt-2">
              <strong className="text-[#1B4332] font-sans text-xs tracking-widest uppercase block mb-1">Reality & Fact</strong>
              {fact}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WhyAdopt = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [calculatorInput, setCalculatorInput] = useState(50);
  const [openAccordionIdx, setOpenAccordionIdx] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);



  return (
    <>
      <AnimatePresence>
        {showLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full h-screen fixed inset-0 z-[9999] bg-white flex items-center justify-center pointer-events-auto"
          >
            <div className="w-[420px] h-[420px] flex items-center justify-center overflow-hidden relative">
              <motion.img
                src={logoimage}
                alt="Life of Paw Logo"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative min-h-screen bg-[#F8F5F0] pt-24 overflow-x-hidden selection:bg-[#D4A017] selection:text-[#1B4332]">
        
        <div className="bg-[#1B4332] py-4 px-6 text-center border-b border-[#D4A017]/25 relative z-10">
          <p className="font-serif text-[11px] sm:text-xs tracking-[0.25em] text-[#F8F5F0]/90 uppercase leading-relaxed max-w-4xl mx-auto">
            A purchased pet gains a <span className="text-[#D4A017] font-extrabold">home</span>. An adopted pet gains a <span className="text-[#D4A017] font-extrabold">future</span>.
          </p>
        </div>

        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute inset-0">
            <img
              src={whyadopt1}
              alt="Emotional Rescue Animal Portrait"
              className="w-full h-full object-cover opacity-50 scale-105"
            />
            <div className="absolute inset-0 bg-[#1B4332]/20 mix-blend-color" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
            <motion.span 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-4"
            >
              <Sparkles size={12} />
              The Compassionate Paradigm
            </motion.span>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="font-serif text-4xl sm:text-6xl lg:text-7xl text-[#F8F5F0] font-bold tracking-tight mb-6 leading-tight"
            >
              Every Adoption <br />
              <span className="text-[#D4A017] italic font-light">Changes Two Lives</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-stone-300 font-sans text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
            >
              When you adopt a rescued animal, you not only save them from uncertainty and hardship, you gain a loyal companion who will change your life forever.
            </motion.p>
            
            
          </div>
        </section>

        <section id="reality-section" className="py-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto text-center scroll-mt-12">
          <span className="text-[10px] tracking-[0.3em] text-[#7B0016] uppercase font-bold mb-3 block">
            Stray Veterinary Crisis
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1B4332] font-bold mb-4">
            The Untold Reality
          </h2>
          <div className="w-12 h-[1px] bg-[#D4A017] mx-auto mb-16" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CounterCard
              countTarget="2,000,000+"
              suffix="+"
              label="Animals Need Homes"
              subtitle="🐾 Millions of stray dogs and cats struggle daily on the streets for survival."
              delay={0}
            />
            <CounterCard
              countTarget="70%"
              suffix="%"
              label="Never Receive Medical Care"
              subtitle="🏥 Many suffer silently through pain and illness, with no one to notice and no one to help."
              delay={0.1}
            />
            <CounterCard
              countTarget="Thousands"
              label="Injured Every Year"
              subtitle="🚗 A single accident can change their lives forever, leaving them scared, alone, and forgotten."
              delay={0.2}
            />
            <CounterCard
              countTarget="1 Adoption"
              label="Adoption Changes Everything"
              subtitle="🐾 Every day they wait, wondering if today will be the day someone finally takes them home."
              delay={0.3}
            />
          </div>
        </section>

        <section className="py-24 bg-white border-y border-[#D8D2C4]/40 px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 block">Comparative Analysis</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#1B4332] font-bold mb-4">
                Why Adoption Is Better Than Buying
              </h2>
              <p className="text-stone-600 font-sans text-xs sm:text-sm leading-relaxed">
                While purchasing a pet brings a new animal into your home, adoption gives an existing animal a second chance at life.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
              
              <div className="bg-stone-50 border border-stone-250 rounded-3xl p-8 sm:p-12 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity duration-300 text-left">
                <div>
                  <span className="text-[9px] tracking-[0.2em] text-stone-400 uppercase font-bold block mb-1">Commercial Sourcing</span>
                  <h3 className="font-serif text-2xl font-bold text-stone-600 mb-8">Buying</h3>
                  
                  <ul className="space-y-5 font-sans text-xs sm:text-sm text-stone-600">
                    <li className="flex items-start gap-3">
                      <span className="text-stone-400 font-extrabold mt-0.5">✕</span>
                      <span>Supports breeding demand and unregulated puppy/kitten mills</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-stone-400 font-extrabold mt-0.5">✕</span>
                      <span>Often extremely expensive with high artificial breeder premiums</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-stone-400 font-extrabold mt-0.5">✕</span>
                      <span>Introduces another animal into an already overpopulated market</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-stone-400 font-extrabold mt-0.5">✕</span>
                      <span>Does not reduce stray and shelter animal numbers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-stone-400 font-extrabold mt-0.5">✕</span>
                      <span>Limited social impact with purely commercial value and transaction</span>
                    </li>
                  </ul>
                </div>
                
                <div className="mt-10 pt-4 border-t border-stone-200 text-stone-400 font-mono text-[9px] uppercase tracking-widest">
                  COMMERCIAL TRANSACTION
                </div>
              </div>

              <div className="bg-[#000000] border-2 border-[#D4A017] rounded-3xl p-8 sm:p-12 flex flex-col justify-between shadow-2xl text-left relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute top-0 right-0 bg-[#D4A017] text-[#1B4332] px-4 py-1.5 rounded-bl-2xl text-[9px] font-sans font-extrabold uppercase tracking-widest shadow-sm">
                  RESCUE ALLIANCE CHOICE
                </div>
                
                <div>
                  <span className="text-[9px] tracking-[0.2em] text-[#D4A017] uppercase font-bold block mb-1">Compassionate Choice</span>
                  <h3 className="font-serif text-2xl font-bold text-[#F8F5F0] mb-8">Adoption</h3>
                  
                  <ul className="space-y-5 font-sans text-xs sm:text-sm text-[#F8F5F0]/90">
                    <li className="flex items-start gap-3">
                      <span className="text-[#D4A017] font-extrabold mt-0.5">✔</span>
                      <span>Saves an active life and grants a second chance at happiness</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#D4A017] font-extrabold mt-0.5">✔</span>
                      <span>Usually significantly lower cost, covering medical prep and vaccine charts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#D4A017] font-extrabold mt-0.5">✔</span>
                      <span>Rescues and shelters a stray animal already struggling in the world</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#D4A017] font-extrabold mt-0.5">✔</span>
                      <span>Directly reduces stray populations and shelter strain</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#D4A017] font-extrabold mt-0.5">✔</span>
                      <span>Creates massive positive social impact and community empowerment</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-10 pt-4 border-t border-white/10 text-[#D4A017] font-mono text-[9px] uppercase tracking-widest">
                  ALTRUISTIC IMPACT
                </div>
              </div>

            </div>
          </div>
        </section>
        <section className="py-24 px-6 sm:px-8 lg:px-12 max-w-4xl mx-auto text-center">
          <span className="text-[10px] tracking-[0.3em] text-[#7B0016] uppercase font-bold mb-3 block">
            Deconstructing Myths
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1B4332] font-bold mb-4 font-bold">
            Dispelling Prejudices
          </h2>
          <div className="w-12 h-[1px] bg-[#D4A017] mx-auto mb-12" />

          <div className="bg-white border border-[#D8D2C4]/40 rounded-3xl p-6 sm:p-10 shadow-lg text-left">
            <AccordionItem
              myth="Stray animals can't become loving family pets."
              fact="Most rescued stray animals simply need safety, patience, and care. Once they feel secure, they often become loyal, affectionate, and deeply bonded companions who thrive in a home environment."
              isOpen={openAccordionIdx === 0}
              onClick={() => setOpenAccordionIdx(openAccordionIdx === 0 ? null : 0)}
            />
            <AccordionItem
              myth="Only puppies and kittens are worth adopting."
              fact="Adult dogs and cats are just as loving and often adapt to new homes more quickly. They usually have established personalities, basic manners, and make wonderful lifelong companions."
              isOpen={openAccordionIdx === 1}
              onClick={() => setOpenAccordionIdx(openAccordionIdx === 1 ? null : 1)}
            />
            <AccordionItem
              myth="Adopting a rescue animal is risky because you don't know its health."
              fact="Responsible rescue organizations provide veterinary examinations, vaccinations, deworming, and health records before adoption. Every animal is carefully assessed to help ensure a healthy start in its new home."
              isOpen={openAccordionIdx === 2}
              onClick={() => setOpenAccordionIdx(openAccordionIdx === 2 ? null : 2)}
            />
          </div>
        </section>

        <section className="py-24 bg-[#000000] text-white border-y border-[#D4A017]/35 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <span className="text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 block">Interactive Projection</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-8">
              Calculate Your Collective Impact
            </h2>

            <div className="bg-white/5 backdrop-blur-md border border-[#D4A017]/25 rounded-3xl p-8 sm:p-12 shadow-2xl text-left max-w-2xl mx-auto">
              <div className="mb-8">
                <label className="block text-xs uppercase font-sans tracking-widest text-stone-300 font-extrabold mb-4">
                  If <span className="text-[#D4A017] text-2xl font-serif font-black mx-1">{calculatorInput}</span> people adopt this month...
                </label>
                <input
                  type="range"
                  min="1"
                  max="1000"
                  value={calculatorInput}
                  onChange={(e) => setCalculatorInput(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#D4A017] focus:outline-none"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-400 mt-2">
                  <span>1 Person</span>
                  <span>1,000 People</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10 text-center sm:text-left">
                <div>
                  <span className="text-[#D4A017] text-3xl sm:text-4xl font-serif font-black block mb-1">
                    {calculatorInput}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-stone-300">
                    Animals Get Homes
                  </span>
                </div>
                <div>
                  <span className="text-[#D4A017] text-3xl sm:text-4xl font-serif font-black block mb-1">
                    {calculatorInput}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-stone-300">
                    Shelter Spaces Open
                  </span>
                </div>
                <div>
                  <span className="text-[#D4A017] text-3xl sm:text-4xl font-serif font-black block mb-1">
                    {(calculatorInput * 30).toLocaleString()}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-stone-300">
                    Meals Saved (Monthly)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="py-24 px-6 sm:px-8 lg:px-12 max-w-7xl mx-auto text-center">
          <span className="text-[10px] tracking-[0.3em] text-[#7B0016] uppercase font-bold mb-3 block">Engagement Channels</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#1B4332] font-bold mb-4 font-bold">
            How You Can Help
          </h2>
          <div className="w-12 h-[1px] bg-[#D4A017] mx-auto mb-16" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Adopt", desc: "Give a rescued companion animal a secure, loving forever home.", path: "/rescue-animals", icon: "🐾", action: "Explore Companions" },
              { title: "Volunteer", desc: "Support local shelters, help clean pens, feed strays, or coordinate registries.", path: "/community", icon: "🤝", action: "Join Community" },
              { title: "Donate", desc: "Fund clinical food programs, emergency operations, and veterinary care.", path: "/donate", icon: "❤️", action: "Support Financially" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{  stiffness: 300 }}
                className="bg-white border border-[#D8D2C4]/40 rounded-3xl p-8 shadow-lg flex flex-col justify-between h-80 hover:shadow-2xl transition-all duration-300 relative text-left group overflow-hidden"
              >
                <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#D4A017] group-hover:bg-[#7B0016] transition-colors" />
                
                <div>
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-serif text-2xl font-bold text-[#1B4332] mb-3">{item.title}</h3>
                  <p className="text-stone-600 font-sans text-xs sm:text-sm leading-relaxed mb-6">{item.desc}</p>
                </div>
                
                <Link
                  to={item.path}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-extrabold text-[#7B0016] hover:text-[#1B4332] transition-colors group-hover:underline self-start mt-auto"
                >
                  <span>{item.action}</span>
                  <ArrowRight size={12} />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="relative py-50 bg-black overflow-hidden flex items-center justify-center text-center">
          <div className="absolute inset-0">
            <img
              src={whyadopt2}
              alt="Emotional Rescue Animal Group Backdrop"
              className="w-full h-full object-cover opacity-30 scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/50" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
              className="flex flex-col items-center"
            >
              <span className="text-[#D4A017] text-4xl mb-2 font-serif">“</span>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-[#F8F5F0] italic font-light leading-relaxed mb-8 max-w-3xl">
                NO HEART SHOULD WAIT A LIFETIME JUST TO BE LOVED.
              </h2>
              <div className="w-82 h-[2px] bg-[#D4A017] shadow-[0_0_8px_#D4A017]" />
            </motion.div>
          </div>
        </section>

      </div>  
    </>
  );
};

export default WhyAdopt;
