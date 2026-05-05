import client from './client';
import type { User } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const { data } = await client.post<LoginResponse>('/auth/login', credentials);
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await client.get<User>('/auth/me');
  return data;
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await client.post('/auth/change-password', payload);
};

export const updateEmail = async (email: string, currentPassword: string): Promise<void> => {
  await client.patch('/auth/me', { email, currentPassword });
};

export const logout = async (): Promise<void> => {
  await client.post('/auth/logout');
};
