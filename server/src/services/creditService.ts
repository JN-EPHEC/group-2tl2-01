import { CreditPurchase, Attendance, Member } from '../models';
import { Op } from 'sequelize';

/**
 * Calcule le solde réel d'une famille :
 *   solde = somme des CreditPurchase.remaining
 *         - nombre de présences sans crédit (creditPurchaseId = null)
 */
export const computeFamilyBalance = async (familyId: string): Promise<number> => {
  const purchases = await CreditPurchase.findAll({ where: { familyId } });
  const creditBalance = purchases.reduce((sum, p) => sum + p.remaining, 0);

  const familyMembers = await Member.findAll({
    where: { familyId },
    attributes: ['id'],
  });
  const memberIds = familyMembers.map(m => m.id);

  const debtCount =
    memberIds.length > 0
      ? await Attendance.count({
          where: { memberId: { [Op.in]: memberIds }, creditPurchaseId: null },
        })
      : 0;

  return creditBalance - debtCount;
};

/**
 * Déduit un crédit depuis le lot disponible.
 * FIXME: le tri par createdAt ne garantit pas le vrai ordre FIFO (purchaseDate).
 */
export const deductCredit = async (member: Member): Promise<string | null> => {
  const allPurchases = await CreditPurchase.findAll({
    where: { familyId: member.familyId },
    order: [['createdAt', 'ASC']],
  });

  const creditPurchase = allPurchases.find(cp => cp.remaining > 0) || null;
  if (!creditPurchase) return null;

  await creditPurchase.update({ remaining: creditPurchase.remaining - 1 });
  return creditPurchase.id;
};

/**
 * Rembourse un crédit lorsqu'une présence est supprimée.
 */
export const refundCredit = async (attendance: Attendance): Promise<void> => {
  if (!attendance.creditPurchaseId) return;

  const creditPurchase = await CreditPurchase.findByPk(attendance.creditPurchaseId);
  if (!creditPurchase) return;

  await creditPurchase.update({ remaining: creditPurchase.remaining + 1 });
};

export const consumeCredit = async (memberId: string): Promise<string | null> => {
  const member = await Member.findByPk(memberId);
  if (!member) return null;
  return deductCredit(member);
};

export const refundCreditById = async (creditPurchaseId: string): Promise<void> => {
  const creditPurchase = await CreditPurchase.findByPk(creditPurchaseId);
  if (!creditPurchase) return;
  await creditPurchase.update({ remaining: creditPurchase.remaining + 1 });
};

export const getAvailableCredits = async (member: Member): Promise<number> => {
  return computeFamilyBalance(member.familyId);
};

export const getFamilyTotalCredits = async (familyId: string): Promise<number> => {
  return computeFamilyBalance(familyId);
};