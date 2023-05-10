import AuthError from './auth-error.js';

export default function (error, req, res, next) {
  console.log(error);
  if (error instanceof AuthError) {
    return res.status(error.status).json({ message: error.message, errors: error.listOfErrors });
  }
  return res.status(500).json({ message: 'Unexpected error' });
}
