import { Router } from 'express';
import multer from 'multer';
import { importFamilies, importMembers } from '../controllers/importController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const router = Router();
router.use(jwtAuth, roleCheck('admin'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

/**
 * @swagger
 * /import/families:
 *   post:
 *     tags: [Import]
 *     summary: Importer des familles depuis un fichier Excel
 *     description: >
 *       Importe des familles depuis un fichier `.xlsx`.
 *       Colonnes attendues : Nom, Téléphone, Email, Adresse, Statut.
 *       Admin seulement.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Résultat de l'import
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created: { type: integer }
 *                 skipped: { type: integer }
 *                 errors: { type: array, items: { type: string } }
 *       400:
 *         description: Fichier manquant ou invalide
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/families', upload.single('file'), importFamilies);

/**
 * @swagger
 * /import/members:
 *   post:
 *     tags: [Import]
 *     summary: Importer des membres depuis un fichier Excel
 *     description: >
 *       Importe des membres depuis un fichier `.xlsx`.
 *       Colonnes attendues : Prénom, Nom, Famille, Date de naissance, Poids (kg), Statut, Autonome.
 *       La famille doit déjà exister. Admin seulement.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Résultat de l'import
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created: { type: integer }
 *                 skipped: { type: integer }
 *                 errors: { type: array, items: { type: string } }
 *       400:
 *         description: Fichier manquant ou invalide
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/members', upload.single('file'), importMembers);

export default router;
