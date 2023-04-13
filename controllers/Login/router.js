const { Router } = require('express');
const LoginController = require('./controller');
const { expressAdapter } = require('../../infra/expressAdapter');

const LoginRouter = Router();
LoginRouter.get('/', expressAdapter(LoginController.Index));
LoginRouter.post('/', expressAdapter(LoginController.Auth));
LoginRouter.post('/trocar_senha', expressAdapter(LoginController.ChangePass));
LoginRouter.get('/sair', expressAdapter(LoginController.Logoff))
module.exports = LoginRouter;
