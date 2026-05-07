export interface ImportResult {
  created: number;
  skipped: number;
  errors: string[];
}

export const importFamilies = async (file: File): Promise<ImportResult> => ({ created: 0, skipped: 0, errors: [] });
export const importMembers = async (file: File): Promise<ImportResult> => ({ created: 0, skipped: 0, errors: [] });