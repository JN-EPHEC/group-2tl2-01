import { Router } from 'express';
import {
  getFamilies, createFamily, getFamily, updateFamily, deactivateFamily, addCredits, getFamilyAttendances, updateFamilyContact,
} from '../controllers/familyController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const router = Router();
router.use(jwtAuth);

/**
 * @swagger
 * /families:
 *   get:
 *     tags: [Familles]
 *     summary: Lister toutes les familles actives
 *     description: >
 *       Retourne les familles avec leur solde de crédits réel (peut être négatif)
 *       et le nombre de membres actifs.
 *       Accessible aux rôles admin et coach.
 *     responses:
 *       200:
 *         description: Liste des familles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Family'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', roleCheck('admin', 'coach'), getFamilies);

/**
 * @swagger
 * /families:
 *   post:
 *     tags: [Familles]
 *     summary: Créer une famille
 *     description: Crée une nouvelle famille. Admin seulement.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFamilyRequest'
 *     responses:
 *       201:
 *         description: Famille créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Family'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', roleCheck('admin'), createFamily);

/**
 * @swagger
 * /families/{id}:
 *   get:
 *     tags: [Familles]
 *     summary: Détail d'une famille
 *     description: >
 *       Retourne la famille avec ses membres actifs, l'historique complet des crédits
 *       et le solde réel (positif ou négatif).
 *       Un utilisateur de rôle `family` ne peut accéder qu'à sa propre famille.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail de la famille
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FamilyDetail'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', getFamily);

/**
 * @swagger
 * /families/{id}:
 *   put:
 *     tags: [Familles]
 *     summary: Modifier une famille
 *     description: Met à jour les informations d'une famille. Admin seulement.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFamilyRequest'
 *     responses:
 *       200:
 *         description: Famille mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Family'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id', roleCheck('admin'), updateFamily);

/**
 * @swagger
 * /families/{id}/deactivate:
 *   patch:
 *     tags: [Familles]
 *     summary: Désactiver une famille
 *     description: >
 *       Rend la famille inactive. Elle n'apparaît plus dans les listes courantes
 *       mais toutes les données historiques sont conservées.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Famille désactivée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Famille désactivée avec succès' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/:id/deactivate', roleCheck('admin'), deactivateFamily);

/**
 * @swagger
 * /families/{id}/credits:
 *   post:
 *     tags: [Familles]
 *     summary: Ajouter des crédits à une famille
 *     description: >
 *       Crée un lot de crédits (CreditPurchase) pour la famille.
 *       Les crédits sont consommés selon la règle **FIFO** (premier entré, premier sorti).
 *       Le solde peut remonter d'un état négatif (dettes) vers un état positif.
 *       Admin seulement.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCreditsRequest'
 *     responses:
 *       201:
 *         description: Crédits ajoutés — retourne le lot de crédits créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddCreditsResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/:id/credits', roleCheck('admin'), addCredits);

router.patch('/:id/contact', updateFamilyContact);
router.get('/:id/attendances', getFamilyAttendances);

export default router;
