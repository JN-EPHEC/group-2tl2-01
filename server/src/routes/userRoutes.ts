import { Router } from 'express';
import {
  getUsers, createUser, getUser, updateUser, deactivateUser, reactivateUser, forcePasswordReset,
} from '../controllers/userController';
import { jwtAuth } from '../middlewares/jwtAuth';
import { roleCheck } from '../middlewares/roleCheck';

const router = Router();
router.use(jwtAuth, roleCheck('admin'));

router.get('/', getUsers);

router.post('/', createUser);

router.get('/:id', getUser);

router.put('/:id', updateUser);

router.patch('/:id/deactivate', deactivateUser);

router.patch('/:id/reactivate', reactivateUser);

router.post('/:id/force-password-reset', forcePasswordReset);

export default router;
