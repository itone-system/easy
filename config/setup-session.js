const sessionExpress = require('express-session');
const { session, isProd } = require('./env');

const loadSessionCache = async () => {
    const sessionCacheService = session.service
    if (sessionCacheService) {

      const redisStore = (await import('connect-redis')).default;
      const { createClient } = (await import('redis')).default;

      let redisClient = createClient({
        host: sessionCacheService.host, 
        port: sessionCacheService.port, 
        password: sessionCacheService.password,
      })

      redisClient.connect().catch(console.error)
  
      const store = new redisStore({
        client: redisClient,
        prefix: sessionCacheService.prefix
      })

      return store
    }
    return null
}

module.exports = async (app) => {
  const store = await loadSessionCache()
  app.use(
    sessionExpress({
      store,
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