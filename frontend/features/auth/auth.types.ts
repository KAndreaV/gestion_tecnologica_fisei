export interface AuthUser {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthSession {
  token: string;
  user?: AuthUser | null;
}

export interface LoginApiResponse {
  token?: string;
  access_token?: string;
  jwt?: string;
  user?: AuthUser;
  message?: string;
}