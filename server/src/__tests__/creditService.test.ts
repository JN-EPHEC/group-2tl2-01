import { CreditPurchase, Attendance, Member } from '../models';
import {
  computeFamilyBalance,
  deductCredit,
  refundCredit,
  consumeCredit,
  refundCreditById,
  getAvailableCredits,
} from '../services/creditService';

jest.mock('../models');

const mockMember = (overrides = {}) => ({
  id: 'member-1',
  familyId: 'family-1',
  ...overrides,
} as any);

const mockCreditPurchase = (overrides = {}) => ({
  id: 'cp-1',
  remaining: 5,
  purchaseDate: '2026-01-01',
  createdAt: new Date(),
  update: jest.fn().mockResolvedValue(true),
  ...overrides,
} as any);

const mockAttendance = (overrides = {}) => ({
  id: 'att-1',
  creditPurchaseId: 'cp-1',
  ...overrides,
} as any);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('computeFamilyBalance', () => {
  it('retourne credits - dettes', async () => {
    (CreditPurchase.findAll as jest.Mock).mockResolvedValue([
      mockCreditPurchase({ remaining: 10 }),
      mockCreditPurchase({ remaining: 5 }),
    ]);
    (Member.findAll as jest.Mock).mockResolvedValue([{ id: 'm1' }, { id: 'm2' }]);
    (Attendance.count as jest.Mock).mockResolvedValue(3);
    const result = await computeFamilyBalance('family-1');
    expect(result).toBe(12);
  });

  it('retourne 0 si aucun membre dans la famille', async () => {
    (CreditPurchase.findAll as jest.Mock).mockResolvedValue([mockCreditPurchase({ remaining: 5 })]);
    (Member.findAll as jest.Mock).mockResolvedValue([]);
    const result = await computeFamilyBalance('family-1');
    expect(result).toBe(5);
  });

  it('peut retourner un solde négatif (dette)', async () => {
    (CreditPurchase.findAll as jest.Mock).mockResolvedValue([mockCreditPurchase({ remaining: 0 })]);
    (Member.findAll as jest.Mock).mockResolvedValue([{ id: 'm1' }]);
    (Attendance.count as jest.Mock).mockResolvedValue(3);
    const result = await computeFamilyBalance('family-1');
    expect(result).toBe(-3);
  });
});

describe('deductCredit', () => {
  it('déduit du premier lot disponible', async () => {
    const cp = mockCreditPurchase({ remaining: 3 });
    (CreditPurchase.findAll as jest.Mock).mockResolvedValue([cp]);
    const result = await deductCredit(mockMember());
    expect(cp.update).toHaveBeenCalledWith({ remaining: 2 });
    expect(result).toBe('cp-1');
  });

  it('retourne null si aucun crédit disponible', async () => {
    (CreditPurchase.findAll as jest.Mock).mockResolvedValue([
      mockCreditPurchase({ remaining: 0 }),
    ]);
    const result = await deductCredit(mockMember());
    expect(result).toBeNull();
  });

  it('choisit le lot FIFO (plus ancien en premier)', async () => {
    const old = mockCreditPurchase({ id: 'cp-old', remaining: 1, purchaseDate: '2026-01-01' });
    const recent = mockCreditPurchase({ id: 'cp-new', remaining: 5, purchaseDate: '2026-06-01' });
    (CreditPurchase.findAll as jest.Mock).mockResolvedValue([old, recent]);
    const result = await deductCredit(mockMember());
    expect(result).toBe('cp-old');
  });
});

describe('refundCredit', () => {
  it('rembourse un crédit quand creditPurchaseId est défini', async () => {
    const cp = mockCreditPurchase({ remaining: 2 });
    (CreditPurchase.findByPk as jest.Mock).mockResolvedValue(cp);
    await refundCredit(mockAttendance({ creditPurchaseId: 'cp-1' }));
    expect(cp.update).toHaveBeenCalledWith({ remaining: 3 });
  });

  it('ne fait rien si creditPurchaseId est null (dette)', async () => {
    await refundCredit(mockAttendance({ creditPurchaseId: null }));
    expect(CreditPurchase.findByPk).not.toHaveBeenCalled();
  });

  it('ne fait rien si le CreditPurchase est introuvable', async () => {
    (CreditPurchase.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(refundCredit(mockAttendance())).resolves.not.toThrow();
  });
});

describe('consumeCredit', () => {
  it('retourne null si membre introuvable', async () => {
    (Member.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await consumeCredit('member-404');
    expect(result).toBeNull();
  });

  it('déduit un crédit pour un membre existant', async () => {
    const cp = mockCreditPurchase({ remaining: 2 });
    (Member.findByPk as jest.Mock).mockResolvedValue(mockMember());
    (CreditPurchase.findAll as jest.Mock).mockResolvedValue([cp]);
    const result = await consumeCredit('member-1');
    expect(result).toBe('cp-1');
  });
});

describe('refundCreditById', () => {
  it('rembourse correctement par id', async () => {
    const cp = mockCreditPurchase({ remaining: 1 });
    (CreditPurchase.findByPk as jest.Mock).mockResolvedValue(cp);
    await refundCreditById('cp-1');
    expect(cp.update).toHaveBeenCalledWith({ remaining: 2 });
  });

  it('ne plante pas si l\'id est invalide', async () => {
    (CreditPurchase.findByPk as jest.Mock).mockResolvedValue(null);
    await expect(refundCreditById('invalid')).resolves.not.toThrow();
  });
});

describe('getAvailableCredits', () => {
  it('utilise computeFamilyBalance', async () => {
    (CreditPurchase.findAll as jest.Mock).mockResolvedValue([mockCreditPurchase({ remaining: 3 })]);
    (Member.findAll as jest.Mock).mockResolvedValue([{ id: 'm1' }]);
    (Attendance.count as jest.Mock).mockResolvedValue(1);
    const result = await getAvailableCredits(mockMember());
    expect(result).toBe(2);
  });
});
