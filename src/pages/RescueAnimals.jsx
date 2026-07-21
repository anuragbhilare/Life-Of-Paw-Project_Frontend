import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star, Sparkles, X, CheckCircle2, ShieldCheck, BriefcaseMedicalIcon} from 'lucide-react';
import { mockAnimals } from '../mocks/mockData';
import ScrollAnimate from '../components/ScrollAnimate';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, API_BASE_URL, getImageUrl } from '../services/api';

const RescueAnimals = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('ALL');
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const getDropdownLabel = () => {
    let base = 'All Companions';
    if (activeFilter === 'dogs') base = 'Dogs';
    if (activeFilter === 'cats') base = 'Cats';
    
    if (genderFilter === 'ALL') return base;
    if (genderFilter === 'Male') return `${base} (Male)`;
    if (genderFilter === 'Female') return `${base} (Female)`;
    return base;
  };

  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [dossierForm, setDossierForm] = useState({
    userId: '',
    animalId: '',
    reason: '',
    location: '',
  });

  const [animalsList, setAnimalsList] = useState([]);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const openMedicalModal = (animal) => {
    setSelectedAnimal(animal);
    setIsMedicalModalOpen(true);
  };
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLiveAnimals = async () => {
      try {
        setIsLoading(true);
        let animalToOrgMap = {};
        let animalToOrgIdMap = {};
        try {
          const orgsRes = await apiClient.get('/orgs/all');
          orgsRes.data.forEach(org => {
            const orgName = org.orgName || org.ORG_NAME || 'Sanctuary Alliance HQ';
            const orgId = org.orgId || org.ORG_ID;
            const animals = org.animals || org.ANIMALS;
            if (animals) {
              animals.forEach(ani => {
                const aId = ani.animalId || ani.ANIMAL_ID;
                if (aId) {
                  animalToOrgMap[aId] = orgName;
                  if (orgId) {
                    animalToOrgIdMap[aId] = orgId;
                  }
                }
              });
            }
          });
        } catch (orgErr) {
          console.error("Failed to load organizations for mapping in RescueAnimals.jsx:", orgErr);
        }

        const response = await apiClient.get('/animals/available');
        const adapted = response.data.map(animal => {
          const aId = animal.animalId || animal.ANIMAL_ID || animal.id || animal.ID;
          let resolvedImage = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600';
          const imagesList = animal.images || animal.IMAGES;
          if (imagesList && imagesList.length > 0) {
            const imgObj = imagesList[0];
            const path = imgObj.imageUrl || imgObj.IMAGE_URL || imgObj.image || imgObj.IMAGE;
            if (path) {
              resolvedImage = getImageUrl(path);
            }
          }

          const orgName = animalToOrgMap[aId] || 'Sanctuary Alliance HQ';
          const resolvedOrgId = animalToOrgIdMap[aId];
          const ngoId = resolvedOrgId ? `ngo-${resolvedOrgId}` : 'ngo-1';

          const name = animal.NAME || animal.name;
          const species = animal.SPECIES || animal.species;
          const breed = animal.BREED || animal.breed || 'Mixed Breed';
          const ageCategory = animal.AGE_CATEGORY || animal.ageCategory || 'Adult';
          const gender = animal.GENDER || animal.gender || 'Unknown';
          const desc = animal.DESCRIPTION || animal.Description || animal.description || 'A beautiful rescue companion awaiting a loving home.';
          const medicalHistory = animal.MEDICAL_HISTORY || animal.medicalHistory || null;
          const status = animal.STATUS || animal.status || 'AVAILABLE';

          return {
            id: aId,
            name: name,
            species: species,
            breed: breed,
            age: ageCategory,
            gender: gender,
            description: desc,
            story: desc,
            medicalHistory: medicalHistory,
            location: orgName,
            imageUrl: resolvedImage,
            image: resolvedImage,
            status: status,
            ngoId: ngoId,
            tags: []
          };
        });
        setAnimalsList(adapted);
      } catch (err) {
        console.error("Failed to fetch live animals, using cached/mock values:", err);
        const saved = localStorage.getItem('managedAnimals');
        if (saved) {
          try {
            setAnimalsList(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };
    fetchLiveAnimals();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const adoptAnimalId = params.get('adoptAnimalId');
    if (adoptAnimalId && animalsList.length > 0) {
      const numericId = parseInt(adoptAnimalId, 10);
      const animal = animalsList.find(a => a.id === numericId);
      if (animal) {
        const activeUser = JSON.parse(sessionStorage.getItem('activeUser'));
        if (activeUser) {
          setDossierForm({
            userId: activeUser.userId || 63,
            animalId: animal.id,
            reason: '',
            location: ''
          });
          setSelectedAnimal(animal);
          setSubmissionSuccess(false);
          setIsModalOpen(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [animalsList]);



  const filteredAnimals = animalsList.filter((animal) => {
    if (!animal) return false;    
    const savedOrgs = localStorage.getItem('allianceOrganizations');
    const orgs = savedOrgs ? JSON.parse(savedOrgs) : [
       { id: "ngo-1", name: "Emerald Hills Animal Sanctuary", isVerified: "APPROVED" },
       { id: "ngo-2", name: "Green Haven Rescues & Adoption", isVerified: "APPROVED" }
    ];
    
    const parentOrg = orgs.find(org => org && org.id === animal.ngoId);
    if (parentOrg && parentOrg.isVerified !== 'APPROVED' && parentOrg.isVerified !== 'Y') {
      return false;
    }

    if (genderFilter !== 'ALL') {
      if (animal.gender?.toLowerCase() !== genderFilter.toLowerCase()) {
        return false;
      }
    }

    if (activeFilter === 'all') return true;
    
    const breedText = (animal.breed || "").toLowerCase();
    const speciesText = (animal.species || "").toLowerCase();
    
    if (activeFilter === 'dogs') {
      return speciesText === 'dog' || 
             breedText.includes('dog') || 
             breedText.includes('retriever') || 
             breedText.includes('collie');
    }
    if (activeFilter === 'cats') {
      return speciesText === 'cat' || 
             breedText.includes('cat');
    }
    return true;
  });

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
      setDossierForm({
        userId: activeUser.userId || 63, 
        animalId: animal.id, 
        reason: '',
        location: ''
      });
      setSelectedAnimal(animal);
      setSubmissionSuccess(false);
      setIsModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDossierForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitDossier = async (e) => {
    e.preventDefault();
    if (!dossierForm.reason) return;

    try {
      await apiClient.post('/adoptions/apply', null, {
        params: {
          animalId: dossierForm.animalId,
          reason: dossierForm.reason,
          location: dossierForm.location || 'Mumbai'
        }
      });
      setSubmissionSuccess(true);
    } catch (err) {
      console.error("Failed to submit adoption requestr:", err);
      alert(err.response?.data?.message || err.message || "Failed to register adoption request.");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F5F0] py-28 px-6 sm:px-8 lg:px-12">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16 mt-6">
          <span className="flex items-center justify-center gap-1.5 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3">
            <Sparkles size={12} />
            Animals Looking for a Home
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1B4332] font-bold tracking-tight mb-4">
            Find Your Future<span className="text-[#9B2226] font-light italic"> Best Friend</span>
          </h1>
          <div className="w-16 h-[1px] bg-[#D4A017] mx-auto mb-6" />
          <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed">
            Every animal featured on Life of Paw has been rescued, cared for, and prepared for adoption by trusted shelters and rescue organizations. Browse companions waiting for a loving forever home.
          </p>
        </div>

        <div className="flex justify-center items-center gap-4 mb-16 font-sans">
          {[
            { id: 'all', label: 'All Companions' },
            { id: 'dogs', label: 'Dogs' },
            { id: 'cats', label: 'Cats' }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                activeFilter === btn.id
                  ? 'bg-[#1B4332] border-[#D4A017] text-white shadow-md'
                  : 'bg-white border-[#D8D2C4]/40 text-stone-600 hover:border-[#D4A017]/50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center mb-10 relative font-sans">
          <div className="relative">
            <button
              onClick={() => setIsGenderDropdownOpen(!isGenderDropdownOpen)}
              className="px-6 py-2.5 bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017] rounded-full text-xs font-bold text-[#1B4332] transition-all cursor-pointer flex items-center gap-2 shadow-xs font-sans uppercase tracking-wider"
            >
              <span>{getDropdownLabel()}</span>
              <span className="text-[9px] text-[#D4A017]">▼</span>
            </button>
            
            {isGenderDropdownOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white border border-[#D8D2C4]/40 rounded-xl shadow-lg z-50 py-1 overflow-hidden font-sans">
                {[
                  { value: 'ALL', label: 'All' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setGenderFilter(opt.value);
                      setIsGenderDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-center text-xs transition-colors hover:bg-[#F8F5F0] hover:text-[#1B4332] cursor-pointer block border-none bg-transparent ${
                      genderFilter === opt.value ? 'bg-[#F8F5F0] text-[#1B4332] font-bold' : 'text-stone-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-[#1B4332]/20 border-t-[#D4A017] rounded-full animate-spin"></div>
          </div>
        ) : filteredAnimals.length === 0 ? (
          <div className="bg-white border border-[#D8D2C4]/45 rounded-3xl p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center gap-4 shadow-sm mt-6">
            <span className="text-3xl text-[#D4A017] animate-pulse">🌿</span>
            <h3 className="font-serif text-xl font-bold text-[#1B4332] mt-2">No Companions Available</h3>
            <p className="text-stone-500 font-sans text-xs leading-relaxed max-w-sm">
              There are currently no active rescue companion profiles registry entries matching this selection. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredAnimals.map((animal, idx) => (
              <ScrollAnimate key={animal.id} delay={idx * 0.05}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#D8D2C4]/30 group hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-1">
                  
                  <div className="relative h-110 overflow-hidden shrink-0">
                    <img
                      src={animal.imageUrl || animal.image || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600'}
                      alt={animal.name || 'Rescue Companion'}
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
                        {animal.name || "Lovely Companion"}
                      </h3>
                      <span className="text-xs uppercase font-sans tracking-widest font-bold text-[#D4A017]">
                        {animal.breed || "Mixed Breed"}
                      </span>
                    </div>

                    <div className="flex gap-4 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
                      <span>Age / Stage: <strong className="text-[#1B4332]">{animal.age || "Unknown"}</strong></span>
                      <span className="w-[1px] h-3.5 bg-stone-300 self-center" />
                      <span>Gender: <strong className="text-[#1B4332]">{animal.gender || "Unknown"}</strong></span>
                    </div>

                    <p className="text-stone-600 font-sans text-sm leading-relaxed mb-4 flex-grow">
                      {animal.story || animal.description || "A beautiful animal looking for a compassionate forever home."}
                    </p>

                    <button 
                      onClick={() => openMedicalModal(animal)} 
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-2 mb-6 transition-colors border-none bg-transparent cursor-pointer self-start"
                    >
                      <BriefcaseMedicalIcon size={15} />
                      <span>VIEW MEDICAL RECORD</span>
                    </button>

                    <button
                      onClick={() => handleAdoptClick(animal)}
                      className="w-full py-3 text-center bg-[#1B4332] hover:bg-[#7b0016] text-white rounded-xl text-xs uppercase tracking-[0.2em] font-bold font-sans shadow-md hover:shadow-lg transition-colors duration-300 flex items-center justify-center gap-2 border border-[#D4A017]/25 cursor-pointer"
                    >
                      <Heart size={13} className="fill-current text-[#D4A017]" />
                      Adopt
                    </button>
                  </div>
                </div>
              </ScrollAnimate>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedAnimal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F8F5F0] rounded-3xl h-[550px] max-h-[90vh] border border-[#D4A017]/40 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 text-stone-600 hover:text-[#7b0016] transition-colors z-20 cursor-pointer"
                aria-label="Close Modal"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                
                <div className="md:col-span-2 relative h-48 md:h-full min-h-[220px]">
                  <img
                    src={selectedAnimal.image}
                    alt={selectedAnimal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/90 via-[#1B4332]/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-[#F8F5F0] relative z-10">
                    <span className="text-[15px] uppercase tracking-widest text-[#D4A017] font-bold">Thanks for giving me a home!❤️</span>
                    <h3 className="font-serif text-3xl font-bold mt-1">{selectedAnimal.name}</h3>
                    <p className="text-xs text-stone-300 font-semibold mt-1 uppercase tracking-wide">{selectedAnimal.breed}</p>
                  </div>
                </div>

                <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center bg-white">
                  {submissionSuccess ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-6 flex flex-col items-center"
                    >
                      <CheckCircle2 size={48} className="text-[#1B4332] mb-4" />
                      <h4 className="font-serif text-xl sm:text-2xl text-[#1B4332] font-bold mb-3">Request Submitted</h4>
                      <p className="text-stone-500 font-sans text-xs sm:text-sm leading-relaxed mb-6">
                        Adoption request has been recorded. Our clinical sanctuary board will review your credentials and contact you shortly.
                      </p>
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="bg-[#1B4332] text-white hover:bg-[#7b0016] px-6 py-2.5 rounded-full text-xs font-sans tracking-widest uppercase font-bold transition-all shadow-md cursor-pointer border border-[#D4A017]/20"
                      >
                        Browse Other Companions
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmitDossier} className="flex flex-col gap-4 font-sans text-left">
                      
                      <div>
                        <span className="text-[10px] tracking-[0.2em] text-[#D4A017] uppercase font-bold block mb-1">APPLICATION DETAILS</span>
                        <h4 className="font-serif text-2xl text-[#1B4332] font-bold">Apply for Guardianship</h4>
                        <div className="w-8 h-[1px] bg-[#D4A017] mt-3 mb-4" />
                      </div>

                      <input type="hidden" name="userId" value={dossierForm.userId} />
                      <input type="hidden" name="animalId" value={dossierForm.animalId} />

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] tracking-widest uppercase font-bold text-stone-500">Reason for Adoption *</label>
                        <textarea
                          required
                          name="reason"
                          rows={3}
                          value={dossierForm.reason}
                          onChange={handleInputChange}
                          placeholder="Tell us about the home environment you will provide..."
                          className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold focus:ring-1 focus:ring-[#D4A017] resize-none"
                        />
                      </div>  

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] tracking-widest uppercase font-bold text-stone-500">Pet Ownership Experience *</label>
                        <input
                          type="text"
                          placeholder="Please describe your previous pet ownership history, or how you have prepared for your first companion:"
                          className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold focus:ring-1 focus:ring-[#D4A017] resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] tracking-widest uppercase font-bold text-stone-500">Your Location *</label>
                        <input
                          required
                          type="text"
                          name="location"
                          value={dossierForm.location}
                          onChange={handleInputChange}
                          placeholder="Bandra, Mumbai"
                          className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold focus:ring-1 focus:ring-[#D4A017] resize-none"
                        />
                      </div>
                      

                      <button
                        type="submit"
                        className="w-full bg-[#7b0016] text-[#F8F5F0] hover:bg-[#1B4332] py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-bold shadow-xl transition-all duration-300 mt-2 flex items-center justify-center gap-1.5 border border-[#D4A017]/30 cursor-pointer"
                      >
                        <Heart size={14} className="text-[#D4A017] fill-current" />
                        SUBMIT REQUEST
                      </button>

                    </form>
                  )}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            <p className="text-stone-500 text-xs mb-6 font-semibold"> ♡ <span className="text-[#1B4332] font-bold">{selectedAnimal.name}</span></p>
            
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

export default RescueAnimals;
