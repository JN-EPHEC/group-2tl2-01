import client from './client';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportFamilies = async (): Promise<void> => {
  const { data } = await client.get('/export/families', { responseType: 'blob' });
  downloadBlob(data, 'familles.xlsx');
};

export const exportMembers = async (): Promise<void> => {
  const { data } = await client.get('/export/members', { responseType: 'blob' });
  downloadBlob(data, 'membres.xlsx');
};

export const exportAttendances = async (): Promise<void> => {
  const { data } = await client.get('/export/attendances', { responseType: 'blob' });
  downloadBlob(data, 'presences.xlsx');
};

export const exportCredits = async (): Promise<void> => {
  const { data } = await client.get('/export/credits', { responseType: 'blob' });
  downloadBlob(data, 'credits.xlsx');
};

export const exportActivityLog = async (): Promise<void> => {
  const { data } = await client.get('/export/activity-log', { responseType: 'blob' });
  downloadBlob(data, 'journal-activite.xlsx');
};
