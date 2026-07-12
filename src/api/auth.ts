import type { StoredAuth } from '../store/authStorage';

import request from './request';

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthResponse = StoredAuth;

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
