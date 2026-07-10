import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, ShieldCheck, Heart, Phone, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, setAuthCredentials, clearAuthCredentials } from '../services/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'user',
    DOB: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    const savedToast = sessionStorage.getItem('toastMessage');
    if (savedToast) {
      setErrorMsg(savedToast);
      sessionStorage.removeItem('toastMessage');
    }
  }, []);

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length > 15) return;
      setRegisterData((prev) => ({
        ...prev,
        [name]: digits
      }));
      return;
    }
    setRegisterData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLogin) {
      if (!signInData.email || !signInData.password) {
        setErrorMsg('Please enter both credentials.');
        return;
      }

      try {
        setAuthCredentials(signInData.email, signInData.password);

        const profile = await apiClient.get('/users/me');

        const activeUser = {
          fullName: profile.data.fullName || "Life of Paw Member",
          email: profile.data.email,
          role: profile.data.role === 'org' ? 'ngo_owner' : profile.data.role, 
          userId: profile.data.userId,
          phone: profile.data.phone || ""
        };

        if (profile.data.role === 'admin') {
          sessionStorage.setItem("userRole", "ADMIN");
        }
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("activeUser", JSON.stringify(activeUser));
        
        const redirectTo = sessionStorage.getItem('redirectTo') || '/dashboard';
        sessionStorage.removeItem('redirectTo');
        navigate(redirectTo);
        
      } catch (err) {
        clearAuthCredentials();
        console.error("Login failed:", err);
        setErrorMsg(err.message || 'Invalid email or password credentials.');
      }
    } else {
      if (!registerData.fullName || !registerData.email || !registerData.password || !registerData.phone || !registerData.DOB) {
        setErrorMsg('All fields are required.');
        return;
      }

      if (registerData.email === "admin@gmail.com") {
        setErrorMsg('This email is reserved for administrative access.');
        return;
      }

      const phoneDigits = registerData.phone.replace(/\D/g, '');
      if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        setErrorMsg('Phone number must be between 7 and 15 digits.');
        return;
      }

      const dobDate = new Date(registerData.DOB);
      const dobYear = dobDate.getFullYear();
      const executionYear = 2026;
      let age = executionYear - dobYear;
      
      const executionMonth = 6;
      const executionDay = 4;
      if (dobDate.getMonth() > executionMonth || 
         (dobDate.getMonth() === executionMonth && dobDate.getDate() > executionDay)) {
        age--;
      }

      if (age < 14 || age > 100) {
        setErrorMsg('Registration requires account owners to be between 14 and 100 years old.');
        return;
      }

      try {
        const regPayload = {
          fullName: registerData.fullName,
          email: registerData.email,
          password: registerData.password,
          phone: phoneDigits,
          role: 'user',
          dob: registerData.DOB
        };
        await apiClient.post('/users/register', regPayload);

        setAuthCredentials(registerData.email, registerData.password);
        const profile = await apiClient.get('/users/me');

        const activeUser = {
          fullName: profile.data.fullName || "Life of Paw Member",
          email: profile.data.email,
          role: profile.data.role === 'org' ? 'ngo_owner' : profile.data.role,
          userId: profile.data.userId,
          phone: profile.data.phone || ""
        };

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("activeUser", JSON.stringify(activeUser));

        const redirectTo = sessionStorage.getItem('redirectTo') || '/dashboard';
        sessionStorage.removeItem('redirectTo');
        navigate(redirectTo);
        
      } catch (err) {
        clearAuthCredentials();
        console.error("Registration failed:", err);
        const serverError = err.response?.data?.message || err.response?.data?.error;
        setErrorMsg(serverError || err.message || 'Registration failed. Mobile or email might already be in use.');
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8F5F0] py-28 px-6 flex items-center justify-center overflow-hidden">
      <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-[#D4A017]/40 pointer-events-none" />
      <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-[#D4A017]/40 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-[#D4A017]/40 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-[#D4A017]/40 pointer-events-none" />

      <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[radial-gradient(#D4A017_2px,transparent_2px)] [background-size:24px_24px]" />

      <div className="max-w-md w-full relative z-10">
        
        <div className="text-center mb-8">
          <span className="flex items-center justify-center gap-1.5 text-[10px] tracking-[0.3em] text-[#D4A017] uppercase font-bold mb-3 font-sans">
            <Sparkles size={12} />
            Life of Paw Gateway
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1B4332] font-bold tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <div className="w-12 h-[1px] bg-[#D4A017] mx-auto mb-6" />
        </div>

        <motion.div
          layout
          className="bg-white rounded-3xl p-8 sm:p-10 border border-[#D4A017]/25 shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F8F5F0] rounded-full border border-stone-200/50 mb-8 font-sans">
            <button
              onClick={() => {
                setIsLogin(true);
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                isLogin
                  ? 'bg-[#1B4332] border border-[#D4A017]/30 text-white shadow-md'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setErrorMsg('');
              }}
              className={`py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                !isLogin
                  ? 'bg-[#1B4332] border border-[#D4A017]/30 text-white shadow-md'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Register
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 bg-[#7b0016]/10 border border-[#7b0016]/30 text-[#7b0016] rounded-xl py-3 px-4 text-xs font-sans font-bold text-center">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-sans">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A017]" />
                      <input
                        type="email"
                        required
                        name="email"
                        value={signInData.email}
                        onChange={handleSignInChange}
                        placeholder="patron@lifeofpaw.org"
                        className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline">
                      <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Password</label>
                     
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A017]" />
                      <input
                        type="password"
                        required
                        name="password"
                        value={signInData.password}
                        onChange={handleSignInChange}
                        placeholder="••••••••••••"
                        className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
               
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A017]" />
                      <input
                        type="text"
                        required
                        name="fullName"
                        value={registerData.fullName}
                        onChange={handleRegisterChange}
                        placeholder="Adeline Mountbatten"
                        className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Date Of Birth</label>
                    <div className="relative">
                      <Calendar size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A017]" />
                      <input
                        type="date"
                        required
                        name="DOB"
                        value={registerData.DOB}
                        onChange={handleRegisterChange}
                        min={`${new Date().getFullYear() - 100}-01-01`}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A017]" />
                      <input
                        type="email"
                        required
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="adeline@houseofpaws.com"
                        className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>
                  </div>              


                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A017]" />
                      <input
                        type="password"
                        required
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="••••••••••••"
                        className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] tracking-widest uppercase font-bold text-stone-500">Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A017]" />
                      <input
                        type="tel"
                        required
                        name="phone"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        placeholder="+91 99999 88888"
                        className="w-full bg-[#F8F5F0]/70 border border-[#D8D2C4]/60 hover:border-[#D4A017]/40 focus:border-[#D4A017] rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-colors text-stone-800 font-semibold"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full bg-[#7b0016] text-[#F8F5F0] hover:bg-[#1B4332] border border-[#D4A017]/30 py-4 rounded-full text-xs uppercase tracking-[0.25em] font-bold shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              <ShieldCheck size={14} className="text-[#D4A017]" />
              SUBMIT
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs text-stone-500 font-medium">
              {isLogin ? "Don't have a patron account?" : "Already registered as a member?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                }}
                className="font-bold text-[#7b0016] hover:text-[#1B4332] uppercase tracking-wider text-[11px]"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
