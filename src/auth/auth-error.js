export default class AuthError extends Error {
  status;
  listOfErrors;

  constructor(status, message, listOfErrors = []) {
    super(message);
    this.status = status;
    this.listOfErrors = listOfErrors;
  }

  static getUnauthorizedError() {
    return new AuthError(401, 'User is not authorized');
  }

  static getBadRequest(message, listOfErrors = []) {
    return new AuthError(400, message, listOfErrors);
  }
}
