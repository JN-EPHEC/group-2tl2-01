import { ActivityLog } from '../models';
import { log, logActivity } from '../services/activityLogService';

jest.mock('../models');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('log', () => {
  it('crée un ActivityLog avec tous les champs', async () => {
    (ActivityLog.create as jest.Mock).mockResolvedValue({});

    await log('user-1', 'CREATE_FAMILY', 'Création famille Dupont', 'Family', 'family-1');

    expect(ActivityLog.create).toHaveBeenCalledWith({
      userId: 'user-1',
      action: 'CREATE_FAMILY',
      details: 'Création famille Dupont',
      targetType: 'Family',
      targetId: 'family-1',
    });
  });

  it('accepte userId null (action système)', async () => {
    (ActivityLog.create as jest.Mock).mockResolvedValue({});

    await log(null, 'SYSTEM_ACTION');

    expect(ActivityLog.create).toHaveBeenCalledWith({
      userId: null,
      action: 'SYSTEM_ACTION',
      details: null,
      targetType: null,
      targetId: null,
    });
  });

  it('ne plante pas si ActivityLog.create échoue', async () => {
    (ActivityLog.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    await expect(log('user-1', 'ACTION')).resolves.not.toThrow();
  });
});

describe('logActivity', () => {
  it('est un alias de log et fonctionne de la même façon', async () => {
    (ActivityLog.create as jest.Mock).mockResolvedValue({});

    await logActivity('user-2', 'UPDATE_MEMBER', 'Modification poids', 'Member', 'member-1');

    expect(ActivityLog.create).toHaveBeenCalledWith({
      userId: 'user-2',
      action: 'UPDATE_MEMBER',
      details: 'Modification poids',
      targetType: 'Member',
      targetId: 'member-1',
    });
  });
});