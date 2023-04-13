const { Router } = require('express');
const HomeController = require('./controller');
const { expressAdapter } = require('../../infra/expressAdapter');

const HomeRouter = Router();
HomeRouter.get(
  '/',
  expressAdapter(
    HomeController.Index
  )
);

module.exports = HomeRouter;
