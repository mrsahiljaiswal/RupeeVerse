export interface UserData {
  username: string;
  email: string;
  finalBalance: number;
}

export interface AuthResponse {
  token: string;
  user: UserData;
}

export interface CurrentUserResponse {
  status: string;
  message: string;
  data: {
    username: string;
    email: string;
    finalBalance: number;
  };
  timestamp: string;
} 