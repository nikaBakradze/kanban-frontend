export interface User {
  id: number;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}