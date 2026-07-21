import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Sparkles, MapPin,ArrowLeft, Calendar, Award, Heart, X, CheckCircle2, ShieldCheck, Shield, BriefcaseMedicalIcon} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollAnimate from '../components/ScrollAnimate';
import { apiClient, API_BASE_URL, getImageUrl } from '../services/api';

const Organizations = () => {
  const [orgsList, setOrgsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [profileTab, setProfileTab] = useState('companions'); 
  const [companions, setCompanions] = useState([]);
  const [companionsError, setCompanionsError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsError, setReviewsError] = useState(null);
  const [subTabUiState, setSubTabUiState] = useState('idle'); 
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isAdoptModalOpen, setIsAdoptModalOpen] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [activeMedicalModal, setActiveMedicalModal] = useState(null);

  const [isDMModalOpen, setIsDMModalOpen] = useState(false);
  const [dmMessage, setDmMessage] = useState('');
  const [dmSending, setDmSending] = useState(false);
  const [dmSuccess, setDmSuccess] = useState(false);
  const [dmError, setDmError] = useState(null);

  const [dossierForm, setDossierForm] = useState({
    userId: '',
    animalId: '',
    reason: '',
    location: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchLiveOrgs = async () => {
      try {
        const response = await apiClient.get('/orgs/all');
        const orgs = response.data || [];
        
        const orgsWithReviews = await Promise.all(orgs.map(async (org) => {
          try {
            const reviewsRes = await apiClient.get(`/social/reviews/org/${org.orgId}`);
            const reviewsData = reviewsRes.data || [];
            
            let avgRating = 0;
            if (reviewsData.length > 0) {
              const sum = reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0);
              avgRating = Number((sum / reviewsData.length).toFixed(1));
            }
            
            return {
              ...org,
              reviewsList: reviewsData,
              avgRating: avgRating,
              totalReviews: reviewsData.length
            };
          } catch (err) {
            console.error(`Failed to fetch reviews for orgId ${org.orgId}:`, err);
            return {
              ...org,
              reviewsList: [],
              avgRating: 0,
              totalReviews: 0
            };
          }
        }));

        const adaptedOrgs = orgsWithReviews.map(org => {
          const isVerifiedVal = (org.isVerified === null || org.isVerified === undefined)
            ? 'APPROVED'
            : (org.isVerified === 'Y' || org.isVerified === 'APPROVED' ? 'APPROVED' : 'PENDING');

          return {
            id: `ngo-${org.orgId}`,
            orgId: org.orgId,
            name: org.orgName,
            orgName: org.orgName,
            location: org.location,
            licenseNumber: org.licenseNumber,
            isVerified: isVerifiedVal,
            ownerEmail: org.contactPerson?.email || '',
            ownerName: org.contactPerson?.fullName || '',
            ownerId: org.contactPerson?.userId || null,
            founded: '2026',
            rating: org.avgRating,
            totalReviews: org.totalReviews,
            reviewsList: org.reviewsList,
            rescuesCount: org.animals ? org.animals.length : 12,
            logo: '🐾',
            sanctuaryDescription: org.sanctuaryDescription || '',
            orgDescription: org.sanctuaryDescription || org.orgDescription || 'A certified, medical-first sanctuary leveraging advanced veterinary practices and large-scale habitat preservation to set a new benchmark for animal welfare.',
            description: org.sanctuaryDescription || org.orgDescription || 'A certified, medical-first sanctuary leveraging advanced veterinary practices and large-scale habitat preservation to set a new benchmark for animal welfare.',
            galleryImages: org.galleryImages || []
          };
        });

        const saved = localStorage.getItem('allianceOrganizations');
        let finalOrgs = adaptedOrgs;
        if (saved) {
          try {
            const savedOrgs = JSON.parse(saved);
            savedOrgs.forEach(sOrg => {
              if (!finalOrgs.some(fOrg => fOrg.id === sOrg.id || fOrg.orgId === sOrg.orgId || fOrg.name === sOrg.name)) {
                sOrg.sanctuaryDescription = sOrg.sanctuaryDescription || sOrg.orgDescription || '';
                sOrg.galleryImages = sOrg.galleryImages || sOrg.orgImages || [];
                sOrg.rating = sOrg.rating !== undefined ? sOrg.rating : 0.0;
                sOrg.totalReviews = sOrg.totalReviews !== undefined ? sOrg.totalReviews : 0;
                sOrg.reviewsList = sOrg.reviewsList || [];
                finalOrgs.push(sOrg);
              }
            });
          } catch (e) {
            console.error(e);
          }
        }
        setOrgsList(finalOrgs);
      } catch (err) {
        console.error("Failed to fetch live alliance organizations in global listings:", err);
        const saved = localStorage.getItem('allianceOrganizations');
        if (saved) {
          try {
            setOrgsList(JSON.parse(saved));
          } catch (e) {
            console.error(e);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLiveOrgs();
  }, []);

  const updateOrgRatingLocal = (orgId, newReviews) => {
    setOrgsList(prevList => prevList?.map(org => {
      if (org.orgId === orgId) {
        let avgRating = 0;
        if (newReviews?.length > 0) {
          const sum = newReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          avgRating = Number((sum / newReviews.length).toFixed(1));
        }
        return {
          ...org,
          rating: avgRating,
          totalReviews: newReviews.length,
          reviewsList: newReviews
        };
      }
      return org;
    }));
    
    setSelectedOrg(prevOrg => {
      if (prevOrg && prevOrg.orgId === orgId) {
        let avgRating = 0;
        if (newReviews?.length > 0) {
          const sum = newReviews.reduce((acc, r) => acc + (r.rating || 0), 0);
          avgRating = Number((sum / newReviews.length).toFixed(1));
        }
        return {
          ...prevOrg,
          rating: avgRating,
          totalReviews: newReviews.length,
          reviewsList: newReviews
        };
      }
      return prevOrg;
    });
  };

  const fetchOrgReviews = async () => {
    if (!selectedOrg) {
      setReviews([]);
      return;
    }
    try {
      setSubTabUiState('loading');
      setReviewsError(null);

      const numericId = typeof selectedOrg.orgId === 'string' && selectedOrg.orgId.startsWith('ngo-')
        ? parseInt(selectedOrg.orgId.replace('ngo-', ''), 10)
        : selectedOrg.orgId;

      const startTime = Date.now();
      const response = await apiClient.get(`/social/reviews/org/${numericId}`);
      const reviewData = Array.isArray(response.data) ? response.data : (response.data?.content || []);
      
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, 300 - elapsed);
      await new Promise(resolve => setTimeout(resolve, remainingTime));

      setReviews(reviewData);
      updateOrgRatingLocal(numericId, reviewData);
      setSubTabUiState('success');
    } catch (err) {
      console.error("Failed to load sanctuary reviews:", err);
      setReviewsError("Could not retrieve review testimonials for this sanctuary.");
      setSubTabUiState('error');
    }
  };

  useEffect(() => {
    if (!selectedOrg) {
      setCompanions([]);
      setReviews([]);
      setSubTabUiState('idle');
      return;
    }

    const fetchOrgDetails = async () => {
      try {
        setSubTabUiState('loading');
        setCompanionsError(null);
        setReviewsError(null);

        const numericId = typeof selectedOrg.orgId === 'string' && selectedOrg.orgId.startsWith('ngo-')
          ? parseInt(selectedOrg.orgId.replace('ngo-', ''), 10)
          : selectedOrg.orgId;

        const startTime = Date.now();

        const [companionsRes, reviewsRes] = await Promise.all([
          apiClient.get(`/animals/public/org/${numericId}`),
          apiClient.get(`/social/reviews/org/${numericId}`)
        ]);

        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, 300 - elapsed);

        setTimeout(() => {
          const fetchedCompanions = Array.isArray(companionsRes.data) ? companionsRes.data : (companionsRes.data?.content || []);
          setCompanions(fetchedCompanions);
          
          const fetchedReviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data?.content || []);
          setReviews(fetchedReviews);
          
          updateOrgRatingLocal(numericId, fetchedReviews);
          setSubTabUiState('success');
        }, remainingTime);
      } catch (err) {
        console.error("Failed to load sanctuary details:", err);
        setCompanionsError("Could not retrieve companion records for this sanctuary.");
        setReviewsError("Could not retrieve review testimonials for this sanctuary.");
        setSubTabUiState('error');
      }
    };

    fetchOrgDetails();
  }, [selectedOrg?.orgId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      setSubmittingReview(true);
      setReviewSubmitError(null);
      setReviewSubmitSuccess(false);

      const numericId = typeof selectedOrg.orgId === 'string' && selectedOrg.orgId.startsWith('ngo-')
        ? parseInt(selectedOrg.orgId.replace('ngo-', ''), 10)
        : selectedOrg.orgId;

      await apiClient.post('/social/reviews/add', null, {
        params: {
          orgId: numericId,
          rating: reviewRating,
          comment: reviewComment
        }
      });

      setReviewComment('');
      setReviewRating(5);
      setReviewSubmitSuccess(true);
      
      await fetchOrgReviews();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setReviewSubmitError(err.response?.data?.message || err.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAdoptClick = (animal) => {
    const activeUser = JSON.parse(sessionStorage.getItem('activeUser'));
    if (!activeUser) {
      sessionStorage.setItem('redirectTo', '/organizations');
      sessionStorage.setItem(
        'toastMessage',
        'Please sign in or create an account to initiate an adoption.'
      );
      navigate('/login');
    } else {
      setDossierForm({
        userId: activeUser.userId || 63,
        animalId: animal.animalId || animal.id,
        reason: '',
        location: ''
      });
      setSelectedAnimal(animal);
      setSubmissionSuccess(false);
      setIsAdoptModalOpen(true);
    }
  };

  const handleSubmitDM = async (e) => {
    e.preventDefault();
    if (!dmMessage.trim()) return;

    const receiverId = selectedOrg.ownerId;
    if (!receiverId) {
      setDmError("This organization does not have a registered owner account.");
      return;
    }

    try {
      setDmSending(true);
      setDmError(null);

      await apiClient.post('/social/messages/send-private', null, {
        params: {
          receiverId: receiverId,
          content: dmMessage
        }
      });

      setDmSuccess(true);
      setDmMessage('');

      setTimeout(() => {
        setIsDMModalOpen(false);
        setDmSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to send DM:", err);
      setDmError(err.response?.data?.message || err.message || "Failed to send message.");
    } finally {
      setDmSending(false);
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
      const currentAnimalId = selectedAnimal.animalId || selectedAnimal.id;
      await apiClient.get(`/animals/get-particular/${currentAnimalId}`);

      await apiClient.post('/adoptions/apply', null, {
        params: {
          animalId: currentAnimalId,
          reason: dossierForm.reason,
          location: dossierForm.location || 'Mumbai'
        }
      });
      setSubmissionSuccess(true);
    } catch (err) {
      console.error("Failed to submit adoption request:", err);
      alert(err.response?.data?.message || err.message || "Failed to register adoption request.");
    }
  };

  const approvedOrgs = orgsList.filter(org => org && (org.isVerified === 'APPROVED' || org.isVerified === 'Y'));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-[#1B4332] font-semibold text-lg">Loading Rescue Organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8F5F0] py-28 px-6 sm:px-8 lg:px-12">
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!selectedOrg ? (
            <motion.div
              key="directory-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center max-w-2xl mx-auto mb-16 mt-6">
                <span className="flex items-center justify-center gap-1.5 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3">
                  <Sparkles size={12} />
                  Trusted Rescue Partners
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl text-[#1B4332] font-bold tracking-tight mb-4">
                  Shelters & NGOs <span className="text-[#9B2226] font-light italic">We Trust</span>
                </h1>
                <div className="w-16 h-[1px] bg-[#D4A017] mx-auto mb-6" />
                <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed">
                  Every organization on our platform is carefully verified to ensure animals receive proper care, medical attention, and responsible adoption support. Together, we create more opportunities for rescued companions to find the families they deserve.
                </p>
              </div>

              {approvedOrgs.length === 0 ? (
                <div className="bg-white border border-[#D8D2C4]/45 rounded-[2rem] p-16 text-center max-w-xl mx-auto flex flex-col items-center shadow-md">
                  <Shield className="text-[#D4A017] mb-4" size={36} />
                  <p className="font-serif text-xl font-bold text-[#1B4332] mb-2">No Certified Organizations</p>
                  <p className="text-stone-500 font-sans text-xs">There are no approved sanctuaries listed in the directory at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {approvedOrgs.map((ngo, idx) => (
                    <ScrollAnimate key={ngo.id} delay={idx * 0.05}>
                      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D8D2C4]/45 shadow-md flex flex-col sm:flex-row gap-6 justify-between h-full hover:shadow-xl hover:border-[#D4A017]/40 transition-all duration-300">
                        <div className="flex flex-col justify-between flex-grow w-full sm:w-[68%]">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 bg-[#F8F5F0] border border-[#D4A017]/35 rounded-full flex items-center justify-center text-2xl shadow-sm shrink-0">
                              {ngo.logo || "🐾"}
                            </div>
                            <div>
                              <h3 className="font-serif text-lg text-[#1B4332] font-bold leading-tight flex items-center gap-2">
                                {ngo.name || ngo.orgName || "Boutique Sanctuary"}
                                <Award size={15} className="text-[#D4A017] fill-current shrink-0" />
                              </h3>
                              <div className="flex flex-col space-y-1 mt-1 text-[11px] text-stone-500 font-semibold">
                                <div className="flex items-center gap-1.5">
                                  <Star size={12} className="fill-[#cca43b] text-[#cca43b] shrink-0" />
                                  <span>
                                    <strong>{Number(ngo.rating || 0).toFixed(1)}</strong> ({ngo.totalReviews || 0} Reviews)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12px] leading-none shrink-0">🐾</span>
                                  <span>
                                    <strong>{ngo.rescuesCount || 0}</strong> Animals / Rescues
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-stone-600 font-sans text-xs leading-relaxed my-auto py-2">
                            {ngo.sanctuaryDescription || ngo.orgDescription || ngo.description || "Partner sanctuary undergoing veterinary alignment review."}
                          </p>

                          <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest pt-3 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
                            <span>{ngo.location ? ngo.location.toUpperCase() : "PUNE, MAHARASHTRA"}</span>
                            <span className="text-stone-300 font-normal">|</span>
                            <span>📅 FOUNDED {ngo.founded || '2026'}</span>
                          </div>
                        </div>

                        <div className="sm:self-stretch shrink-0 flex flex-col items-center justify-between border-t sm:border-t-0 sm:border-l border-[#D8D2C4]/45 pt-6 sm:pt-0 sm:pl-6 w-full sm:w-[32%] text-center">
                          <span className="text-[10px] tracking-[0.25em] text-[#D4A017] uppercase font-bold block">
                            ORGANIZATION PROFILE
                          </span>
                          
                          <div className="my-auto py-4">
                            <button
                              onClick={() => {
                                setSelectedOrg(ngo);
                                setProfileTab('companions');
                              }}
                              className="px-0 py-1 bg-transparent hover:text-[#7b0016] text-[#1B4332] rounded-none text-[11px] font-sans font-extrabold uppercase tracking-widest border-b-2 border-[#D4A017] transition-all cursor-pointer hover:border-[#7b0016]"
                            >
                              EXPLORE SHELTER
                            </button>
                          </div>
                          
                          <span className="text-[9px] font-sans tracking-widest text-stone-400 font-extrabold uppercase block">
                            VERIFIED ORGANIZATION 
                          </span>
                        </div>
                      </div>
                    </ScrollAnimate>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="sanctuary-profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col text-left"
            >
              <button
                onClick={() => setSelectedOrg(null)}
                className="flex items-center gap-2 text-[#1B4332] hover:text-[#7b0016] font-sans font-bold uppercase tracking-wider text-xs transition-all mb-8 cursor-pointer self-start border border-stone-300/40 bg-white px-4 py-2.5 rounded-full shadow-sm"
              >
                <ArrowLeft size={14} className="text-[#D4A017]" />
                Back to Directory
              </button>

              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#D8D2C4]/40 shadow-md mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#D4A017]" />
                <div className="pl-3 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="w-20 h-20 bg-[#F8F5F0] border border-[#D4A017]/35 rounded-full flex items-center justify-center text-4xl shadow-inner shrink-0">
                    {selectedOrg.logo || '🏛️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-serif text-3xl font-bold text-[#1B4332]">{selectedOrg.name || selectedOrg.orgName}</h2>
                      <button
                        onClick={() => {
                          const activeUser = JSON.parse(sessionStorage.getItem('activeUser'));
                          if (!activeUser) {
                            alert("You need to login / register to text organizations.");
                          } else {
                            setIsDMModalOpen(true);
                            setDmSuccess(false);
                            setDmError(null);
                            setDmMessage('');
                          }
                        }}
                        className="p-2 bg-[#1B4332] hover:bg-[#7b0016] text-[#D4A017] hover:text-white rounded-full shadow transition-all duration-300 hover:scale-105 cursor-pointer flex items-center justify-center shrink-0 border border-[#D4A017]/30 w-8 h-8 sm:w-9 sm:h-9 animate-pulse"
                        title="Chat with Organization"
                      >
                        <span className="text-sm sm:text-base leading-none">💬</span>
                      </button>
                    </div>
                    <span className="text-[9px] tracking-[0.25em] text-[#D4A017] uppercase font-bold mt-1 block">CERTIFIED PLATFORM ALLIANCE MEMBER</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-sans text-stone-600 bg-[#F8F5F0]/65 border border-stone-150 p-5 rounded-2xl w-full md:w-auto md:min-w-[280px]">
                  <div>
                    <span className="text-[8px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">License Number</span>
                    <span className="font-mono font-bold text-stone-800">{selectedOrg.licenseNumber || 'LIC-2983-VET'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">Contact Person</span>
                    <span className="font-bold text-[#1B4332]">{selectedOrg.ownerName || 'Sanctuary Manager'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">Location</span>
                    <span className="font-bold text-[#1B4332]">{selectedOrg.location || 'Mumbai, MH'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">Registry Date</span>
                    <span className="font-bold text-stone-850">Founded {selectedOrg.founded || '2026'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-[#D8D2C4]/40 shadow-sm mb-8">
                <h3 className="font-serif text-xl font-bold text-[#1B4332] mb-3">Audited Mission Statement</h3>
                <p className="text-stone-650 leading-relaxed font-sans text-sm italic">
                  "{selectedOrg.sanctuaryDescription || selectedOrg.orgDescription || 'A certified, medical-first sanctuary leveraging advanced veterinary practices and large-scale habitat preservation to set a new benchmark for animal welfare.'}"
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-[#D8D2C4]/40 shadow-sm mb-8">
                <h3 className="font-serif text-xl font-bold text-[#1B4332] mb-4">Sanctuary Gallery</h3>
                {(!selectedOrg.galleryImages || selectedOrg.galleryImages.length === 0) ? (
                  <p className="text-stone-400 text-xs italic">No environment gallery uploads registered for this organization.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {selectedOrg.galleryImages.map((img, idx) => {
                      const finalUrl = getImageUrl(img.imageUrl || img.url);
                      return (
                        <div key={idx} className="flex flex-col gap-2 bg-[#F8F5F0]/40 border border-stone-250/30 p-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all">
                          <img
                            src={finalUrl}
                            alt={`Audit Photo ${idx + 1}`}
                            className="w-full h-44 object-cover rounded-xl shadow-sm"
                          />
                          <span className="text-[8px] text-stone-500 font-semibold truncate text-center block" title={img.imageUrl}>
                            {img.imageUrl ? img.imageUrl.split('/').pop() : `Audit Asset ${idx + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex border-b border-stone-200 mb-8 mt-6 justify-center sm:justify-start font-sans">
                <button
                  onClick={() => setProfileTab('companions')}
                  className={`px-8 py-4 font-serif font-bold text-base sm:text-lg border-b-2 transition-all cursor-pointer ${
                    profileTab === 'companions'
                      ? 'border-[#1B4332] text-[#1B4332]'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  🐕 Resident Companions ({companions.length})
                </button>
                <button
                  onClick={() => setProfileTab('reviews')}
                  className={`px-8 py-4 font-serif font-bold text-base sm:text-lg border-b-2 transition-all cursor-pointer ${
                    profileTab === 'reviews'
                      ? 'border-[#1B4332] text-[#1B4332]'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  ⭐ Public Reviews
                </button>
              </div>

              {profileTab === 'companions' ? (
                <div>
                  {subTabUiState === 'loading' ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                      <p className="text-stone-500 text-xs font-semibold">Loading Animal Records...</p>
                    </div>
                  ) : companionsError ? (
                    <div className="py-12 text-center text-[#7b0016] text-xs font-bold font-sans uppercase">
                      ⚠️ {companionsError}
                    </div>
                  ) : companions?.length === 0 ? (
                    <div className="bg-[#F8F5F0] border border-dashed border-[#D8D2C4] rounded-2xl p-12 text-center flex flex-col items-center">
                      <ShieldCheck className="text-stone-400 mb-2" size={24} />
                      <p className="font-serif text-base font-bold text-[#1B4332] mb-1">No Active Listings</p>
                      <p className="text-stone-400 text-xs">There are no resident companions currently looking for guardianship here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      {companions?.map((item, idx) => {
                         const hasImages = item?.images && item.images.length > 0;
                         const finalAnimalImg = hasImages ? getImageUrl(item.images[0].imageUrl) : null;

                        return (
                          <ScrollAnimate key={item.animalId || item.id} delay={idx * 0.05}>
                            <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-[#D8D2C4]/30 group hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-1 relative">
                              <div className="relative h-120 overflow-hidden shrink-0 bg-stone-100 flex items-center justify-center">
                                {finalAnimalImg ? (
                                  <img
                                    src={finalAnimalImg}
                                    alt={item.name || 'Rescue Companion'}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-stone-200 flex flex-col items-center justify-center text-stone-400 font-sans text-xs uppercase tracking-[0.2em] font-bold">
                                    <span>🐾 No Photo Available</span>
                                  </div>
                                )}
                                
                                {item.status === 'ADOPTED' && (
                                  <div className="absolute top-4 right-4 bg-[#1B4332] text-white border border-[#D4A017] px-3.5 py-1.5 rounded-full text-[9px] font-sans font-extrabold uppercase tracking-widest shadow-md z-20">
                                    🎉 HAPPILY ADOPTED
                                  </div>
                                )}

                                <span className="absolute bottom-4 left-4 text-xs font-semibold text-stone-200 flex items-center gap-1.5 z-10">
                                  <Star size={12} className="fill-[#D4A017] text-[#D4A017]" />
                                  {item.location || selectedOrg.location}
                                </span>
                              </div>

                              <div className="p-6 flex flex-col flex-grow text-left">
                                <div className="flex justify-between items-baseline mb-3">
                                  <h3 className="font-serif text-xl text-[#1B4332] font-bold">
                                    {item.name}
                                  </h3>
                                  <span className="text-xs uppercase font-sans tracking-widest font-bold text-[#D4A017]">
                                    {item.breed || "Mixed Breed"}
                                  </span>
                                </div>

                                <div className="flex gap-4 text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">
                                  <span>Age / Stage: <strong className="text-[#1B4332]">{item.ageCategory || item.age || "Unknown"}</strong></span>
                                  <span className="w-[1px] h-3.5 bg-stone-300 self-center" />
                                  <span>Gender: <strong className="text-[#1B4332]">{item.gender || "Unknown"}</strong></span>
                                </div>

                                <p className="text-stone-600 font-sans text-xs leading-relaxed mb-4 flex-grow">
                                  {item.story || item.description || "A beautiful animal looking for a compassionate forever home."}
                                </p>

                                {(item.medicalHistory || item.healthLog) && (
                                  <button
                                    onClick={() => setActiveMedicalModal({
                                      name: item.name,
                                      medicalHistory: item.medicalHistory || item.healthLog
                                    })}
                                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 mt-2 mb-6 transition-colors border-none bg-transparent cursor-pointer self-start"
                                
                                  >
                                    <BriefcaseMedicalIcon size={15} />
                                    <span>View Medical Records</span>
                                  </button>
                                )}

                                {item.status === 'ADOPTED' ? (
                                  <button
                                    disabled
                                    className="w-full py-3 text-center bg-stone-350 border border-stone-400/20 text-stone-500 rounded-xl text-xs uppercase tracking-[0.2em] font-bold font-sans cursor-not-allowed"
                                  >
                                    Found a Home
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAdoptClick(item)}
                                    className="w-full py-3 text-center bg-[#1B4332] hover:bg-[#7b0016] text-white rounded-xl text-xs uppercase tracking-[0.2em] font-bold font-sans shadow-md hover:shadow-lg transition-colors duration-300 flex items-center justify-center gap-2 border border-[#D4A017]/25 cursor-pointer"
                                  >
                                    <Heart size={13} className="fill-current text-[#D4A017]" />
                                    Adopt
                                  </button>
                                )}
                              </div>
                            </div>
                          </ScrollAnimate>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto mt-4 font-sans">
                  
                  <div className="flex flex-col gap-6 w-full">
                    <h3 className="font-serif text-2xl font-bold text-[#1B4332] text-left border-b border-stone-150 pb-3">
                      Adopter Testimonials
                    </h3>
                    
                    {subTabUiState === 'loading' ? (
                      <div className="py-12 flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                        <p className="text-stone-500 text-xs font-semibold">Retrieving reviews...</p>
                      </div>
                    ) : reviewsError ? (
                      <div className="py-12 text-center text-[#7b0016] text-xs font-bold uppercase">
                        ⚠️ {reviewsError}
                      </div>
                    ) : reviews?.length === 0 ? (
                      <div className="bg-[#F8F5F0] border-2 border-dashed border-[#D8D2C4]/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-2">
                        <span className="text-3xl text-stone-400">⭐</span>
                        <h4 className="font-serif text-lg font-bold text-[#1B4332]">No Reviews Yet</h4>
                        <p className="text-stone-500 text-xs max-w-xs leading-relaxed">
                          Be the first to share your adoption journey and review your experience with this sanctuary!
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {reviews?.map((rev) => (
                          <div
                            key={rev.reviewId || rev.id}
                            className="bg-white border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm text-left flex flex-col gap-2 relative hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-serif text-[#1B4332] font-bold text-sm">
                                  {rev.reviewer?.fullName || 'Anonymous Adopter'}
                                </h4>
                                <div className="flex gap-0.5 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                      key={star}
                                      className={`text-xs ${star <= (rev.rating || 0) ? 'text-[#cca43b]' : 'text-stone-200'}`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className="text-[10px] text-stone-400 font-medium">
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent Review'}
                              </span>
                            </div>
                            <p className="text-stone-650 font-sans text-xs leading-relaxed mt-1 italic">
                              "{rev.commentText}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-white border border-[#D8D2C4]/45 rounded-3xl p-8 shadow-md text-left flex flex-col gap-6">
                    <h3 className="font-serif text-xl font-bold text-[#1B4332] border-b border-stone-100 pb-3">
                      Leave a Testimonial
                    </h3>

                    {JSON.parse(sessionStorage.getItem('activeUser')) ? (
                      <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                        {reviewSubmitError && (
                          <div className="bg-[#7b0016]/10 border border-[#7b0016]/20 text-[#7b0016] px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider">
                            ⚠️ {reviewSubmitError}
                          </div>
                        )}
                        {reviewSubmitSuccess && (
                          <div className="bg-[#1B4332]/10 border border-[#1B4332]/25 text-[#1B4332] px-4 py-2.5 rounded-xl text-xs font-semibold">
                            🎉 Your review has been submitted successfully! Thank you for your testimonial.
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] tracking-widest uppercase font-bold text-stone-500">Your Rating *</label>
                          <div className="flex gap-1.5 items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className={`text-2xl transition-all cursor-pointer border-none bg-transparent focus:outline-none ${
                                  star <= (hoverRating || reviewRating) ? 'text-[#cca43b]' : 'text-stone-300'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] tracking-widest uppercase font-bold text-stone-500">Your Review *</label>
                          <textarea
                            required
                            rows={4}
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            placeholder="Share your experience adopting from this sanctuary..."
                            className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold focus:ring-1 focus:ring-[#D4A017] resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="self-start bg-[#1B4332] text-white hover:bg-[#7b0016] px-6 py-2.5 rounded-full text-xs font-sans tracking-widest uppercase font-bold transition-all shadow-md cursor-pointer border border-[#D4A017]/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    ) : (
                      <div className="bg-[#F8F5F0]/60 border border-[#D8D2C4]/40 rounded-2xl p-6 text-center">
                        <p className="text-stone-600 text-xs font-semibold">
                          Please <Link to="/login" className="text-[#cca43b] hover:text-[#1B4332] underline font-bold">sign in</Link> or <Link to="/login" className="text-[#cca43b] hover:text-[#1B4332] underline font-bold">create an account</Link> to leave a public review.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isDMModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F8F5F0] rounded-3xl border border-[#D4A017]/40 shadow-2xl relative overflow-hidden w-full max-w-lg p-8 sm:p-10 text-left font-sans"
            >
              <button
                onClick={() => setIsDMModalOpen(false)}
                className="absolute top-5 right-5 text-stone-600 hover:text-[#7b0016] transition-colors z-20 cursor-pointer"
                aria-label="Close Modal"
              >
                <X size={20} />
              </button>

              <h3 className="font-serif text-2xl font-bold text-[#1B4332] mb-2">Message {selectedOrg.name}</h3>
              <p className="text-xs text-stone-500 mb-6">Send a direct private message to the organization manager. You can follow up on this conversation inside your dashboard.</p>

              {dmSuccess ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 flex flex-col items-center"
                >
                  <CheckCircle2 size={48} className="text-[#1B4332] mb-4" strokeWidth={1.5} />
                  <h4 className="font-serif text-lg text-[#1B4332] font-bold mb-2">Message Sent!</h4>
                  <p className="text-stone-500 text-xs sm:text-sm mb-4">
                    Your message has been delivered to {selectedOrg.ownerName || selectedOrg.name}.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitDM} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] tracking-widest uppercase font-bold text-stone-500">Your Message</label>
                    <textarea
                      value={dmMessage}
                      onChange={(e) => setDmMessage(e.target.value)}
                      placeholder="Type your inquiry or message here..."
                      className="w-full bg-white border border-[#D8D2C4]/70 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-2xl py-3 px-4 text-xs focus:outline-none transition-colors text-stone-850 font-semibold resize-none min-h-[120px]"
                      required
                    />
                  </div>

                  {dmError && (
                    <div className="text-xs font-bold text-[#7b0016] bg-[#7b0016]/10 p-3 rounded-xl border border-[#7b0016]/20">
                      {dmError}
                    </div>
                  )}

                  <div className="flex gap-3 justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setIsDMModalOpen(false)}
                      className="px-5 py-2.5 border border-stone-300 rounded-full text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={dmSending}
                      className="px-6 py-2.5 bg-[#1B4332] text-white hover:bg-[#7b0016] rounded-full text-xs tracking-wider uppercase font-bold transition-all shadow-md cursor-pointer border border-[#D4A017]/20 flex items-center gap-2"
                    >
                      {dmSending ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdoptModalOpen && selectedAnimal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F8F5F0] rounded-3xl h-[550px] max-h-[90vh] border border-[#D4A017]/40 shadow-2xl relative overflow-hidden w-full max-w-7xl"
            >
              <button
                onClick={() => setIsAdoptModalOpen(false)}
                className="absolute top-5 right-5 text-stone-600 hover:text-[#7b0016] transition-colors z-20 cursor-pointer"
                aria-label="Close Modal"
              >
                <X size={24} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                
                <div className="md:col-span-2 relative h-48 md:h-full min-h-[220px]">
                  {selectedAnimal.images && selectedAnimal.images.length > 0 ? (
                    <img
                      src={getImageUrl(selectedAnimal.images[0].imageUrl)}
                      alt={selectedAnimal.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-stone-200 flex items-center justify-center text-stone-400 font-sans text-xs uppercase tracking-wider">
                      No Photo Available
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B4332]/90 via-[#1B4332]/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-[#F8F5F0] relative z-10 text-left">
                    <span className="text-[15px] uppercase tracking-widest text-[#D4A017] font-bold">Thanks for giving me a home!❤️</span>
                    <h3 className="font-serif text-3xl font-bold mt-1">{selectedAnimal.name}</h3>
                    <p className="text-xs text-stone-300 font-semibold mt-1 uppercase tracking-wide">{selectedAnimal.breed || "Mixed Breed"}</p>
                  </div>
                </div>

                <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center bg-white overflow-y-auto h-full max-h-[calc(90vh-120px)] md:max-h-full">
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
                        onClick={() => setIsAdoptModalOpen(false)}
                        className="bg-[#1B4332] text-white hover:bg-[#7b0016] px-6 py-2.5 rounded-full text-xs font-sans tracking-widest uppercase font-bold transition-all shadow-md cursor-pointer border border-[#D4A017]/20"
                      >
                        Explore Other Resident Companions
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
                          required
                          placeholder="Please describe your previous pet ownership history, or how you have prepared for your first companion:"
                          className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold focus:ring-1 focus:ring-[#D4A017]"
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
                          className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold focus:ring-1 focus:ring-[#D4A017]"
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

      {activeMedicalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#F8F5F0] rounded-3xl w-full max-w-md border border-[#D4A017]/40 shadow-2xl p-8 relative text-left">
            <button
              onClick={() => setActiveMedicalModal(null)}
              className="absolute top-5 right-5 text-stone-600 hover:text-[#7b0016] transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <h3 className="font-serif text-2xl font-bold text-[#1B4332] mb-1">Medical Report</h3>
            <p className="text-stone-500 text-xs mb-6 font-semibold"> ♡ <span className="text-[#1B4332] font-bold">{activeMedicalModal.name}</span></p>
            
            <div className="bg-white border border-[#D8D2C4]/40 rounded-2xl p-5 shadow-inner text-sm text-stone-700 leading-relaxed font-sans font-medium">
              {activeMedicalModal.medicalHistory || "No critical medical history recorded. Companion is vaccinated and healthy."}
            </div>
            
            <button
              onClick={() => setActiveMedicalModal(null)}
              className="w-full bg-[#1B4332] text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider mt-6 border border-[#D4A017]/25 hover:bg-[#9B2226] transition-colors cursor-pointer"
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organizations;
