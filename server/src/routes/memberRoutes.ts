import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  getMembers, createMember, getMember, updateMember,
  deactivateMember, getMemberAttendances, uploadPhoto,
  reactivateMember, changeMemberFamily, updateMemberWeight,
} from '../controllers/memberController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = Router();
router.use(jwtAuth);

/**
 * @swagger
 * /members:
 *   get:
 *     tags: [Membres]
 *     summary: Lister les membres
 *     description: >
 *       Retourne les membres actifs avec leur solde de crédits (peut être négatif).
 *       Le solde est partagé entre tous les membres de la même famille (sauf membres autonomes).
 *       Admin et coach seulement.
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema: { type: boolean, default: false }
 *         description: Inclure les membres inactifs (admin seulement)
 *     responses:
 *       200:
 *         description: Liste des membres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Member'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/', roleCheck('admin', 'coach'), getMembers);

/**
 * @swagger
 * /members:
 *   post:
 *     tags: [Membres]
 *     summary: Créer un membre
 *     description: >
 *       Crée un nouveau membre.
 *       La famille (`familyId`) est **obligatoire** — elle doit exister préalablement.
 *       Admin et coach.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMemberRequest'
 *     responses:
 *       201:
 *         description: Membre créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         description: Famille introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', roleCheck('admin', 'coach'), createMember);

/**
 * @swagger
 * /members/{id}:
 *   get:
 *     tags: [Membres]
 *     summary: Détail d'un membre
 *     description: >
 *       Retourne les informations complètes d'un membre : famille, solde de crédits,
 *       historique des lots de crédits et dernières présences.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Détail du membre
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MemberDetail'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id', getMember);

/**
 * @swagger
 * /members/{id}:
 *   put:
 *     tags: [Membres]
 *     summary: Modifier un membre
 *     description: Met à jour les informations d'un membre (prénom, nom, poids, date de naissance…). Admin et coach.
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
 *             $ref: '#/components/schemas/UpdateMemberRequest'
 *     responses:
 *       200:
 *         description: Membre mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Member'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.put('/:id', roleCheck('admin', 'coach'), updateMember);

/**
 * @swagger
 * /members/{id}/deactivate:
 *   patch:
 *     tags: [Membres]
 *     summary: Désactiver un membre
 *     description: >
 *       Rend le membre inactif : il n'apparaît plus dans les listes de présence
 *       mais son historique est conservé. Admin seulement.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Membre désactivé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Membre désactivé avec succès' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.patch('/:id/deactivate', roleCheck('admin'), deactivateMember);

/**
 * @swagger
 * /members/{id}/make-autonomous:
 *   post:
 *     tags: [Membres]
 *     summary: Rendre un membre autonome
 *     description: >
 *       Détache le membre du compteur de crédits familial.
 *       Il dispose alors de son propre compteur de crédits individuel.
 *       L'historique des présences est entièrement conservé. Admin seulement.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Membre rendu autonome
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: 'Membre rendu autonome avec succès' }
 *                 member:  { $ref: '#/components/schemas/Member' }
 *       400:
 *         description: Le membre est déjà autonome
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
/**
 * @swagger
 * /members/{id}/attendances:
 *   get:
 *     tags: [Membres]
 *     summary: Historique des présences d'un membre
 *     description: Retourne toutes les présences d'un membre, triées de la plus récente à la plus ancienne.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Liste des présences
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AttendanceWithCourse'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get('/:id/attendances', getMemberAttendances);

/**
 * @swagger
 * /members/{id}/photo:
 *   post:
 *     tags: [Membres]
 *     summary: Uploader la photo d'un membre
 *     description: >
 *       Envoie une image (JPEG, PNG…) pour le profil du membre.
 *       Taille maximale : 5 Mo. Le fichier est stocké dans le dossier `/uploads/`.
 *       Admin et coach.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [photo]
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPEG, PNG, WebP…)
 *     responses:
 *       200:
 *         description: Photo mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 photo:   { type: string, example: 'a1b2c3d4.jpg' }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/:id/photo', roleCheck('admin', 'coach'), upload.single('photo'), uploadPhoto);

router.patch('/:id/weight', updateMemberWeight);
router.patch('/:id/reactivate', roleCheck('admin'), reactivateMember);
router.patch('/:id/change-family', roleCheck('admin'), changeMemberFamily);

export default router;
