import authController from './auth-controller.js';
import authMiddleware from './auth-middleware.js';

import Router from 'express';
import { body } from 'express-validator';

const router = new Router();

router.post(
  '/registration',
  [
    body('username', 'Username cannot be empty').notEmpty(),
    body('email', 'Invalid email address').isEmail(),
    body('password')
      .isLength({ min: 5, max: 20 })
      .withMessage('Password must be at least 5 to 20 chars long')
      .matches(/^[A-Za-z\d]+$/)
      .withMessage('Password must consist of letters and numbers'),
  ],
  authController.registerUser
);

router.post('/login', authController.loginUser);

router.post('/logout', authController.logoutUser);

router.get('/activate/:token', authController.activateAccount);

router.get('/refresh', authController.refreshToken);

router.delete('/delete', authMiddleware, authController.deleteAccount);

/* maybe unused.. */
router.delete('/delete/:username', authMiddleware, authController.deleteAccountByName);

/* test endpoint to get list of users */
router.get('/users', authController.getUsers);

export default router;
