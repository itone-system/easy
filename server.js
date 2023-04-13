const setupRoutes = require('./config/setup-routes');
const setupCors = require('./config/setup-cors');
const setupViews = require('./config/setup-views');
const setupPublic = require('./config/setup-public');
const setupSession = require('./config/setup-session');
const setupGlobal = require('./config/setup-global');
const express = require('express');
const { port } = require('./config/env')
// const dbAdapter = require('./infra/dbAdapter')
// const model = dbAdapter('Users')

const app = express();

// app.get('/', async (req, res) => {

//   const teste = await model.select().execute()
// res.json(teste)
// })
setupGlobal(app);
setupCors(app);
setupSession(app);
setupViews(app);
setupPublic(app);
setupRoutes(app);

app.listen(port, () => {
  console.log(`Aplicação rodando na porta ${port}`);
});
