import AuthError from './auth-error.js';
import tokenService from './token-service.js';

export default function (req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(AuthError.getUnauthorizedError());
    }
    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(AuthError.getUnauthorizedError());
    }
    const userData = tokenService.validateAccessToken(accessToken);
    if (!userData) {
      return next(AuthError.getUnauthorizedError());
    }
    req.data = userData;
    next();
  } catch (error) {
    return next(AuthError.getUnauthorizedError());
  }
}
