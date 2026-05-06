import client from './client';
import type { Family, Member, CreditPurchase, Attendance } from '../types';

export interface FamilyDetail extends Family {
  members: Member[];
  creditHistory: CreditPurchase[];
}

export interface CreateFamilyPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  // Responsible user account (required for new family creation)
  responsibleFirstName: string;
  responsibleLastName: string;
  responsibleEmail: string;
  responsiblePassword: string;
}

export interface AddCreditsPayload {
  amount: number;
  note?: string;
}

export const getFamilies = async (): Promise<Family[]> => {
  const { data } = await client.get<Family[]>('/families');
  return data;
};

export const getFamily = async (id: string): Promise<FamilyDetail> => {
  const { data } = await client.get<FamilyDetail>(`/families/${id}`);
  return data;
};

export const createFamily = async (payload: CreateFamilyPayload): Promise<Family> => {
  const { data } = await client.post<Family>('/families', payload);
  return data;
};

export const updateFamily = async (id: string, payload: { name?: string; phone?: string; email?: string; address?: string }): Promise<Family> => {
  const { data } = await client.put<Family>(`/families/${id}`, payload);
  return data;
};

export const deactivateFamily = async (id: string): Promise<void> => {
  await client.patch(`/families/${id}/deactivate`);
};

export const addCredits = async (id: string, payload: AddCreditsPayload): Promise<void> => {
  await client.post(`/families/${id}/credits`, payload);
};

export const getFamilyAttendances = async (id: string): Promise<Attendance[]> => {
  const { data } = await client.get<Attendance[]>(`/families/${id}/attendances`);
  return data;
};

export const updateFamilyContact = async (id: string, payload: { phone?: string; email?: string }): Promise<void> => {
  await client.patch(`/families/${id}/contact`, payload);
};

export const getFamilyMembers = async (id: string): Promise<Member[]> => {
  const family = await getFamily(id);
  return family.members ?? [];
};