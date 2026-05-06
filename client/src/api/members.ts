import client from './client';
import type { Member, Attendance } from '../types';

export interface MemberDetail extends Member {
  attendances: Attendance[];
}

export interface CreateMemberPayload {
  firstName: string;
  lastName: string;
  familyId: string;
  birthDate?: string;
  weight?: number;
}

export const getMembers = async (includeInactive = false): Promise<Member[]> => {
  const { data } = await client.get<Member[]>('/members', {
    params: { includeInactive: includeInactive ? 'true' : undefined },
  });
  return data;
};

export const getMember = async (id: string): Promise<MemberDetail> => {
  const { data } = await client.get<MemberDetail>(`/members/${id}`);
  return data;
};

export const createMember = async (payload: CreateMemberPayload): Promise<Member> => {
  const { data } = await client.post<Member>('/members', payload);
  return data;
};

export const updateMember = async (id: string, payload: Partial<CreateMemberPayload>): Promise<Member> => {
  const { data } = await client.put<Member>(`/members/${id}`, payload);
  return data;
};

export const deactivateMember = async (id: string): Promise<void> => {
  await client.patch(`/members/${id}/deactivate`);
};

export const makeMemberAutonomous = async (id: string): Promise<void> => {
  await client.post(`/members/${id}/make-autonomous`);
};

export const getMemberAttendances = async (id: string): Promise<Attendance[]> => {
  const { data } = await client.get<Attendance[]>(`/members/${id}/attendances`);
  return data;
};

export const uploadMemberPhoto = async (id: string, file: File): Promise<Member> => {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await client.post<Member>(`/members/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const updateMemberWeight = async (id: string, weight: number | null): Promise<Member> => {
  const { data } = await client.patch<Member>(`/members/${id}/weight`, { weight });
  return data;
};

export const reactivateMember = async (id: string): Promise<void> => {
  await client.patch(`/members/${id}/reactivate`);
};

export const changeMemberFamily = async (
  id: string,
  payload: { familyId?: string; isAutonomous?: boolean }
): Promise<void> => {
  await client.patch(`/members/${id}/change-family`, payload);
};
