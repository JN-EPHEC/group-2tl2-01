import { ActivityLog } from '../models';

export const logActivity = async (
  userId: string | null,
  action: string,
  details?: string,
  targetType?: string,
  targetId?: string
): Promise<void> => log(userId, action, details, targetType, targetId);

export const log = async (
  userId: string | null,
  action: string,
  details?: string,
  targetType?: string,
  targetId?: string
): Promise<void> => {
  try {
    await ActivityLog.create({
      userId: userId || null,
      action,
      details: details || null,
      targetType: targetType || null,
      targetId: targetId || null,
    });
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du log d\'activité:', err);
  }
};