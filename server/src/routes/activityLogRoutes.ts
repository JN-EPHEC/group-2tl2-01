import { Router } from 'express';
import { getActivityLog } from '../controllers/activityLogController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const router = Router();
router.use(jwtAuth, roleCheck('admin'));

/**
 * @swagger
 * /activity-log:
 *   get:
 *     tags: [Journal]
 *     summary: Consulter le journal d'activité
 *     description: >
 *       Retourne la liste paginée des actions enregistrées dans le système,
 *       triées de la plus récente à la plus ancienne.
 *       Chaque entrée indique l'utilisateur responsable, l'action effectuée
 *       et le détail en clair. Admin seulement.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1, minimum: 1 }
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50, minimum: 1, maximum: 200 }
 *         description: Nombre d'entrées par page
 *     responses:
 *       200:
 *         description: Journal paginé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedActivityLog'
 *             example:
 *               total: 120
 *               page: 1
 *               limit: 50
 *               totalPages: 3
 *               logs:
 *                 - id: "uuid-1"
 *                   action: ADD_CREDITS
 *                   details: "Ajout de 10 cours à Famille Dupont"
 *                   createdAt: "2026-04-10T18:10:00.000Z"
 *                   user:
 *                     firstName: Admin
 *                     lastName: Club
 *                     role: admin
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', getActivityLog);

export default router;
