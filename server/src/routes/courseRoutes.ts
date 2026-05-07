import { Router } from 'express';
import {
  getCourses, createCourse, getCourse, updateCourse, addAttendances, removeAttendance,
} from '../controllers/courseController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const router = Router();
router.use(jwtAuth);

/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [Cours]
 *     summary: Lister les cours
 *     description: >
 *       Retourne les cours triés du plus récent au plus ancien, avec le type,
 *       le créateur et le nombre de présences. Filtrage optionnel par date et type.
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *         description: Date de début (ex. 2026-04-01)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *         description: Date de fin (ex. 2026-04-30)
 *       - in: query
 *         name: courseTypeId
 *         schema: { type: string, format: uuid }
 *         description: Filtrer par type de cours
 *     responses:
 *       200:
 *         description: Liste des cours
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/', getCourses);

/**
 * @swagger
 * /courses:
 *   post:
 *     tags: [Cours]
 *     summary: Créer un cours
 *     description: >
 *       Crée une nouvelle séance d'entraînement. Après création, accéder au détail
 *       via `GET /courses/{id}` pour encoder les présences. Admin et coach.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       201:
 *         description: Cours créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', roleCheck('admin', 'coach'), createCourse);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     tags: [Cours]
 *     summary: Détail d'un cours avec présences
 *     description: >
 *       Retourne le cours avec la liste complète des présences, les informations
 *       de chaque membre présent et l'indicateur de crédit consommé
 *       (`creditPurchaseId` null = présence enregistrée sans crédit / dette).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail du cours
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseDetail'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', getCourse);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     tags: [Cours]
 *     summary: Modifier un cours
 *     description: Met à jour la date, l'heure, le type ou les notes d'un cours. Admin et coach.
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
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       200:
 *         description: Cours mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id', roleCheck('admin', 'coach'), updateCourse);

/**
 * @swagger
 * /courses/{id}/attendances:
 *   post:
 *     tags: [Cours]
 *     summary: Ajouter des présences (prise de présence)
 *     description: >
 *       **Route principale de la prise de présence mobile.**
 *
 *       Enregistre une liste de membres comme présents à ce cours.
 *       Pour chaque membre :
 *       - Si déjà présent → ignoré (`alreadyPresent`)
 *       - S'il reste des crédits → crédit consommé FIFO, présence liée au lot (`added`)
 *       - Si aucun crédit → présence enregistrée avec `creditPurchaseId = null` (dette),
 *         membre aussi dans `noCredits`
 *
 *       Les présences peuvent être modifiées ultérieurement sans restriction.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID du cours
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddAttendancesRequest'
 *     responses:
 *       201:
 *         description: Présences enregistrées
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddAttendancesResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/:id/attendances', roleCheck('admin', 'coach'), addAttendances);

/**
 * @swagger
 * /courses/{id}/attendances/{memberId}:
 *   delete:
 *     tags: [Cours]
 *     summary: Supprimer la présence d'un membre
 *     description: >
 *       Retire un membre de la liste des présents.
 *       Si un crédit avait été consommé (`creditPurchaseId` non null), il est **recrédité automatiquement**
 *       sur le lot d'origine (remboursement FIFO).
 *       Si la présence était une dette (`creditPurchaseId = null`), la dette disparaît simplement.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID du cours
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID du membre à retirer
 *     responses:
 *       200:
 *         description: Présence supprimée et crédit remboursé si applicable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Présence supprimée' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.delete('/:id/attendances/:memberId', roleCheck('admin', 'coach'), removeAttendance);

export default router;