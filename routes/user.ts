import { Router } from 'express';
import {
  checkPasswordResetToken,
  deleteAccount,
  deleteOwnAccount,
  generatePasswordResetToken,
  getAllUsers,
  getSpecificUser,
  resetPassword,
  updateEmail,
  updateName,
  updatePassword,
} from '../controllers/user';
import loginRequired from '../middlewares/login-required';
import restrictAccess from '../middlewares/restrict-access';

const router = Router();

router.route('/').get(loginRequired, restrictAccess, getAllUsers);

router.route('/account').delete(loginRequired, deleteOwnAccount);

router.route('/account/name').patch(loginRequired, updateName);

router.route('/account/email').patch(loginRequired, updateEmail);

router.route('/account/password').patch(loginRequired, updatePassword);

router
  .route('/:userId')
  .get(loginRequired, restrictAccess, getSpecificUser)
  .delete(loginRequired, restrictAccess, deleteAccount);

router
  .route('/resetpassword')
  .post(generatePasswordResetToken)
  .patch(resetPassword);

router.route('/resetpassword/check').post(checkPasswordResetToken);

export default router;
