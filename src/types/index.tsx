export interface User {
  id: number;
  full_name: string;
  email: string;
  avatar_url?: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}