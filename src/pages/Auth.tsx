/* eslint-disable react-hooks/set-state-in-effect */
import { useState, type FormEvent, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import showIcon from '../assets/show password.svg';
import hideIcon from '../assets/hide password.svg';

const containerVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 25,
      mass: 0.8,
    },
  },
};

const formVariants = {
  hidden: { opacity: 0, x: -16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: 16,
    filter: 'blur(4px)',
    transition: { duration: 0.15 },
  },
};

export default function Auth() {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.includes('register') ? 'register' : 'login';

  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  const [regFullName, setRegFullName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState<boolean>(false);

  const [error, setError] = useState<string>('');

  const { login, register, googleLogin } = useAuth();

  useEffect(() => {
    setError('');
  }, [location.pathname]);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // განახლებული ენდფოინთი /api/auth/login
      await login(loginEmail, loginPassword);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Authorization failed.');
      } else {
        setError('unknown error');
      }
    }
  };

  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (regPassword !== regConfirmPassword) {
      return setError('Passwords do not match');
    }

    setError('');

    try {
      // განახლებული ენდფოინთი /api/auth/register
      await register(regFullName, regEmail, regPassword);
      navigate('/dashboard');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'რეგისტრაცია ვერ მოხერხდა');
      } else {
        setError('უცნობი შეცდომა');
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-md"
    >
      <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-blue-600/30 via-indigo-500/20 to-blue-600/30 opacity-70 blur-2xl pointer-events-none" />

      <div className="relative rounded-3xl border border-gray-800/80 bg-[#13151b]/70 p-8 text-white shadow-2xl backdrop-blur-md">
        <div className="relative mb-6 flex items-center justify-between rounded-2xl border border-gray-700/50 bg-[#1c1f26]/80 p-1.5">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className={`relative z-10 flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'login' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {activeTab === 'login' && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 -z-10 rounded-xl bg-blue-600 shadow-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            Login
          </button>

          <button
            type="button"
            onClick={() => navigate('/register')}
            className={`relative z-10 flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-200 ${
              activeTab === 'register' ? 'text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {activeTab === 'register' && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 -z-10 rounded-xl bg-blue-600 shadow-lg"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            Register
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8, scaleY: 0.9 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -8, scaleY: 0.9 }}
              transition={shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 500, damping: 30 }}
              style={{ transformOrigin: 'top' }}
              className="mb-4 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'login' ? (
            <motion.form
              key="login-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleLoginSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Email
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full rounded-xl border border-gray-700/60 bg-[#1c1f26]/60 p-3 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-xl border border-gray-700/60 bg-[#1c1f26]/60 p-3 pr-10 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 transition hover:opacity-100"
                  >
                    <img
                      src={showLoginPassword ? hideIcon : showIcon}
                      alt="toggle password"
                      className="h-5 w-5"
                    />
                  </button>
                </div>

                <div className="mt-1 flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-xs text-indigo-400 transition-colors hover:text-indigo-300 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500"
              >
                Login now
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="register-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleRegisterSubmit}
              className="space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-700/60 bg-[#1c1f26]/60 p-3 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Email
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full rounded-xl border border-gray-700/60 bg-[#1c1f26]/60 p-3 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-xl border border-gray-700/60 bg-[#1c1f26]/60 p-3 pr-10 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 transition hover:opacity-100"
                  >
                    <img
                      src={showRegPassword ? hideIcon : showIcon}
                      alt="toggle password"
                      className="h-5 w-5"
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-xl border border-gray-700/60 bg-[#1c1f26]/60 p-3 pr-10 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 transition hover:opacity-100"
                  >
                    <img
                      src={showRegConfirmPassword ? hideIcon : showIcon}
                      alt="toggle confirm password"
                      className="h-5 w-5"
                    />
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500"
              >
                Create An Account
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="my-6 flex items-center justify-between">
          <span className="w-1/5 border-b border-gray-800" />
          <span className="text-xs uppercase tracking-wider text-gray-500">OR</span>
          <span className="w-1/5 border-b border-gray-800" />
        </div>

        {/* Custom Premium Styled Google Button */}
        <motion.div
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="relative w-full overflow-hidden rounded-xl border border-gray-700/60 bg-[#1c1f26]/80 backdrop-blur-sm transition-all duration-200 hover:border-gray-500 hover:bg-[#232730]"
        >
          <div className="flex w-full items-center justify-center gap-3 py-3 px-4">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-200">
              Continue with Google
            </span>
          </div>

          <div className="absolute inset-0 opacity-0 cursor-pointer">
            <GoogleLogin
              onSuccess={async (credentialResponse: CredentialResponse) => {
                if (credentialResponse.credential) {
                  try {
                    await googleLogin(credentialResponse.credential);
                    navigate('/dashboard');
                  } catch {
                    setError('Google Authorization failed.');
                  }
                }
              }}
              onError={() => setError('Could not sign in with Google.')}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
