import { GoogleOAuthProvider } from '@react-oauth/google';
import Auth from './Auth';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "529445039101-32tto4o7noirm1vvndnvnl9fl9h0klds.apps.googleusercontent.com";

export default function AuthRoute() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Auth />
    </GoogleOAuthProvider>
  );
}
