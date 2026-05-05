import client from './client';
import type { User, UserRole } from '../types';

export interface CreateUserPayload {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  familyId?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const { data } = await client.get<User[]>('/users');
  return data;
};

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const { data } = await client.post<User>('/users', payload);
  return data;
};

export const updateUser = async (id: string, payload: Partial<CreateUserPayload>): Promise<User> => {
  const { data } = await client.put<User>(`/users/${id}`, payload);
  return data;
};

export const deactivateUser = async (id: string): Promise<void> => {
  await client.patch(`/users/${id}/deactivate`);
};

export const reactivateUser = async (id: string): Promise<void> => {
  await client.patch(`/users/${id}/reactivate`);
};

export const forcePasswordReset = async (id: string): Promise<void> => {
  await client.post(`/users/${id}/force-password-reset`);
};
