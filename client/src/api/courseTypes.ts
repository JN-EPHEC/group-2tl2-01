import client from './client';
import type { CourseType } from '../types';

export interface CreateCourseTypePayload {
  name: string;
  color?: string;
}

export const getCourseTypes = async (includeInactive = false): Promise<CourseType[]> => {
  const { data } = await client.get<CourseType[]>('/course-types', {
    params: includeInactive ? { includeInactive: 'true' } : undefined,
  });
  return data;
};

export const createCourseType = async (payload: CreateCourseTypePayload): Promise<CourseType> => {
  const { data } = await client.post<CourseType>('/course-types', payload);
  return data;
};

export const updateCourseType = async (id: string, payload: Partial<CreateCourseTypePayload>): Promise<CourseType> => {
  const { data } = await client.put<CourseType>(`/course-types/${id}`, payload);
  return data;
};

export const deactivateCourseType = async (id: string): Promise<void> => {
  await client.patch(`/course-types/${id}/deactivate`);
};

export const reactivateCourseType = async (id: string): Promise<void> => {
  await client.patch(`/course-types/${id}/reactivate`);
};