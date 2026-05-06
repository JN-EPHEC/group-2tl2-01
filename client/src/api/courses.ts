import client from './client';
import type { Course, Attendance } from '../types';

export interface CourseDetail extends Course {
  attendances: Attendance[];
}

export interface CreateCoursePayload {
  date: string;
  time: string;
  courseTypeId: string;
  notes?: string;
}

export interface CoursesFilter {
  from?: string;
  to?: string;
  courseTypeId?: string;
}

export const getCourses = async (filter?: CoursesFilter): Promise<Course[]> => {
  const { data } = await client.get<Course[]>('/courses', { params: filter });
  return data;
};

export const getCourse = async (id: string): Promise<CourseDetail> => {
  const { data } = await client.get<CourseDetail>(`/courses/${id}`);
  return data;
};

export const createCourse = async (payload: CreateCoursePayload): Promise<Course> => {
  const { data } = await client.post<Course>('/courses', payload);
  return data;
};

export const updateCourse = async (id: string, payload: Partial<CreateCoursePayload>): Promise<Course> => {
  const { data } = await client.put<Course>(`/courses/${id}`, payload);
  return data;
};

export const addAttendances = async (courseId: string, memberIds: string[]): Promise<Attendance[]> => {
  const { data } = await client.post<Attendance[]>(`/courses/${courseId}/attendances`, { memberIds });
  return data;
};

export const removeAttendance = async (courseId: string, memberId: string): Promise<void> => {
  await client.delete(`/courses/${courseId}/attendances/${memberId}`);
};
