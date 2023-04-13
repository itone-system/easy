const { Router } = require('express');
const { expressAdapter } = require('../../infra/expressAdapter');
const UsuarioController = require('../Usuarios/controller');

const UsuarioRouter = Router();

UsuarioRouter.get('/listar', expressAdapter(UsuarioController.List));
module.exports = UsuarioRouter;
