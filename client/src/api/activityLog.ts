import client from './client';
import type { ActivityLogEntry } from '../types';

export interface ActivityLogResponse {
  data: ActivityLogEntry[];
  total: number;
  page: number;
  limit: number;
}

export const getActivityLog = async (page = 1, limit = 50): Promise<ActivityLogResponse> => {
  const { data } = await client.get<ActivityLogResponse>('/activity-log', {
    params: { page, limit },
  });
  return data;
};