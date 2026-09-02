import { useState, useEffect, type JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { useAuth, AuthProvider } from './context/AuthContext';
import { KanbanProvider } from './context/KanbanContext';
import bgSvg from './assets/bg.svg';
import kanbanLogo from './assets/kanban-logo.svg';
import { MotionConfig, useReducedMotion } from 'framer-motion';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [showSplash, setShowSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [revealText, setRevealText] = useState(false);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 100);

    const textTimer = setTimeout(() => {
      setRevealText(true);
    }, 800);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3700);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(textTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  return (
    <Router>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <KanbanProvider>
            {showSplash && (
              <div
                className={`fixed inset-0 z-9999 flex items-center justify-center bg-[#000000] transition-opacity ${
                  shouldReduceMotion ? 'duration-0' : 'duration-700'
                } ease-in-out ${
                  fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
              >
                <div className="flex items-center space-x-5 relative">
                  <img
                    src={kanbanLogo}
                    alt="Kanban Logo"
                    className={`w-12 h-12 md:w-16 md:h-16 transition-all duration-700 ease-out transform ${
                      showLogo
                        ? 'opacity-100 scale-100 translate-x-0'
                        : 'opacity-0 scale-50 -translate-x-10'
                    }`}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  />

                  <h1
                    className={`text-4xl md:text-6xl font-bold tracking-tight text-white transform transition-[transform,opacity] ${
                      shouldReduceMotion ? 'duration-0' : 'duration-700'
                    } ease-out ${
                      revealText ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                    }`}
                  >
                    Kanban
                  </h1>
                </div>
              </div>
            )}

          <div 
            className="min-h-screen bg-black bg-cover bg-center bg-no-repeat bg-fixed flex items-center justify-center p-4 relative overflow-hidden"
            style={{ backgroundImage: `url(${bgSvg})` }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/register" replace />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </div>
          </KanbanProvider>
        </AuthProvider>
      </MotionConfig>
    </Router>
  );
}