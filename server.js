const setupAll = require('./config/setup-all');
const express = require('express');
const { port } = require('./config/env')

const app = express();

setupAll(app).then(() => {
  app.listen(port, () => {
    console.log(`Aplicação rodando na porta ${port}`);
  });  
})