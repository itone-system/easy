const { Router } = require('express');
const MenuController = require('./controller');
const { expressAdapter } = require('../../infra/expressAdapter');
const MenuRouter = Router();

MenuRouter.get(
  '/',
  expressAdapter(
    MenuController.Index
  )
);

module.exports = MenuRouter;