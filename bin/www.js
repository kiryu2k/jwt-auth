import startApp from '../src/app.js';

import normalizePort from 'normalize-port';

const port = normalizePort(process.env.PORT || '3000');

startApp(port);
