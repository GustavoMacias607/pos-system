export type LoginCredentials = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthenticatedLoginData = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type TwoFactorRequiredData = {
  requiresTwoFactor: true;
  userId: number;
};

export type LoginData = AuthenticatedLoginData | TwoFactorRequiredData;

export type LoginResponse = {
  success: true;
  data: LoginData;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
};
