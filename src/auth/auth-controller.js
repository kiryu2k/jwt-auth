import userService from './user-service.js';
import AuthError from './auth-error.js';

import { validationResult } from 'express-validator';

class AuthController {
  async registerUser(req, res, next) {
    try {
      const validationError = validationResult(req);
      if (!validationError.isEmpty()) {
        return next(AuthError.getBadRequest('Validation error', validationError.array()));
      }
      const { username, email, password } = req.body;
      const userData = await userService.register(username, email, password);
      const cookieAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      res.cookie('refreshToken', userData.refreshToken, { maxAge: cookieAge, httpOnly: true });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { username, password } = req.body;
      const userData = await userService.login(username, password);
      const cookieAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      res.cookie('refreshToken', userData.refreshToken, { maxAge: cookieAge, httpOnly: true });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async logoutUser(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (error) {
      next(error);
    }
  }

  async activateAccount(req, res, next) {
    try {
      const activationToken = req.params.token;
      await userService.activate(activationToken);
      return res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      const cookieAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      res.cookie('refreshToken', userData.refreshToken, { maxAge: cookieAge, httpOnly: true });
      return res.json(userData);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const user = await userService.findByTokenAndDelete(refreshToken);
      await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getUsers();
      return res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccountByName(req, res, next) {
    try {
      const user = await userService.deleteByName(req.params.username);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
