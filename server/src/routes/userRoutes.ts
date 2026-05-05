import { Router } from 'express';
import {
  getUsers, createUser, getUser, updateUser, deactivateUser, reactivateUser, forcePasswordReset,
} from '../controllers/userController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const router = Router();
router.use(jwtAuth, roleCheck('admin'));

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Utilisateurs]
 *     summary: Lister tous les utilisateurs
 *     description: Retourne la liste complète des utilisateurs (sans le champ password). Admin seulement.
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserPublic'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', getUsers);

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Utilisateurs]
 *     summary: Créer un utilisateur
 *     description: >
 *       Crée un nouveau compte (admin, coach ou family).
 *       Si `role = family`, le champ `familyId` est recommandé pour lier le compte à une famille.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', createUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Utilisateurs]
 *     summary: Détail d'un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/:id', getUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Utilisateurs]
 *     summary: Modifier un utilisateur
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
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPublic'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id', updateUser);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     tags: [Utilisateurs]
 *     summary: Désactiver un compte utilisateur
 *     description: >
 *       Rend le compte inactif. L'utilisateur ne peut plus se connecter.
 *       Les données sont conservées.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Compte désactivé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Compte désactivé' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/:id/deactivate', deactivateUser);

/**
 * @swagger
 * /users/{id}/reactivate:
 *   patch:
 *     tags: [Utilisateurs]
 *     summary: Réactiver un compte utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Compte réactivé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Compte réactivé avec succès' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/:id/reactivate', reactivateUser);

/**
 * @swagger
 * /users/{id}/force-password-reset:
 *   post:
 *     tags: [Utilisateurs]
 *     summary: Forcer la réinitialisation du mot de passe
 *     description: >
 *       Active le flag `forcePasswordChange` sur le compte.
 *       L'utilisateur devra changer son mot de passe à la prochaine connexion.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Reset forcé activé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Réinitialisation de mot de passe forcée' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/:id/force-password-reset', forcePasswordReset);

export default router;
