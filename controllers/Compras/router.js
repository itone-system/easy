const { Router } = require('express');
const ComprasController = require('../Compras/controller');
const { expressAdapter } = require('../../infra/expressAdapter');
const ComprasRouter = Router();

ComprasRouter.post('/', expressAdapter(ComprasController.Create));
ComprasRouter.post('/enviarParaPagamento', expressAdapter(ComprasController.enviarParaPagamento));
module.exports = ComprasRouter;
