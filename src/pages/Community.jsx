import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, X, Sparkles, AlertCircle, PawPrint } from 'lucide-react';
import { apiCall, apiClient, API_BASE_URL } from '../services/api';

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const secondsDiff = Math.floor((now - date) / 1000);
  
  if (secondsDiff < 60) return 'Just now';
  const minutesDiff = Math.floor(secondsDiff / 60);
  if (minutesDiff < 60) return `${minutesDiff}m ago`;
  const hoursDiff = Math.floor(minutesDiff / 60);
  if (hoursDiff < 24) return `${hoursDiff}h ago`;
  const daysDiff = Math.floor(hoursDiff / 24);
  if (daysDiff < 7) return `${daysDiff}d ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const fallbackMockPosts = [
  {
    id: 'mock-3',
    author: 'Clara Oswald',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    email: 'clara@gmail.com',
    isAdmin: false,
    content: 'Found a stray kitten near the North Avenue park. She looks healthy but scared. If anyone has foster space or recognizes her, please let me know!',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
  },
  {
    id: 'mock-2',
    author: 'Marcus Vance (Super Admin)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    email: 'admin@gmail.com',
    isAdmin: true,
    content: 'We are hosting a community adoption drive this Saturday at 10 AM. Volunteers and foster parents are welcome to join. Please register on the Dashboard.',
    imageUrl: '',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
  },
  {
    id: 'mock-1',
    author: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
    email: 'elena@gmail.com',
    isAdmin: false,
    content: 'Just adopted Barnaby today! He is settling in perfectly. Thank you to the Sanctuary Alliance for making the transition so smooth. Crate training begins tonight!',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  }   
];

const MessageItem = ({ post }) => {
  return (
    <div 
      id={`msg-card-${post.id}`}
      className={`transition-all duration-300 font-sans border-b border-stone-100 last:border-none pb-5 ${
        post.isAdmin 
          ? 'bg-[#D4A017]/5 border-l-4 border-[#D4A017] rounded-r-2xl p-4 sm:p-5 my-2 shadow-sm' 
          : 'bg-transparent py-3'
      }`}
    >
      <div className="flex items-start gap-4">
        {post.avatar && post.avatar.startsWith('http') ? (
          <img
            src={post.avatar}
            alt={post.author}
            className="w-10 h-10 rounded-full object-cover border border-[#D4A017]/25 shrink-0 shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#1B4332] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#D4A017]/35 shadow-sm">
            {post.author.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-grow min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1.5">
            <span className="font-sans font-bold text-sm text-[#1B4332]">
              {post.author}
            </span>
            {post.isAdmin && (
              <span className="bg-[#D4A017]/20 text-[#6a0d10] text-[8px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded-full border border-[#D4A017]/40 shadow-xs mr-2">
                ADMIN
              </span>
            )}
            <span className="text-[10px] text-stone-400 font-sans">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>

          <p className="text-stone-750 text-sm leading-relaxed break-words pr-2 font-medium">
            {post.content}
          </p>

          {post.imageUrl && (
            <img
              src={post.imageUrl.startsWith('http') ? post.imageUrl : `${API_BASE_URL}${post.imageUrl}`}
              alt="Community post attachment"
              className="rounded-xl max-h-72 object-cover border border-stone-200 mt-3 block shadow-sm hover:shadow-md transition-shadow max-w-full sm:max-w-lg"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const feedContainerRef = useRef(null);

  const [searchParams] = useSearchParams();
  const highlightMsgId = searchParams.get('highlightMsgId');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (highlightMsgId && posts.length > 0) {
      setTimeout(() => {
        const targetElement = document.getElementById(`msg-card-${highlightMsgId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          targetElement.classList.add('animate-pulse-gold');
        }
      }, 150);
    }
  }, [highlightMsgId, posts]);

  const activeUser = JSON.parse(sessionStorage.getItem('user_session')) || JSON.parse(sessionStorage.getItem('activeUser'));
  const isAuthenticated = !!activeUser;

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/social/community-feed');
      
      const adapted = data.map(msg => {
        return {
          id: msg.msgId,
          author: msg.sender?.fullName || 'Anonymous Patron',
          avatar: msg.sender?.avatar || '',
          email: msg.sender?.email || '',
          isAdmin: msg.sender?.role === 'admin' || msg.sender?.role === 'ADMIN' || msg.sender?.email === 'admin@gmail.com' || msg.msgType === 'ANNOUNCEMENT',
          content: msg.content || '',
          imageUrl: msg.imageUrl || '',
          created_at: msg.createdAt || new Date().toISOString()
        };
      });

      const sorted = adapted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      const defaultSortedFallback = fallbackMockPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setPosts(sorted.length > 0 ? sorted : defaultSortedFallback);
    } catch (err) {
      console.error("Failed to load community feed:", err);
      const defaultSortedFallback = fallbackMockPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setPosts(defaultSortedFallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    if (posts.length > 0 && !highlightMsgId) {
      const scrollTimer = setTimeout(() => {
        scrollToBottom(true);
      }, 150);
      return () => clearTimeout(scrollTimer);
    }
  }, [posts, highlightMsgId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!isAuthenticated) {
      setErrorMessage("Please login or register to communicate.");
      return;
    }

    if (!content.trim() && !attachedFile) {
      setErrorMessage("Message content cannot be empty.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      if (attachedFile) {
        formData.append('file', attachedFile);
      }
      
      const url = `/social/post-to-feed?content=${encodeURIComponent(content.trim())}&type=COMMUNITY`;
      
      await apiClient.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setContent('');
      removeAttachedFile();
      setErrorMessage('');
      
      await fetchFeed();
    } catch (err) {
      console.error("Failed to post message:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Failed to publish message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F5F0] py-28 px-6 sm:px-8 lg:px-12">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A017]/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1B4332]/5 rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="flex items-center justify-center gap-1.5 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 font-sans">
            <Sparkles size={12} className="animate-pulse" />
            LIFE OF PAW ALLIANCE
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-[#1B4332] font-bold tracking-tight mb-4">
            Community <span className="text-[#9B2226] font-light italic">Feed Wall</span>
          </h1>
          <div className="w-16 h-[1px] bg-[#D4A017] mx-auto mb-6" />
          <p className="text-stone-600 font-sans text-sm leading-relaxed">
            Connect with our animal welfare advocates, share your adoption stories, ask veterinary recovery questions, or browse updates from verified rescue organizations.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md border border-[#D8D2C4]/60  shadow-xl overflow-hidden flex flex-col h-[100vh] min-h-[500px]">
          
          <div 
            ref={feedContainerRef}
            className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-[#1B4332] scrollbar-track-stone-100"
          >
            {loading && posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-8 h-8 border-2 border-[#D4A017] border-t-[#1B4332] rounded-full animate-spin" />
                <p className="text-xs uppercase tracking-widest text-stone-500 font-bold font-sans">Syncing Feed...</p>
              </div>
            ) : (
              posts.map((post) => (
                <MessageItem key={post.id} post={post} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#D8D2C4]/50 bg-stone-50/50 p-4 md:p-6 relative">
            {errorMessage && (
              <div className="mb-3 p-3 bg-[#6a0d10]/10 border border-[#6a0d10]/30 rounded-xl flex items-center gap-2 text-xs text-[#6a0d10] font-sans font-semibold">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mb-4 p-3.5 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-xl text-center text-xs text-stone-700 font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                <span>If you want to send a message, please</span>
                <Link to="/login" className="text-[#9B2226] hover:underline">register or login</Link>.
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-3 md:gap-4 relative">
              <div className="flex-grow flex flex-col gap-2 bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus-within:border-[#D4A017] rounded-2xl p-2.5 transition-colors">
                
                {imagePreview && (
                  <div className="relative inline-block w-20 h-20 rounded-lg overflow-hidden border border-stone-200 shadow-sm mb-2 shrink-0">
                    <img src={imagePreview} alt="Attachment preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeAttachedFile}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/85 text-white w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <textarea
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={isAuthenticated ? "Share your thoughts..." : "If you want to send a message, please register or login."}
                  disabled={!isAuthenticated}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm text-stone-850 placeholder-stone-400 font-sans focus:ring-0 p-1"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={!isAuthenticated}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!isAuthenticated}
                  className={`p-3.5 rounded-full border border-[#D8D2C4]/60 bg-white hover:bg-stone-50 text-stone-500 hover:text-[#1B4332] transition-colors cursor-pointer shadow-sm ${
                    !isAuthenticated && 'opacity-50 cursor-not-allowed'
                  }`}
                  title="Add Image"
                >
                  <Image size={18} />
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1B4332] hover:bg-[#9B2226] p-3.5 rounded-full border border-[#D4A017]/35 shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer flex items-center justify-center"
                  title="Send Message"
                >
                  <PawPrint className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Community;
