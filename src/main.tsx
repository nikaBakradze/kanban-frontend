import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "529445039101-32tto4o7noirm1vvndnvnl9fl9h0klds.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </HashRouter>
  </StrictMode>,
);
