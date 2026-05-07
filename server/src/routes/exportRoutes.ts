import { Router } from 'express';
import {
  exportFamilies, exportMembers, exportAttendances, exportCredits, exportActivityLog,
} from '../controllers/exportController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const router = Router();
router.use(jwtAuth, roleCheck('admin'));

/**
 * @swagger
 * /export/families:
 *   get:
 *     tags: [Export]
 *     summary: Exporter les familles (Excel)
 *     description: >
 *       Génère et télécharge un fichier Excel `.xlsx` contenant toutes les familles
 *       avec leur solde de crédits actuel. Admin seulement.
 *     responses:
 *       200:
 *         description: Fichier Excel téléchargeable
 *         headers:
 *           Content-Disposition:
 *             schema: { type: string, example: 'attachment; filename="familles.xlsx"' }
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/families', exportFamilies);

/**
 * @swagger
 * /export/members:
 *   get:
 *     tags: [Export]
 *     summary: Exporter les membres (Excel)
 *     description: >
 *       Génère un fichier Excel `.xlsx` avec la liste complète des membres
 *       (prénom, nom, famille, date de naissance, poids, statut, autonomie).
 *     responses:
 *       200:
 *         description: Fichier Excel téléchargeable
 *         headers:
 *           Content-Disposition:
 *             schema: { type: string, example: 'attachment; filename="membres.xlsx"' }
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/members', exportMembers);

/**
 * @swagger
 * /export/attendances:
 *   get:
 *     tags: [Export]
 *     summary: Exporter l'historique des présences (Excel)
 *     description: >
 *       Génère un fichier Excel `.xlsx` avec toutes les présences enregistrées
 *       (membre, type de cours, date, heure), triées de la plus récente à la plus ancienne.
 *     responses:
 *       200:
 *         description: Fichier Excel téléchargeable
 *         headers:
 *           Content-Disposition:
 *             schema: { type: string, example: 'attachment; filename="presences.xlsx"' }
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/attendances', exportAttendances);

/**
 * @swagger
 * /export/credits:
 *   get:
 *     tags: [Export]
 *     summary: Exporter l'historique des crédits (Excel)
 *     description: >
 *       Génère un fichier Excel `.xlsx` avec tous les achats de crédits
 *       (famille ou membre autonome, montant ajouté, restant, note, date, ajouté par).
 *     responses:
 *       200:
 *         description: Fichier Excel téléchargeable
 *         headers:
 *           Content-Disposition:
 *             schema: { type: string, example: 'attachment; filename="credits.xlsx"' }
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/credits', exportCredits);

/**
 * @swagger
 * /export/activity-log:
 *   get:
 *     tags: [Export]
 *     summary: Exporter le journal d'activité (Excel)
 *     description: >
 *       Génère un fichier Excel `.xlsx` avec la totalité du journal d'activité
 *       (date, utilisateur, action, détails), trié du plus récent au plus ancien.
 *     responses:
 *       200:
 *         description: Fichier Excel téléchargeable
 *         headers:
 *           Content-Disposition:
 *             schema: { type: string, example: 'attachment; filename="journal.xlsx"' }
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema: { type: string, format: binary }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/activity-log', exportActivityLog);


export default router;



