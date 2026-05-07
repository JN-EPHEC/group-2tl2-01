import client from './client';

export interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

const uploadFile = async (endpoint: string, file: File): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post<ImportResult>(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const importFamilies = (file: File): Promise<ImportResult> =>
  uploadFile('/import/families', file);

export const importMembers = (file: File): Promise<ImportResult> =>
  uploadFile('/import/members', file);