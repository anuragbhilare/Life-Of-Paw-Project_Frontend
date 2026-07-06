import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Heart, Star, Sparkles, MessageCircle, Eye, ShieldCheck, CheckCircle2, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockStats, mockAnimals, mockNGOs, mockStories } from '../mocks/mockData';
import ScrollAnimate from '../components/ScrollAnimate';
import Achievements from '../assets/Achievements.jpeg';
import EmergencyRescue from '../assets/EmergencyRescue.jpeg';
import rehab from '../assets/Rehab.jpg';
import adoption from '../assets/DignifiedAdoption.jpeg';
import besthome from '../assets/besthome.jpg';
import { apiClient } from '../services/api';
import logoImage from '../assets/LifeOfPawLogo-2.png';



const StatCounter = ({ value, suffix }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    let totalDuration = 1500;
    let incrementTime = Math.max(Math.floor(totalDuration / end), 15);
    
    let timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#D4A017] font-bold tracking-tight">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const Home = () => {
  const [animals, setAnimals] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `http://localhost:9999${avatar}`;
  };

  const getPostMetaData = (msgId) => {
    switch (msgId) {
      case 230:
        return {
          title: "Welcoming Your New Rescue Dog",
          category: "Adoption Tips"
        };
      case 229:
        return {
          title: "Beach Rescue Journey",
          category: "Rescue Stories"
        };
      case 228:
        return {
          title: "Sheru's Forever Home",
          category: "Success Stories"
        };
      default:
        return {
          title: "Community Post",
          category: "Community Network"
        };
    }
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const openMedicalModal = (animal) => {
    setSelectedAnimal(animal);
    setIsMedicalModalOpen(true);
  };
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#mission') {
      const element = document.getElementById('mission');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  useEffect(() => {
    const fetchDatabaseAnimals = async () => {
      try {
        setLoading(true);
        const animalsRes = await apiClient.get('/animals/available');
        
        let animalToOrgMap = {};
        try {
          const orgsRes = await apiClient.get('/orgs/all');
          orgsRes.data.forEach(org => {
            if (org.animals) {
              org.animals.forEach(ani => {
                animalToOrgMap[ani.animalId] = org.orgName;
              });
            }
          });
        } catch (orgErr) {
          console.error("Failed to load organizations for mapping:", orgErr);
        }

        const adapted = animalsRes.data
          .filter(ani => ani.status === 'AVAILABLE')
          .map(animal => {
            let resolvedImage = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';
            if (animal.images && animal.images.length > 0) {
              const path = animal.images[0].imageUrl;
              resolvedImage = path.startsWith('http') ? path : `http://localhost:9999${path}`;
            }

            const orgName = animalToOrgMap[animal.animalId] || 'Sanctuary Alliance HQ';

            return {
              id: animal.animalId,
              name: animal.name,
              species: animal.species,
              breed: animal.breed || 'Mixed Breed',
              age: animal.ageCategory || 'Adult',
              gender: animal.gender || 'Unknown',
              description: animal.description || 'A beautiful rescue companion awaiting a loving home.',
              story: animal.description || 'A beautiful rescue companion awaiting a loving home.',
              medicalHistory: animal.medicalHistory || null,
              location: orgName,
              imageUrl: resolvedImage,
              image: resolvedImage,
              status: animal.status || 'AVAILABLE',
              tags: []
            };
          });

        let finalAnimals = adapted;
        if (finalAnimals.length < 3) {
          const needed = 3 - finalAnimals.length;
          const filler = mockAnimals.slice(0, needed).map(m => ({
            ...m,
            id: m.id || `mock-${m.name}`,
            medicalHistory: 'Healthy and vaccinated.'
          }));
          finalAnimals = [...finalAnimals, ...filler];
        } else {
          finalAnimals = finalAnimals.slice(0, 3);
        }
        setAnimals(finalAnimals);
      } catch (err) {
        console.error("Database fetch failed on Home.jsx:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDatabaseAnimals();
  }, []);

  useEffect(() => {
    const fetchCommunityFeed = async () => {
      try {
        const res = await apiClient.get('/social/community-feed');
        const filtered = res.data.filter(msg => [230, 229, 228].includes(msg.msgId));
        const sorted = [230, 229, 228]
          .map(id => filtered.find(m => m.msgId === id))
          .filter(Boolean);
        setCommunityPosts(sorted);
      } catch (err) {
        console.error("Failed to fetch community feed on Home.jsx:", err);
      }
    };
    fetchCommunityFeed();
  }, []);

  const handleAdoptClick = (animal) => {
    const activeUser = JSON.parse(sessionStorage.getItem('activeUser'));
    if (!activeUser) {
      sessionStorage.setItem('redirectTo', `/rescue-animals?adoptAnimalId=${animal.id}`);
      sessionStorage.setItem(
        'toastMessage',
        'Please sign in or create an account to initiate an adoption.'
      );
      navigate('/login');
    } else {
      navigate(`/rescue-animals?adoptAnimalId=${animal.id}`);
    }
  };

  const displayAnimals = error || animals.length === 0 ? mockAnimals.slice(0, 3).map(m => ({ ...m, medicalHistory: 'Healthy and vaccinated.' })) : animals;
  
  
  return (
    

    
    <div className="bg-[#F8F5F0]">
      <section className="relative h-screen flex items-center justify-center bg-stone-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            
            src={besthome}
            alt="Rescue Dog and Cat"
            className="w-full h-full object-cover object-center opacity-100 scale-100 select-none"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black via-stone-950/85 to-[#1B4332]/50 z-10" />
        </div>

        <div className="absolute inset-0 opacity-[0.03] z-10 pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

        <div className="relative z-20 max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-center text-white mt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <span className="flex items-center gap-2 text-xs sm:text-sm tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-4 font-sans">
              <Sparkles size={14} className="animate-spin-slow text-[#D4A017]" />
              FOR THE VOICELESS | THE FORGOTTEN | AND THE LOVED
            </span>

            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight max-w-4xl text-[#F8F5F0]">
              Every Paw Deserves a <br className="hidden sm:inline" />
              <span className="text-[#D4A017] font-serif italic font-light">Loving Home</span>
            </h1>

            <p className="text-stone-300 font-sans text-base sm:text-lg lg:text-xl max-w-2xl leading-relaxed mb-10 font-medium">
              Life of Paw is dedicated to rescuing, protecting, and rehoming animals in need by connecting compassionate adopters with verified rescue organizations and trusted animal welfare communities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center font-sans">
              <Link
                to="/rescue-animals"
                className="w-full sm:w-auto bg-[#7b0016] border border-[#D4A017]/40 text-[#F8F5F0] hover:bg-[#D4A017] hover:text-[#1B4332] hover:border-[#1B4332] px-10 py-4 rounded-full text-xs sm:text-sm tracking-[0.2em] uppercase font-bold shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Adopt Now
              </Link>
              <Link
                to="/organizations"
                className="w-full sm:w-auto border border-[#D4A017]/50 text-[#F8F5F0] hover:bg-[#F8F5F0]/10 px-10 py-4 rounded-full text-xs sm:text-sm tracking-[0.2em] uppercase font-bold transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Explore NGOs
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 opacity-80 animate-bounce">
          <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-[#D4A017] font-bold">Scroll Down</span>
          <div className="w-[1px] h-8 bg-[#D4A017]" />
        </div>
      </section>

      <section className="relative py-28 bg-[#F8F5F0] overflow-hidden border-b border-[#D8D2C4]/20">
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-paw-pattern" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
            
            <div className="lg:col-span-5 relative group">
              <div className="absolute inset-0 border border-[#D4A017]/45 rounded-3xl translate-x-3 translate-y-3 pointer-events-none group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500" />
              <div className="relative rounded-3xl overflow-hidden border border-[#D8D2C4]/50 shadow-2xl bg-white aspect-[4/3] sm:aspect-square lg:aspect-auto lg:h-[480px]">
                <img
                  src={Achievements}
                  alt="Together We Make A Difference"
                  className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-750"
                />
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-center">
              <span className="flex items-center gap-2 text-xs tracking-[0.35em] text-[#D4A017] uppercase font-extrabold mb-4 font-sans">
                <span className="w-8 h-[1px] bg-[#D4A017]" />
                ACHIEVEMENTS
              </span>
              
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1B4332] leading-tight mb-8">
                Together, We've Made<br />
                <span className="text-[#9B2226] font-serif font-light italic">A Difference</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 border-t border-[#D8D2C4]/50 pt-8">
                {[
                  { id: "stat-1", label: "Rescued Animals", value: 15420, suffix: "+" },
                  { id: "stat-2", label: "Successful Adoptions", value: 12890, suffix: "+" },
                  { id: "stat-3", label: "Verified NGOs", value: 340, suffix: "+" }
                ].map((stat) => (
                  <div key={stat.id} className="flex flex-col">
                    <div className="font-serif text-4xl sm:text-5xl text-[#D4A017] font-bold tracking-tight mb-2">
                      <StatCounter value={stat.value} suffix={stat.suffix} />
                    </div>
                    <span className="text-stone-600 font-sans text-xs sm:text-sm tracking-wide font-bold uppercase">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <section id="mission" className="relative py-28 px-6 sm:px-8 lg:px-12 overflow-hidden bg-[#F8F5F0]">
        <div className="absolute top-12 left-10 w-24 h-24 opacity-[0.02] text-[#1B4332] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M50 40c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-22 6c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm44 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-34-22c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm24 0c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z" />
          </svg>
        </div>
        <div className="absolute bottom-16 right-16 w-32 h-32 opacity-[0.02] text-[#1B4332] pointer-events-none">
          <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
            <path d="M50 40c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-22 6c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm44 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-34-22c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm24 0c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <ScrollAnimate>
              <span className="text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 block">
                WHAT WE DO
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1B4332] font-bold tracking-tight mb-4">
                Protecting Our <span className="text-[#9B2226] font-light italic">Voiceless</span> Friends
              </h2>
              <div className="w-16 h-[1px] bg-[#D4A017] mx-auto mt-6 mb-6" />
              <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed">
                Every paw deserves a future. By connecting shelters, rescue organizations, and compassionate adopters, we turn stories of abandonment into journeys of recovery, belonging, and lifelong companionship.
              </p>
            </ScrollAnimate>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                title: "Emergency Rescue",
                desc: "Responding with urgency to stray, injured, or neglected animals. Our response network extracts paws from hazardous environments and secures absolute safety.",
                bg: EmergencyRescue,
                icon: "🚑"
              },
              {
                title: "Rehabilitation & Recovery",
                desc: "Every rescued animal deserves a chance to heal. Through medical care, nourishment, emotional support, and dedicated rehabilitation, we help abandoned and vulnerable companions regain their strength, confidence, and hope.",
                bg: rehab,
                icon: "❤️"
              },
              {
                title: "Forever Home Placement",
                desc: "We connect rescued animals with responsible and compassionate families through a thoughtful adoption process, creating lifelong bonds built on trust, care, and unconditional love.",
                bg: adoption,
                icon: "🏡"
              }
            ].map((mission, idx) => (
              <ScrollAnimate key={idx} delay={idx * 0.15} className="group h-full">
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-[#D8D2C4]/25 hover:-translate-y-1.5">
                  <div className="relative h-60 overflow-hidden shrink-0">
                    <img
                      src={mission.bg}
                      alt={mission.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-4 left-4 bg-[#F8F5F0] text-[#1B4332] w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-md border border-[#D4A017]">
                      {mission.icon}
                    </span>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="font-serif text-xl sm:text-2xl text-[#1B4332] font-bold mb-4">
                      {mission.title}
                    </h3>
                    <p className="text-[#555] font-sans text-sm leading-relaxed mb-6 flex-grow">
                      {mission.desc}
                    </p>
                    
                    
                  </div>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-28 px-6 sm:px-8 lg:px-12 bg-white border-t border-[#D8D2C4]/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 block">
                Friends in Need
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1B4332] font-bold tracking-tight">
                Featured <span className="text-[#9B2226] font-light italic">Rescue Paws</span>
              </h2>
            </div>
            <Link
              to="/rescue-animals"
              className="group text-sm font-sans tracking-[0.2em] uppercase font-bold text-[#1B4332] hover:text-[#9B2226] flex items-center gap-2 pb-1 border-b border-[#1B4332] hover:border-[#9B2226] transition-all self-start md:self-auto"
            >
              View All Companions
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {displayAnimals.map((animal, idx) =>  (
              <ScrollAnimate key={animal.id} delay={idx * 0.1}>
                <div className="bg-[#F8F5F0] rounded-2xl overflow-hidden shadow-lg border border-[#D8D2C4]/30 group hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-1">
                  
                  <div className="relative h-100 overflow-hidden shrink-0">
                    <img
                      src={animal.image}
                      alt={animal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    <span className="absolute bottom-4 left-4 text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                      <Star size={12} className="fill-[#D4A017] text-[#D4A017]" />
                      {animal.location}
                    </span>
                  </div>

                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-baseline mb-3">
                      <h3 className="font-serif text-2xl text-[#1B4332] font-bold">
                        {animal.name}
                      </h3>
                      <span className="text-xs uppercase font-sans tracking-widest font-bold text-[#D4A017]">
                        {animal.breed}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
                      <span>Age / Stage: <strong className="text-[#1B4332]">{animal.age}</strong></span>
                      <span className="w-[1px] h-3.5 bg-stone-300 self-center" />
                      <span>Gender: <strong className="text-[#1B4332]">{animal.gender}</strong></span>
                    </div>

                    <p className="text-stone-600 font-sans text-sm leading-relaxed mb-4 flex-grow">
                      {animal.story}
                    </p>

                    <button 
                      onClick={() => openMedicalModal(animal)} 
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-2 mb-6 transition-colors border-none bg-transparent cursor-pointer self-start"
                    >
                      <span>🛡️ VIEW MEDICAL RECORD</span>
                    </button>

                    <button
                      onClick={() => handleAdoptClick(animal)}
                      className="w-full py-3 text-center bg-[#1B4332] hover:bg-[#9B2226] text-white rounded-xl text-xs uppercase tracking-[0.2em] font-bold font-sans shadow-md hover:shadow-lg transition-colors duration-300 flex items-center justify-center gap-2 border border-[#D4A017]/25 cursor-pointer"
                    >
                      <Heart size={13} className="fill-current text-[#D4A017]" />
                      Adopt
                    </button>
                  </div>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-28 px-6 sm:px-8 lg:px-12 bg-[#F8F5F0]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <ScrollAnimate>
              <span className="text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 block">
                PARTNER SANCTUARIES
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1B4332] font-bold tracking-tight mb-4">
                Verified <span className="text-[#9B2226] font-light italic">Organizations</span>
              </h2>
              <div className="w-16 h-[1px] bg-[#D4A017] mx-auto mt-5" />
            </ScrollAnimate>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockNGOs.map((ngo, idx) => (
              <ScrollAnimate key={ngo.id} delay={idx * 0.1}>
                <div className="bg-white rounded-2xl p-8 border border-[#D8D2C4]/35 shadow-md flex flex-col justify-between h-full hover:shadow-xl hover:border-[#D4A017]/40 transition-all duration-300">
                  <div>
                    <div className="w-14 h-14 bg-[#F8F5F0] border border-[#D4A017]/35 rounded-full flex items-center justify-center text-2xl mb-6 shadow-sm">
                      {ngo.logo}
                    </div>

                    <h3 className="font-serif text-lg text-[#1B4332] font-bold leading-snug mb-3">
                      {ngo.name}
                    </h3>
                    
                    <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 font-semibold mb-4">
                      <Star size={13} className="fill-[#D4A017] text-[#D4A017]" />
                      <strong>{ngo.rating}</strong> ({ngo.rescuesCount} Rescues)
                    </span>

                    <p className="text-stone-600 font-sans text-xs sm:text-sm leading-relaxed mb-6">
                      {ngo.description}
                    </p>
                  </div>

                  <Link
                    to="/organizations"
                    className="text-xs uppercase font-sans tracking-widest font-bold text-[#9B2226] hover:text-[#1B4332] transition-colors flex items-center gap-1 mt-2"
                  >
                    View Shelter
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>


      <section className="relative py-28 px-6 sm:px-8 lg:px-12 bg-[#000000]/95 overflow-hidden text-white border-t border-b border-[#D4A017]/30">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:28px_28px]" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <ScrollAnimate>
              <span className="text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 block">
                TESTIMONIALS
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#F8F5F0]">
                Adoption <span className="text-[#D4A017] font-serif italic font-light">Masterpieces</span>
              </h2>
              <div className="w-12 h-[1px] bg-[#D4A017] mx-auto mt-5" />
            </ScrollAnimate>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16">
            {mockStories.map((story, idx) => (
              <ScrollAnimate key={story.id} delay={idx * 0.15}>
                <div className="bg-white/5 backdrop-blur-sm p-8 sm:p-12 rounded-3xl border border-[#D4A017]/50 flex flex-col justify-between h-full relative group hover:border-[#D4A017]/50 transition-all duration-500">
                  <span className="absolute -top-6 -left-2 text-7xl font-serif text-[#D4A017]/50 leading-none select-none">“</span>
                  
                  <div>
                    <p className="text-stone-300 font-sans text-base sm:text-lg italic leading-relaxed mb-8 relative z-10">
                      "{story.quote}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                    <img
                      src={story.avatar}
                      alt={story.adopter}
                      className="w-14 h-14 rounded-full object-cover border border-[#D4A017]/40 shadow-lg shrink-0"
                    />
                    <div>
                      <h4 className="font-serif text-base sm:text-lg text-[#F8F5F0] font-bold">
                        {story.adopter}
                      </h4>
                      <p className="text-xs uppercase tracking-widest text-[#D4A017] font-semibold mt-0.5">
                        Adopted {story.petName} — {story.achievement}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-28 px-6 sm:px-8 lg:px-12 bg-white border-t border-[#D8D2C4]/35">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 block">
                COMMUNITY NETWORK
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1B4332] font-bold tracking-tight">
                Voices That <span className="text-[#9B2226] font-light italic">Inspire</span>
              </h2>
            </div>
            <Link
              to="/community"
              className="group text-sm font-sans tracking-[0.2em] uppercase font-bold text-[#1B4332] hover:text-[#9B2226] flex items-center gap-2 pb-1 border-b border-[#1B4332] hover:border-[#9B2226] transition-all self-start md:self-auto"
            >
              Explore Community Hub
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {communityPosts.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-stone-400 font-sans text-sm">
                Loading community highlights...
              </div>
            ) : (
              communityPosts.map((msg, idx) => {
                const meta = getPostMetaData(msg.msgId);
                const avatarUrl = getAvatarUrl(msg.sender?.avatar);
                const authorName = msg.sender?.fullName || 'Anonymous Patron';
                const postDate = formatDate(msg.createdAt);

                const truncateContent = (text, maxLength = 130) => {
                  if (!text) return '';
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };

                return (
                  <ScrollAnimate key={msg.msgId} delay={idx * 0.1}>
                    <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-stone-200/60 p-6 flex flex-col justify-between h-[360px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(27,67,50,0.06)] transition-all duration-300 ease-out">
                      <div>
                        <span className="bg-[#1B4332]/5 text-[#1B4332] font-semibold text-xs tracking-wider uppercase px-3 py-1 rounded-full w-fit mb-4 inline-block font-sans">
                          {meta.category}
                        </span>

                        <h3 className="font-serif text-lg sm:text-xl text-[#1B4332] font-bold mb-3 leading-snug hover:text-[#9B2226] transition-colors cursor-pointer">
                          {meta.title}
                        </h3>

                        <p className="text-stone-600 font-sans text-xs sm:text-sm leading-relaxed mb-6 font-medium">
                          {truncateContent(msg.content)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-stone-200/60 pt-4 mt-6">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={authorName}
                              className="w-8 h-8 rounded-full object-cover border border-[#D4A017]/25 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-[#D4A017]/35 shadow-sm">
                              {getInitials(authorName)}
                            </div>
                          )}
                          <div className="text-[11px] font-semibold text-stone-500 font-sans">
                            <span className="text-[#1B4332] block font-bold">{authorName}</span>
                            <span className="text-[10px] text-stone-400">{postDate}</span>
                          </div>
                        </div>

                        <Link 
                          className="text-sm font-bold text-[#D4A017] hover:text-[#1B4332] flex items-center gap-1 group/btn transition-colors duration-200" 
                          to={`/community?highlightMsgId=${msg.msgId}`}
                        >
                          Read Story 
                          <span className="transform group-hover/btn:translate-x-1 transition-transform duration-200">→</span>
                        </Link>
                      </div>
                    </div>
                  </ScrollAnimate>
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="relative py-28 flex items-center justify-center bg-stone-900 overflow-hidden text-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1444212477490-ca407925329e?auto=format&fit=crop&q=80&w=2000"
            alt="Be a Voice for Voiceless"
            className="w-full h-full object-cover object-center opacity-50 select-none scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-950/90 to-[#9B2226]/50 z-10" />
        </div>

        <div className="relative z-20 max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-white">
          <ScrollAnimate>
            <span className="flex items-center justify-center gap-1.5 text-xs sm:text-sm tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-6 font-sans">
              <ShieldCheck size={16} />
              BE A VOICE FOR THE VOICELESS
            </span>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight text-[#F8F5F0]">
              Your Compassion <br className="hidden sm:inline" />
              <span className="text-[#D4A017] font-serif italic font-light">Saves Priceless Lives</span>
            </h2>

            <p className="text-stone-300 font-sans text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed mb-10 mx-auto font-medium">
              Together, we can rewrite the story of every abandoned animal. Your support provides rescue, protection, medical care, and the chance to find a forever family where love lasts a lifetime.
            </p>

            <div className="flex justify-center font-sans">
              <Link
                to="/donate"
                className="relative overflow-hidden group bg-gradient-to-r from-[#9B2226] to-[#b62f33] text-white border border-[#D4A017]/40 px-12 py-4 rounded-full text-xs sm:text-sm tracking-[0.25em] uppercase font-bold shadow-[0_10px_25px_rgba(155,34,38,0.4)] hover:shadow-[0_10px_25px_rgba(212,160,23,0.3)] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  <Heart size={14} className="fill-[#D4A017] text-[#D4A017] animate-pulse" />
                  Become a Member
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-[#D4A017]/25 to-transparent transition-transform duration-1000 ease-out" />
              </Link>
            </div>
          </ScrollAnimate>
        </div>
      </section>

      {isMedicalModalOpen && selectedAnimal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#F8F5F0] rounded-3xl w-full max-w-md border border-[#D4A017]/40 shadow-2xl p-8 relative text-left">
            <button
              onClick={() => {
                setIsMedicalModalOpen(false);
                setSelectedAnimal(null);
              }}
              className="absolute top-5 right-5 text-stone-600 hover:text-[#7b0016] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif text-2xl font-bold text-[#1B4332] mb-1">Medical Report</h3>
            <p className="text-stone-500 text-xs mb-6 font-semibold">Patient: <span className="text-[#1B4332] font-bold">{selectedAnimal.name}</span></p>
            
            <div className="bg-white border border-[#D8D2C4]/40 rounded-2xl p-5 shadow-inner text-sm text-stone-700 leading-relaxed font-sans font-medium">
              {selectedAnimal.medicalHistory || "No specific medical history recorded by the sanctuary."}
            </div>
            
            <button
              onClick={() => {
                setIsMedicalModalOpen(false);
                setSelectedAnimal(null);
              }}
              className="w-full bg-[#1B4332] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider mt-6 border border-[#D4A017]/25 hover:bg-[#9B2226] transition-colors cursor-pointer"
            >
              CLOSE REPORT
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
