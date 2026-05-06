import { Router } from 'express';
import {
  getCourseTypes, createCourseType, updateCourseType, deactivateCourseType, reactivateCourseType,
} from '../controllers/courseTypeController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const router = Router();
router.use(jwtAuth);

/**
 * @swagger
 * /course-types:
 *   get:
 *     tags: [Types de cours]
 *     summary: Lister les types de cours actifs
 *     description: Retourne tous les types de cours actifs (Judo, Natation, etc.). Tous les rôles authentifiés.
 *     responses:
 *       200:
 *         description: Liste des types de cours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CourseType'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', getCourseTypes);

/**
 * @swagger
 * /course-types:
 *   post:
 *     tags: [Types de cours]
 *     summary: Créer un type de cours
 *     description: Ajoute un nouveau type de cours au référentiel. Admin seulement.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseTypeRequest'
 *     responses:
 *       201:
 *         description: Type de cours créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseType'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         description: Un type avec ce nom existe déjà
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', roleCheck('admin'), createCourseType);

/**
 * @swagger
 * /course-types/{id}:
 *   put:
 *     tags: [Types de cours]
 *     summary: Modifier un type de cours
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
 *             $ref: '#/components/schemas/CreateCourseTypeRequest'
 *     responses:
 *       200:
 *         description: Type mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseType'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id', roleCheck('admin'), updateCourseType);

/**
 * @swagger
 * /course-types/{id}/deactivate:
 *   patch:
 *     tags: [Types de cours]
 *     summary: Désactiver un type de cours
 *     description: >
 *       Rend le type inactif — il n'apparaît plus lors de la création d'un cours.
 *       Les cours existants de ce type ne sont pas affectés.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Type désactivé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Type de cours désactivé' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/:id/deactivate', roleCheck('admin'), deactivateCourseType);

router.patch('/:id/reactivate', roleCheck('admin'), reactivateCourseType);

export default router;
