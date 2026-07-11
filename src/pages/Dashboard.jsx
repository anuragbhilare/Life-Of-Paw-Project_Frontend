import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, MessageCircle, FileText, LogOut, Shield, MapPin, Mail, Phone, 
  Calendar, Send, Sparkles, LoaderCircleIcon, Heart, X, Pencil, Trash2, Camera,
  LayoutDashboard, Users, PawPrint, Building, FileSpreadsheet, MessageSquare, Wallet, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import petAdminDashboardImg from '../assets/Pet_Admin_Dashboard.jpeg';
import { apiCall, apiClient, clearAuthCredentials, setAuthCredentials } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const userChatEndRef = useRef(null);
  const adminChatEndRef = useRef(null);
  const [inboundRequests, setInboundRequests] = useState([]); 
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL'); 
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');
  const [isAdminFilterDropdownOpen, setIsAdminFilterDropdownOpen] = useState(false);
  const [adminUserFilter, setAdminUserFilter] = useState('ALL');
  const [isAdminUserDropdownOpen, setIsAdminUserDropdownOpen] = useState(false);
  const [adminAnimalFilter, setAdminAnimalFilter] = useState('ALL');
  const [isAdminAnimalDropdownOpen, setIsAdminAnimalDropdownOpen] = useState(false);
  const [activeTreasurySection, setActiveTreasurySection] = useState(null);
  const [masterStats, setMasterStats] = useState({
    totalUsers: 0,
    totalAnimals: 0,
    totalOrganizations: 0,
    successfulAdoption: 0,
    pendingAdoptions: 0
  });
  const [loadingMasterStats, setLoadingMasterStats] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState({ fullName: '', phone: '', password: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [activeUser, setActiveUser] = useState(null);
  const [dashboardMode, setDashboardMode] = useState(() => {
    const session = JSON.parse(sessionStorage.getItem('user_session')) || JSON.parse(sessionStorage.getItem('activeUser'));
    return (session?.role === 'ngo_owner' || sessionStorage.getItem('userRole') === 'ADMIN') ? 'org' : 'user';
  });
  const [userData, setUserData] = useState(null);

  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [orgSuccess, setOrgSuccess] = useState(false);
  const [orgForm, setOrgForm] = useState({
    orgName: '',
    licenseNumber: '',
    location: '',
    orgDescription: '',
    orgImages: '',
    isVerified: 'N'
  });
  const [orgStatus, setOrgStatus] = useState(null);
  const [orgAppStatus, setOrgAppStatus] = useState({ hasApplication: false, status: null });
  const [orgsList, setOrgsList] = useState([]);

  const [allianceOrgs, setAllianceOrgs] = useState(() => {
    const saved = localStorage.getItem('allianceOrganizations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    const defaultOrgs = [
      {
        id: "ngo-1",
        name: "Emerald Hills Animal Sanctuary",
        location: "San Francisco, CA",
        rating: 4.9,
        rescuesCount: 3840,
        logo: "🌿",
        description: "Dedicated to the rescue, rehabilitation, and long-term care of stray and abandoned domestic animals in northern California.",
        orgDescription: "We offer open-canopy rehabilitation habitats, fully vaccinated onboarding protocols, 24/7 clinical veterinary coverage, and a dedicated post-adoption counseling program. Our sanctuary has a 98% successful rehoming rate since founding.",
        founded: "2012",
        isVerified: "APPROVED",
        ownerEmail: "soham@lifeofpaw.org"
      },
      {
        id: "ngo-2",
        name: "Green Haven Rescues & Adoption",
        location: "Brooklyn, NY",
        rating: 4.8,
        rescuesCount: 4210,
        logo: "🏡",
        description: "A highly-rated urban rescue organization focused on street cat colonies, veterinary care, and loving family placements.",
        orgDescription: "Green Haven specializes in street cat rehabilitation, TNR (Trap-Neuter-Return) programs, and premium family placement services. Every animal receives a full health dossier, behavioral assessment, and microchipping before adoption.",
        founded: "2015",
        isVerified: "APPROVED",
        ownerEmail: "greenhaven@lifeofpaw.org"
      },
      {
        id: "ngo-3",
        name: "Golden Paw Foundation",
        location: "Colaba, Mumbai",
        rating: 4.7,
        rescuesCount: 1540,
        logo: "🐾",
        description: "Boutique stray support foundation in South Mumbai providing nutrition and community support.",
        orgDescription: "Dedicated stray support for over 1500 animals in South Mumbai, focusing on veterinary care and feeding.",
        founded: "2018",
        isVerified: "APPROVED",
        ownerEmail: "goldenpaw@lifeofpaw.org"
      },
      {
        id: "ngo-4",
        name: "Happy Tails Shelter",
        location: "Pune, Maharashtra",
        rating: 4.6,
        rescuesCount: 920,
        logo: "🐕",
        description: "Dedicated canine adoption center and rescue refuge.",
        orgDescription: "Providing premium care, vaccination, and rehabilitation for shelter dogs.",
        founded: "2020",
        isVerified: "APPROVED",
        ownerEmail: "happytails@lifeofpaw.org"
      },
      {
        id: "ngo-5",
        name: "Safe Haven Animal Rescue",
        location: "Delhi, NCR",
        rating: 4.5,
        rescuesCount: 810,
        logo: "🐱",
        description: "Emergency animal rescue and boarding shelter.",
        orgDescription: "Refuge for injured or abandoned animals across Delhi region.",
        founded: "2021",
        isVerified: "APPROVED",
        ownerEmail: "safehaven@lifeofpaw.org"
      },
      {
        id: "ngo-6",
        name: "Second Chance Sanctuary",
        location: "Bangalore, KA",
        rating: 4.8,
        rescuesCount: 2200,
        logo: "🌟",
        description: "State-of-the-art animal rehabilitation and therapy sanctuary.",
        orgDescription: "Focusing on therapy, surgical recovery, and lifetime care.",
        founded: "2016",
        isVerified: "APPROVED",
        ownerEmail: "secondchance@lifeofpaw.org"
      },
      {
        id: "ngo-7",
        name: "Hope Veterinary Care & Shelter",
        location: "Chennai, TN",
        rating: 4.9,
        rescuesCount: 3100,
        logo: "🏥",
        description: "Clinical-grade shelter specializing in critical health recovery.",
        orgDescription: "On-site hospital and physical therapy facilities.",
        founded: "2014",
        isVerified: "APPROVED",
        ownerEmail: "hopevet@lifeofpaw.org"
      },
      {
        id: "ngo-8",
        name: "Whisker Woods Feline Sanctuary",
        location: "Dehradun, UK",
        rating: 4.7,
        rescuesCount: 450,
        logo: "🌲",
        description: "Lush forest sanctuary dedicated exclusively to cat colonies.",
        orgDescription: "Providing free-roaming outdoor habitats for cats.",
        founded: "2022",
        isVerified: "APPROVED",
        ownerEmail: "whiskerwoods@lifeofpaw.org"
      },
      {
        id: "ngo-9",
        name: "Soham's NGO",
        location: "Mumbai, MH",
        rating: 4.6,
        rescuesCount: 120,
        logo: "❤️",
        description: "Boutique rescue and community care service based in Mumbai.",
        orgDescription: "Focusing on quick placement, vaccination drives, and stray sterilization programs.",
        founded: "2025",
        isVerified: "APPROVED",
        ownerEmail: "soham@lifeofpaw.org"
      },
      {
        id: "ngo-pending-1",
        name: "Paws & Hearts Rehabilitation Center",
        location: "Khar, Mumbai",
        rating: 5.0,
        rescuesCount: 0,
        logo: "🐾",
        description: "Emergency rescue and orthopedic care specializing in trauma rehab for stray animals.",
        orgDescription: "We offer dedicated surgical care, custom orthopedic prosthetics, and hydrotherapy for paralyzed street companions.",
        founded: "2026",
        isVerified: "PENDING",
        ownerEmail: "sahil@lifeofpaw.org",
        ownerName: "Sahil"
      },
      {
        id: "ngo-pending-2",
        name: "Bark Avenue Canine Haven",
        location: "Andheri West, Mumbai",
        rating: 5.0,
        rescuesCount: 0,
        logo: "🐕",
        description: "Specialized canine rehabilitation and behavior correction refuge.",
        orgDescription: "Our center hosts open sensory gardens, certified dog behaviors, and post-adopt education workshops.",
        founded: "2026",
        isVerified: "PENDING",
        ownerEmail: "lalitkumar@gmail.com",
        ownerName: "Lalit Kumar"
      }
    ];
    localStorage.setItem('allianceOrganizations', JSON.stringify(defaultOrgs));
    return defaultOrgs;
  });

  const [pendingOrgs, setPendingOrgs] = useState([]);
  const [viewMode, setViewMode] = useState('patron');
  const [isVerifiedOverride, setIsVerifiedOverride] = useState(false);
  const [editingCompanionId, setEditingCompanionId] = useState(null);
  const userOrg = allianceOrgs.find(org => org && (
    org.ownerEmail === activeUser?.email || 
    (activeUser?.userId && org.ownerId === activeUser?.userId) || 
    (activeUser?.fullName && org.ownerName === activeUser?.fullName)
  ));

  const currentNgo = orgsList?.find(org => org.contactPerson?.userId === activeUser?.userId || org.userId === activeUser?.userId);
  const displayNgoId = currentNgo ? `#${currentNgo.orgId || currentNgo.ngoId}` : '#PENDING';
  const parentNgoId = userOrg ? userOrg.id : (isVerifiedOverride ? "ngo-1" : null);

  const [selectedOrg, setSelectedOrg] = useState('org-1');
  const [typedMessage, setTypedMessage] = useState('');
  const [chats, setChats] = useState({
    'org-1': [
      { sender: 'org', text: 'Greeting patron. We have reviewed your initial dossier for Aurelius. Could you confirm if you have a fenced yard?', time: 'Yesterday, 4:15 PM' },
      { sender: 'user', text: 'Yes, we have a fully fenced 1,200 sq ft yard in a quiet residential area. We are looking forward to a shelter visit.', time: 'Yesterday, 5:30 PM' },
      { sender: 'org', text: 'Marvelous. The medical board has approved your initial visit. You may book a slot for this Friday.', time: 'Today, 10:00 AM' }
    ],
    'org-2': [
      { sender: 'org', text: 'Hello! Thank you for applying for Cleopatra. Calico cats require stable environments. Do you have other pets?', time: '2 days ago' },
      { sender: 'user', text: 'We have no other pets currently. We live in a quiet apartment and work from home.', time: '2 days ago' },
      { sender: 'org', text: 'Excellent details. We are scheduling veterinary tests for her. We will update you in 48 hours.', time: 'Yesterday, 11:20 AM' }
    ],
    'org-3': [
      { sender: 'org', text: 'Welcome to the Golden Paw network. We received your sponsorship request. We appreciate your compassion.', time: 'May 24, 2026' }
    ]
  });

  const [messagesList, setMessagesList] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [selectedChannelId, setSelectedChannelId] = useState('admin');
  const [patronTypedMessage, setPatronTypedMessage] = useState('');
  const [activeChatHistory, setActiveChatHistory] = useState([]);
  const [ownerSelectedChannelId, setOwnerSelectedChannelId] = useState('');
  const [ownerChatHistory, setOwnerChatHistory] = useState([]);

  const chatChannels = React.useMemo(() => {
    const channelsMap = {};
    
    channelsMap['admin'] = {
      id: 'admin',
      name: 'Life of Paw Help Desk / Admin',
      subtitle: 'Platform Support',
      avatar: '👑',
      isAdmin: true,
      messages: []
    };

    messagesList.forEach(msg => {
      if (!msg) return;
      
      const isFromAdmin = msg.sender?.role?.toUpperCase() === 'ADMIN' || msg.sender?.userId === 41 || msg.sender?.email === 'admin@lifeofpaw.org';
      const isToAdmin = msg.receiver === null || msg.receiver?.role?.toUpperCase() === 'ADMIN' || msg.receiver?.email === 'admin@lifeofpaw.org';
      
      if (isFromAdmin || isToAdmin) {
        const isSentByMe = msg.sender?.userId === activeUser?.userId;
        channelsMap['admin'].messages.push({
          sender: isSentByMe ? 'user' : 'admin',
          text: msg.content,
          createdAt: msg.createdAt,
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
        });
      } else {
        const isSentByMe = msg.sender?.userId === activeUser?.userId;
        const otherUser = isSentByMe ? msg.receiver : msg.sender;
        if (!otherUser) return;
        
        const channelKey = String(otherUser.userId);
        if (!channelsMap[channelKey]) {
          const matchedOrg = allianceOrgs?.find(org => 
            org?.ownerEmail === otherUser.email || org?.ownerId === otherUser.userId
          );
          const channelName = matchedOrg?.name || matchedOrg?.orgName || otherUser.fullName || otherUser.email || 'Sanctuary Partner';
          
          channelsMap[channelKey] = {
            id: channelKey,
            name: channelName,
            subtitle: otherUser.email || 'Sanctuary Staff',
            avatar: '🏛️',
            isAdmin: false,
            otherUserId: otherUser.userId,
            messages: []
          };
        }
        
        channelsMap[channelKey].messages.push({
          sender: isSentByMe ? 'user' : 'org',
          text: msg.content,
          createdAt: msg.createdAt,
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
        });
      }
    });

    const ordered = [channelsMap['admin']];
    Object.keys(channelsMap).forEach(key => {
      if (key !== 'admin') {
        ordered.push(channelsMap[key]);
      }
    });

    return ordered;
  }, [messagesList, activeUser, allianceOrgs]);

  const ownerChatChannels = React.useMemo(() => {
    if (!inboundRequests) return [];
    const channelsMap = {};
    
    const list = Array.isArray(messagesList) ? messagesList : [];
    list.forEach(msg => {
      if (!msg) return;
      
      const isFromAdmin = msg.sender?.role?.toUpperCase() === 'ADMIN' || msg.sender?.userId === 41 || msg.sender?.email === 'admin@lifeofpaw.org';
      const isToAdmin = msg.receiver === null || msg.receiver?.role?.toUpperCase() === 'ADMIN' || msg.receiver?.email === 'admin@lifeofpaw.org';
      
      if (isFromAdmin || isToAdmin) {
        return;
      }
      
      const isSentByMe = msg.sender?.userId === activeUser?.userId;
      const otherUser = isSentByMe ? msg.receiver : msg.sender;
      if (!otherUser) return;
      
      const channelKey = String(otherUser.userId);
      if (!channelsMap[channelKey]) {
        channelsMap[channelKey] = {
          id: channelKey,
          name: otherUser.fullName || otherUser.email || `Adopter #${otherUser.userId}`,
          subtitle: otherUser.email || 'Adopter Profile',
          avatar: '👤',
          otherUserId: otherUser.userId,
          messages: []
        };
      }
      
      channelsMap[channelKey].messages.push({
        sender: isSentByMe ? 'user' : 'adopter',
        text: msg.content,
        createdAt: msg.createdAt,
        time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
      });
    });

    if (ownerSelectedChannelId && !channelsMap[ownerSelectedChannelId]) {
      const req = inboundRequests.find(r => String(r.user?.userId || r.requestId || r.id) === ownerSelectedChannelId);
      if (req) {
        channelsMap[ownerSelectedChannelId] = {
          id: ownerSelectedChannelId,
          name: req.user?.fullName || req.requester,
          subtitle: req.user?.email || 'Applicant',
          avatar: '👤',
          otherUserId: parseInt(ownerSelectedChannelId, 10) || 1,
          messages: []
        };
      } else if (ownerSelectedChannelId === '1') {
        channelsMap['1'] = {
          id: '1',
          name: 'Lalit Kumar',
          subtitle: 'lalitkumar@gmail.com',
          avatar: '👤',
          otherUserId: 1,
          messages: []
        };
      } else if (ownerSelectedChannelId === '2') {
        channelsMap['2'] = {
          id: '2',
          name: 'Sanjana Sen',
          subtitle: 'sanjanasen@gmail.com',
          avatar: '👤',
          otherUserId: 2,
          messages: []
        };
      }
    }
    
    return Object.values(channelsMap);
  }, [messagesList, activeUser, ownerSelectedChannelId, inboundRequests]);

  const activeChannel = chatChannels.find(ch => ch.id === selectedChannelId) || chatChannels[0];
  const activeOwnerChannel = ownerChatChannels.find(ch => ch.id === ownerSelectedChannelId) || ownerChatChannels[0];

  const activeChatMessages = React.useMemo(() => {
    return [...activeChatHistory].map(msg => {
      const isSentByMe = msg.sender?.userId === activeUser?.userId;
      const senderRole = selectedChannelId === 'admin'
        ? (isSentByMe ? 'user' : 'admin')
        : (isSentByMe ? 'user' : 'org');
        
      return {
        sender: senderRole,
        text: msg.content,
        createdAt: msg.createdAt,
        time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
      };
    });
  }, [activeChatHistory, activeUser, selectedChannelId]);

  const activeOwnerMessages = React.useMemo(() => {
    return [...ownerChatHistory].map(msg => {
      const isSentByMe = msg.sender?.userId === activeUser?.userId;
      return {
        sender: isSentByMe ? 'user' : 'adopter',
        text: msg.content,
        createdAt: msg.createdAt,
        time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'
      };
    });
  }, [ownerChatHistory, activeUser]);


  const [managedAnimals, setManagedAnimals] = useState([]);
  const [animalToOrgMap, setAnimalToOrgMap] = useState({});
  const [loadingAnimals, setLoadingAnimals] = useState(true);
  const [animalFetchError, setAnimalFetchError] = useState(null);

  useEffect(() => {
    const fetchOrgAppStatus = async () => {
      if (!activeUser) return;
      try {
        const res = await apiClient.get('/users/organization-status');
        setOrgAppStatus(res.data);
      } catch (err) {
        console.error("Failed to load organization status:", err);
      }
    };
    fetchOrgAppStatus();
  }, [activeUser]);

  useEffect(() => {
    const fetchLiveRescueAnimals = async () => {
      try {
        setLoadingAnimals(true);
        
        const liveAnimalsData = await apiCall('/animals/all', { method: 'GET' });
        
        setManagedAnimals(liveAnimalsData);
      } catch (err) {
        console.error("Failed to sync database animals:", err);
        setAnimalFetchError("Could not retrieve companion records from the database.");
      } finally {
        setLoadingAnimals(false);
      }
    };

    fetchLiveRescueAnimals();
  }, []);

  const fetchLiveOrgs = async () => {
    try {
      const response = await apiCall('/orgs/all', { method: 'GET' });
      setOrgsList(response);
      const saved = localStorage.getItem('allianceOrganizations');
      const savedOrgs = saved ? JSON.parse(saved) : [];

      const adaptedOrgs = response.map(org => {
        const isVerifiedVal = (org.isVerified === null || org.isVerified === undefined)
          ? 'APPROVED'
          : (org.isVerified === 'Y' || org.isVerified === 'APPROVED' ? 'APPROVED' : 'PENDING');

        const matchedSaved = savedOrgs.find(o => o.orgId === org.orgId);
        const savedDesc = matchedSaved ? (matchedSaved.orgDescription || matchedSaved.description) : null;
        const savedImages = matchedSaved ? matchedSaved.orgImages : null;

        return {
          id: `ngo-${org.orgId}`,
          orgId: org.orgId,
          name: org.orgName,
          orgName: org.orgName,
          location: org.location,
          licenseNumber: org.licenseNumber,
          isVerified: isVerifiedVal,
          ownerEmail: org.contactPerson?.email || '',
          ownerId: org.contactPerson?.userId || null,
          ownerName: org.contactPerson?.fullName || '',
          founded: '2026',
          rating: 4.8,
          rescuesCount: org.animals ? org.animals.length : 12, 
          logo: '🐾',
          orgDescription: savedDesc || org.sanctuaryDescription || 'We offer open-canopy rehabilitation habitats, fully vaccinated onboarding protocols, 24/7 clinical veterinary coverage, and a dedicated post-adoption counseling program.',
          description: savedDesc || org.sanctuaryDescription || 'We offer open-canopy rehabilitation habitats, fully vaccinated onboarding protocols, 24/7 clinical veterinary coverage, and a dedicated post-adoption counseling program.',
          orgImages: savedImages || (org.galleryImages || []).map(img => ({
            name: img.imageUrl ? img.imageUrl.split('/').pop() : 'image',
            url: `http://localhost:9999${img.imageUrl}`
          })),
          animals: org.animals || []
        };
      });

      const lookupMap = {};
      response.forEach(org => {
        if (org.animals && Array.isArray(org.animals)) {
          org.animals.forEach(ani => {
            const aId = ani.animalId || ani.ANIMAL_ID;
            if (aId) {
              lookupMap[aId] = org.orgName;
            }
          });
        }
      });
      setAnimalToOrgMap(lookupMap);

      if (adaptedOrgs.length > 0) {
        setAllianceOrgs(adaptedOrgs);
      }
    } catch (err) {
      console.error("Failed to load live alliance organizations:", err);
    }
  };

  const fetchPendingOrgs = async () => {
    if (activeUser?.role !== 'admin') {
      const session = JSON.parse(sessionStorage.getItem('user_session')) || JSON.parse(sessionStorage.getItem('activeUser'));
      const role = session?.role || sessionStorage.getItem('userRole');
      if (role?.toLowerCase() !== 'admin') return;
    }
    try {
      const response = await apiCall('/orgs/pending', { method: 'GET' });
      const adaptedPending = response.map(org => ({
        id: `ngo-${org.orgId}`,
        orgId: org.orgId,
        name: org.orgName,
        orgName: org.orgName,
        location: org.location,
        licenseNumber: org.licenseNumber,
        isVerified: 'PENDING',
        ownerEmail: org.contactPerson?.email || '',
        ownerId: org.contactPerson?.userId || null,
        ownerName: org.contactPerson?.fullName || '',
        founded: '2026',
        rating: 5.0,
        rescuesCount: 0,
        logo: '🐾',
        sanctuaryDescription: org.sanctuaryDescription || '',
        orgDescription: org.sanctuaryDescription || '',
        description: org.sanctuaryDescription || '',
        galleryImages: org.galleryImages || [],
        orgImages: (org.galleryImages || []).map(img => ({
          name: img.imageUrl ? img.imageUrl.split('/').pop() : 'image',
          url: `http://localhost:9999${img.imageUrl}`
        }))
      }));
      setPendingOrgs(adaptedPending);
    } catch (err) {
      console.error("Failed to load pending alliance organizations:", err);
    }
  };

  useEffect(() => {
    fetchLiveOrgs();
    fetchPendingOrgs();
  }, []);

  const [isAddCompanionOpen, setIsAddCompanionOpen] = useState(false);
  const [newCompanion, setNewCompanion] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: 'Male',
    description: '',
    location: '',
    imageUrl: '',
    status: 'AVAILABLE'
  });

  const companionImageRef = useRef(null);
  const orgImagesRef = useRef(null);

  const [onboardingFiles, setOnboardingFiles] = useState([]);
  const [animalFile, setAnimalFile] = useState(null);

  const handleOrgImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      alert("A maximum of 3 images are allowed for the organization gallery.");
      setOnboardingFiles(files.slice(0, 3));
    } else {
      setOnboardingFiles(files);
    }
  };

  const handleAnimalImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 1) {
      alert("A maximum of 1 image is allowed for the companion profile.");
      setAnimalFile(files[0] || null);
    } else {
      setAnimalFile(files[0] || null);
    }
  };

  const [editingImageId, setEditingImageId] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState('');

  const [expandedDescOrgIds, setExpandedDescOrgIds] = useState([]);
  const [expandedGalleryOrgIds, setExpandedGalleryOrgIds] = useState([]);

  const toggleDescOrg = (orgId) => {
    setExpandedDescOrgIds(prev => 
      prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]
    );
  };

  const toggleGalleryOrg = (orgId) => {
    setExpandedGalleryOrgIds(prev => 
      prev.includes(orgId) ? prev.filter(id => id !== orgId) : [...prev, orgId]
    );
  };

  const handleStartEditProfile = () => {
    setProfileEditForm({
      fullName: activeUser?.fullName || '',
      phone: activeUser?.phone || '',
      password: ''
    });
    setProfileError('');
    setProfileSuccess('');
    setIsEditingProfile(true);
  };

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    const digits = profileEditForm.phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      setProfileError('Phone number must be between 7 and 15 digits.');
      return;
    }

    try {
      const payload = {
        fullName: profileEditForm.fullName,
        phone: digits,
        email: activeUser?.email || ''
      };

      if (profileEditForm.password && profileEditForm.password.trim() !== '') {
        payload.password = profileEditForm.password;
      }

      const res = await apiClient.put('/users/me', payload);

      const updatedUser = {
        fullName: res.data.fullName || activeUser?.fullName || "Life of Paw Member",
        email: res.data.email || activeUser?.email,
        role: res.data.role === 'org' ? 'ngo_owner' : res.data.role || activeUser?.role,
        userId: res.data.userId || activeUser?.userId,
        phone: res.data.phone || digits
      };

      if (payload.password) {
        setAuthCredentials(updatedUser.email, payload.password);
      }

      sessionStorage.setItem("activeUser", JSON.stringify(updatedUser));
      setActiveUser(updatedUser);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditingProfile(false);
      }, 1500);
    } catch (err) {
      console.error("Profile update failed:", err);
      setProfileError(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to update profile.');
    }
  };
  const [viewingDossierId, setViewingDossierId] = useState(null);
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [adminReviews, setAdminReviews] = useState([]);
  const [loadingAdminReviews, setLoadingAdminReviews] = useState(false);
  const [adminReviewsError, setAdminReviewsError] = useState(null);
  const [summary, setSummary] = useState({ totalDonationsRaised: 0, totalPayoutsDistributed: 0, netSavingsBalance: 0 });
  const [payouts, setPayouts] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFinancialData = async () => {
    if (activeUser?.role !== 'admin') {
      const session = JSON.parse(sessionStorage.getItem('user_session')) || JSON.parse(sessionStorage.getItem('activeUser'));
      const role = session?.role || sessionStorage.getItem('userRole');
      if (role?.toLowerCase() !== 'admin') return;
    }
    try {
      const [summaryRes, payoutsRes, donationsRes] = await Promise.all([
        apiClient.get('http://localhost:9999/api/finance/admin/savings-summary'),
        apiClient.get('http://localhost:9999/api/finance/admin/all-payouts'),
        apiClient.get('http://localhost:9999/api/finance/admin/all-donations')
      ]);
      setSummary(summaryRes.data);
      setPayouts(payoutsRes.data);
      setDonations(donationsRes.data);
    } catch (error) {
      console.error("Error connecting to real system finance databases:", error);
    } finally {
      setLoading(false);
    }
  };

  const [communityPosts, setCommunityPosts] = useState(() => {
    const saved = localStorage.getItem('adminCommunityPosts');
    return saved ? JSON.parse(saved) : [
      { id: 'post-1', author: 'Colaba Stray Care', content: 'Urgent donation support request: Food supply running low for 40 strays in Colaba area.', date: 'Today, 2:30 PM', replies: [{ content: 'We are looking into this, please hold on.', createdAt: new Date(Date.now() - 3600000).toISOString(), sender: { userId: 41, role: 'admin' } }], repliesCount: 1 },
      { id: 'post-2', author: 'Pune Animal Shelter', content: 'Flooding in kennel block 3 has damaged clinical equipment. Requesting emergency upgrades.', date: 'Yesterday, 10:15 AM', replies: [], repliesCount: 0 }
    ];
  });

  const [selectedPostId, setSelectedPostId] = useState('post-1');
  const [communityReplyText, setCommunityReplyText] = useState('');

  const [recentActivities, setRecentActivities] = useState(() => {
    const saved = localStorage.getItem('recentActivities');
    return saved ? JSON.parse(saved) : [
      "New adoption application received for Tito from Ganesh.",
      "New adoption application received for Siya from Ganesh.",
      "New adoption application received for Shadow from Ganesh.",
      "New Organization joined: Soham's NGO",
      "New Organization joined: Sahil's NGO",
      "New Organization joined: Mahesh's NGO"
    ];
  });

  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState(false);
  const [selectedOrgForDonation, setSelectedOrgForDonation] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [donationRemark, setDonationRemark] = useState('');
  const [donationError, setDonationError] = useState('');

  const [editingAnimalId, setEditingAnimalId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (activeUser?.role !== 'admin') {
        const session = JSON.parse(sessionStorage.getItem('user_session')) || JSON.parse(sessionStorage.getItem('activeUser'));
        const role = session?.role || sessionStorage.getItem('userRole');
        if (role?.toLowerCase() !== 'admin') return;
      }
      try {
        const response = await apiClient.get('/users/all');
        const allUsers = response.data || [];
        const filteredUsers = allUsers.filter(u => u.role !== 'admin');
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Failed to fetch live database users:", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  useEffect(() => {
    localStorage.setItem('adminCommunityPosts', JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    localStorage.setItem('recentActivities', JSON.stringify(recentActivities));
  }, [recentActivities]);


  useEffect(() => {
    localStorage.setItem('allianceOrganizations', JSON.stringify(allianceOrgs));
  }, [allianceOrgs]);

  useEffect(() => {
    if (activeTreasurySection) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeTreasurySection]);

  const fetchMasterStats = async () => {
    try {
      setLoadingMasterStats(true);
      const response = await apiClient.get('/admin/dashboard/master-view');
      if (response.data && response.data.stats) {
        setMasterStats(response.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch master stats:", err);
    } finally {
      setLoadingMasterStats(false);
    }
  };

  useEffect(() => {
    const role = activeUser?.role || sessionStorage.getItem('userRole');
    if (role?.toUpperCase() === 'ADMIN') {
      fetchMasterStats();
    }
  }, [activeUser, viewMode]);

  const handleAddCompanionClick = () => {
    setEditingCompanionId(null);
    setNewCompanion({
      name: '',
      species: '',
      breed: '',
      age: '',
      gender: 'Male',
      description: '',
      medicalHistory: '',
      location: '',
      imageUrl: '',
      status: 'AVAILABLE'
    });
    if (companionImageRef.current) companionImageRef.current.value = '';
    setAnimalFile(null);
    setIsAddCompanionOpen(true);
  };

  const handleEditDossierClick = (animal) => {
    setEditingCompanionId(animal.id);
    setNewCompanion({
      name: animal.name || '',
      species: animal.species || '',
      breed: animal.breed || '',
      age: animal.age || '',
      gender: animal.gender || 'Male',
      description: animal.description || '',
      medicalHistory: animal.medicalHistory || animal.MEDICAL_HISTORY || '',
      location: animal.location || '',
      imageUrl: animal.imageUrl || '',
      status: animal.status || 'AVAILABLE'
    });
    if (companionImageRef.current) companionImageRef.current.value = '';
    setAnimalFile(null);
    setIsAddCompanionOpen(true);
  };

  const handleAddCompanion = async (e) => {
    e.preventDefault();
    if (!newCompanion.name || !newCompanion.species) return;

    try {
      const animalPayload = {
        name: newCompanion.name,
        species: newCompanion.species,
        breed: newCompanion.breed || 'Mixed Breed',
        ageCategory: newCompanion.age || 'Adult',
        gender: newCompanion.gender || 'Male',
        description: newCompanion.description || 'A wonderful companion awaiting a loving home.',
        medicalHistory: newCompanion.medicalHistory || '',
        status: newCompanion.status || 'AVAILABLE'
      };

      let animalResult;
      if (editingCompanionId) {
        const res = await apiClient.put(`/animals/${editingCompanionId}`, animalPayload);
        animalResult = res.data;
      } else {
        const numericOrgId = userOrg?.orgId || 1;
        const res = await apiClient.post(`/animals/add`, animalPayload, {
          params: { orgId: numericOrgId }
        });
        animalResult = res.data;
      }

      if (companionImageRef.current?.files?.[0] && animalResult.animalId) {
        const file = companionImageRef.current.files[0];
        
        if (editingCompanionId) {
          await apiClient.delete(`/animals/${animalResult.animalId}/remove-image`);
        }

        const formData = new FormData();
        formData.append('file', file);
        
        await apiClient.post(`/animals/${animalResult.animalId}/add-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      try {
        const liveAnimals = await apiCall('/animals/all', { method: 'GET' });
        setManagedAnimals(liveAnimals);
        
        await fetchLiveOrgs();
      } catch (syncErr) {
        console.warn("Non-fatal network latency or sync stutter encountered while updating companion list:", syncErr);
      }

      setIsAddCompanionOpen(false);
      setEditingCompanionId(null);
      setNewCompanion({ name: '', species: '', breed: '', age: '', gender: 'Male', description: '', medicalHistory: '', location: '', imageUrl: '', status: 'AVAILABLE' });
      if (companionImageRef.current) companionImageRef.current.value = '';
      setAnimalFile(null);
    } catch (err) {
      console.error("Failed to save companion:", err);
      alert(err.response?.data?.message || err.message || "Failed to persist companion to live database.");
    }
  };

  const handleUpdateImageSubmit = async (e) => {
    e.preventDefault();
    if (!newImageFile || !editingImageId) return;

    try {
      await apiClient.delete(`/animals/${editingImageId}/remove-image`);

      const formData = new FormData();
      formData.append('file', newImageFile);

      await apiClient.post(`/animals/${editingImageId}/add-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setEditingImageId(null);
      setNewImageFile(null);
      setNewImagePreview('');
      
      setManagedAnimals(prev =>
        prev.map(animal => {
          const currentId = animal.animalId || animal.id;
          if (currentId === editingImageId) {
            return { ...animal, imageUrl: newImagePreview };
          }
          return animal;
        })
      );
      
      await fetchLiveOrgs();
      alert("Companion photo updated successfully.");
    } catch (err) {
      console.error("Asset updates faulted:", err);
      alert("Failed to chain asset adjustments securely.");
    }
  };

  const handleRemoveImage = async (animalId) => {
    const confirmRemoval = window.confirm("Are you sure you want to permanently remove this image from the sanctuary cloud registry?");
    if (!confirmRemoval) return;

    try {
      await apiClient.delete(`/animals/${animalId}/remove-image`);
      
      setManagedAnimals(prev =>
        prev.map(animal => {
          const currentId = animal.animalId || animal.id;
          if (currentId === animalId) {
            return { ...animal, imageUrl: '', images: [] };
          }
          return animal;
        })
      );
      
      await fetchLiveOrgs();
    } catch (err) {
      console.error("Database deletion sync failed:", err);
      alert(err.response?.data?.message || "Failed to clear asset record safely.");
    }
  };

  const handleDeleteCompanion = async (animalId) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently remove this companion from the Alliance registry?");
    if (confirmDelete) {
      try {
        await apiClient.delete(`/animals/${animalId}`);
        setManagedAnimals(prev => prev.filter(a => a.animalId !== animalId));
        setAllianceOrgs(prevOrgs => prevOrgs.map(org => {
          if (org.animals) {
            return {
              ...org,
              animals: org.animals.filter(a => (a.animalId || a.ANIMAL_ID) !== animalId)
            };
          }
          return org;
        }));
        setAnimalToOrgMap(prev => {
          const copy = { ...prev };
          delete copy[animalId];
          return copy;
        });
      } catch (err) {
        console.error("Failed to delete animal:", err);
        alert(err.response?.data?.message || err.message || "Failed to delete companion from live database.");
      }
    }
  };

  const handleTalkToApplicant = (req) => {
    setActiveTab('alliance_messages');
    const applicantUserId = req?.user?.userId;
    if (applicantUserId) {
      setOwnerSelectedChannelId(String(applicantUserId));
    } else {
      if (req?.requester === 'Lalit Kumar') {
        setOwnerSelectedChannelId('1');
      } else if (req?.requester === 'Sanjana Sen') {
        setOwnerSelectedChannelId('2');
      } else {
        setOwnerSelectedChannelId('1');
      }
    }
  };

  const [dossiersList, setDossiersList] = useState([]);

  const [ngoReviews, setNgoReviews] = useState([]);
  const [loadingNgoReviews, setLoadingNgoReviews] = useState(false);
  const [ngoReviewsError, setNgoReviewsError] = useState(null);

  useEffect(() => {
    const fetchAdoptionRequests = async () => {
      if (!activeUser) return;
      try {
        if (viewMode === 'patron') {
          const res = await apiClient.get('/adoptions/my-history');
          const list = Array.isArray(res.data) ? res.data : [];
          const adapted = list.map(req => ({
            id: `dos-${req.requestId}`,
            requestId: req.requestId,
            petName: req.animal?.name || 'Rescue Companion',
            breed: req.animal?.breed || 'Mixed Breed',
            location: req.deliveryLocation || 'Bandra, Mumbai',
            date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'May 29, 2026',
            reason: req.reason,
            status: req.status === 'APPROVED' ? 'APPROVED BY SANCTUARY' : req.status === 'PENDING' ? 'PENDING REVIEW' : 'REJECTED BY SANCTUARY'
          }));
          setDossiersList(adapted);
        } else if (viewMode === 'sanctuary' && userOrg?.orgId) {
          const res = await apiClient.get(`/ngo/dashboard/${userOrg.orgId}/requests`);
          const list = Array.isArray(res.data) ? res.data : [];
          const adapted = list.map(req => ({
            id: `req-${req.requestId}`,
            requestId: req.requestId,
            requester: req.user?.fullName || 'Anonymous Patron',
            petName: req.animal?.name || 'Rescue Companion',
            breed: req.animal?.breed || 'Mixed Breed',
            date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'May 29, 2026',
            requestDate: req.requestDate,
            reason: req.reason,
            status: req.status === 'APPROVED' ? 'APPROVED BY SANCTUARY' : req.status === 'PENDING' ? 'PENDING REVIEW' : 'REJECTED BY SANCTUARY',
            location: req.deliveryLocation || 'Bandra, Mumbai',
            user: req.user
          }));
          setInboundRequests(adapted);
        } else if (viewMode === 'admin') {
          const res = await apiClient.get('/adoptions/all');
          const list = Array.isArray(res.data) ? res.data : [];
          const adapted = list.map(req => ({
            id: `req-${req.requestId}`,
            requestId: req.requestId,
            requester: req.user?.fullName || 'Anonymous Patron',
            petName: req.animal?.name || 'Rescue Companion',
            breed: req.animal?.breed || 'Mixed Breed',
            date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'May 29, 2026',
            requestDate: req.requestDate,
            reason: req.reason,
            status: req.status === 'APPROVED' ? 'APPROVED BY ADMIN' : req.status === 'PENDING' ? 'PENDING REVIEW' : 'REJECTED BY ADMIN',
            location: req.deliveryLocation || 'Bandra, Mumbai',
            user: req.user
          }));
          setInboundRequests(adapted);
        }
      } catch (err) {
        console.error("Failed to load live adoption requests:", err);
      }
    };
    fetchAdoptionRequests();
  }, [activeUser, viewMode, userOrg]);

  const [donationsList, setDonationsList] = useState([]);
  const [ngoPayoutsList, setNgoPayoutsList] = useState([]);
  const [isFinanceLoading, setIsFinanceLoading] = useState(false);

  useEffect(() => {
    const fetchFinanceData = async () => {
      if (!activeUser) return;
      try {
        setIsFinanceLoading(true);
        if (viewMode === 'patron') {
          const res = await apiClient.get('/finance/my-donation-history');
          const list = Array.isArray(res.data) ? res.data : [];
          const adapted = list.map(don => ({
            id: `don-${don.donationId}`,
            donationId: don.donationId,
            date: don.date ? new Date(don.date).toLocaleDateString() : 'May 29, 2026',
            org: 'Life of Paw Animal Sponsorship',
            amount: `₹${don.amount}`,
            status: 'SUCCESS',
            type: don.amount >= 2499 ? 'Gold Patronage' : don.amount >= 999 ? 'Silver Patronage' : 'Bronze Patronage'
          }));
          
          setDonationsList(prev => {
            if (JSON.stringify(prev) === JSON.stringify(adapted)) return prev;
            return adapted;
          });
        } else if (viewMode === 'sanctuary' && userOrg?.orgId) {
          const res = await apiClient.get('/finance/ngo/my-payouts', {
            params: { orgId: userOrg.orgId }
          });
          const list = Array.isArray(res.data) ? res.data : [];
          const adapted = list.map(payout => ({
            id: `payout-${payout.payoutId}`,
            payoutId: payout.payoutId,
            date: payout.payoutDate ? new Date(payout.payoutDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '',
            rawDate: payout.payoutDate ? new Date(payout.payoutDate) : new Date(),
            donor: 'Admin',
            amount: `₹${payout.amount}`,
            rawAmount: payout.amount || 0,
            status: 'SUCCESS',
            type: payout.remarks || 'Emergency support disburse'
          }));

          const sorted = adapted.sort((a, b) => {
            const timeA = a.rawDate ? a.rawDate.getTime() : 0;
            const timeB = b.rawDate ? b.rawDate.getTime() : 0;
            return timeB - timeA;
          });
          
          setNgoPayoutsList(prev => {
            if (JSON.stringify(prev) === JSON.stringify(sorted)) return prev;
            return sorted;
          });
        }
      } catch (err) {
        console.error("Failed to load live finance records:", err);
      } finally {
        setIsFinanceLoading(false);
      }
    };
    fetchFinanceData();
  }, [activeUser?.userId, viewMode, userOrg?.orgId]);

  useEffect(() => {
    const fetchAdminSupportTickets = async () => {
      if (viewMode !== 'admin' || activeAdminTab !== 'communications') return;
      try {
        const res = await apiClient.get('/social/messages/admin/support-feed');
        const uniqueUsers = new Set();
        const tickets = [];
        
        res.data.forEach(msg => {
          if (!msg.sender || uniqueUsers.has(msg.sender.userId)) return;
          uniqueUsers.add(msg.sender.userId);
          
          tickets.push({
            id: `ticket-${msg.sender.userId}-${msg.msgId}`,
            userId: msg.sender.userId,
            author: msg.sender.fullName || msg.sender.email,
            content: msg.content,
            date: msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Today',
            replies: [],
            repliesCount: 0
          });
        });
        
        if (tickets.length > 0) {
          setCommunityPosts(tickets);
          setSelectedPostId(tickets[0].id);
        }
      } catch (err) {
        console.error("Failed to load admin support feed:", err);
      }
    };
    fetchAdminSupportTickets();
  }, [viewMode, activeAdminTab]);

  const fetchAdminReviews = async () => {
    try {
      setLoadingAdminReviews(true);
      setAdminReviewsError(null);
      const res = await apiClient.get('/social/reviews/all');
      setAdminReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load admin reviews moderation list:", err);
      setAdminReviewsError("Could not retrieve public reviews directory.");
    } finally {
      setLoadingAdminReviews(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'admin' && activeAdminTab === 'admin_reviews') {
      fetchAdminReviews();
    }
  }, [viewMode, activeAdminTab]);

  const handleDeleteAdminReview = async (reviewId) => {
    const previousReviews = [...adminReviews];
    setAdminReviews(prev => prev.filter(rev => rev.reviewId !== reviewId && rev.id !== reviewId));

    try {
      await apiClient.delete(`/social/reviews/${reviewId}`);
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete review.");
      setAdminReviews(previousReviews);
    }
  };

  const fetchMessagesHistory = async () => {
    try {
      setLoadingMessages(true);
      setMessagesError(null);
      const res = await apiClient.get('/social/history/messages');
      const messageData = Array.isArray(res.data) ? res.data : [];
      setMessagesList(messageData);
    } catch (err) {
      console.error("Failed to load messages history:", err);
      setMessagesError("Could not retrieve message history.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchActiveChatHistory = async () => {
    if (!selectedChannelId) return;
    try {
      setLoadingMessages(true);
      setMessagesError(null);
      let otherId = selectedChannelId;
      if (selectedChannelId === 'admin') {
        otherId = 41;
      } else {
        otherId = parseInt(selectedChannelId, 10);
      }
      const res = await apiClient.get('/social/messages/chat-history', {
        params: { otherUserId: otherId }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setActiveChatHistory(data);
    } catch (err) {
      console.error("Failed to load active chat history:", err);
      setMessagesError("Could not retrieve active chat history.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchOwnerChatHistory = async () => {
    if (!ownerSelectedChannelId) return;
    try {
      setLoadingMessages(true);
      setMessagesError(null);
      const otherId = parseInt(ownerSelectedChannelId, 10);
      const res = await apiClient.get('/social/messages/chat-history', {
        params: { otherUserId: otherId }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setOwnerChatHistory(data);
    } catch (err) {
      console.error("Failed to load owner chat history:", err);
      setMessagesError("Could not retrieve adopter chat history.");
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'messages' && viewMode === 'patron') {
      fetchMessagesHistory();
    }
  }, [activeTab, viewMode]);

  useEffect(() => {
    if (activeTab === 'messages' && viewMode === 'patron') {
      fetchActiveChatHistory();
    }
  }, [activeTab, viewMode, selectedChannelId]);

  useEffect(() => {
    if (activeTab === 'alliance_messages' && viewMode === 'sanctuary') {
      fetchMessagesHistory();
    }
  }, [activeTab, viewMode]);

  useEffect(() => {
    if (activeTab === 'alliance_messages' && viewMode === 'sanctuary') {
      fetchOwnerChatHistory();
    }
  }, [activeTab, viewMode, ownerSelectedChannelId]);

  useEffect(() => {
    if (viewMode === 'sanctuary' && activeTab === 'alliance_messages') {
      if (ownerChatChannels.length > 0 && !ownerChatChannels.some(ch => ch.id === ownerSelectedChannelId)) {
        setOwnerSelectedChannelId(ownerChatChannels[0].id);
      }
    }
  }, [viewMode, activeTab, ownerChatChannels, ownerSelectedChannelId]);

  const handleSendPatronMessage = async (e) => {
    e.preventDefault();
    if (!patronTypedMessage.trim()) return;

    try {
      if (selectedChannelId === 'admin') {
        await apiClient.post('/social/messages/send-private', null, {
          params: {
            receiverId: 41,
            content: patronTypedMessage
          }
        });
      } else {
        const receiverId = parseInt(selectedChannelId, 10);
        await apiClient.post('/social/messages/send-private', null, {
          params: {
            receiverId: receiverId,
            content: patronTypedMessage
          }
        });
      }
      setPatronTypedMessage('');
      await fetchActiveChatHistory();
      fetchMessagesHistory();
    } catch (err) {
      console.error("Failed to send message:", err);
      alert(err.response?.data?.message || err.message || "Failed to send message.");
    }
  };


  useEffect(() => {
    const fetchTicketReplies = async () => {
      if (!selectedPostId || typeof selectedPostId !== 'string' || !selectedPostId.startsWith('ticket-')) return;
      try {
        const parts = selectedPostId.split('-');
        const ticketUserId = parseInt(parts[1], 10);
        
        const chatHistory = await apiClient.get('/social/messages/chat-history', {
          params: { otherUserId: ticketUserId }
        });
        
        const chatHistoryData = Array.isArray(chatHistory.data) ? chatHistory.data : [];
        const sortedHistory = [...chatHistoryData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        const firstUserMsg = sortedHistory.find(m => m.sender?.userId === ticketUserId);
        const replies = sortedHistory.map(m => ({
          content: m.content,
          createdAt: m.createdAt || new Date().toISOString(),
          sender: m.sender
        }));
        const adminRepliesCount = sortedHistory.filter(m => m.sender?.userId !== ticketUserId).length;
          
        setCommunityPosts(prev => prev.map(p => {
          if (p.id === selectedPostId) {
            return {
              ...p,
              content: firstUserMsg ? firstUserMsg.content : p.content,
              replies: replies,
              repliesCount: adminRepliesCount
            };
          }
          return p;
        }));
      } catch (err) {
        console.error("Failed to load chat history for ticket:", err);
      }
    };
    fetchTicketReplies();
  }, [selectedPostId]);

  const handleApproveRequest = async (id) => {
    const numericId = typeof id === 'string' && id.startsWith('req-')
      ? parseInt(id.replace('req-', ''), 10)
      : id;

    try {
      await apiClient.put('/adoptions/update-status', null, {
        params: { requestId: numericId, status: 'APPROVED' }
      });
      if (viewMode === 'sanctuary' && userOrg?.orgId) {
        const res = await apiClient.get(`/ngo/dashboard/${userOrg.orgId}/requests`);
        const adapted = res.data.map(req => ({
          id: `req-${req.requestId}`,
          requestId: req.requestId,
          requester: req.user?.fullName || 'Anonymous Patron',
          petName: req.animal?.name || 'Rescue Companion',
          breed: req.animal?.breed || 'Mixed Breed',
          date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'May 29, 2026',
          reason: req.reason,
          status: req.status === 'APPROVED' ? 'APPROVED BY SANCTUARY' : req.status === 'PENDING' ? 'PENDING REVIEW' : 'REJECTED BY SANCTUARY',
          location: req.deliveryLocation || 'Bandra, Mumbai',
          user: req.user
        }));
        setInboundRequests(adapted);
      } else if (viewMode === 'admin') {
        const res = await apiClient.get('/adoptions/all');
        const adapted = res.data.map(req => ({
          id: `req-${req.requestId}`,
          requestId: req.requestId,
          requester: req.user?.fullName || 'Anonymous Patron',
          petName: req.animal?.name || 'Rescue Companion',
          breed: req.animal?.breed || 'Mixed Breed',
          date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'May 29, 2026',
          reason: req.reason,
          status: req.status === 'APPROVED' ? 'APPROVED BY ADMIN' : req.status === 'PENDING' ? 'PENDING REVIEW' : 'REJECTED BY ADMIN',
          location: req.deliveryLocation || 'Bandra, Mumbai',
          user: req.user
        }));
        setInboundRequests(adapted);
        fetchMasterStats();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to approve adoption request.");
    }
  };

  const handleRejectRequest = async (id) => {
    const numericId = typeof id === 'string' && id.startsWith('req-')
      ? parseInt(id.replace('req-', ''), 10)
      : id;

    try {
      await apiClient.put('/adoptions/update-status', null, {
        params: { requestId: numericId, status: 'REJECTED' }
      });
      if (viewMode === 'sanctuary' && userOrg?.orgId) {
        const res = await apiClient.get(`/ngo/dashboard/${userOrg.orgId}/requests`);
        const adapted = res.data.map(req => ({
          id: `req-${req.requestId}`,
          requestId: req.requestId,
          requester: req.user?.fullName || 'Anonymous Patron',
          petName: req.animal?.name || 'Rescue Companion',
          breed: req.animal?.breed || 'Mixed Breed',
          date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'May 29, 2026',
          reason: req.reason,
          status: req.status === 'APPROVED' ? 'APPROVED BY SANCTUARY' : req.status === 'PENDING' ? 'PENDING REVIEW' : 'REJECTED BY SANCTUARY',
          location: req.deliveryLocation || 'Bandra, Mumbai',
          user: req.user
        }));
        setInboundRequests(adapted);
      } else if (viewMode === 'admin') {
        const res = await apiClient.get('/adoptions/all');
        const adapted = res.data.map(req => ({
          id: `req-${req.requestId}`,
          requestId: req.requestId,
          requester: req.user?.fullName || 'Anonymous Patron',
          petName: req.animal?.name || 'Rescue Companion',
          breed: req.animal?.breed || 'Mixed Breed',
          date: req.requestDate ? new Date(req.requestDate).toLocaleDateString() : 'May 29, 2026',
          reason: req.reason,
          status: req.status === 'APPROVED' ? 'APPROVED BY ADMIN' : req.status === 'PENDING' ? 'PENDING REVIEW' : 'REJECTED BY ADMIN',
          location: req.deliveryLocation || 'Bandra, Mumbai',
          user: req.user
        }));
        setInboundRequests(adapted);
        fetchMasterStats();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reject adoption request.");
    }
  };

  const fetchNgoReviews = async () => {
    if (!userOrg?.orgId) return;
    try {
      setLoadingNgoReviews(true);
      setNgoReviewsError(null);
      const res = await apiClient.get(`/social/reviews/org/${userOrg.orgId}`);
      setNgoReviews(res.data || []);
    } catch (err) {
      console.error("Failed to fetch NGO reviews:", err);
      setNgoReviewsError("Could not retrieve review records from the server.");
    } finally {
      setLoadingNgoReviews(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'sanctuary' && activeTab === 'ngo_reviews' && userOrg?.orgId) {
      fetchNgoReviews();
    }
  }, [viewMode, activeTab, userOrg]);

  const handleDeleteNgoReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      await apiClient.delete(`/social/reviews/${reviewId}`);
      setNgoReviews(prev => prev.filter(r => (r.reviewId || r.id) !== reviewId));
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete review.");
    }
  };

  const handleApproveOrg = async (orgId) => {
    const numericId = typeof orgId === 'string' && orgId.startsWith('ngo-')
      ? parseInt(orgId.replace('ngo-', ''), 10)
      : orgId;

    try {
      const response = await apiClient.patch(`/orgs/${numericId}/verify`, null, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      const approvedOrg = pendingOrgs.find(o => o.id === orgId);

      setPendingOrgs(prev => prev.filter(org => org.id !== orgId));
      fetchLiveOrgs();

      setRecentActivities(prev => [
        `Sanctuary "${approvedOrg?.name || 'New Sanctuary'}" verified and approved for system entry.`,
        ...prev
      ]);
    } catch (err) {
      console.error(err);
      if (err.response) {
        console.error("Verification connection error:", err.response.data);
      }
      alert("Failed to verify organization on live database.");
    }
  };

  const handleRejectOrg = async (orgId) => {
    const numericId = typeof orgId === 'string' && orgId.startsWith('ngo-')
      ? parseInt(orgId.replace('ngo-', ''), 10)
      : orgId;

    try {
      await apiClient.delete(`/orgs/${numericId}`);

      const rejectedOrg = pendingOrgs.find(o => o.id === orgId);

      setPendingOrgs(prev => prev.filter(org => org.id !== orgId));
      fetchLiveOrgs();

      setRecentActivities(prev => [
        `Sanctuary registration for "${rejectedOrg?.name || 'New Sanctuary'}" rejected.`,
        ...prev
      ]);
    } catch (err) {
      console.error("Failed to reject organization:", err);
      alert("Failed to reject organization on live database.");
    }
  };

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('user_session')) || JSON.parse(sessionStorage.getItem('activeUser'));
    const adminRole = sessionStorage.getItem('userRole');
    if (!session) {
      sessionStorage.setItem('toastMessage', 'Please sign in or create an account to view your personal dashboard.');
      navigate('/login');
      return;
    }

    if (allianceOrgs.length > 0) {
      const matchingOrg = allianceOrgs.find(org => org && (
        (session.email && org.ownerEmail === session.email) || 
        (session.userId && org.ownerId === session.userId) || 
        (session.fullName && org.ownerName === session.fullName)
      ));

      let finalRole = session.role;
      const hasApprovedOrg = orgAppStatus.status === 'APPROVED' || (matchingOrg && (matchingOrg.isVerified === 'APPROVED' || matchingOrg.isVerified === 'Y'));

      if (hasApprovedOrg) {
        if (finalRole !== 'ngo_owner' && adminRole !== 'ADMIN') {
          finalRole = 'ngo_owner';
          session.role = 'ngo_owner';
          sessionStorage.setItem('activeUser', JSON.stringify(session));
          localStorage.setItem('orgOnboardingStatus', 'approved');
        }
      } else {
        if (finalRole === 'ngo_owner') {
          finalRole = 'user';
          session.role = 'user';
          sessionStorage.setItem('activeUser', JSON.stringify(session));
        }
      }

      setActiveUser(session);

      if (adminRole === 'ADMIN') {
        setViewMode('admin');
        if (viewMode !== 'admin') {
          setActiveAdminTab('overview');
        }
      } else if (hasApprovedOrg && finalRole === 'ngo_owner') {
        if (dashboardMode === 'user') {
          setViewMode('patron');
        } else {
          setViewMode('sanctuary');
          if (activeTab === 'profile') {
            setActiveTab('companion_inventory');
          }
        }
      } else {
        setViewMode('patron');
        if (activeTab === 'companion_inventory' || activeTab === 'inbound_adoptions' || activeTab === 'sanctuary_treasury' || activeTab === 'alliance_messages' || activeTab === 'ngo_reviews') {
          setActiveTab('profile');
        }
      }
    }

    const savedStatus = localStorage.getItem('orgOnboardingStatus');
    if (savedStatus) {
      setOrgStatus(savedStatus);
    }
  }, [navigate, allianceOrgs, orgAppStatus, dashboardMode]);

  useEffect(() => {
    const hasApprovedOrg = orgAppStatus.status === 'APPROVED' || (userOrg && (userOrg.isVerified === 'APPROVED' || userOrg.isVerified === 'Y'));
    const isAdmin = sessionStorage.getItem('userRole') === 'ADMIN';
    if (!isAdmin && !hasApprovedOrg) {
      if (viewMode === 'sanctuary') {
        setViewMode('patron');
        setDashboardMode('user');
      }
      if (activeTab === 'companion_inventory' || activeTab === 'inbound_adoptions' || activeTab === 'sanctuary_treasury' || activeTab === 'alliance_messages' || activeTab === 'ngo_reviews') {
        setActiveTab('profile');
      }
    }
  }, [viewMode, activeTab, userOrg, orgAppStatus]);

  useEffect(() => {
    const fetchUserData = async () => {
      const session = JSON.parse(sessionStorage.getItem('activeUser')) || activeUser;
      const userId = session?.userId;
      if (userId) {
        try {
          const res = await apiClient.get(`/users/get-particular/${userId}`);
          setUserData(res.data);
        } catch (err) {
          console.error("Failed to fetch dynamic user data:", err);
          setUserData({
            userId: userId,
            fullName: session.fullName || session.name || "Sushma Animal Care",
            role: session.role
          });
        }
      }
    };
    fetchUserData();
  }, [activeUser]);

  const handleLogout = () => {
    sessionStorage.removeItem('user_session');
    sessionStorage.removeItem('activeUser');
    sessionStorage.removeItem('userRole');
    clearAuthCredentials();
    navigate('/login');
    window.location.reload();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !ownerSelectedChannelId) return;

    try {
      const receiverId = parseInt(ownerSelectedChannelId, 10);
      await apiClient.post('/social/messages/send-private', null, {
        params: {
          receiverId: receiverId,
          content: typedMessage
        }
      });
      setTypedMessage('');
      await fetchOwnerChatHistory();
      fetchMessagesHistory();
    } catch (err) {
      console.error("Failed to send message to adopter:", err);
      alert(err.response?.data?.message || err.message || "Failed to send message.");
    }
  };

  if (!activeUser) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-center font-sans">
          <LoaderCircleIcon size={32} className="text-[#D4A017] animate-pulse mx-auto mb-4" />
          <p className="text-stone-500 font-semibold uppercase tracking-widest text-xs">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8F5F0] py-28 px-6 sm:px-8 lg:px-12">
      <div className="absolute inset-0 opacity-[0.012] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="border-b border-[#D4A017]/35 pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 mt-6">
          <div>
            <span className="flex items-center gap-1.5 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 font-sans">
              <Sparkles size={12} />
              Welcome back, {activeUser?.fullName || activeUser?.name || 'Guest'}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#1B4332] font-bold tracking-tight">
              {viewMode === 'admin' ? (
                <>
                  Admin <span className="text-[#9B2226] font-light italic">Dashboard</span>
                </>
              ) : (
                <>
                  Personal <span className="text-[#9B2226] font-light italic">Dashboard</span>
                </>
              )}
            </h1>
            {activeUser?.role === 'ngo_owner' && (
              <p className="text-xs text-[#D4A017] tracking-widest uppercase font-semibold mt-2.5 font-sans">
                {userData ? `${userData.fullName.toUpperCase()} — ALLIANCE PARTNER PROFILE` : `${(activeUser?.fullName || activeUser?.name || "Emerald Hills Sanctuary").toUpperCase()} — ALLIANCE PARTNER PROFILE`}
              </p>
            )}
          </div>
          <div className="text-stone-500 text-xs font-semibold uppercase tracking-wider font-sans md:text-right">
            <span>Reference ID: </span>
            <strong className="text-[#1B4332] font-bold">#Life Of Paw-{userData?.userId || activeUser?.userId || 63}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 flex flex-col gap-3 font-sans">
            <div className="bg-white border border-[#D8D2C4]/40 rounded-[2rem] p-6 mb-1 text-center shadow-[0_4px_25px_rgba(27,67,50,0.02)] relative overflow-hidden flex flex-col items-center group">
              <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#D4A017] via-[#1B4332] to-[#D4A017]" />
              <div className="w-14 h-14 rounded-full bg-[#1B4332]/5 border border-[#D4A017]/10 flex items-center justify-center text-[#D4A017] mb-3 shadow-inner transition-transform duration-500 group-hover:scale-110">
                <PawPrint size={22} className="stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-lg font-extrabold text-[#1B4332] tracking-tight leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Life of Paw</h2>
              <span className="text-[7.5px] tracking-[0.3em] font-sans uppercase font-extrabold text-[#D4A017] mt-2 block">Organization Portal</span>
              {viewMode === 'sanctuary' && (
                <span className="text-[9px] tracking-wider font-mono font-bold text-[#1B4332] mt-1.5 block">ORGANIZATION ID: {displayNgoId}</span>
              )}
            </div>

            {viewMode === 'admin' ? (
              <>
                {[
                  { id: 'overview', label: 'Dashboard Overview', icon: (active) => <LayoutDashboard size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> },
                  { id: 'users', label: 'User Management', icon: (active) => <Users size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> },
                  { id: 'animals', label: 'Animals Management', icon: (active) => <PawPrint size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> },
                  { id: 'ngos', label: 'NGO Organizations', icon: (active) => <Building size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> },
                  { id: 'approvals', label: 'Organization Approvals', icon: (active) => <Shield size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> },
                  { id: 'adoptions', label: 'Adoption Requests', icon: (active) => <FileSpreadsheet size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> },
                  { id: 'communications', label: 'Admin Inbox', icon: (active) => <MessageSquare size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> },
                  { id: 'admin_reviews', label: 'Public Reviews', icon: (active) => <Star size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> },
                  { id: 'treasury', label: 'Fund Allocation', icon: (active) => <Wallet size={15} className={active ? 'text-white' : 'text-[#D4A017] group-hover:text-[#1B4332] transition-colors'} /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id)}
                    className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 border text-left cursor-pointer group ${
                      activeAdminTab === tab.id
                        ? 'bg-gradient-to-r from-[#1B4332] to-[#122e22] border-[#D4A017] text-[#F8F5F0] shadow-[0_4px_20px_rgba(27,67,50,0.15)] scale-[1.01]'
                        : 'bg-white border-[#D8D2C4]/40 text-stone-600 hover:border-[#D4A017]/40 hover:bg-[#F8F5F0]/50 hover:text-[#1B4332] hover:-translate-y-0.5 transform'
                    }`}
                  >
                    <span className="shrink-0">{tab.icon(activeAdminTab === tab.id)}</span>
                    <span className="font-sans font-bold leading-none mt-0.5">{tab.label}</span>
                  </button>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-5 py-4 mt-6 rounded-2xl text-[10px] font-bold uppercase tracking-[0.18em] transition-all text-left text-white bg-[#7b0016] border border-[#D4A017]/30 hover:bg-[#1B4332] cursor-pointer hover:shadow-lg transform hover:-translate-y-0.5 duration-350"
                >
                  <LogOut size={16} />
                  Logout Admin
                </button>
              </>
            ) : (
              <>
                {(() => {
                  const tabs = viewMode === 'sanctuary' ? [
                    { id: 'companion_inventory', label: 'Animal Listings', icon: <Shield size={16} /> },
                    { id: 'inbound_adoptions', label: 'Adoption Applications', icon: <FileText size={16} /> },
                    { id: 'sanctuary_treasury', label: 'Contributions', icon: <Heart size={16} /> },
                    { id: 'alliance_messages', label: 'Organization Messages', icon: <MessageCircle size={16} /> },
                    { id: 'ngo_reviews', label: 'Reviews & Ratings', icon: <Star size={16} /> }
                  ] : [
                    { id: 'profile', label: 'Profile Overview', icon: <User size={16} /> },
                    { id: 'dossiers', label: 'My Adoptions', icon: <FileText size={16} /> },
                    { id: 'donations', label: 'My Donations', icon: <Heart size={16} /> },
                    { id: 'messages', label: 'Messages', icon: <MessageCircle size={16} /> }
                  ];
                  return tabs;
                })().map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.18em] transition-all duration-300 border text-left cursor-pointer group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#1B4332] to-[#122e22] border-[#D4A017] text-[#F8F5F0] shadow-[0_4px_20px_rgba(27,67,50,0.15)] scale-[1.01]'
                        : 'bg-white border-[#D8D2C4]/40 text-stone-600 hover:border-[#D4A017]/40 hover:bg-[#F8F5F0]/50 hover:text-[#1B4332] hover:-translate-y-0.5 transform'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}

                {(orgAppStatus.status === 'APPROVED' || isVerifiedOverride) ? (
                  <button
                    onClick={() => {
                      const targetMode = viewMode === 'patron' ? 'sanctuary' : 'patron';
                      setDashboardMode(targetMode === 'patron' ? 'user' : 'org');
                      setViewMode(targetMode);
                      setActiveTab(targetMode === 'patron' ? 'profile' : 'companion_inventory');
                    }}
                    className="w-full flex flex-col items-center justify-center gap-1 px-5 py-4 mt-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-500 text-center bg-gradient-to-r from-[#D4A017] via-[#F3E5AB] to-[#D4A017] border-2 border-double border-[#1B4332]/45 text-[#1B4332] cursor-pointer shadow-lg hover:shadow-[#D4A017]/30 transform hover:-translate-y-0.5"
                  >
                    <span className="text-[7px] text-[#7b0016] tracking-[0.2em] font-extrabold block">verified alliance ngo</span>
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} className="text-[#7b0016] shrink-0 animate-pulse" />
                      <span className="font-serif font-extrabold tracking-widest truncate max-w-[180px]">
                        {orgAppStatus.orgName || (userOrg ? (userOrg.name || userOrg.orgName) : "SOHAM'S NGO")}
                      </span>
                    </div>
                    <span className="text-[7px] text-[#1B4332]/60 tracking-[0.15em] mt-0.5">
                      Click to switch to {viewMode === 'patron' ? "SANCTUARY PORTAL" : "PATRON DASHBOARD"}
                    </span>
                  </button>
                ) : (orgAppStatus.hasApplication && orgAppStatus.status === 'PENDING') ? (
                  <div className="w-full flex flex-col items-center justify-center gap-1.5 px-5 py-5 mt-6 rounded-xl bg-[#F8F5F0] border-2 border-double border-[#D4A017]/45 text-[#1B4332] font-sans text-center relative overflow-hidden shadow-inner select-none">
                    <div className="flex items-center justify-center gap-2">
                      <Shield size={14} className="text-[#D4A017] fill-current shrink-0 animate-pulse" />
                      <span className="text-[10px] tracking-[0.2em] font-bold uppercase leading-none">ORGANIZATION REGISTRATION PENDING / VERIFICATION IN PROGRESS</span>
                    </div>
                    <span className="text-[8px] text-[#D4A017] tracking-widest font-semibold uppercase font-sans">Verification In Progress</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setOrgForm({ orgName: '', licenseNumber: '', location: '', orgDescription: '', orgImages: '', isVerified: 'N' });
                      setOrgSuccess(false);
                      setOnboardingFiles([]);
                      setIsOrgModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-4 mt-6 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 text-left text-white bg-[#1B4332] border border-[#D4A017] hover:bg-[#7b0016] cursor-pointer shadow-lg group hover:scale-[1.01]"
                  >
                    <Shield size={16} className="text-[#D4A017] group-hover:animate-bounce" />
                    ✨ JOIN ALLIANCE: REGISTER NEW SANCTUARY
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-4 mt-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all text-left text-white bg-[#7b0016] border border-[#D4A017]/30 hover:bg-[#1B4332] cursor-pointer"
                >
                  <LogOut size={16} />
                  Logout - {activeUser?.fullName || activeUser?.name || 'Guest'}
                </button>
              </>
            )}
          </div>

          <div className="lg:col-span-9 bg-white border border-[#D8D2C4]/45 rounded-3xl p-8 sm:p-10 shadow-lg min-h-[500px] flex flex-col justify-between relative overflow-hidden">
            
            <div className="absolute top-10 right-10 w-24 h-24 opacity-[0.015] text-[#1B4332] pointer-events-none">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                <path d="M50 40c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-22 6c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm44 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-34-22c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm24 0c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z" />
              </svg>
            </div>

            <AnimatePresence mode="wait">
              
              {viewMode === 'admin' ? (
                <>
                  {activeAdminTab === 'overview' && (() => {
                    if (loadingMasterStats || !masterStats) {
                      return (
                        <motion.div
                          key="admin-overview-loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col gap-6 text-left"
                        >
                          <div className="bg-gradient-to-r from-white to-[#F8F5F0] border border-[#D8D2C4]/40 shadow-xl p-8 sm:p-10 rounded-[2.5rem] mb-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 animate-pulse">
                            <div className="flex flex-col text-left max-w-xl flex-grow gap-3">
                              <div className="h-4 w-36 bg-stone-200 rounded" />
                              <div className="h-8 w-64 bg-stone-200 rounded mt-2" />
                              <div className="h-3 w-96 bg-stone-150 rounded mt-1" />
                            </div>
                            <div className="hidden lg:block w-72 h-52 bg-stone-200 rounded-2xl" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            {[...Array(5)].map((_, idx) => (
                              <div 
                                key={idx} 
                                className="bg-white border border-[#D8D2C4]/40 p-6 sm:p-7 rounded-[24px] flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(27,67,50,0.02)] h-44 animate-pulse"
                              >
                                <div className="w-12 h-12 rounded-2xl bg-stone-200" />
                                <div className="h-8 w-16 bg-stone-200 mt-4 rounded" />
                                <div className="h-3 w-28 bg-stone-150 mt-3 rounded" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key="admin-overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6 text-left"
                      >
                        <div className="bg-gradient-to-r from-white to-[#F8F5F0] border border-[#D8D2C4]/40 shadow-xl p-8 sm:p-10 rounded-[2.5rem] mb-6 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
                          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#D4A017] via-[#1B4332] to-[#D4A017]" />
                          <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />
                          
                          <div className="flex flex-col text-left max-w-xl">
                            <span className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-extrabold mb-3.5 font-sans">
                              <Sparkles size={13} className="text-[#D4A017] animate-pulse" />
                              WELCOME BACK, ADMIN
                            </span>
                            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1B4332] font-extrabold tracking-tight mb-4 leading-none" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                              Admin Control Center
                            </h2>
                            <p className="text-stone-500 text-xs sm:text-sm font-sans leading-relaxed font-semibold">
                              Monitor platform activity, organization approvals, adoption requests, and community engagement across Life of Paw.
                            </p>
                          </div>

                          <div className="hidden lg:block w-72 h-52 relative shrink-0">
                            <img 
                              src={petAdminDashboardImg} 
                              alt="Pet Admin Dashboard" 
                              className="w-full h-full object-contain rounded-2xl shadow-md border border-[#D8D2C4]/40" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                          {[
                            { label: 'Total Registered Patrons', value: Math.max(0, (masterStats?.totalUsers || 0) - 1), icon: <Users size={22} className="text-[#B58925]" />, iconBg: 'bg-[#B58925]/10', hoverBorder: "hover:border-[#B58925]/50 hover:shadow-[#B58925]/5" },
                            { label: 'Total Animals Managed', value: masterStats?.totalAnimals || 0, icon: <PawPrint size={22} className="text-[#8B5A2B]" />, iconBg: 'bg-[#8B5A2B]/10', hoverBorder: "hover:border-[#8B5A2B]/50 hover:shadow-[#8B5A2B]/5" },
                            { label: 'Partner Sanctuaries', value: masterStats?.totalOrganizations || 0, icon: <Building size={22} className="text-[#1B4332]" />, iconBg: 'bg-[#1B4332]/10', hoverBorder: "hover:border-[#1B4332]/50 hover:shadow-[#1B4332]/5" },
                            { label: 'Successful Adoptions', value: masterStats?.successfulAdoption || 0, icon: <Heart size={22} className="text-[#1B4332] fill-[#1B4332]" />, iconBg: 'bg-[#1B4332]/10', hoverBorder: "hover:border-[#1B4332]/50 hover:shadow-[#1B4332]/5" },
                            { label: 'Pending Applications', value: masterStats?.pendingAdoptions || 0, icon: <Calendar size={22} className="text-[#7b0016]" />, iconBg: 'bg-[#7b0016]/10', hoverBorder: "hover:border-[#7b0016]/50 hover:shadow-[#7b0016]/5" }
                          ].map((item, idx) => (
                            <div 
                              key={idx} 
                              className={`bg-white border border-[#D8D2C4]/40 p-6 sm:p-7 rounded-[24px] flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(27,67,50,0.02)] relative overflow-hidden transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(27,67,50,0.08)] hover:border-[#D4A017]/40 ${item.hoverBorder} group cursor-pointer h-44`}
                            >
                              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#D4A017]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              
                              <div className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 shadow-sm border border-stone-100/50`}>
                                {item.icon}
                              </div>
                              
                              <span 
                                className="font-serif text-4xl sm:text-5xl font-extrabold text-[#1B4332] mt-4 block leading-none transition-colors duration-300 group-hover:text-[#7b0016]" 
                                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                              >
                                {item.value}
                              </span>
                              
                              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-stone-400 font-sans mt-3 block leading-tight text-center">{item.label}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
                          <div className="lg:col-span-7 bg-white border border-[#D8D2C4]/40 p-6 sm:p-7 rounded-[2rem] shadow-[0_8px_30px_rgb(27,67,50,0.03)] flex flex-col justify-between relative overflow-hidden">
                            <div>
                              <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-3">
                                <h3 className="font-serif text-xs sm:text-sm font-bold text-[#1B4332] uppercase tracking-[0.15em] m-0" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Adoption Placements Overview</h3>
                                <div className="flex items-center gap-2 bg-[#1B4332]/5 border border-[#1B4332]/20 px-3 py-1.5 rounded-full">
                                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#D4A017] animate-pulse" />
                                  <span className="text-[9px] tracking-wider uppercase font-bold text-[#1B4332]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>This Month</span>
                                </div>
                              </div>
                              
                              <div className="relative w-full select-none mt-2">
                                <svg viewBox="0 0 500 210" className="w-full h-auto text-stone-400" xmlns="http://www.w3.org/2000/svg">
                                  <defs>
                                    <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#1B4332" stopOpacity="0.25" />
                                      <stop offset="100%" stopColor="#1B4332" stopOpacity="0.00" />
                                    </linearGradient>
                                    <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                                      <stop offset="0%" stopColor="#1B4332" />
                                      <stop offset="70%" stopColor="#1B4332" />
                                      <stop offset="100%" stopColor="#D4A017" />
                                    </linearGradient>
                                    <filter id="pointGlow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4A017" floodOpacity="0.4" />
                                    </filter>
                                    <filter id="tooltipShadow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
                                    </filter>
                                  </defs>

                                  {[
                                    { label: '50', y: 50 },
                                    { label: '40', y: 74 },
                                    { label: '30', y: 98 },
                                    { label: '20', y: 122 },
                                    { label: '10', y: 146 },
                                    { label: '0', y: 170 }
                                  ].map((grid, idx) => (
                                    <g key={idx} className="opacity-90">
                                      <line x1="40" y1={grid.y} x2="480" y2={grid.y} stroke="#F1EFEA" strokeWidth="1" strokeDasharray="4 4" />
                                      <text x="25" y={grid.y + 3} fill="#888888" fontSize="8.5" fontWeight="bold" fontFamily="'Plus Jakarta Sans', sans-serif" textAnchor="end">{grid.label}</text>
                                    </g>
                                  ))}

                                  <path 
                                    d="M 40 170 L 40 141.2 C 84 134, 84 126.8, 128 126.8 C 172 126.8, 172 134, 216 134 C 260 134, 260 117.2, 304 117.2 C 348 117.2, 348 98, 392 98 C 436 98, 436 69.2, 480 69.2 L 480 170 Z" 
                                    fill="url(#chartAreaGrad)" 
                                  />

                                  <path 
                                    d="M 40 141.2 C 84 134, 84 126.8, 128 126.8 C 172 126.8, 172 134, 216 134 C 260 134, 260 117.2, 304 117.2 C 348 117.2, 348 98, 392 98 C 436 98, 436 69.2, 480 69.2" 
                                    fill="none" 
                                    stroke="url(#chartLineGrad)" 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round" 
                                  />

                                  {[
                                    { m: 'Jan', x: 40 },
                                    { m: 'Feb', x: 128 },
                                    { m: 'Mar', x: 216 },
                                    { m: 'Apr', x: 304 },
                                    { m: 'May', x: 392 },
                                    { m: 'Jun', x: 480 }
                                  ].map((axis, idx) => (
                                    <text key={idx} x={axis.x} y="192" fill="#888888" fontSize="9.5" fontWeight="bold" fontFamily="'Plus Jakarta Sans', sans-serif" textAnchor="middle">{axis.m}</text>
                                  ))}

                                  {[
                                    { m: 'Jan', val: 12, x: 40, y: 141.2 },
                                    { m: 'Feb', val: 18, x: 128, y: 126.8 },
                                    { m: 'Mar', val: 15, x: 216, y: 134 },
                                    { m: 'Apr', val: 22, x: 304, y: 117.2 },
                                    { m: 'May', val: 30, x: 392, y: 98.0 },
                                    { m: 'Jun', val: 42, x: 480, y: 69.2 },
                                    { m: 'July', val: 48, x: 560, y: 43.2 }
                                  ].map((pt, idx) => (
                                    <g key={idx} className="group/pt cursor-pointer">
                                      <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />
                                      
                                      <circle 
                                        cx={pt.x} 
                                        cy={pt.y} 
                                        r="6" 
                                        fill="#1B4332" 
                                        fillOpacity="0.15" 
                                        className="transition-all duration-300 group-hover/pt:scale-150 origin-center" 
                                        style={{ transformOrigin: `${pt.x}px ${pt.y}px` }} 
                                      />
                                      
                                      <circle 
                                        cx={pt.x} 
                                        cy={pt.y} 
                                        r="5" 
                                        fill="#FFFFFF" 
                                        stroke="#D4A017" 
                                        strokeWidth="2.5" 
                                        filter="url(#pointGlow)"
                                        className="transition-transform duration-300 group-hover/pt:scale-110 origin-center" 
                                        style={{ transformOrigin: `${pt.x}px ${pt.y}px` }} 
                                      />
                                      
                                      <circle cx={pt.x} cy={pt.y} r="2" fill="#1B4332" />

                                      <g 
                                        className="opacity-0 translate-y-2 group-hover/pt:opacity-100 group-hover/pt:translate-y-0 transition-all duration-300 pointer-events-none origin-bottom" 
                                        style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
                                      >
                                        <rect x={pt.x - 55} y={pt.y - 38} width="110" height="26" rx="8" fill="#1B4332" filter="url(#tooltipShadow)" />
                                        <rect x={pt.x - 55} y={pt.y - 38} width="110" height="26" rx="8" fill="none" stroke="#D4A017" strokeWidth="1" />
                                        
                                        <text x={pt.x} y={pt.y - 22} fill="#FFFFFF" fontSize="9.5" fontWeight="bold" fontFamily="'Plus Jakarta Sans', sans-serif" textAnchor="middle">
                                          {pt.val} Placements
                                        </text>
                                      </g>
                                    </g>
                                  ))}
                                </svg>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Life of Paw Network</span>
                              <span className="text-[8px] text-[#1B4332] font-bold uppercase tracking-widest bg-[#1B4332]/5 border border-[#1B4332]/25 px-2.5 py-0.5 rounded-full">H1 Placement Report</span>
                            </div>
                          </div>

                          <div className="lg:col-span-5 bg-white border border-[#D8D2C4]/40 p-6 sm:p-7 rounded-[2rem] shadow-[0_8px_30px_rgb(27,67,50,0.03)] flex flex-col justify-between min-h-[260px] text-left">
                            <div>
                              <h3 className="font-serif text-xs sm:text-sm font-bold text-[#1B4332] uppercase tracking-[0.15em] border-b border-stone-100 pb-3 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Recent Activities</h3>
                              
                              <div className="overflow-y-auto max-h-[190px] flex flex-col gap-4 pr-1">
                                {recentActivities.map((act, i) => (
                                  <div key={i} className="relative pl-6 pb-4 last:pb-0 group text-left">
                                    <div className="absolute left-[5px] top-2.5 bottom-0 w-[1px] bg-gradient-to-b from-[#D4A017] to-stone-100 group-last:hidden" />
                                    <div className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border border-[#D4A017] bg-[#F8F5F0] flex items-center justify-center shadow-sm transition-transform group-hover:scale-125 duration-300">
                                      <span className="w-1 h-1 rounded-full bg-[#1B4332]" />
                                    </div>
                                    <p className="font-sans text-stone-700 font-semibold text-xs leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{act}</p>
                                    <span className="text-[8px] tracking-wider uppercase font-bold text-stone-400 mt-1 block">Live platform event</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="pt-3 border-t border-stone-50/70 flex justify-between items-center">
                              <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest">Real-time log stream</span>
                              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}

                  {activeAdminTab === 'users' && (() => {
                    const filteredUsers = [...users]
                      .filter(u => {
                        if (adminUserFilter === 'ALL') return true;
                        if (adminUserFilter === 'USERS') {
                          return u.role !== 'org' && u.role?.toLowerCase() !== 'ngo_owner';
                        }
                        if (adminUserFilter === 'ORG') {
                          return u.role === 'org' || u.role?.toLowerCase() === 'ngo_owner';
                        }
                        return true;
                      })
                      .sort((a, b) => {
                        const idA = Number(a.userId) || 0;
                        const idB = Number(b.userId) || 0;
                        return idA - idB;
                      });

                    return (
                      <motion.div
                        key="admin-users"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6 text-left"
                      >
                        <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h2 className="font-serif text-2xl text-[#1B4332] font-bold">User Management</h2>
                            <p className="text-xs text-stone-500 font-sans mt-1">Manage and review all registered accounts and profiles.</p>
                          </div>

                          <div className="relative self-start sm:self-auto">
                            <button
                              onClick={() => setIsAdminUserDropdownOpen(!isAdminUserDropdownOpen)}
                              className="px-4 py-2 bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017] rounded-xl text-xs font-bold text-[#1B4332] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm font-sans"
                            >
                              {adminUserFilter === 'ALL' && "All"}
                              {adminUserFilter === 'USERS' && "Users"}
                              {adminUserFilter === 'ORG' && "Organization Owners"}
                              <span className="text-[10px] text-stone-400">▼</span>
                            </button>
                            
                            {isAdminUserDropdownOpen && (
                              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#D8D2C4]/40 rounded-xl shadow-lg z-50 py-1 overflow-hidden font-sans">
                                {[
                                  { value: 'ALL', label: 'All' },
                                  { value: 'USERS', label: 'Users' },
                                  { value: 'ORG', label: 'Organization Owners' }
                                ].map(opt => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      setAdminUserFilter(opt.value);
                                      setIsAdminUserDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-xs transition-colors hover:bg-[#F8F5F0] hover:text-[#1B4332] cursor-pointer block border-none bg-transparent ${
                                      adminUserFilter === opt.value ? 'bg-[#F8F5F0] text-[#1B4332] font-bold' : 'text-stone-600'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {filteredUsers.length === 0 ? (
                          <div className="bg-[#F8F5F0] border border-[#D8D2C4]/40 rounded-2xl p-10 text-center font-sans">
                            <p className="text-sm font-semibold text-stone-500">No matching users found.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto border border-[#D8D2C4]/45 rounded-2xl bg-white shadow-sm">
                            <table className="w-full text-left border-collapse text-xs font-sans">
                              <thead>
                                <tr className="bg-[#F8F5F0] text-stone-500 uppercase tracking-wider font-bold border-b border-[#D8D2C4]/45 text-[10px]">
                                  <th className="p-4">User ID</th>
                                  <th className="p-4">Full Name</th>
                                  <th className="p-4">Email</th>
                                  <th className="p-4">Phone</th>
                                  <th className="p-4">Role</th>
                                  <th className="p-4 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100 font-medium">
                                {filteredUsers.map((user) => (
                                  <tr key={user.userId} className="hover:bg-stone-50 text-stone-800 transition-colors">
                                    <td className="p-4 text-stone-400 font-mono font-bold">{user.userId}</td>
                                    <td className="p-4 font-bold text-[#1B4332]">{user.fullName}</td>
                                    <td className="p-4 select-all font-semibold">{user.email}</td>
                                    <td className="p-4 select-all font-semibold">{user.phone || '—'}</td>
                                    <td className="p-4">
                                      <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                        user.role === 'org'
                                          ? 'bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]'
                                          : 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332]'
                                      }`}>
                                        {user.role === 'org' ? 'NGO OWNER' : 'PATRON'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right">
                                      <button
                                        onClick={async () => {
                                          const confirmDelete = window.confirm(`Are you sure you want to permanently delete user profile for ${user.fullName}?`);
                                          if (confirmDelete) {
                                            try {
                                              const userId = user.userId;
                                              await apiClient.delete(`/users/${userId}`);
                                              setUsers(prev => prev.filter(u => u.userId !== userId));
                                              setRecentActivities(prev => [
                                                `User profile for ${user.fullName} permanently purged.`,
                                                ...prev
                                              ]);
                                            } catch (error) {
                                              console.error("Failed to delete user profile:", error);
                                            }
                                          }
                                        }}
                                        className="px-3 py-1.5 bg-[#7b0016] text-[#F8F5F0] hover:bg-[#1B4332] hover:border-[#7b0016] border border-[#D4A017]/30 rounded-full text-[9px] uppercase font-bold tracking-widest cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                                      >
                                         DELETE PROFILE
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </motion.div>
                    );
                  })()}

                  {activeAdminTab === 'animals' && (() => {
                    const filteredAnimals = [...managedAnimals]
                      .filter(animal => {
                        if (adminAnimalFilter === 'ALL') return true;
                        const statusUpper = animal.status?.toUpperCase() || '';
                        if (adminAnimalFilter === 'ADOPTED') return statusUpper.includes('ADOPTED');
                        if (adminAnimalFilter === 'AVAILABLE') return statusUpper.includes('AVAILABLE');
                        return true;
                      });

                    return (
                      <motion.div
                        key="admin-animals"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6 text-left"
                      >
                        <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Animals Management</h2>
                            <p className="text-xs text-stone-500 font-sans mt-1">Oversee and maintain animal records across all partnered sanctuaries.</p>
                          </div>

                          <div className="relative self-start sm:self-auto">
                            <button
                              onClick={() => setIsAdminAnimalDropdownOpen(!isAdminAnimalDropdownOpen)}
                              className="px-4 py-2 bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017] rounded-xl text-xs font-bold text-[#1B4332] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm font-sans"
                            >
                              {adminAnimalFilter === 'ALL' && "All"}
                              {adminAnimalFilter === 'ADOPTED' && "Adopted"}
                              {adminAnimalFilter === 'AVAILABLE' && "Available"}
                              <span className="text-[10px] text-stone-400">▼</span>
                            </button>
                            
                            {isAdminAnimalDropdownOpen && (
                              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#D8D2C4]/40 rounded-xl shadow-lg z-50 py-1 overflow-hidden font-sans">
                                {[
                                  { value: 'ALL', label: 'All' },
                                  { value: 'ADOPTED', label: 'Adopted' },
                                  { value: 'AVAILABLE', label: 'Available' }
                                ].map(opt => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      setAdminAnimalFilter(opt.value);
                                      setIsAdminAnimalDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-xs transition-colors hover:bg-[#F8F5F0] hover:text-[#1B4332] cursor-pointer block border-none bg-transparent ${
                                      adminAnimalFilter === opt.value ? 'bg-[#F8F5F0] text-[#1B4332] font-bold' : 'text-stone-600'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {filteredAnimals.length === 0 ? (
                          <div className="bg-[#F8F5F0] border border-[#D8D2C4]/40 rounded-2xl p-10 text-center font-sans">
                            <p className="text-sm font-semibold text-stone-500">No matching animals found.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto border border-[#D8D2C4]/45 rounded-2xl bg-white shadow-sm">
                            <table className="w-full text-left border-collapse text-xs font-sans">
                              <thead>
                                <tr className="bg-[#F8F5F0] text-stone-500 uppercase tracking-wider font-bold border-b border-[#D8D2C4]/45 text-[10px]">
                                  <th className="p-4">Animal ID</th>
                                  <th className="p-4">Name</th>
                                  <th className="p-4">Species</th>
                                  <th className="p-4">Breed</th>
                                  <th className="p-4">Age Category</th>
                                  <th className="p-4">Gender</th>
                                  <th className="p-4">Sanctuary NGO</th>
                                  <th className="p-4">Status</th>
                                  <th className="p-4 text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100 font-medium">
                                {filteredAnimals.map((animal) => {
                                  const currentId = animal.animalId;
                                  const isEditing = editingAnimalId === currentId;
                                  const databaseImage = animal.images && animal.images.length > 0 ? animal.images[0].imageUrl : '';
                                  
                                  return (
                                    <tr key={currentId} className="hover:bg-stone-50 text-stone-850 transition-colors">
                                      <td className="p-4 text-stone-400 font-mono font-bold">#{currentId}</td>
                                      <td className="p-4">
                                        <div className="flex items-center gap-3">
                                          {databaseImage ? (
                                            <img 
                                              src={databaseImage.startsWith('http') ? databaseImage : `http://localhost:9999${databaseImage}`}
                                              alt={animal.name}
                                              className="w-8 h-8 rounded-full object-cover border border-stone-200"
                                            />
                                          ) : (
                                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-400">
                                              🐾
                                            </div>
                                          )}
                                          {isEditing ? (
                                            <input
                                              type="text"
                                              defaultValue={animal.name}
                                              id={`edit-name-${currentId}`}
                                              className="bg-white border border-[#D8D2C4]/60 focus:border-[#D4A017] rounded py-1 px-2 focus:outline-none text-xs text-stone-800 font-bold w-24"
                                            />
                                          ) : (
                                            <span className="font-bold text-[#1B4332]">{animal.name}</span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-4">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            defaultValue={animal.species}
                                            id={`edit-species-${currentId}`}
                                            className="bg-white border border-[#D8D2C4]/60 focus:border-[#D4A017] rounded py-1 px-2 focus:outline-none text-xs text-stone-800 font-medium w-20"
                                          />
                                        ) : (
                                          <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-600 font-medium">{animal.species}</span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            defaultValue={animal.breed}
                                            id={`edit-breed-${currentId}`}
                                            className="bg-white border border-[#D8D2C4]/60 focus:border-[#D4A017] rounded py-1 px-2 focus:outline-none text-xs text-stone-800 font-bold w-32"
                                          />
                                        ) : (
                                          <span>{animal.breed || '—'}</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-xs font-semibold text-stone-600">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            defaultValue={animal.ageCategory}
                                            id={`edit-ageCategory-${currentId}`}
                                            className="bg-white border border-[#D8D2C4]/60 focus:border-[#D4A017] rounded py-1 px-2 focus:outline-none text-xs text-stone-800 font-semibold w-20"
                                          />
                                        ) : (
                                          <span>{animal.ageCategory || '—'}</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-xs text-stone-600 font-medium">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            defaultValue={animal.gender}
                                            id={`edit-gender-${currentId}`}
                                            className="bg-white border border-[#D8D2C4]/60 focus:border-[#D4A017] rounded py-1 px-2 focus:outline-none text-xs text-stone-800 font-medium w-16"
                                          />
                                        ) : (
                                          <span>{animal.gender}</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-[#D4A017] font-bold text-xs">
                                        {animalToOrgMap[animal.animalId] || 'Sanctuary Alliance HQ'}
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-sans tracking-widest font-extrabold uppercase border shrink-0 ${
                                          animal.status === 'AVAILABLE'
                                            ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332]'
                                            : animal.status === 'PENDING ADOPTION'
                                            ? 'bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]'
                                            : 'bg-[#7b0016]/10 border-[#7b0016] text-[#7b0016]'
                                        }`}>
                                          {animal.status}
                                        </span>
                                      </td>
                                      <td className="p-4">
                                        {isEditing ? (
                                          <div className="flex gap-2 justify-center">
                                            <button
                                              onClick={async () => {
                                                const newName = document.getElementById(`edit-name-${currentId}`).value;
                                                const newSpecies = document.getElementById(`edit-species-${currentId}`).value;
                                                const newBreed = document.getElementById(`edit-breed-${currentId}`).value;
                                                const newAgeCategory = document.getElementById(`edit-ageCategory-${currentId}`).value;
                                                const newGender = document.getElementById(`edit-gender-${currentId}`).value;
                                                if (!newName.trim() || !newSpecies.trim() || !newAgeCategory.trim() || !newGender.trim()) {
                                                  alert("Please fill out all required fields.");
                                                  return;
                                                }
                                                
                                                try {
                                                  const response = await apiClient.put(`/animals/${currentId}`, {
                                                    name: newName,
                                                    species: newSpecies,
                                                    breed: newBreed,
                                                    ageCategory: newAgeCategory,
                                                    gender: newGender
                                                  });
                                                  const updatedAnimal = response.data;
                                                  setManagedAnimals(prev => prev.map(a => a.animalId === currentId ? { ...a, ...updatedAnimal } : a));
                                                  setAllianceOrgs(prevOrgs => prevOrgs.map(org => {
                                                    if (org.animals) {
                                                      return {
                                                        ...org,
                                                        animals: org.animals.map(a => (a.animalId || a.ANIMAL_ID) === currentId ? { ...a, name: newName, species: newSpecies, breed: newBreed, ageCategory: newAgeCategory, gender: newGender } : a)
                                                      };
                                                    }
                                                    return org;
                                                  }));
                                                  setEditingAnimalId(null);
                                                  setRecentActivities(prev => [
                                                    `Companion record for ${newName} updated in global registers.`,
                                                    ...prev
                                                  ]);
                                                } catch (err) {
                                                  console.error("Failed to update animal:", err);
                                                  alert("Failed to update companion in live database.");
                                                }
                                              }}
                                              className="px-2.5 py-1 bg-[#1B4332] text-white rounded font-bold uppercase tracking-wider cursor-pointer text-[10px]"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() => setEditingAnimalId(null)}
                                              className="px-2.5 py-1 bg-stone-200 text-stone-700 rounded font-bold uppercase tracking-wider cursor-pointer text-[10px]"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex gap-4 justify-center items-center">
                                            <button
                                              onClick={() => setEditingAnimalId(currentId)}
                                              className="p-1 text-[#D4A017] hover:text-[#1B4332] transition-colors cursor-pointer"
                                              title="Edit Companion Record"
                                            >
                                              <Pencil size={14} className="stroke-[2.5]" />
                                            </button>
                                            <span className="text-stone-350 select-none">|</span>
                                            <button
                                              onClick={async () => {
                                                const confirmDelete = window.confirm(`Are you sure you want to permanently delete animal profile for ${animal.name}?`);
                                                if (confirmDelete) {
                                                  try {
                                                    await apiClient.delete(`/animals/${currentId}`);
                                                    setManagedAnimals(prev => prev.filter(a => a.animalId !== currentId));
                                                    setAllianceOrgs(prevOrgs => prevOrgs.map(org => {
                                                      if (org.animals) {
                                                        return {
                                                          ...org,
                                                          animals: org.animals.filter(a => (a.animalId || a.ANIMAL_ID) !== currentId)
                                                        };
                                                      }
                                                      return org;
                                                    }));
                                                    setAnimalToOrgMap(prev => {
                                                      const copy = { ...prev };
                                                      delete copy[currentId];
                                                      return copy;
                                                    });
                                                    setRecentActivities(prev => [
                                                      `Animal entry ${animal.name} deleted from global registers.`,
                                                      ...prev
                                                    ]);
                                                  } catch (err) {
                                                    console.error(err);
                                                    alert("Failed to delete animal from live database.");
                                                  }
                                                }
                                              }}
                                              className="p-1 text-[#7b0016] hover:text-[#1B4332] transition-colors cursor-pointer"
                                              title="Globally Delete Animal"
                                            >
                                              <Trash2 size={14} className="stroke-[2.5]" />
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </motion.div>
                    );
                  })()}

                  {activeAdminTab === 'ngos' && (
                    <motion.div
                      key="admin-ngos"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6 text-left"
                    >
                      <div className="border-b border-stone-100 pb-4">
                        <h2 className="font-serif text-2xl text-[#1B4332] font-bold">NGO Organizations</h2>
                        <p className="text-xs text-stone-500 font-sans mt-1">Certify trusted alliances and enforce network compliance for partnered sanctuaries.</p>
                      </div>

                      <div className="flex flex-col gap-4">
                        {allianceOrgs.filter(org => org.orgId && (org.isVerified === 'APPROVED' || org.isVerified === 'Y')).length === 0 ? (
                          <div className="bg-[#F8F5F0] border border-dashed border-[#D8D2C4] rounded-[2rem] p-16 text-center flex flex-col items-center">
                            <Building className="text-[#D4A017] mb-4" size={24} />
                            <p className="font-serif text-lg font-bold text-[#1B4332] mb-1">No Verified NGO Organizations</p>
                            <p className="text-stone-400 text-xs max-w-sm">There are no approved sanctuary organizations in the database yet.</p>
                          </div>
                        ) : (
                          allianceOrgs.filter(org => org.orgId && (org.isVerified === 'APPROVED' || org.isVerified === 'Y')).map((org) => (
                            <div key={org.id} className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4 font-sans">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{org.logo || '🏛️'}</span>
                                  <h3 className="font-serif text-lg font-bold text-[#1B4332]">{org.name || org.orgName}</h3>
                                </div>
                                <p className="text-stone-500 text-xs font-semibold mt-1">Location: {org.location} | Foundation Year: {org.founded || '2026'}</p>
                                <p className="text-stone-600 text-xs mt-2 italic font-sans max-w-xl">"{org.description || org.orgDescription}"</p>
                                
                                <div className="mt-3 flex items-center gap-2">
                                  <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400">Status:</span>
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-sans tracking-widest font-extrabold uppercase border ${
                                    org.isVerified === 'APPROVED'
                                      ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332]'
                                      : 'bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]'
                                  }`}>
                                    {org.isVerified === 'APPROVED' ? '✓ CERTIFIED' : 'PENDING AUDIT'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2.5 sm:items-end justify-center shrink-0">
                                {org.isVerified !== 'APPROVED' && (
                                  <button
                                    onClick={() => handleApproveOrg(org.id)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-[#1B4332] hover:bg-[#7b0016] text-[#F8F5F0] border border-[#D4A017]/30 rounded-full text-[9px] font-sans uppercase font-bold tracking-[0.25em] transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02]"
                                  >
                                    APPROVE SYSTEM ENTRY
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    const confirmBan = window.confirm(`CAUTION! Banning organization "${org.name || org.orgName}" will execute a master deletion cascade that deletes all associated animals. Proceed?`);
                                    if (confirmBan) {
                                      handleRejectOrg(org.id);
                                    }
                                  }}
                                  className="w-full sm:w-auto px-4 py-2 bg-[#7b0016] hover:bg-[#1B4332] text-white border border-[#D4A017]/30 rounded-full text-[9px] uppercase font-bold tracking-widest transition-all duration-300 cursor-pointer shadow-sm hover:scale-[1.02]"
                                >
                                  ⛔ BAN NGO
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeAdminTab === 'approvals' && (
                    <motion.div
                      key="admin-approvals"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6 text-left font-sans animate-fade-in"
                    >
                      <div className="border-b border-stone-200/60 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h2 className="font-serif text-2xl text-[#1B4332] font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Organization Approvals</h2>
                          <p className="text-xs text-stone-500 font-sans mt-1">Review, verify, and approve sanctuary registration requests to join the alliance.</p>
                        </div>
                        <div className="bg-[#1B4332]/5 border border-[#1B4332]/25 px-4 py-2 rounded-full text-xs font-bold text-[#1B4332] flex items-center gap-2">
                          <Shield size={13} className="text-[#D4A017]" />
                          <span>{pendingOrgs.length} Requests Pending</span>
                        </div>
                      </div>

                      {pendingOrgs.length === 0 ? (
                        <div className="bg-[#F8F5F0] border border-dashed border-[#D8D2C4] rounded-[2rem] p-16 text-center flex flex-col items-center">
                          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#D4A017] mb-4 shadow-sm">
                            <Shield size={24} className="stroke-[1.5]" />
                          </div>
                          <p className="font-serif text-lg font-bold text-[#1B4332] mb-1">No Pending Organization Approvals</p>
                          <p className="text-stone-400 text-xs max-w-sm">All registration audits have been resolved. The Life of Paw registry is completely up-to-date.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {pendingOrgs.map((org) => (
                            <div key={org.id} className="bg-white border border-[#D8D2C4]/40 hover:border-[#D4A017]/40 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(27,67,50,0.03)] flex flex-col md:flex-row justify-between md:items-center gap-6 relative overflow-hidden transition-all duration-350 hover:shadow-md group">
                              <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[#D4A017]" />
                              
                              <div className="flex-grow pl-3">
                                <div className="flex flex-wrap items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#1B4332]/5 flex items-center justify-center text-[#D4A017] shadow-inner text-lg font-serif">
                                    {org.logo || '🏛️'}
                                  </div>
                                  <div>
                                    <h3 className="font-serif text-lg font-bold text-[#1B4332] tracking-tight">{org.name || org.orgName}</h3>
                                    <span className="text-[8px] tracking-[0.2em] font-sans uppercase font-extrabold text-[#D4A017] mt-0.5 block">VERIFICATION SUBMITTED</span>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 text-xs text-stone-600">
                                  <div className="bg-[#F8F5F0]/50 border border-stone-100 p-3.5 rounded-2xl">
                                    <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Owner Context</span>
                                    <span className="font-bold text-[#1B4332]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{org.ownerName || org.ownerEmail || 'Pending Owner'}</span>
                                  </div>
                                  <div className="bg-[#F8F5F0]/50 border border-stone-100 p-3.5 rounded-2xl">
                                    <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Veterinary License</span>
                                    <span className="font-mono font-bold text-stone-800" style={{ fontFamily: "monospace" }}>{org.licenseNumber || 'LIC-2983-VET'}</span>
                                  </div>
                                  <div className="bg-[#F8F5F0]/50 border border-stone-100 p-3.5 rounded-2xl">
                                    <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Sanctuary Location</span>
                                    <span className="font-bold text-[#1B4332]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{org.location || 'Mumbai, MH'}</span>
                                  </div>
                                  <div className="bg-[#F8F5F0]/50 border border-stone-100 p-3.5 rounded-2xl">
                                    <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Submission Date</span>
                                    <span className="font-bold text-stone-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{org.founded || '2026'}</span>
                                  </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3 font-sans">
                                  <button
                                    onClick={() => toggleDescOrg(org.id)}
                                    className="px-4 py-2 bg-[#1B4332]/5 border border-[#1B4332]/25 text-[#1B4332] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-[#1B4332]/10 cursor-pointer flex items-center gap-1.5"
                                  >
                                    <span>📜 Why Our Sanctuary Is Better</span>
                                    <span className="text-[8px] opacity-75">{expandedDescOrgIds.includes(org.id) ? "▲ Hide" : "▼ Show"}</span>
                                  </button>

                                  <button
                                    onClick={() => toggleGalleryOrg(org.id)}
                                    className="px-4 py-2 bg-[#D4A017]/5 border border-[#D4A017]/25 text-[#7b0016] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all hover:bg-[#D4A017]/10 cursor-pointer flex items-center gap-1.5"
                                  >
                                    <span>🖼️ View Gallery Attachments ({org.galleryImages?.length || 0})</span>
                                    <span className="text-[8px] opacity-75">{expandedGalleryOrgIds.includes(org.id) ? "▲ Hide" : "▼ Show"}</span>
                                  </button>
                                </div>

                                {expandedDescOrgIds.includes(org.id) && (
                                  <div className="mt-4 p-4 bg-[#F8F5F0]/30 border border-stone-100 rounded-2xl animate-fade-in font-sans">
                                    <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1.5">Stated Audited Description</span>
                                    <p className="text-xs text-stone-650 italic leading-relaxed">"{org.sanctuaryDescription || 'No description statement provided.'}"</p>
                                  </div>
                                )}

                                {expandedGalleryOrgIds.includes(org.id) && (
                                  <div className="mt-4 p-4 bg-[#F8F5F0]/30 border border-stone-100 rounded-2xl animate-fade-in font-sans">
                                    <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-3">Audited Onboarding Image Attachments</span>
                                    {(!org.galleryImages || org.galleryImages.length === 0) ? (
                                      <p className="text-stone-400 text-[10px] italic">No gallery attachments uploaded.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                                        {org.galleryImages.map((img, idx) => (
                                          <div key={idx} className="flex flex-col gap-1.5 bg-white border border-stone-200/50 p-2 rounded-xl shadow-sm">
                                            <img
                                              src={`http://localhost:9999${img.imageUrl}`}
                                              alt={`Attachment ${idx + 1}`}
                                              className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <span className="text-[8px] text-stone-500 font-semibold truncate text-center block">
                                              {img.imageUrl ? img.imageUrl.split('/').pop() : 'Attachment'}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex md:flex-col gap-3 md:items-end justify-center shrink-0 pl-3 md:border-l border-stone-150">
                                <button
                                  onClick={() => handleApproveOrg(org.id)}
                                  className="px-6 py-3 bg-[#1B4332] hover:bg-[#D4A017] text-[#F8F5F0] border border-[#D4A017]/25 rounded-full text-[9px] font-sans uppercase font-bold tracking-[0.2em] transition-all duration-300 cursor-pointer shadow-md hover:scale-[1.02] flex items-center justify-center gap-1.5"
                                >
                                  APPROVE SYSTEM ENTRY
                                </button>
                                <button
                                  onClick={() => handleRejectOrg(org.id)}
                                  className="px-6 py-3 bg-white hover:bg-[#7b0016] text-[#7b0016] hover:text-white border border-[#7b0016]/40 rounded-full text-[9px] font-sans uppercase font-bold tracking-[0.2em] transition-all duration-300 cursor-pointer shadow-sm hover:scale-[1.02] flex items-center justify-center gap-1.5"
                                >
                                  REJECT SYSTEM ENTRY
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeAdminTab === 'adoptions' && (() => {
                    const filteredAdminRequests = [...inboundRequests]
                      .filter(req => {
                        if (adminStatusFilter === 'ALL') return true;
                        const statusUpper = req.status?.toUpperCase() || '';
                        if (adminStatusFilter === 'APPROVED') return statusUpper.includes('APPROVED');
                        if (adminStatusFilter === 'REJECTED') return statusUpper.includes('REJECTED');
                        if (adminStatusFilter === 'PENDING') return statusUpper.includes('PENDING');
                        return false;
                      })
                      .sort((a, b) => {
                        const dateA = new Date(a.requestDate || a.createdAt || a.date).getTime();
                        const dateB = new Date(b.requestDate || b.createdAt || b.date).getTime();
                        return dateB - dateA;
                      });

                    return (
                      <motion.div
                        key="admin-adoptions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6 text-left"
                      >
                        <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Adoption Requests</h2>
                            <p className="text-xs text-stone-500 font-sans mt-1">Review and manage adoption applications from regional applicants.</p>
                          </div>

                          <div className="relative self-start sm:self-auto">
                            <button
                              onClick={() => setIsAdminFilterDropdownOpen(!isAdminFilterDropdownOpen)}
                              className="px-4 py-2 bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017] rounded-xl text-xs font-bold text-[#1B4332] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm font-sans"
                            >
                              {adminStatusFilter === 'ALL' && "All Applications"}
                              {adminStatusFilter === 'APPROVED' && "Approved Requests"}
                              {adminStatusFilter === 'REJECTED' && "Rejected Requests"}
                              {adminStatusFilter === 'PENDING' && "Pending Requests"}
                              <span className="text-[10px] text-stone-400">▼</span>
                            </button>
                            
                            {isAdminFilterDropdownOpen && (
                              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#D8D2C4]/40 rounded-xl shadow-lg z-50 py-1 overflow-hidden font-sans">
                                {[
                                  { value: 'ALL', label: 'All Applications' },
                                  { value: 'PENDING', label: 'Pending Requests' },
                                  { value: 'APPROVED', label: 'Approved Requests' },
                                  { value: 'REJECTED', label: 'Rejected Requests' }
                                ].map(opt => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      setAdminStatusFilter(opt.value);
                                      setIsAdminFilterDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-xs transition-colors hover:bg-[#F8F5F0] hover:text-[#1B4332] cursor-pointer block border-none bg-transparent ${
                                      adminStatusFilter === opt.value ? 'bg-[#F8F5F0] text-[#1B4332] font-bold' : 'text-stone-600'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-6">
                          {filteredAdminRequests.length === 0 ? (
                            <div className="bg-white border border-[#D8D2C4]/35 rounded-2xl p-8 text-center text-stone-400 font-sans text-xs italic">
                              No applications are recorded under this specific status tier.
                            </div>
                          ) : (
                            filteredAdminRequests.map((req) => (
                              <div key={req.id} className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/50">
                                  <div>
                                    <span className="text-[10px] tracking-wider uppercase font-bold text-[#D4A017]">Received: {req.date}</span>
                                    <h3 className="font-serif text-xl text-[#1B4332] font-bold mt-0.5">Request for {req.petName} ({req.breed})</h3>
                                    <p className="text-xs text-stone-550 font-semibold">
                                      Applicant: <span className="text-[#1B4332] font-bold">{req.requester}</span>
                                    </p>
                                  </div>
                                  {(() => {
                                    const statusUpper = req.status?.toUpperCase() || '';
                                    if (statusUpper.includes('APPROVED')) {
                                      return (
                                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm flex items-center gap-1 self-start sm:self-auto text-center">
                                          ✓ {req.status}
                                        </span>
                                      );
                                    } else if (statusUpper.includes('REJECTED')) {
                                      return (
                                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto text-center">
                                          {req.status}
                                        </span>
                                      );
                                    } else {
                                      return (
                                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto text-center">
                                          {req.status}
                                        </span>
                                      );
                                    }
                                  })()}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-stone-600">
                                  <div className="sm:col-span-2">
                                    <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Applicant's Statement</span>
                                    <p className="leading-relaxed font-semibold text-stone-850">"{req.reason}"</p>
                                  </div>
                                  <div>
                                    <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1 ">Target Location</span>
                                    <p className="font-bold text-[#1B4332] flex items-center gap-1">
                                      <MapPin size={12} className="text-[#D4A017]" />
                                      {req.location}
                                    </p>
                                  </div>
                                </div>

                                {req.status === 'PENDING REVIEW' && (
                                  <div className="flex gap-2.5 justify-end pt-3 border-t border-stone-200/50">
                                    <button
                                      onClick={() => handleRejectRequest(req.id)}
                                      className="px-4 py-2 border border-[#7b0016] rounded-full text-[9px] uppercase font-bold tracking-widest text-[#7b0016] hover:bg-[#7b0016]/5 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                    >
                                    REJECT APPLICATION
                                    </button>
                                    <button
                                      onClick={() => handleApproveRequest(req.id)}
                                      className="px-4 py-2 bg-[#1B4332] text-white border border-[#1B4332] rounded-full text-[9px] uppercase font-bold tracking-widest hover:bg-[#7b0016] transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm"
                                    >
                                    APPROVE APPLICATION
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    );
                  })()}

                  {activeAdminTab === 'communications' && (
                    <motion.div
                      key="admin-communications"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6 flex-grow text-left"
                    >
                      <div className="border-b border-stone-100 pb-4 shrink-0">
                        <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Admin Inbox</h2>
                        <p className="text-xs text-stone-500 font-sans mt-1">Monitor stray reports, adoption inquiries, and urgent animal welfare requests.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 border border-[#D8D2C4]/45 rounded-2xl overflow-hidden min-h-[400px] bg-stone-55 shadow-sm">
                        <div className="md:col-span-5 bg-white border-r border-[#D8D2C4]/45 flex flex-col divide-y divide-stone-100">
                          {communityPosts.map((post) => (
                            <button
                              key={post.id}
                              onClick={() => setSelectedPostId(post.id)}
                              className={`w-full p-4 text-left transition-all flex flex-col gap-1.5 cursor-pointer ${
                                selectedPostId === post.id ? 'bg-[#F8F5F0] border-l-4 border-[#D4A017]' : 'hover:bg-stone-50'
                              }`}
                            >
                              <span className="font-serif text-xs font-bold text-[#1B4332] block truncate">{post.author}</span>
                              <span className="text-[10px] text-stone-600 block line-clamp-2">{post.content}</span>
                              <span className="text-[9px] text-[#7b0016] uppercase tracking-wider font-extrabold mt-1">Replies: {post.repliesCount}</span>
                            </button>
                          ))}
                        </div>

                        <div className="md:col-span-7 flex flex-col justify-between h-[420px] bg-[#F8F5F0]/30 overflow-hidden">
                          {(() => {
                            const post = communityPosts.find(p => p.id === selectedPostId);
                            if (!post) return <div className="p-8 text-center text-stone-400 font-semibold uppercase text-[10px]">Select a community request thread</div>;
                            
                            let rawHistory = [...post.replies];
                            const isTicket = typeof post.id === 'string' && post.id.startsWith('ticket-');
                            if (!isTicket && rawHistory.every(r => r.sender?.userId === 41 || r.sender?.role === 'admin')) {
                              rawHistory = [
                                ...rawHistory,
                                {
                                  content: post.content,
                                  createdAt: post.date || new Date(Date.now() - 7200000).toISOString(),
                                  sender: { userId: 999, role: 'user' }
                                }
                              ];
                            }

                            const unifiedChatLog = [...rawHistory].sort((a, b) => {
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            });

                            return (
                              <>
                                <div className="flex flex-col-reverse overflow-y-auto h-[450px] max-h-[450px] pr-2 p-4">
                                  {unifiedChatLog.map((msg, rIdx) => {
                                    const isAdmin = msg.sender?.userId === 41 || msg.sender?.role === 'admin';
                                    if (isAdmin) {
                                      return (
                                        <div key={rIdx} className="bg-[#1b4332] text-white self-end rounded-2xl rounded-br-none p-3 shadow-sm text-xs max-w-[85%] font-sans mb-3 text-left">
                                          <span className="text-[8px] tracking-widest uppercase font-bold text-[#D4A017] block mb-1">Admin Response</span>
                                          <p>{msg.content}</p>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <div key={rIdx} className="bg-gray-100 text-gray-800 self-start rounded-2xl rounded-bl-none p-3 shadow-sm text-xs max-w-[85%] font-sans mb-3 text-left">
                                          <span className="text-[8px] tracking-widest uppercase font-bold text-stone-500 block mb-1">User Inquiry</span>
                                          <p>{msg.content}</p>
                                        </div>
                                      );
                                    }
                                  })}
                                </div>

                                <div className="p-3 border-t border-[#D8D2C4]/45 bg-white flex flex-col gap-2 shrink-0">
                                  <textarea
                                    value={communityReplyText}
                                    onChange={(e) => setCommunityReplyText(e.target.value)}
                                    placeholder="Draft text reply or public channel announcement..."
                                    className="w-full bg-[#F8F5F0] border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-xl py-2 px-3 text-xs focus:outline-none transition-colors text-stone-850 font-semibold resize-none"
                                    rows={2}
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={async () => {
                                        if (!communityReplyText.trim()) return;
                                        try {
                                          await apiClient.post('/social/post-to-feed', null, {
                                            params: {
                                              content: `ANNOUNCEMENT | Admin Announcement\n\n${communityReplyText}`,
                                              type: 'COMMUNITY'
                                            }
                                          });

                                          const newAnn = {
                                            id: 'post-' + Date.now(),
                                            author: '★ Super Admin Announcement',
                                            content: communityReplyText,
                                            date: 'Just now',
                                            replies: [],
                                            repliesCount: 0
                                          };
                                          setCommunityPosts(prev => [newAnn, ...prev]);
                                          setSelectedPostId(newAnn.id);
                                          setCommunityReplyText('');
                                          setRecentActivities(prev => [
                                            `Admin pushed a public announcement.`,
                                            ...prev
                                          ]);
                                        } catch (err) {
                                          console.error("Failed to broadcast announcement:", err);
                                          alert("Failed to broadcast announcement: " + (err.response?.data?.message || err.message));
                                        }
                                      }}
                                      
                                    >
                                      
                                    </button>
                                    <button
                                      onClick={async () => {
                                        if (!communityReplyText.trim()) return;
                                        try {
                                          const isTicket = typeof selectedPostId === 'string' && selectedPostId.startsWith('ticket-');
                                          if (isTicket) {
                                            const parts = selectedPostId.split('-');
                                            const ticketUserId = parseInt(parts[1], 10);

                                            await apiClient.post(`/social/messages/admin/reply/${ticketUserId}`, null, {
                                              params: { content: communityReplyText }
                                            });
                                          }

                                          setCommunityPosts(prev => prev.map(p => {
                                            if (p.id === selectedPostId) {
                                              return {
                                                ...p,
                                                replies: [...p.replies, {
                                                  content: communityReplyText,
                                                  createdAt: new Date().toISOString(),
                                                  sender: { userId: 41, role: 'admin' }
                                                }],
                                                repliesCount: p.repliesCount + 1
                                              };
                                            }
                                            return p;
                                          }));
                                          setCommunityReplyText('');
                                          setRecentActivities(prev => [
                                            `Admin responded to ${post.author}.`,
                                            ...prev
                                          ]);
                                        } catch (err) {
                                          console.error("Failed to reply to ticket:", err);
                                          alert("Failed to reply to ticket: " + (err.response?.data?.message || err.message));
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-[#1B4332] text-white border border-[#1B4332] rounded-full text-[9px] uppercase font-bold tracking-widest hover:bg-[#7b0016] transition-all cursor-pointer shadow-sm"
                                    >
                                      ✉️ Send Reply
                                    </button>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeAdminTab === 'admin_reviews' && (
                    <motion.div
                      key="admin-reviews-moderation"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6 flex-grow text-left"
                    >
                      <div className="border-b border-stone-100 pb-4 shrink-0">
                        <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Public Reviews Moderation</h2>
                        <p className="text-xs text-stone-500 font-sans mt-1">Audit adopter reviews, inspect star-ratings, and moderate abusive language or inappropriate content.</p>
                      </div>

                      {loadingAdminReviews ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                          <p className="text-stone-500 text-xs font-semibold">Retrieving public reviews list...</p>
                        </div>
                      ) : adminReviewsError ? (
                        <div className="py-12 text-center text-[#7b0016] text-xs font-bold uppercase">
                          ⚠️ {adminReviewsError}
                        </div>
                      ) : adminReviews?.length === 0 ? (
                        <div className="bg-white border-2 border-dashed border-[#D8D2C4]/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-2 shadow-sm">
                          <span className="text-3xl text-stone-400">⭐</span>
                          <h4 className="font-serif text-lg font-bold text-[#1B4332]">No Public Reviews Found</h4>
                          <p className="text-stone-500 text-xs max-w-xs leading-relaxed">
                            There are currently no reviews submitted on the platform.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-white border border-[#D8D2C4]/45 rounded-2xl shadow-sm overflow-hidden font-sans font-medium text-xs text-stone-700">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-[#1B4332]/5 text-[#1B4332] text-[10px] font-bold uppercase tracking-wider border-b border-[#D8D2C4]/45">
                                  <th className="py-4 px-6">Reviewer Info</th>
                                  <th className="py-4 px-6">Rating</th>
                                  <th className="py-4 px-6">Comment</th>
                                  <th className="py-4 px-6">Submitted At</th>
                                  <th className="py-4 px-6 text-center w-24">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {adminReviews.map((rev) => (
                                  <tr key={rev.reviewId || rev.id} className="hover:bg-stone-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                      <div className="font-bold text-stone-900">{rev.reviewer?.fullName || 'Anonymous Adopter'}</div>
                                      <div className="text-stone-400 text-[10px]">{rev.reviewer?.email || 'N/A'}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <span
                                            key={star}
                                            className={`text-sm ${star <= (rev.rating || 0) ? 'text-[#cca43b]' : 'text-stone-200'}`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 max-w-xs">
                                      <p className="italic text-stone-600 truncate-2-lines break-words leading-relaxed">
                                        "{rev.commentText}"
                                      </p>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-stone-500 font-sans">
                                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                      <button
                                        onClick={() => {
                                          if (confirm("Are you sure you want to delete this public review? This action is permanent.")) {
                                            handleDeleteAdminReview(rev.reviewId || rev.id);
                                          }
                                        }}
                                        className="p-2 hover:bg-[#7b0016]/10 text-stone-400 hover:text-[#7b0016] rounded-full transition-colors cursor-pointer inline-flex items-center justify-center border-none bg-transparent"
                                        title="Delete Review"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeAdminTab === 'treasury' && (
                    <motion.div
                      key="admin-treasury"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-6 text-left"
                    >
                      <div className="border-b border-stone-100 pb-4">
                        <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Fund Allocation Center</h2>
                        <p className="text-xs text-stone-500 font-sans mt-1">Manage and distribute support funds across verified partner organizations.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 flex justify-between items-center shadow-sm relative overflow-hidden text-left">
                          <div>
                            <span className="text-[9px] tracking-widest uppercase font-bold text-stone-500 block mb-1">Total Donations Raised</span>
                            <h4 className="font-serif text-2xl font-extrabold text-[#1B4332]">₹{summary.totalDonationsRaised.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                          </div>
                          <span className="text-2xl relative z-10">📈</span>
                          <div className="absolute inset-0 bg-[radial-gradient(#1B4332_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
                        </div>

                        <div className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 flex justify-between items-center shadow-sm relative overflow-hidden text-left">
                          <div>
                            <span className="text-[9px] tracking-widest uppercase font-bold text-stone-500 block mb-1">Total Payouts Sent</span>
                            <h4 className="font-serif text-2xl font-extrabold text-[#7b0016]">₹{summary.totalPayoutsDistributed.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                          </div>
                          <span className="text-2xl relative z-10">📉</span>
                          <div className="absolute inset-0 bg-[radial-gradient(#7b0016_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
                        </div>

                        <div className="bg-[#1B4332] text-white border border-[#D4A017]/35 rounded-2xl p-6 flex justify-between items-center shadow-md relative overflow-hidden text-left">
                          <div>
                            <span className="text-[9px] tracking-widest uppercase font-bold text-[#D4A017] block mb-1">Remaining Pool Balance</span>
                            <h4 className="font-serif text-3xl font-extrabold text-[#F8F5F0]">₹{summary.netSavingsBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h4>
                          </div>
                          <span className="text-3xl relative z-10">💰</span>
                          <div className="absolute inset-0 bg-[radial-gradient(#D4A017_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                        <div
                          onClick={() => setActiveTreasurySection('orgs')}
                          className="bg-[#F8F5F0] border border-[#D8D2C4]/45 p-6 rounded-2xl hover:border-[#D4A017] transition-all duration-300 cursor-pointer flex flex-col gap-4 group shadow-sm hover:shadow-md hover:scale-[1.01] text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-white border border-[#D4A017]/30 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                            <Building className="text-[#D4A017]" size={18} />
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-bold text-[#1B4332] group-hover:text-[#D4A017] transition-colors">Verified Partner Organizations</h4>
                            <p className="text-stone-500 text-xs font-sans mt-1 leading-relaxed">
                              View verified sanctuaries and distribute support funds or allocate financial packages.
                            </p>
                          </div>
                          <span className="text-[10px] text-[#7b0016] uppercase tracking-widest font-extrabold mt-auto flex items-center gap-1">
                            Manage Partners →
                          </span>
                        </div>

                        <div
                          onClick={() => setActiveTreasurySection('history')}
                          className="bg-[#F8F5F0] border border-[#D8D2C4]/45 p-6 rounded-2xl hover:border-[#D4A017] transition-all duration-300 cursor-pointer flex flex-col gap-4 group shadow-sm hover:shadow-md hover:scale-[1.01] text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-white border border-[#D4A017]/30 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                            <FileSpreadsheet className="text-[#D4A017]" size={18} />
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-bold text-[#1B4332] group-hover:text-[#D4A017] transition-colors">Funding Transaction History</h4>
                            <p className="text-stone-550 text-xs font-sans mt-1 leading-relaxed">
                              Inspect the records of outbound payout distributions and platform support history.
                            </p>
                          </div>
                          <span className="text-[10px] text-[#7b0016] uppercase tracking-widest font-extrabold mt-auto flex items-center gap-1">
                            View Ledger →
                          </span>
                        </div>

                        <div
                          onClick={() => setActiveTreasurySection('inflows')}
                          className="bg-[#F8F5F0] border border-[#D8D2C4]/45 p-6 rounded-2xl hover:border-[#D4A017] transition-all duration-300 cursor-pointer flex flex-col gap-4 group shadow-sm hover:shadow-md hover:scale-[1.01] text-left"
                        >
                          <div className="w-10 h-10 rounded-full bg-white border border-[#D4A017]/30 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                            <Heart className="text-[#D4A017]" size={18} />
                          </div>
                          <div>
                            <h4 className="font-serif text-base font-bold text-[#1B4332] group-hover:text-[#D4A017] transition-colors">Platform Inflow Logs</h4>
                            <p className="text-stone-500 text-xs font-sans mt-1 leading-relaxed">
                              Track donor names, email addresses, contribution timestamps, and incoming transactions.
                            </p>
                          </div>
                          <span className="text-[10px] text-[#7b0016] uppercase tracking-widest font-extrabold mt-auto flex items-center gap-1">
                            View Donors →
                          </span>
                        </div>
                      </div>

                      <AnimatePresence>
                        {activeTreasurySection && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center pt-28 p-6 bg-black/60 backdrop-blur-md">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 15 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white rounded-3xl w-full max-w-4xl border border-[#D4A017]/40 shadow-2xl p-8 relative overflow-hidden flex flex-col max-h-[85vh] text-left"
                            >
                              <button
                                onClick={() => setActiveTreasurySection(null)}
                                className="absolute top-6 right-6 text-stone-650 hover:text-[#7b0016] transition-colors cursor-pointer z-50 p-1"
                              >
                                <X size={22} />
                              </button>

                              <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

                              <div className="border-b border-stone-100 pb-4 shrink-0 pr-12">
                                <h3 className="font-serif text-2xl font-bold text-[#1B4332]">
                                  {activeTreasurySection === 'orgs' && "Verified Partner Organizations"}
                                  {activeTreasurySection === 'history' && "Funding Transaction History"}
                                  {activeTreasurySection === 'inflows' && "Platform Inflow Logs"}
                                </h3>
                                <p className="text-xs text-stone-500 font-sans mt-1 font-semibold">
                                  {activeTreasurySection === 'orgs' && "Select an approved sanctuary to disburse support funds."}
                                  {activeTreasurySection === 'history' && "Log of all distributed payouts and financial support allocations."}
                                  {activeTreasurySection === 'inflows' && "Details of incoming donations and patron records."}
                                </p>
                              </div>

                              <div className="overflow-y-auto flex-grow pr-2 mt-6">
                                {activeTreasurySection === 'orgs' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {allianceOrgs.filter(org => org.isVerified === 'APPROVED').map((org) => (
                                      <div
                                        key={org.id}
                                        onClick={() => {
                                          setSelectedOrgForDonation(org);
                                          setDonationAmount('');
                                          setDonationRemark('');
                                          setDonationError('');
                                          setIsTreasuryModalOpen(true);
                                        }}
                                        className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-xl p-5 hover:border-[#D4A017] transition-all duration-300 cursor-pointer flex justify-between items-center group shadow-sm hover:shadow-md"
                                      >
                                        <div>
                                          <h4 className="font-serif text-base font-bold text-[#1B4332] group-hover:text-[#D4A017] transition-colors">{org.name || org.orgName}</h4>
                                          <p className="text-stone-550 text-[10px] uppercase font-bold tracking-wider mt-1">{org.location}</p>
                                        </div>
                                        <span className="text-xs text-[#7b0016] uppercase tracking-widest font-extrabold group-hover:translate-x-1 transition-transform">Allocate Funds →</span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {activeTreasurySection === 'history' && (
                                  <>
                                    {payouts.length === 0 ? (
                                      <p className="text-stone-550 font-sans text-xs italic py-4">No outbound transactions recorded.</p>
                                    ) : (
                                      <div className="flex flex-col gap-3 font-sans text-xs">
                                        {payouts.map((item) => (
                                          <div key={item.payoutId} className="bg-[#F8F5F0]/60 border border-[#D8D2C4]/35 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                            <div>
                                              <span className="text-[8px] text-stone-400 block font-bold uppercase">{new Date(item.payoutDate).toLocaleDateString()} | ID: PAY-{item.payoutId}</span>
                                              <h4 className="font-bold text-[#1B4332] mt-0.5">Distributed to: {item.orgName}</h4>
                                              {item.remarks && <p className="text-stone-600 italic mt-1 font-semibold">"{item.remarks}"</p>}
                                            </div>
                                            <span className="font-serif text-lg font-extrabold text-[#7b0016]">
                                              ₹{item.amount.toLocaleString()}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}

                                {activeTreasurySection === 'inflows' && (
                                  <>
                                    {donations.length === 0 ? (
                                      <p className="text-stone-550 font-sans text-xs italic py-4">No incoming donation logs recorded.</p>
                                    ) : (
                                      <div className="flex flex-col gap-3 font-sans text-xs">
                                        {donations.map((item) => (
                                          <div key={item.donationId} className="bg-[#F8F5F0]/60 border border-[#D8D2C4]/35 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                            <div>
                                              <span className="text-[8px] text-stone-400 block font-bold uppercase">{item.donorEmail} | {new Date(item.transactionDate).toLocaleDateString()} | ID: DON-{item.donationId}</span>
                                              <h4 className="font-bold text-[#1B4332] mt-0.5">Donation Received from: {item.donorName}</h4>
                                            </div>
                                            <span className="font-serif text-lg font-extrabold text-[#1B4332]">
                                              + ₹{item.amount.toLocaleString()}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {isTreasuryModalOpen && selectedOrgForDonation && (
                          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 15 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 15 }}
                              transition={{ duration: 0.3 }}
                              className="bg-[#F8F5F0] rounded-3xl w-full max-w-md border border-[#D4A017]/40 shadow-2xl p-8 relative overflow-hidden text-left"
                            >
                              <button
                                onClick={() => setIsTreasuryModalOpen(false)}
                                className="absolute top-5 right-5 text-stone-600 hover:text-[#7b0016] transition-colors cursor-pointer"
                              >
                                <X size={20} />
                              </button>

                              <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

                              <h3 className="font-serif text-2xl font-bold text-[#1B4332] mb-1">Dispatch Alliance Funds</h3>
                              <p className="text-stone-500 text-xs mb-6 font-semibold">Allocate financial packages to: <span className="text-[#1B4332] font-bold">{selectedOrgForDonation.name || selectedOrgForDonation.orgName}</span></p>

                              {donationError && (
                                <div className="mb-4 bg-[#7b0016]/10 border border-[#7b0016]/30 text-[#7b0016] rounded-xl py-2.5 px-4 text-xs font-bold text-center">
                                  {donationError}
                                </div>
                              )}

                              <form
                                onSubmit={async (e) => {
                                  e.preventDefault();
                                  setDonationError('');
                                  const amt = parseFloat(donationAmount);
                                  if (isNaN(amt) || amt <= 0) {
                                    setDonationError('Please enter a valid donation amount.');
                                    return;
                                  }
                                  if (amt > summary.netSavingsBalance) {
                                    setDonationError('Insufficient funds in treasury pool.');
                                    return;
                                  }
                                  if (!donationRemark.trim()) {
                                    setDonationError('Justification remark is required.');
                                    return;
                                  }

                                  try {
                                    const rawOrgId = selectedOrgForDonation.orgId || selectedOrgForDonation.id;
                                    const numericOrgId = typeof rawOrgId === 'string' && rawOrgId.startsWith('ngo-')
                                      ? parseInt(rawOrgId.replace('ngo-', ''), 10)
                                      : parseInt(rawOrgId, 10);

                                    if (isNaN(numericOrgId)) {
                                      throw new Error("Invalid organization ID mapping.");
                                    }

                                    apiClient.post(`http://localhost:9999/api/finance/admin/payout?orgId=${numericOrgId}&amount=${amt}&remarks=${encodeURIComponent(donationRemark.trim())}`)
                                      .then(() => {
                                          fetchFinancialData();
                                      })
                                      .catch(err => console.error("Payout disbursement failed:", err));

                                    setRecentActivities(prev => [
                                      `Admin donated ₹${amt.toLocaleString()} to ${selectedOrgForDonation.name || selectedOrgForDonation.orgName} for ${donationRemark.trim()}`,
                                      ...prev
                                    ]);

                                    setIsTreasuryModalOpen(false);
                                    setSelectedOrgForDonation(null);
                                    setDonationAmount('');
                                    setDonationRemark('');
                                  } catch (err) {
                                    console.error("Failed to disburse payout:", err);
                                    setDonationError(err.response?.data?.message || err.message || "Failed to disburse payout to backend.");
                                  }
                                }}
                                className="flex flex-col gap-4 font-sans text-xs"
                              >
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Financial Package Amount ($) *</label>
                                  <input
                                    type="number"
                                    required
                                    min="1"
                                    step="any"
                                    value={donationAmount}
                                    onChange={(e) => setDonationAmount(e.target.value)}
                                    placeholder="e.g., 5000"
                                    className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm font-semibold focus:outline-none transition-colors"
                                  />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">ADMIN TRANSACTION REMARK / JUSTIFICATION *</label>
                                  <textarea
                                    required
                                    rows={3}
                                    value={donationRemark}
                                    onChange={(e) => setDonationRemark(e.target.value)}
                                    placeholder="e.g., Grant allocated for emergency canine clinical ward upgrades"
                                    className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm font-semibold focus:outline-none transition-colors resize-none"
                                  />
                                </div>

                                <button
                                  type="submit"
                                  className="w-full bg-[#1B4332] text-white hover:bg-[#7b0016] py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-bold shadow-md transition-all duration-300 border border-[#D4A017]/30 mt-2 cursor-pointer"
                                >
                                  DISPATCH ALLIANCE FUNDS
                                </button>
                              </form>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </>
              ) : (
                <>
              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="border-b border-stone-100 pb-4 flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Guardian Profile</h2>
                      <p className="text-xs text-stone-500 font-sans mt-1">Manage your personal information, adoption activity, donations, and communications.</p>
                    </div>
                    {!isEditingProfile && (
                      <button
                        onClick={handleStartEditProfile}
                        className="bg-white hover:bg-[#F8F5F0] border border-[#D4A017] text-[#1B4332] font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-full transition-all duration-300 shadow-xs cursor-pointer"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <form onSubmit={handleProfileUpdateSubmit} className="bg-[#F8F5F0] border border-[#D8D2C4]/45 p-8 rounded-2xl flex flex-col gap-5 shadow-sm max-w-xl text-left">
                      <h3 className="font-serif text-lg font-bold text-[#1B4332] mb-2">Edit Profile Details</h3>

                      {profileError && (
                        <div className="bg-[#7b0016]/10 border border-[#7b0016] text-[#7b0016] px-4 py-3 rounded-xl text-xs font-semibold">
                          {profileError}
                        </div>
                      )}

                      {profileSuccess && (
                        <div className="bg-[#1B4332]/10 border border-[#1B4332] text-[#1B4332] px-4 py-3 rounded-xl text-xs font-semibold">
                          {profileSuccess}
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileEditForm.fullName}
                          onChange={(e) => setProfileEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Phone Contact</label>
                        <input
                          type="text"
                          required
                          value={profileEditForm.phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, '');
                            if (digits.length <= 15) {
                              setProfileEditForm(prev => ({ ...prev, phone: digits }));
                            }
                          }}
                          className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                        />
                        <span className="text-[9px] text-stone-400 font-semibold uppercase tracking-wider">Must be between 7 and 15 digits. Only positive digits are allowed.</span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">New Password (leave blank to keep current)</label>
                        <input
                          type="password"
                          value={profileEditForm.password}
                          onChange={(e) => setProfileEditForm(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="••••••••"
                          className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <button
                          type="submit"
                          className="bg-[#1B4332] text-white hover:bg-[#7b0016] border border-[#1B4332] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer"
                        >
                          SAVE CHANGES
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="bg-white hover:bg-[#F8F5F0] border border-stone-300 text-stone-600 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xs cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: 'Full Name', value: activeUser?.fullName || activeUser?.name || 'Guest', icon: <User className="text-[#D4A017]" size={16} /> },
                        { label: 'Registered Email', value: activeUser?.email || 'guest@lifeofpaw.org', icon: <Mail className="text-[#D4A017]" size={16} /> },
                        { label: 'Phone Contact', value: activeUser?.phone || 'Not Provided', icon: <Phone className="text-[#D4A017]" size={16} /> },
                        { label: 'Guardian Status', value: activeUser?.role || 'Guest Member', icon: <Shield className="text-[#D4A017]" size={16} /> }
                      ].map((card, idx) => (
                        <div
                          key={idx}
                          className="bg-[#F8F5F0] border border-[#D8D2C4]/45 p-6 rounded-2xl flex items-start gap-4 shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-full bg-white border border-[#D4A017]/30 flex items-center justify-center shrink-0">
                            {card.icon}
                          </div>
                          <div>
                            <span className="text-[10px] tracking-widest uppercase font-bold text-stone-400 font-sans block mb-1">{card.label}</span>
                            <span className="font-sans text-sm font-semibold text-[#1B4332] block">{card.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {orgAppStatus.status !== 'APPROVED' && (
                    <div className="bg-[#F8F5F0] border border-[#D8D2C4]/50 rounded-2xl p-6 shadow-sm mt-4 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white border border-[#D4A017]/30 flex items-center justify-center shrink-0">
                          <Building className="text-[#D4A017]" size={18} />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-bold text-[#1B4332]">Sanctuary Alliance Onboarding</h3>
                          <p className="text-stone-550 text-xs mt-0.5">Register your shelter or NGO to list animals and manage adoptions.</p>
                        </div>
                      </div>
                      
                      {(orgAppStatus.hasApplication && orgAppStatus.status === 'PENDING') ? (
                        <div className="w-full flex flex-col items-center justify-center gap-1.5 px-5 py-5 rounded-xl bg-white border-2 border-double border-[#D4A017]/45 text-[#1B4332] font-sans text-center relative overflow-hidden shadow-inner select-none">
                          <div className="flex items-center justify-center gap-2">
                            <Shield size={14} className="text-[#D4A017] fill-current shrink-0 animate-pulse" />
                            <span className="text-[10px] tracking-[0.2em] font-bold uppercase leading-none text-stone-700">ORGANIZATION REGISTRATION PENDING / VERIFICATION IN PROGRESS</span>
                          </div>
                          <span className="text-[8px] text-[#D4A017] tracking-widest font-semibold uppercase">Verification In Progress</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setOrgForm({ orgName: '', licenseNumber: '', location: '', orgDescription: '', orgImages: '', isVerified: 'N' });
                            setOrgSuccess(false);
                            setOnboardingFiles([]);
                            setIsOrgModalOpen(true);
                          }}
                          className="w-full sm:w-auto self-start bg-[#1B4332] text-white hover:bg-[#7b0016] border border-[#D4A017] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md cursor-pointer flex items-center gap-2"
                        >
                          <Shield size={14} className="text-[#D4A017]" />
                          Register Organization
                        </button>
                      )}
                    </div>
                  )}

                  <div className="bg-[#1B4332] text-white border border-[#D4A017]/35 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 mt-4 shadow-md">
                    <div className="w-16 h-16 rounded-full bg-white/5 border border-[#D4A017] flex items-center justify-center text-2xl shrink-0 text-[#D4A017]">
                      🛡️
                    </div>
                    <div>
                      <h4 className="font-serif text-lg font-bold text-[#F8F5F0] mb-1">Trusted And Secure Platform</h4>
                      <p className="text-stone-300 font-sans text-xs leading-relaxed">
                        Your personal information, adoption applications, and organization records are protected through secure systems and verified access controls, ensuring a safe and transparent experience for every member of the Life of Paw community.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'dossiers' && (
                <motion.div
                  key="dossiers-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Adoption Requests</h2>
                    <p className="text-xs text-stone-500 font-sans mt-1">Monitor the progress of your companion adoption journey.</p>
                  </div>

                  {dossiersList?.length === 0 ? (
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 text-center max-w-xl mx-auto mt-6">
                      <div className="w-16 h-16 rounded-full bg-[#1B4332]/5 border border-[#cca43b]/20 flex items-center justify-center text-[#cca43b] mx-auto mb-4">
                        <Heart size={24} className="text-[#cca43b] stroke-[1.5]" />
                      </div>
                      <h3 className="text-[#1b4332] font-semibold text-xl mb-2 font-serif">No Active Companionship Journeys Found</h3>
                      <p className="text-gray-500 text-sm mb-6">Your heart is open, but your dashboard is empty. Discover rescue animals waiting for a safe home and begin an adoption application today.</p>
                      <button
                        onClick={() => navigate('/rescue-animals')}
                        className="bg-[#1b4332] text-white font-medium px-6 py-2.5 rounded-xl hover:bg-[#143225] transition-all shadow-sm cursor-pointer"
                      >
                        EXPLORE COMPANIONS
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {dossiersList?.map((dos) => (
                        <div
                          key={dos.id}
                          className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/50">
                            <div>
                              <span className="text-[10px] tracking-wider uppercase font-bold text-[#D4A017]">Initiated: {dos.date}</span>
                              <h3 className="font-serif text-xl text-[#1B4332] font-bold mt-0.5">{dos.petName}</h3>
                              <p className="text-xs text-stone-500 font-semibold">{dos.breed}</p>
                            </div>
                            
                            <span
                              className={`px-4 py-1.5 rounded-full text-[9px] font-sans tracking-widest font-extrabold uppercase text-center self-start sm:self-auto border ${
                                dos.status === 'APPROVED BY SANCTUARY' || dos.status === 'APPROVED BY ADMIN'
                                  ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332]'
                                  : 'bg-[#7b0016]/10 border-[#7b0016] text-[#7b0016]'
                              }`}
                            >
                              {dos.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-stone-600">
                            <div className="sm:col-span-2">
                              <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Reason for Guardianship</span>
                              <p className="leading-relaxed font-semibold text-stone-850">"{dos.reason}"</p>
                            </div>
                            <div>
                              <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Target Location</span>
                              <p className="font-bold text-[#1B4332] flex items-center gap-1">
                                <MapPin size={12} className="text-[#D4A017]" />
                                {dos.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'donations' && (
                <motion.div
                  key="donations-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Donation History</h2>
                    <p className="text-xs text-stone-500 font-sans mt-1">Track your contributions and the positive impact you've made across our rescue community.</p>
                  </div>

                  {donationsList?.length === 0 ? (
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-8 text-center max-w-xl mx-auto mt-6">
                      <div className="w-16 h-16 rounded-full bg-[#1B4332]/5 border border-[#cca43b]/20 flex items-center justify-center text-[#cca43b] mx-auto mb-4">
                        <Wallet size={24} className="text-[#cca43b] stroke-[1.5]" />
                      </div>
                      <h3 className="text-[#1b4332] font-semibold text-xl mb-2 font-serif">No Contribution History Found</h3>
                      <p className="text-gray-500 text-sm mb-6">Your support can change lives. Help us build a more compassionate future by providing life-saving medical resources, food, and shelter safety to animals in need.</p>
                      <button
                        onClick={() => navigate('/donate')}
                        className="bg-[#cca43b] text-white font-medium px-6 py-2.5 rounded-xl hover:bg-[#b59032] transition-all shadow-sm cursor-pointer"
                      >
                        SUPPORT THE POOL
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {donationsList?.map((donation) => (
                        <div
                          key={donation.id}
                          className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex flex-col gap-1 text-left">
                            <span className="text-[10px] tracking-wider uppercase font-bold text-[#D4A017]">{donation.date}</span>
                            <h3 className="font-serif text-lg text-[#1B4332] font-bold mt-0.5">{donation.org}</h3>
                            <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{donation.type}</span>
                          </div>

                          <div className="flex items-center gap-6 self-start sm:self-auto">
                            <div className="text-right">
                              <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">Amount</span>
                              <span className="font-serif text-2xl font-extrabold text-[#7b0016]">{donation.amount}</span>
                            </div>
                            <div className="w-[1px] h-10 bg-[#D4A017]/20" />
                            <div>
                              <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Status</span>
                              <span className="bg-[#1B4332]/10 border border-[#1B4332] text-[#1B4332] px-3.5 py-1 rounded-full text-[9px] font-sans tracking-widest font-extrabold uppercase text-center block">
                                {donation.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div
                  key="messages-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6 flex-grow"
                >
                  <div className="border-b border-stone-100 pb-4 shrink-0">
                    <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Secure Communications</h2>
                    <p className="text-xs text-stone-500 font-sans mt-1">View updates and exchange messages with verified partner organizations and support team.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 border border-[#D8D2C4]/45 rounded-2xl overflow-hidden min-h-[400px] bg-stone-50">
                    
                    <div className="md:col-span-5 bg-white border-r border-[#D8D2C4]/45 flex flex-col divide-y divide-stone-100 overflow-y-auto max-h-[420px]">
                      {chatChannels.map((channel) => {
                        const isActive = selectedChannelId === channel.id;
                        return (
                          <button
                            key={channel.id}
                            type="button"
                            onClick={() => setSelectedChannelId(channel.id)}
                            className={`w-full p-4 text-left transition-all flex items-center gap-3.5 cursor-pointer border-none bg-transparent ${
                              isActive
                                ? 'bg-[#F8F5F0] border-l-4 border-[#D4A017]'
                                : 'hover:bg-stone-50 border-l-4 border-transparent'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 relative ${
                              channel.isAdmin 
                                ? 'border-2 border-[#cca43b] bg-[#cca43b]/10 text-[#cca43b]' 
                                : 'bg-[#1B4332]/5 text-[#1B4332] border border-[#1B4332]/10'
                            }`}>
                              {channel.avatar}
                              {channel.isAdmin && (
                                <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#cca43b] text-white text-[7px] font-bold uppercase px-1 rounded shadow-sm scale-90 tracking-wider">
                                  Admin
                                </span>
                              )}
                            </div>
                            
                            <div className="flex-grow min-w-0">
                              <span className="font-serif text-xs sm:text-sm font-bold text-[#1B4332] block truncate">
                                {channel.name}
                              </span>
                              <span className="text-[10px] text-[#7b0016] font-semibold uppercase tracking-wider block truncate mt-0.5">
                                {channel.subtitle}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="md:col-span-7 flex flex-col justify-between h-[420px] bg-[#F8F5F0]/30 overflow-hidden">
                      
                      <div className="p-3 bg-white border-b border-[#D8D2C4]/45 flex items-center gap-2 shrink-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                          activeChannel?.isAdmin ? 'bg-[#cca43b]/20 text-[#cca43b] border border-[#cca43b]' : 'bg-[#1B4332]/10 text-[#1B4332]'
                        }`}>
                          {activeChannel?.avatar || '💬'}
                        </div>
                        <span className="font-serif text-xs sm:text-sm font-bold text-[#1B4332] truncate">
                          {activeChannel?.name || 'Conversation Window'}
                        </span>
                      </div>

                      <div className="flex flex-col-reverse overflow-y-auto h-[450px] pr-2 max-h-[450px]">
                        {loadingMessages ? (
                          <div className="my-auto flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                            <p className="text-stone-400 text-[10px] font-semibold uppercase tracking-widest">Just a moment...</p>
                          </div>
                        ) : activeChatMessages.length === 0 ? (
                          <div className="my-auto text-center p-6 text-stone-400 font-sans text-xs italic">
                            No messages in this thread yet. Send a message to start the conversation!
                          </div>
                        ) : (
                          [...activeChatMessages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((msg, mIdx) => (
                            <div
                              key={mIdx}
                              className={`max-w-[85%] rounded-2xl p-3 text-xs font-sans shadow-sm flex flex-col mb-3 ${
                                msg.sender === 'user'
                                  ? 'bg-[#1B4332] text-white self-end rounded-br-none'
                                  : 'bg-white text-stone-800 self-start rounded-bl-none border border-[#D8D2C4]/25'
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              <span
                                className={`text-[8px] mt-1 text-right block ${
                                  msg.sender === 'user' ? 'text-white/60' : 'text-stone-400'
                                }`}
                              >
                                {msg.time}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={handleSendPatronMessage} className="p-3 border-t border-[#D8D2C4]/45 bg-white flex gap-2 shrink-0">
                        <input
                          type="text"
                          value={patronTypedMessage}
                          onChange={(e) => setPatronTypedMessage(e.target.value)}
                          placeholder={`Message ${activeChannel?.isAdmin ? 'Support Desk' : 'Sanctuary Staff'}...`}
                          className="flex-grow bg-[#F8F5F0] border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-full py-2.5 px-4 text-xs focus:outline-none transition-colors text-stone-850 font-semibold"
                        />
                        <button
                          type="submit"
                          className="w-10 h-10 bg-[#7b0016] text-white rounded-full flex items-center justify-center hover:bg-[#1B4332] transition-colors border border-[#D4A017]/30 shrink-0 cursor-pointer"
                          aria-label="Send message"
                        >
                          <Send size={14} className="fill-current text-[#D4A017]" />
                        </button>
                      </form>

                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'companion_inventory' && viewMode === 'sanctuary' && (() => {
                const adaptedAnimals = (managedAnimals || []).map(animal => {
                  if (!animal) return null;
                  const aId = animal?.animalId || animal?.id;
                  
                  const matchedOrg = allianceOrgs?.find(org => 
                    org?.animals?.some(ani => (ani?.animalId || ani?.ANIMAL_ID) === aId)
                  );
                  
                  const resolvedOrgName = matchedOrg?.orgName || matchedOrg?.name || 'Sanctuary Alliance HQ';
                  const resolvedNgoId = matchedOrg?.id || 'ngo-1';
                  
                  let resolvedImage = '';
                  const imagesList = animal?.images || [];
                  if (imagesList && imagesList.length > 0) {
                    const imgUrl = imagesList[0]?.imageUrl;
                    if (imgUrl) {
                      resolvedImage = imgUrl.startsWith('http') ? imgUrl : `http://localhost:9999${imgUrl}`;
                    }
                  }
                  
                  return {
                    ...animal,
                    id: aId,
                    age: animal?.age || animal?.ageCategory || 'Adult',
                    imageUrl: resolvedImage || animal?.imageUrl || '',
                    location: resolvedOrgName,
                    ngoId: resolvedNgoId
                  };
                }).filter(Boolean);

                const displayAnimals = adaptedAnimals.filter(animal => {
                  if (isVerifiedOverride && !userOrg) return true;
                  return animal.ngoId === parentNgoId;
                });
                return (
                  <motion.div
                    key="companion-inventory-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Companion Inventory</h2>
                        <p className="text-xs text-stone-500 font-sans mt-1">Verified animals currently sheltered and curated under your sanctuary's stewardship.</p>
                      </div>
                      <button
                        onClick={handleAddCompanionClick}
                        className="bg-[#1B4332] text-[#F8F5F0] border border-[#D4A017] hover:bg-[#7b0016] px-5 py-2.5 rounded-full text-xs font-sans tracking-widest uppercase font-bold transition-all shadow-md cursor-pointer self-start sm:self-auto"
                      >
                        REGISTER NEW COMPANION
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {displayAnimals.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 bg-[#F8F5F0] border-2 border-dashed border-[#D4A017]/35 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-white border border-[#D4A017]/35 flex items-center justify-center text-2xl shadow-sm text-[#D4A017] animate-pulse">
                            🛡️
                          </div>
                          <h3 className="font-serif text-xl font-bold text-[#1B4332]">No companions registered yet</h3>
                          <p className="text-stone-500 font-sans text-xs max-w-sm leading-relaxed">
                            Begin showcasing your sanctuary's residents by registering your first companion profile. This will instantly appear in the Alliance Network.
                          </p>
                          <button
                            onClick={handleAddCompanionClick}
                            className="bg-[#1B4332] text-white hover:bg-[#7b0016] px-6 py-2.5 rounded-full text-xs font-sans tracking-widest uppercase font-bold transition-all shadow-md cursor-pointer border border-[#D4A017]/30 mt-2"
                          >
                            Register First Companion
                          </button>
                        </div>
                      ) : (
                        displayAnimals.map((animal) => (
                          <div
                            key={animal.id}
                            className="relative bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 overflow-hidden"
                          >
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center gap-2">
                                <div className="relative group overflow-hidden rounded-2xl w-[110px] h-[110px] shadow-sm border border-[#D4A017]/25">
                                  {animal.imageUrl ? (
                                    <img src={animal.imageUrl} className="w-full h-full object-cover" alt={animal.name} />
                                  ) : (
                                    <div className="w-full h-full bg-[#1B4332] flex items-center justify-center relative">
                                      <svg viewBox="0 0 100 100" className="w-12 h-12 text-[#D4A017] fill-current opacity-90 drop-shadow-md">
                                        <path d="M50 40c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm-22 6c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm44 0c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-34-22c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm24 0c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7z" />
                                      </svg>
                                      <div className="absolute inset-1 border border-[#D4A017]/10 rounded-xl pointer-events-none" />
                                    </div>
                                  )}
                                  
                                  <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-300 rounded-2xl">
                                    <button
                                      onClick={() => {
                                        setEditingImageId(animal.id || animal.animalId);
                                        setTempImageUrl(animal.imageUrl || '');
                                        setNewImageFile(null);
                                        setNewImagePreview('');
                                      }}
                                      title="Update Photo"
                                      className="p-1.5 bg-white/10 hover:bg-[#D4A017] text-white rounded-lg transition-colors cursor-pointer border-none"
                                    >
                                      <Camera size={16} className="stroke-[2.5]" />
                                    </button>

                                    {animal.imageUrl && (
                                      <button
                                        onClick={() => handleRemoveImage(animal.id || animal.animalId)}
                                        title="Permanently Remove Photo"
                                        className="p-1.5 bg-white/10 hover:bg-red-600 text-white rounded-lg transition-colors cursor-pointer border-none"
                                      >
                                        <Trash2 size={16} className="stroke-[2.5]" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-1 items-center w-full mt-1.5 border-t border-stone-100 pt-1.5">
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => handleEditDossierClick(animal)}
                                      title="Edit"
                                      className="p-1 text-[#D4A017] hover:text-[#1B4332] transition-colors cursor-pointer shrink-0"
                                    >
                                      <Pencil size={13} className="stroke-[2.5]" />
                                    </button>
                                    <span className="text-stone-300 text-[10px] select-none">|</span>
                                    <button
                                      onClick={() => handleDeleteCompanion(animal.id)}
                                      title="Delete Profile"
                                      className="p-1 text-[#7b0016] hover:text-[#1B4332] transition-colors cursor-pointer shrink-0"
                                    >
                                      <Trash2 size={13} className="stroke-[2.5]" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex-grow flex flex-col justify-between py-0.5">
                                <div>
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="truncate max-w-[120px] sm:max-w-none">
                                      <span className="text-[8px] tracking-widest uppercase font-bold text-stone-400">ID: {animal.id}</span>
                                      <h3 className="font-serif text-lg sm:text-xl text-[#1B4332] font-bold leading-tight mt-0.5 truncate">{animal.name}</h3>
                                    </div>
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-[8px] font-sans tracking-widest font-extrabold uppercase border shrink-0 ${
                                        animal.status === 'AVAILABLE'
                                          ? 'bg-[#1B4332]/10 border-[#1B4332] text-[#1B4332]'
                                          : animal.status === 'PENDING ADOPTION'
                                          ? 'bg-[#D4A017]/10 border-[#D4A017] text-[#D4A017]'
                                          : 'bg-[#7b0016]/10 border-[#7b0016] text-[#7b0016]'
                                      }`}
                                    >
                                      {animal.status}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] font-sans text-stone-600 mt-2.5">
                                    <div>
                                      <span className="text-[7px] tracking-widest uppercase font-bold text-stone-400 block">Species</span>
                                      <span className="font-semibold text-stone-850 truncate block">{animal.species}</span>
                                    </div>
                                    <div>
                                      <span className="text-[7px] tracking-widest uppercase font-bold text-stone-400 block">Breed</span>
                                      <span className="font-semibold text-stone-850 truncate block max-w-[90px]">{animal.breed || '—'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[7px] tracking-widest uppercase font-bold text-stone-400 block">Age & Gender</span>
                                      <span className="font-semibold text-stone-850 block truncate">{animal.age || '—'} {animal.gender ? `(${animal.gender})` : ''}</span>
                                    </div>
                                    <div>
                                      <span className="text-[7px] tracking-widest uppercase font-bold text-stone-400 block">Location</span>
                                      <span className="font-bold text-[#1B4332] block truncate max-w-[90px]">{animal.location || '—'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {animal.description && (
                              <p className="text-xs text-stone-600 font-sans italic leading-relaxed border-t border-stone-200/40 pt-2.5 mt-2">
                                "{animal.description}"
                              </p>
                            )}

                            <AnimatePresence>
                              {editingImageId === animal.id && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute inset-0 bg-[#F8F5F0]/95 backdrop-blur-sm z-10 flex flex-col justify-center p-6 rounded-2xl"
                                >
                                  <form
                                    onSubmit={handleUpdateImageSubmit}
                                    className="flex flex-col gap-3"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-[9px] tracking-widest uppercase font-bold text-[#D4A017] font-sans">Update Companion Image</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingImageId(null);
                                          setTempImageUrl('');
                                          setNewImageFile(null);
                                          setNewImagePreview('');
                                        }}
                                        className="text-stone-400 hover:text-[#7b0016] transition-colors border-none bg-transparent cursor-pointer"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 my-1">
                                      <div className="flex flex-col gap-1 items-center bg-white border border-[#D8D2C4]/40 rounded-xl p-2.5">
                                        <span className="text-[8px] tracking-widest uppercase font-bold text-stone-400 font-sans text-center">Current Image</span>
                                        {tempImageUrl ? (
                                          <img src={tempImageUrl} className="w-[75px] h-[75px] object-cover rounded-lg border border-stone-200 shadow-sm" alt="Current" />
                                        ) : (
                                          <div className="w-[75px] h-[75px] rounded-lg border border-stone-200 border-dashed bg-stone-50 flex items-center justify-center text-[8px] text-stone-400 font-semibold font-sans text-center">No image set</div>
                                        )}
                                      </div>

                                      <div className="flex flex-col gap-1 items-center bg-white border border-[#D8D2C4]/40 rounded-xl p-2.5 relative justify-center min-h-[110px]">
                                        <span className="text-[8px] tracking-widest uppercase font-bold text-stone-400 font-sans text-center mb-1">New Image</span>
                                        {newImagePreview ? (
                                          <div className="relative group/new flex flex-col items-center gap-1">
                                            <img src={newImagePreview} className="w-[75px] h-[65px] object-cover rounded-lg border border-stone-200 shadow-sm" alt="Preview" />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setNewImageFile(null);
                                                setNewImagePreview('');
                                              }}
                                              className="text-[9px] text-[#7b0016] hover:text-[#9B2226] font-bold font-sans cursor-pointer border-none bg-transparent flex items-center gap-0.5"
                                            >
                                              ✕ Clear
                                            </button>
                                          </div>
                                        ) : (
                                          <label className="relative flex flex-col items-center justify-center gap-1.5 w-full h-[65px] border-2 border-dashed border-[#D4A017]/40 hover:border-[#D4A017]/70 rounded-lg cursor-pointer transition-all bg-stone-50">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#D4A017]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-stone-500">Select File</span>
                                            <input 
                                              type="file" 
                                              accept="image/*" 
                                              className="sr-only" 
                                              onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                  setNewImageFile(file);
                                                  setNewImagePreview(URL.createObjectURL(file));
                                                }
                                              }}
                                            />
                                          </label>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex gap-2 justify-end mt-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingImageId(null);
                                          setTempImageUrl('');
                                          setNewImageFile(null);
                                          setNewImagePreview('');
                                        }}
                                        className="px-3 py-1.5 border border-[#D8D2C4] hover:bg-stone-50 text-[9px] uppercase font-bold tracking-wider text-stone-600 rounded-full cursor-pointer transition-all bg-transparent"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        disabled={!newImageFile}
                                        className={`px-4 py-1.5 border text-[9px] uppercase font-bold tracking-wider rounded-full cursor-pointer transition-all shadow-sm ${
                                          newImageFile 
                                            ? 'bg-[#1B4332] text-white hover:bg-[#7b0016] border-[#1B4332]' 
                                            : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                                        }`}
                                      >
                                        Save Image
                                      </button>
                                    </div>
                                  </form>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                );
              })()}

              {activeTab === 'inbound_adoptions' && viewMode === 'sanctuary' && (() => {
                const processedRequests = [...inboundRequests]
                  .filter(req => {
                    if (selectedStatusFilter === 'ALL') return true;
                    const statusUpper = req.status?.toUpperCase() || '';
                    if (selectedStatusFilter === 'APPROVED') return statusUpper.includes('APPROVED');
                    if (selectedStatusFilter === 'REJECTED') return statusUpper.includes('REJECTED');
                    if (selectedStatusFilter === 'PENDING') return statusUpper.includes('PENDING');
                    return false;
                  })
                  .sort((a, b) => {
                    const dateA = new Date(a.requestDate || a.createdAt || a.date).getTime();
                    const dateB = new Date(b.requestDate || b.createdAt || b.date).getTime();
                    return dateB - dateA;
                  });

                return (
                  <motion.div
                    key="inbound-adoptions-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Inbound Adoption Requests</h2>
                        <p className="text-xs text-stone-550 font-sans mt-1">Review and audit sanctuary adoption requests for companions under your care.</p>
                      </div>
                      
                      <div className="relative self-start sm:self-auto">
                        <button
                          onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                          className="px-4 py-2 bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017] rounded-xl text-xs font-bold text-[#1B4332] transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm font-sans"
                          
                        >
                          {selectedStatusFilter === 'ALL' && "All Applications"}
                          {selectedStatusFilter === 'APPROVED' && "Approved Requests"}
                          {selectedStatusFilter === 'REJECTED' && "Rejected Requests"}
                          {selectedStatusFilter === 'PENDING' && "Pending Requests"}
                          <span className="text-[10px] text-stone-400">▼</span>
                        </button>
                        
                        {isFilterDropdownOpen && (
                          <div className="absolute right-0 mt-1.5 w-48 bg-white border border-[#D8D2C4]/40 rounded-xl shadow-lg z-50 py-1 overflow-hidden font-sans">
                            {[
                              { value: 'ALL', label: 'All Applications' },
                              { value: 'PENDING', label: 'Pending Requests' },
                              { value: 'APPROVED', label: 'Approved Requests' },
                              { value: 'REJECTED', label: 'Rejected Requests' }
                            ].map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  setSelectedStatusFilter(opt.value);
                                  setIsFilterDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left text-xs transition-colors hover:bg-[#F8F5F0] hover:text-[#1B4332] cursor-pointer block border-none bg-transparent ${
                                  selectedStatusFilter === opt.value ? 'bg-[#F8F5F0] text-[#1B4332] font-bold' : 'text-stone-600'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-6">
                      {processedRequests.length === 0 ? (
                        <div className="bg-white border border-[#D8D2C4]/35 rounded-2xl p-8 text-center text-stone-400 font-sans text-xs italic">
                          No inbound requests found matching the current status filter.
                        </div>
                      ) : (
                        processedRequests.map((req) => (
                          <div
                            key={req.id}
                            className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200/50">
                              <div>
                                <span className="text-[10px] tracking-wider uppercase font-bold text-[#D4A017]">Received: {req.date}</span>
                                <h3 className="font-serif text-xl text-[#1B4332] font-bold mt-0.5">
                                  Request for {req.petName} ({req.breed})
                                </h3>
                                <p className="text-xs text-stone-550 font-semibold">
                                  Applicant: <span className="text-[#1B4332] font-bold">{req.requester}</span> 
                                </p>
                              </div>
                              
                              {(() => {
                                const statusUpper = req.status?.toUpperCase() || '';
                                if (statusUpper.includes('APPROVED')) {
                                  return (
                                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm flex items-center gap-1 self-start sm:self-auto text-center">
                                      ✓ {req.status}
                                    </span>
                                  );
                                } else if (statusUpper.includes('REJECTED')) {
                                  return (
                                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 self-start sm:self-auto text-center">
                                      {req.status}
                                    </span>
                                  );
                                } else {
                                  return (
                                    <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto text-center">
                                      {req.status}
                                    </span>
                                  );
                                }
                              })()}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-stone-600">
                              <div className="sm:col-span-2">
                                <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Applicant's Statement</span>
                                <p className="leading-relaxed font-semibold text-stone-850">"{req.reason}"</p>
                              </div>
                              <div>
                                <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Target Location</span>
                                <p className="font-bold text-[#1B4332] flex items-center gap-1">
                                  <MapPin size={12} className="text-[#D4A017]" />
                                  {req.location}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-stone-200/50">
                              <div className="flex flex-wrap gap-2.5">
                                <button
                                  onClick={() => setViewingDossierId(viewingDossierId === req.id ? null : req.id)}
                                  className="px-4 py-2 border border-[#1B4332] rounded-full text-[9px] uppercase font-bold tracking-widest text-[#1B4332] hover:bg-[#1B4332] hover:text-white transition-all cursor-pointer animate-none"
                                >
                                  {viewingDossierId === req.id ? 'Close Info' : 'View Applicant Info'}
                                </button>
                                
                                <button
                                  onClick={() => handleTalkToApplicant(req)}
                                  className="px-4 py-2 bg-[#D4A017] text-[#1B4332] hover:bg-[#1B4332] hover:text-white border border-[#D4A017] rounded-full text-[9px] uppercase font-bold tracking-widest transition-all cursor-pointer shadow-sm"
                                >
                                  Talk to Applicant
                                </button>
                              </div>

                              {req.status === 'PENDING REVIEW' && (
                                <div className="flex gap-2.5 justify-end">
                                  <button
                                    onClick={() => handleRejectRequest(req.id)}
                                    className="px-4 py-2 border border-[#7b0016] rounded-full text-[9px] uppercase font-bold tracking-widest text-[#7b0016] hover:bg-[#7b0016]/5 transition-all cursor-pointer"
                                  >
                                    Reject Request
                                  </button>
                                  <button
                                    onClick={() => handleApproveRequest(req.id)}
                                    className="px-4 py-2 bg-[#1B4332] text-white border border-[#1B4332] rounded-full text-[9px] uppercase font-bold tracking-widest hover:bg-[#7b0016] hover:border-[#7b0016] transition-all cursor-pointer shadow-sm"
                                  >
                                    Approve Request
                                  </button>
                                </div>
                              )}
                            </div>

                            <AnimatePresence>
                              {viewingDossierId === req.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden mt-3"
                                >
                                  <div className="bg-[#F8F5F0] border-2 border-double border-[#D4A017] rounded-xl p-5 shadow-inner text-left relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:16px_16px]" />
                                    <h4 className="font-serif text-[#1B4332] font-bold text-xs uppercase tracking-[0.15em] mb-3 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 bg-[#D4A017] rounded-full animate-ping" />
                                      Verified Applicant
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                                      <div>
                                        <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">Full Name</span>
                                        <span className="font-semibold text-[#1B4332] block">{req.user?.fullName || req.requester}</span>
                                      </div>
                                      <div>
                                        <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">Registered Email</span>
                                        <span className="font-semibold text-stone-850 block select-all">
                                          {req.user?.email || (req.requester === 'Lalit Kumar' ? 'lalitkumar@gmail.com' : req.requester === 'Sanjana Sen' ? 'sanjanasen@gmail.com' : 'rahulnair@gmail.com')}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">Mobile Number</span>
                                        <span className="font-semibold text-stone-850 block select-all">
                                          {req.user?.phone || (req.requester === 'Lalit Kumar' ? '+91 98765 43210' : req.requester === 'Sanjana Sen' ? '+91 98123 45678' : '+91 98987 65432')}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                );
              })()}
              {activeTab === 'sanctuary_treasury' && viewMode === 'sanctuary' && (() => {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth();
                const currentMonthName = now.toLocaleString('default', { month: 'long' });
                const thisMonthDisbursals = ngoPayoutsList.reduce((sum, item) => {
                  const d = item.rawDate || new Date();
                  if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
                    return sum + (item.rawAmount || 0);
                  }
                  return sum;
                }, 0);

                const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
                const prevYear = prevMonthDate.getFullYear();
                const prevMonth = prevMonthDate.getMonth();

                const prevMonthPayouts = ngoPayoutsList.reduce((sum, item) => {
                  const d = item.rawDate || new Date();
                  if (d.getFullYear() === prevYear && d.getMonth() === prevMonth) {
                    return sum + (item.rawAmount || 0);
                  }
                  return sum;
                }, 0);

                return (
                  <motion.div
                    key="sanctuary-treasury-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="border-b border-stone-100 pb-4">
                      <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Sanctuary Treasury</h2>
                      <p className="text-xs text-stone-500 font-sans mt-1">Real-time ledger overview of philanthropic donations credited to your organization.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-[#F8F5F0] border border-[#D8D2C4]/45 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                        <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400">Total Philanthropic Income</span>
                        <h4 className="font-serif text-3xl font-extrabold text-[#7b0016] mt-2">
                          {ngoPayoutsList && ngoPayoutsList.length > 0 
                            ? '₹' + ngoPayoutsList.reduce((acc, curr) => {
                                const numericVal = parseFloat(curr.amount.replace(/[^\d.]/g, ''));
                                return acc + (isNaN(numericVal) ? 0 : numericVal);
                              }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })
                            : '₹0.00'}
                        </h4>
                        <span className="text-[8px] text-stone-500 mt-1">
                          {ngoPayoutsList && ngoPayoutsList.length > 0 ? 'Live database synchronized' : 'No payout records found'}
                        </span>
                      </div>
                      <div className="bg-[#F8F5F0] border border-[#D8D2C4]/45 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                        <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400">This Month's Disbursals</span>
                        <h4 className="font-serif text-3xl font-extrabold text-[#7b0016] mt-2">
                          ₹{thisMonthDisbursals.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h4>
                        <span className="text-[8px] text-stone-500 mt-1">Active for {currentMonthName}</span>
                      </div>
                      <div className="bg-[#F8F5F0] border border-[#D8D2C4]/45 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
                        <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400">Previous Month Payouts</span>
                        <h4 className="font-serif text-3xl font-extrabold text-[#1B4332] mt-2">
                          ₹{prevMonthPayouts.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </h4>
                        <span className="text-[8px] text-stone-500 mt-1">Settled archive balances</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 mt-4">
                      <h3 className="font-serif text-lg text-[#1B4332] font-bold">Contribution History Ledger</h3>
                      <div className="flex flex-col gap-4">
                        {isFinanceLoading ? (
                          <div className="flex flex-col items-center justify-center p-12 gap-3">
                            <div className="w-8 h-8 border-2 border-[#D4A017] border-t-[#1B4332] rounded-full animate-spin" />
                            <p className="text-xs uppercase tracking-widest text-stone-500 font-bold font-sans">Syncing Ledger...</p>
                          </div>
                        ) : ngoPayoutsList && ngoPayoutsList.length > 0 ? (
                          ngoPayoutsList.map((donation) => (
                            <div
                              key={donation.id}
                              className="bg-[#F8F5F0] border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                            >
                              <div className="flex flex-col gap-1 text-left">
                                <span className="text-[10px] tracking-wider uppercase font-bold text-[#D4A017]">{donation.date}</span>
                                <h3 className="font-serif text-lg text-[#1B4332] font-bold mt-0.5">Donor: {donation.donor}</h3>
                                <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">{donation.type}</span>
                              </div>

                              <div className="flex items-center gap-6 self-start sm:self-auto">
                                <div className="text-right">
                                  <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-0.5">Amount</span>
                                  <span className="font-serif text-2xl font-extrabold text-[#7b0016]">{donation.amount}</span>
                                </div>
                                <div className="w-[1px] h-10 bg-[#D4A017]/20" />
                                <div>
                                  <span className="text-[9px] tracking-widest uppercase font-bold text-stone-400 block mb-1">Status</span>
                                  <span className="bg-[#1B4332]/10 border border-[#1B4332] text-[#1B4332] px-3.5 py-1 rounded-full text-[9px] font-sans tracking-widest font-extrabold uppercase text-center block">
                                    {donation.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center bg-[#F8F5F0]/50 border border-[#D4A017]/25 rounded-3xl p-10 text-center max-w-xl mx-auto my-4 gap-3.5 shadow-xs w-full">
                            <div className="w-12 h-12 rounded-full bg-white border border-[#D4A017]/30 flex items-center justify-center text-xl shadow-xs text-[#D4A017]">
                              📁
                            </div>
                            <h3 className="font-serif text-lg font-bold text-[#1B4332]">No Transaction History Recorded</h3>
                            <p className="text-stone-500 font-sans text-xs leading-relaxed max-w-md font-medium">
                              Your sanctuary registry does not have any processed administrative payout clearances or donation distribution records filed at this time.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {activeTab === 'alliance_messages' && viewMode === 'sanctuary' && (
                <motion.div
                  key="alliance-messages-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6 flex-grow"
                >
                  <div className="border-b border-stone-100 pb-4 shrink-0">
                    <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Alliance Adopter Inquiries</h2>
                    <p className="text-xs text-stone-500 font-sans mt-1">Securely processed inquiries and background details for pending pet adoptions.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 border border-[#D8D2C4]/45 rounded-2xl overflow-hidden min-h-[400px] bg-stone-50">
                    
                    <div className="md:col-span-5 bg-white border-r border-[#D8D2C4]/45 flex flex-col divide-y divide-stone-100 overflow-y-auto max-h-[420px]">
                      {ownerChatChannels.length === 0 ? (
                        <div className="p-6 text-center text-stone-400 font-sans text-xs italic">
                          No adopter enquiries found yet.
                        </div>
                      ) : (
                        ownerChatChannels.map((channel) => {
                          const isActive = ownerSelectedChannelId === channel.id;
                          return (
                            <button
                              key={channel.id}
                              type="button"
                              onClick={() => setOwnerSelectedChannelId(channel.id)}
                              className={`w-full p-4 text-left transition-all flex items-center gap-3.5 cursor-pointer border-none bg-transparent ${
                                isActive
                                  ? 'bg-[#F8F5F0] border-l-4 border-[#D4A017]'
                                  : 'hover:bg-stone-50 border-l-4 border-transparent'
                              }`}
                            >
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 bg-[#1B4332]/5 text-[#1B4332] border border-[#1B4332]/10">
                                {channel.avatar}
                              </div>
                              
                              <div className="flex-grow min-w-0">
                                <span className="font-serif text-xs sm:text-sm font-bold text-[#1B4332] block truncate">
                                  {channel.name}
                                </span>
                                <span className="text-[10px] text-[#7b0016] font-semibold uppercase tracking-wider block truncate mt-0.5">
                                  {channel.subtitle}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="md:col-span-7 flex flex-col justify-between h-[420px] bg-[#F8F5F0]/30 overflow-hidden">
                      
                      {activeOwnerChannel && (
                        <div className="p-3 bg-white border-b border-[#D8D2C4]/45 flex items-center gap-2 shrink-0 text-left">
                          <div className="w-6 h-6 rounded-full bg-[#1B4332]/10 text-[#1B4332] flex items-center justify-center text-xs">
                            {activeOwnerChannel.avatar || '👤'}
                          </div>
                          <span className="font-serif text-xs sm:text-sm font-bold text-[#1B4332] truncate">
                            {activeOwnerChannel.name}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col-reverse overflow-y-auto h-[450px] pr-2 max-h-[450px]">
                        {loadingMessages ? (
                          <div className="my-auto flex flex-col items-center gap-2">
                            <div className="w-6 h-6 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                            <p className="text-stone-400 text-[10px] font-semibold uppercase tracking-widest">Just a moment...</p>
                          </div>
                        ) : activeOwnerMessages.length === 0 ? (
                          <div className="my-auto text-center p-6 text-stone-400 font-sans text-xs italic">
                            No messages in this thread yet. Send a message to start the conversation!
                          </div>
                        ) : (
                          [...activeOwnerMessages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((msg, mIdx) => (
                            <div
                              key={mIdx}
                              className={`max-w-[85%] rounded-2xl p-3 text-xs font-sans shadow-sm flex flex-col mb-3 ${
                                msg.sender === 'user'
                                  ? 'bg-[#1B4332] text-white self-end rounded-br-none'
                                  : 'bg-white text-stone-800 self-start rounded-bl-none border border-[#D8D2C4]/25'
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              <span
                                className={`text-[8px] mt-1 text-right block ${
                                  msg.sender === 'user' ? 'text-white/60' : 'text-stone-400'
                                }`}
                              >
                                {msg.time}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <form onSubmit={handleSendMessage} className="p-3 border-t border-[#D8D2C4]/45 bg-white flex gap-2 shrink-0">
                        <input
                          type="text"
                          value={typedMessage}
                          onChange={(e) => setTypedMessage(e.target.value)}
                          placeholder="Type sanctuary enquiry reply..."
                          className="flex-grow bg-[#F8F5F0] border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-full py-2.5 px-4 text-xs focus:outline-none transition-colors text-stone-850 font-semibold"
                        />
                        <button
                          type="submit"
                          className="w-10 h-10 bg-[#7b0016] text-white rounded-full flex items-center justify-center hover:bg-[#1B4332] transition-colors border border-[#D4A017]/30 shrink-0 cursor-pointer"
                          aria-label="Send message"
                        >
                          <Send size={14} className="fill-current text-[#D4A017]" />
                        </button>
                      </form>

                    </div>

                  </div>
                </motion.div>
              )}

              {activeTab === 'ngo_reviews' && viewMode === 'sanctuary' && (
                <motion.div
                  key="ngo-reviews-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="border-b border-stone-100 pb-4">
                    <h2 className="font-serif text-2xl text-[#1B4332] font-bold">Reviews & Ratings</h2>
                    <p className="text-xs text-stone-500 font-sans mt-1">Real-time adopter feedback and star-ratings registered for your sanctuary.</p>
                  </div>
                  
                  {loadingNgoReviews ? (
                    <div className="py-12 flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
                      <p className="text-stone-500 text-xs font-semibold">Loading reviews...</p>
                    </div>
                  ) : ngoReviewsError ? (
                    <div className="py-12 text-center text-[#7b0016] text-xs font-bold font-sans uppercase">
                      ⚠️ {ngoReviewsError}
                    </div>
                  ) : (ngoReviews || []).length === 0 ? (
                    <div className="bg-[#F8F5F0] border border-dashed border-[#D8D2C4]/45 rounded-2xl p-12 text-center flex flex-col items-center w-full justify-center">
                      <Star className="text-stone-400 mb-2" size={24} />
                      <p className="font-serif text-base font-bold text-[#1B4332] mb-1">No Reviews Yet</p>
                      <p className="text-stone-400 text-xs">There are no reviews submitted for your sanctuary in our registry.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(ngoReviews || []).map((rev) => (
                        <div key={rev.reviewId || rev.id} className="bg-white border border-[#D8D2C4]/45 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-300 relative text-left">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-serif text-[#1B4332] font-bold text-sm">
                                  {rev.reviewer?.fullName || 'Anonymous Adopter'}
                                </h4>
                                <span className="text-[9px] text-stone-400 font-mono tracking-wider">#{rev.reviewer?.email}</span>
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
                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                              </span>
                            </div>
                            <p className="text-stone-650 font-sans text-xs leading-relaxed mt-2 italic">
                              "{rev.commentText}"
                            </p>
                          </div>
                          <div className="flex justify-end border-t border-stone-100 pt-3">
                            <button
                              onClick={() => handleDeleteNgoReview(rev.reviewId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7b0016]/10 text-[#7b0016] border border-[#7b0016]/20 rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider hover:bg-[#7b0016] hover:text-white transition-all cursor-pointer"
                            >
                              <Trash2 size={12} />
                              Remove Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

          </div>

        </div>

      </div>

      {viewMode !== 'admin' && sessionStorage.getItem('userRole') !== 'ADMIN' && 
       (activeUser?.role === 'ngo_owner' || (userOrg && (userOrg.isVerified === 'APPROVED' || userOrg.isVerified === 'Y'))) && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pb-3 pointer-events-none">
          <div className="pointer-events-auto bg-[#1B4332]/90 backdrop-blur-md border border-[#D4A017]/30 rounded-2xl px-5 py-2.5 flex items-center gap-4 shadow-2xl">
             <div className="w-[1px] h-5 bg-[#D4A017]/20" />
            <button
              onClick={() => {
                setDashboardMode('org');
                setIsVerifiedOverride(true);
                localStorage.setItem('devNgoOverride', 'true');
                setViewMode('sanctuary');
                setActiveTab('companion_inventory');
              }}
              className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300 font-sans cursor-pointer border ${
                dashboardMode === 'org'
                  ? 'bg-[#1B4332] border-[#D4A017] text-[#D4A017] shadow-sm'
                  : 'bg-transparent border-[#D4A017]/30 text-[#D4A017]/65 hover:text-[#D4A017] hover:border-[#D4A017]/60'
              }`}
            >
              {isVerifiedOverride ? '✓ SANCTUARY MODE ON' : 'SWITCH TO ORGANIZATION'}
            </button>
            <button
              onClick={() => {
                setDashboardMode('user');
                setIsVerifiedOverride(false);
                localStorage.setItem('devNgoOverride', 'false');
                setViewMode('patron');
                setActiveTab('profile');
              }}
              className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300 font-sans cursor-pointer border ${
                dashboardMode === 'user'
                  ? 'bg-[#1B4332] border-[#D4A017] text-[#D4A017] shadow-sm'
                  : 'bg-transparent border-[#D4A017]/30 text-[#D4A017]/65 hover:text-[#D4A017] hover:border-[#D4A017]/60'
              }`}
            >
              USER DASHBOARD
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isOrgModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F8F5F0] rounded-3xl w-full max-w-2xl border border-[#D4A017]/40 shadow-2xl p-8 sm:p-10 relative overflow-y-auto max-h-[92vh]"
            >
              <button
                onClick={() => setIsOrgModalOpen(false)}
                className="absolute top-5 right-5 text-stone-600 hover:text-[#7b0016] transition-colors z-20 cursor-pointer"
                aria-label="Close Onboarding Modal"
              >
                <X size={24} />
              </button>

              <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

              {orgSuccess ? (
                <div className="text-center py-6 flex flex-col items-center font-sans">
                  <Shield className="text-[#1B4332] stroke-[1.5] mb-4" size={48} />
                  <h3 className="font-serif text-2xl text-[#1B4332] font-bold mb-3">Onboarding Application Submitted</h3>
                  <p className="text-stone-500 text-xs sm:text-sm leading-relaxed mb-6">
                  Your sanctuary registration and profile details have been submitted. Our veterinary alliance board will verify your credentials and license details in the next 3 to 5 business days.
                  </p>
                  <button
                    onClick={() => {
                      setIsOrgModalOpen(false);
                      setOrgSuccess(false);
                    }}
                    className="bg-[#1B4332] text-white hover:bg-[#7b0016] px-8 py-2.5 rounded-full text-xs font-sans tracking-widest uppercase font-bold transition-all shadow-md cursor-pointer border border-[#D4A017]/20"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    console.log('Sanctuary Onboarding Application submitted to backend:', orgForm);

                    if (onboardingFiles.length > 3) {
                      alert("SECURITY/STORAGE VIOLATION: You can upload a maximum of 3 sanctuary gallery images!");
                      return;
                    }

                    try {
                      const formData = new FormData();
                      formData.append("orgName", orgForm.orgName);
                      formData.append("licenseNumber", orgForm.licenseNumber);
                      formData.append("location", orgForm.location);
                      
                      const rawDesc = orgForm.orgDescription || "";
                      const trimmedDesc = rawDesc.trim();
                      const sanctuaryDescription = trimmedDesc || "A newly registered boutique sanctuary.";
                      formData.append("sanctuaryDescription", sanctuaryDescription);

                      onboardingFiles.forEach((file) => {
                        formData.append("files", file);
                      });

                      const response = await apiClient.post('/orgs/add', formData, {
                        params: { userId: activeUser.userId },
                        headers: {
                          'Content-Type': 'multipart/form-data'
                        }
                      });

                      const galleryImages = (response.data.galleryImages || []).map((img) => ({
                        imageId: img.imageId,
                        imageUrl: img.imageUrl,
                        name: img.imageUrl ? img.imageUrl.split('/').pop() : 'image',
                        url: `http://localhost:9999${img.imageUrl}`
                      }));

                      const newOrgObj = {
                        id: `ngo-${response.data.orgId}`,
                        orgId: response.data.orgId,
                        name: response.data.orgName,
                        orgName: response.data.orgName,
                        licenseNumber: response.data.licenseNumber,
                        location: response.data.location,
                        isVerified: "PENDING", 
                        orgDescription: response.data.sanctuaryDescription || sanctuaryDescription,
                        description: response.data.sanctuaryDescription || sanctuaryDescription,
                        ownerEmail: activeUser?.email,
                        founded: new Date().getFullYear().toString(),
                        rating: 5.0, 
                        rescuesCount: 0, 
                        logo: "🐾",
                        orgImages: galleryImages
                      };

                      setAllianceOrgs(prev => [...prev, newOrgObj]);
                      setPendingOrgs(prev => [...prev, newOrgObj]);

                      localStorage.setItem('orgOnboardingStatus', 'initiated');
                      localStorage.setItem('onboardingOrgName', orgForm.orgName);
                      setOrgStatus('initiated');
                      setOrgAppStatus({ hasApplication: true, status: 'PENDING', orgName: orgForm.orgName });
                      setOrgSuccess(true);
                      setOnboardingFiles([]);
                    } catch (err) {
                      console.error("Failed to register organization:", err);
                      alert(err.response?.data?.message || err.message || "Failed to submit organization registration.");
                    }
                  }}
                  className="flex flex-col gap-4 font-sans text-left"
                >
                  <div>
                    <span className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#D4A017] uppercase font-bold mb-1">
                      <Sparkles size={12} />
                      ALLIANCE ONBOARDING SYSTEM
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#1B4332] font-bold leading-tight">
                    Alliance Onboarding Application
                    </h2>
                    <p className="text-stone-550 text-[10px] sm:text-xs font-semibold leading-relaxed mt-1.5">
                      Register New Organization. You will become the verified system administrator of this sanctuary upon veterinary board approval.
                    </p>
                    <div className="w-12 h-[1px] bg-[#D4A017] mt-3 mb-4" />
                  </div>

                  <input type="hidden" name="isVerified" value={orgForm.isVerified} />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Sanctuary Brand Name *</label>
                    <input
                      type="text"
                      required
                      name="orgName"
                      value={orgForm.orgName}
                      onChange={(e) => setOrgForm(prev => ({ ...prev, orgName: e.target.value }))}
                      placeholder="e.g., Royal Paws Haven"
                      className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Veterinary License Number *</label>
                    <input
                      type="text"
                      required
                      name="licenseNumber"
                      value={orgForm.licenseNumber}
                      onChange={(e) => setOrgForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      placeholder="e.g., LIC-8493-VET"
                      className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Physical Sanctuary Location *</label>
                    <input
                      type="text"
                      required
                      name="location"
                      value={orgForm.location}
                      onChange={(e) => setOrgForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Bandra, Mumbai"
                      className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Why Our Sanctuary Is Better *</label>
                    <textarea
                      rows={3}
                      required
                      name="orgDescription"
                      value={orgForm.orgDescription}
                      onChange={(e) => setOrgForm(prev => ({ ...prev, orgDescription: e.target.value }))}
                      placeholder="e.g., We offer open-canopy rehabilitation, fully vaccinated onboarding protocols, and 24/7 clinical coverage"
                      className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-850 font-semibold resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 font-sans">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Sanctuary Gallery Images *</label>
                    <label className="relative flex flex-col items-center justify-center gap-2 w-full bg-white border-2 border-dashed border-[#D4A017]/40 hover:border-[#D4A017]/70 focus-within:border-[#D4A017] rounded-lg py-4 px-3 cursor-pointer transition-all group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#D4A017] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Browse Gallery Files</span>
                      <span className="text-[9px] text-stone-400 font-semibold">Select multiple image files (JPG, PNG, WebP)</span>
                      <span className="text-[9px] text-red-500 font-semibold">Maximum 3 photos can be added</span>

                      <input
                        required
                        ref={orgImagesRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleOrgImagesChange}
                      />
                    </label>
                    {onboardingFiles.length > 0 && (
                      <div className="mt-2 text-[10px] text-[#1B4332] font-semibold text-center select-none font-sans">
                        🐾 {onboardingFiles.map(f => f.name).join(', ')} added.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={orgAppStatus.status === 'PENDING'}
                    className={`w-full py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-bold shadow-xl transition-all duration-300 mt-2 flex items-center justify-center gap-1.5 border border-[#D4A017]/30 cursor-pointer ${
                      orgAppStatus.status === 'PENDING'
                        ? 'bg-stone-300 text-stone-500 border-stone-200 cursor-not-allowed'
                        : 'bg-[#7b0016] text-[#F8F5F0] hover:bg-[#1B4332]'
                    }`}
                  >
                    SUBMIT FOR AUDIT
                  </button>

                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddCompanionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-[#F8F5F0]  w-full max-w-5xl border border-[#D4A017]/40 shadow-2xl p-8 sm:p-10 relative overflow-y-auto max-h-[92vh]"
            >
              <button
                onClick={() => setIsAddCompanionOpen(false)}
                className="absolute top-5 right-5 text-stone-600 hover:text-[#7b0016] transition-colors z-20 cursor-pointer"
                aria-label="Close Modal"
              >
                <X size={24} />
              </button>

              <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

              <form
                onSubmit={handleAddCompanion}
                className="flex flex-col gap-5 font-sans text-left"
              >
                <div>
                  <span className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-[#D4A017] uppercase font-bold mb-1">
                    <Sparkles size={12} />
                    SANCTUARY COMPANION SYSTEM
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#1B4332] font-bold leading-tight">
                    {editingCompanionId ? "Update Companion Profile" : "Register New Companion"}
                  </h2>
                  <p className="text-stone-550 text-[10px] sm:text-xs font-semibold leading-relaxed mt-1.5">
                    {editingCompanionId ? "Modify active animal details curated under your sanctuary's stewardship." : "Publish a new animal profile to the active Life of Paw alliance registry."}
                  </p>
                  <div className="w-12 h-[1px] bg-[#D4A017] mt-3" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div className="flex flex-col gap-4">

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Companion Name *</label>
                      <input
                        type="text"
                        required
                        value={newCompanion.name}
                        onChange={(e) => setNewCompanion(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Aurelius"
                        className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Species *</label>
                      <input
                        type="text"
                        required
                        value={newCompanion.species}
                        onChange={(e) => setNewCompanion(prev => ({ ...prev, species: e.target.value }))}
                        placeholder="e.g., Dog"
                        className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Breed</label>
                      <input
                        type="text"
                        value={newCompanion.breed}
                        onChange={(e) => setNewCompanion(prev => ({ ...prev, breed: e.target.value }))}
                        placeholder="e.g., Golden Retriever Mix"
                        className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Age / Stage</label>
                        <input
                          type="text"
                          value={newCompanion.age}
                          list="age-suggestions" 
                          onChange={(e) => setNewCompanion(prev => ({ ...prev, age: e.target.value }))}
                          placeholder="e.g., 3 yrs"
                          className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                        />
                        <datalist id="age-suggestions">
                          <option value="Puppy / Kitten" />
                          <option value="Young Adult" />
                          <option value="Adult" />
                          <option value="Senior" />
                        </datalist>

                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Gender</label>
                        <select
                          value={newCompanion.gender}
                          onChange={(e) => setNewCompanion(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-800 font-semibold cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Medical History *</label>
                        <input
                          required
                          type="text"
                          placeholder="Medical conditions and treatments"
                          value={newCompanion.medicalHistory || ''}
                          onChange={(e) => setNewCompanion({ ...newCompanion, medicalHistory: e.target.value })}
                          className="w-full min-w-[460px] bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 px-3 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                        />
                      </div>
                    </div>

                  </div>
                  <div className="flex flex-col gap-4">

          

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Companion Description</label>
                      <textarea
                        rows={7}
                        value={newCompanion.description}
                        onChange={(e) => setNewCompanion(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="e.g., A gentle, energetic companion who loves morning runs and open yards..."
                        className="w-full bg-white border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-3 px-3 text-sm focus:outline-none transition-colors text-stone-800 font-semibold resize-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 font-sans">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Companion Profile Image*</label>
                      <label className="relative flex flex-col items-center justify-center gap-2 w-full bg-white border-2 border-dashed border-[#D4A017]/40 hover:border-[#D4A017]/70 focus-within:border-[#D4A017] rounded-xl py-5 px-3 cursor-pointer transition-all group">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-[#D4A017] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 18h16.5M3.75 3.75h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6a2.25 2.25 0 012.25-2.25z" />
                        </svg>
                        <span className="text-[12px] tracking-widest uppercase font-bold text-stone-500">Choose Photo File</span>
                        <span className="text-[10px] text-stone-400 font-semibold">JPG, PNG or WebP accepted</span>
                        <span className="text-[10px] text-red-500 font-semibold">Only 1 photo can be added</span>
                        <input
                          ref={companionImageRef}
                          required={!editingCompanionId}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleAnimalImageChange}
                        />
                      </label>
                      {animalFile && (
                        <div className="mt-2 text-[10px] text-[#1B4332] font-semibold text-center select-none font-sans flex flex-col items-center gap-1.5">
                          <div>🐾 {animalFile.name} attached successfully</div>
                          <button
                            type="button"
                            onClick={() => {
                              if (companionImageRef.current) companionImageRef.current.value = "";
                              setAnimalFile(null);
                            }}
                            className="px-2.5 py-1 bg-[#7b0016] hover:bg-[#9B2226] text-white rounded-full text-[9px] uppercase font-bold tracking-wider transition-colors cursor-pointer border-none shadow-sm"
                          >
                            ✕ Remove Selected File
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

                <div className="flex flex-col gap-3 pt-1 border-t border-stone-100">

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Registry Status</label>
                    <div className="w-full bg-[#1B4332]/5 border border-[#1B4332]/25 rounded-lg py-2.5 px-4 text-sm text-[#1B4332] font-bold select-none flex items-center justify-between">
                      <span className="font-sans text-xs uppercase tracking-widest">AVAILABLE</span>
                      <span className="w-2 h-2 rounded-full bg-[#1B4332] animate-pulse" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#1B4332] text-[#F8F5F0] hover:bg-[#7b0016] py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-bold shadow-xl transition-all duration-300 flex items-center justify-center gap-1.5 border border-[#D4A017] cursor-pointer"
                  >
                    {editingCompanionId ? "UPDATE COMPANION PROFILE" : "PUBLISH COMPANION PROFILE"}
                  </button>

                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
