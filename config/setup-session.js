const sessionExpress = require('express-session');
const { session, isProd } = require('./env');

module.exports = (app) => {
  app.use(
    sessionExpress({
      secret: session.key,
      resave: false,
      saveUninitialized: true,
        cookie: {
        maxAge: session.age,
        secure: isProd
      }
    })
  );
};
