import request from './request';

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthUser = {
  id?: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function loginApi(credentials: AuthCredentials) {
  return request.post<AuthResponse, AuthResponse, AuthCredentials>(
    '/auth/login',
    credentials,
  );
}

export function registerApi(credentials: AuthCredentials) {
  return request.post<AuthResponse, AuthResponse, AuthCredentials>(
    '/auth/register',
    credentials,
  );
}
