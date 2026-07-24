import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiClient } from '../services/api';

const Donate = () => {
  const navigate = useNavigate();
  const activeUser = JSON.parse(sessionStorage.getItem('activeUser') || 'null');
  
  const [selectedTier, setSelectedTier] = useState('silver');
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState(activeUser?.fullName || '');
  const [donorEmail, setDonorEmail] = useState(activeUser?.email || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const tiers = [
    {
      id: 'bronze',
      name: 'Compassion Supporter',
      price: '₹499',
      description: 'Helps provide nutritious meals, clean water, and daily care for rescued animals.',
      features: [
      'Feed 2–3 rescued animals',
      'Help maintain safe shelter'
      ]
      },
      {
      id: 'silver',
      name: 'Hope Guardian',
      price: '₹999',
      description: 'Supports medical care and recovery for animals that need extra attention.',
      features: [
      'Vaccinate 2-3 animals',
      'Medicines and routine veterinary care',
      'Support food during recovery'
      ]
      },
      {
      id: 'gold',
      name: 'Life Saver',
      price: '₹2,499',
      description: 'Provides life-saving treatment and long-term rehabilitation for animals in critical condition.',
      features: [
      'Emergency medical treatment',
      'Surgeries or specialized veterinary care',
      'Rehabilitation and recovery support',
      'Food and shelter for animals during treatment'
      ]
      }

  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (activeUser) {
      if (donorEmail.trim().toLowerCase() !== activeUser.email.trim().toLowerCase()) {
        setErrorMessage("Email does not match your logged-in account email. Please use your registered email address.");
        return;
      }
    }

    let parsedAmount = 0;
    if (customAmount) {
      parsedAmount = parseFloat(customAmount);
    } else if (selectedTier === 'bronze') {
      parsedAmount = 499;
    } else if (selectedTier === 'silver') {
      parsedAmount = 999;
    } else if (selectedTier === 'gold') {
      parsedAmount = 2499;
    }

    try {
      await apiClient.post('/finance/donate', null, {
        params: { amount: parsedAmount }
      });
      setFormSubmitted(true);
    } catch (err) {
      console.error("Donation submission failed:", err);
      alert(err.response?.data?.message || err.message || "Donation failed. Please ensure you are logged in.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F5F0] py-28 px-6 sm:px-8 lg:px-12">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:28px_28px]" />
      <div className="max-w-5xl mx-auto relative z-10">        
        <div className="text-center max-w-2xl mx-auto mb-16 mt-6">
          <span className="flex items-center justify-center gap-1 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3">
            <Sparkles size={12} />
            Life of Paw Donations
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1B4332] font-bold tracking-tight mb-4">
            Give Hope Save <span className="text-[#9B2226] font-light italic">Lives</span>
          </h1>
          <div className="w-16 h-[1px] bg-[#D4A017] mx-auto mb-6" />
          <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed">
            Every contribution powers rescue operations, veterinary treatment, rehabilitation programs, and compassionate care for animals on their journey home.
          </p>
        </div>

        {formSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-12 border border-[#D4A017]/40 shadow-xl text-center max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-[#1B4332] text-[#D4A017] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#D4A017]">
              <Heart size={28} className="fill-current text-[#D4A017]" />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1B4332] font-bold mb-4">
              Thank You for Your Kind Support
            </h2>
            <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed mb-8">
              Your generosity helps provide food, medical care, shelter, and a second chance to animals waiting for a loving home. Every contribution brings hope to a life that needs it most.
            </p>
            <button
              onClick={() => setFormSubmitted(false)}
              className="bg-[#1B4332] text-white border border-[#D4A017]/30 hover:bg-[#9B2226] px-8 py-3 rounded-full text-xs font-sans tracking-[0.25em] uppercase font-bold transition-all shadow-md"
            >
              Support More Lives
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2 flex flex-col gap-6">
              <h2 className="font-serif text-xl sm:text-2xl text-[#1B4332] font-bold mb-2">
              Choose Your Life-Saving Contribution
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      setSelectedTier(tier.id);
                      setCustomAmount('');
                    }}
                    className={`bg-white rounded-2xl p-6 text-left border transition-all duration-300 shadow-sm flex flex-col justify-between h-full relative hover:shadow-md ${
                      selectedTier === tier.id
                        ? 'border-[#9B2226] ring-1 ring-[#9B2226] scale-[1.02]'
                        : 'border-[#D8D2C4]/40 hover:border-[#D4A017]/50'
                    }`}
                  >
                    {selectedTier === tier.id && (
                      <span className="absolute top-3 right-3 bg-[#9B2226] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                    <div>
                      <h3 className="font-serif text-base text-[#1B4332] font-bold mb-1">
                        {tier.name}
                      </h3>
                      <div className="font-serif text-3xl font-extrabold text-[#9B2226] mb-3">
                        {tier.price} <span className="text-xs text-stone-500 font-sans font-semibold">/ mo</span>
                      </div>
                      <p className="text-stone-500 font-sans text-xs leading-relaxed mb-4">
                        {tier.description}
                      </p>
                    </div>

                    <div className="border-t border-stone-100 pt-4 w-full">
                      <ul className="flex flex-col space-y-1.5 font-sans text-[10px] text-stone-600 font-semibold uppercase tracking-wider">
                        {tier.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#D4A017]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-8 border border-[#D8D2C4]/45 shadow-sm mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg text-[#1B4332] font-bold">
                    Or Enter Custom Contribution
                  </h3>
                  <p className="text-xs text-stone-500 font-sans">
                    One-time or recurring, your support funds essential medical care for rescued animals.
                  </p>
                </div>
                <div className="relative font-sans max-w-xs w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-serif text-lg text-stone-500 font-bold">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setCustomAmount(value);
                      setSelectedTier('');
                    }}
                    placeholder="99"
                    className="w-full bg-[#F8F5F0]/60 border border-[#D8D2C4]/60 hover:border-[#D4A017]/60 focus:border-[#D4A017] rounded-full py-3 pl-8 pr-4 text-stone-800 font-semibold focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-[#D4A017]/25 shadow-lg flex flex-col gap-6 lg:mt-11">
              <div className="border-b border-stone-100 pb-4">
                <h3 className="font-serif text-xl text-[#1B4332] font-bold">
                  Account Details
                </h3>
                <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                  Secure checkout fully processed under clinical privacy rules.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 font-sans">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Your full name" 
                    className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">PAYMENT DETAILS *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-4 text-sm focus:outline-none transition-colors text-stone-800 text-center font-semibold"
                    />
                    <input
                      type="text"
                      required
                      placeholder="CVV"
                      className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-4 text-sm focus:outline-none transition-colors text-stone-800 text-center font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-stone-500 text-[10px] font-semibold mt-4">
                  <ShieldCheck size={14} className="text-[#D4A017] shrink-0" />
                  <span>Fully secured 256-bit SSL transaction encryption.</span>
                </div>

                {activeUser ? (
                  <>
                    {errorMessage && (
                      <div className="text-[#9B2226] text-xs font-sans font-bold mt-1 text-center bg-red-50 p-2 rounded-lg border border-red-200">
                        ⚠️ {errorMessage}
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full bg-[#9B2226] border border-[#D4A017]/40 text-white hover:bg-[#1B4332] py-4 rounded-full text-xs uppercase tracking-[0.2em] font-bold shadow-xl transition-all duration-300 mt-2 cursor-pointer"
                    >
                      MAKE MY DONATION
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.setItem('redirectTo', '/donate');
                      navigate('/login');
                    }}
                    className="w-full bg-[#1B4332] border border-[#D4A017]/40 text-white hover:bg-[#9B2226] py-4 rounded-full text-xs uppercase tracking-[0.2em] font-bold shadow-xl transition-all duration-300 mt-2 text-center block cursor-pointer"
                  >
                    LOGIN / REGISTER TO DONATE
                  </button>
                )}
              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Donate;
