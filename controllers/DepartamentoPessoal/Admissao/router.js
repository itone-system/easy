const { Router } = require('express');
const AdmissaoRouter = Router();
const admissaoController = require('./controller')
const { expressAdapter } = require('../../../infra/expressAdapter');
// const { renderView, renderJson, redirect } = require('../../../helpers/render');

AdmissaoRouter.get('/create', expressAdapter(admissaoController.criar))

AdmissaoRouter.get('/', expressAdapter(admissaoController.home));

AdmissaoRouter.get('/index', expressAdapter(admissaoController.listar))
            
AdmissaoRouter.post('/insert', expressAdapter(admissaoController.insert))

AdmissaoRouter.get('/:codigo/detail', expressAdapter(admissaoController.detail))

AdmissaoRouter.post('/aprovar', expressAdapter(admissaoController.aprovar))

AdmissaoRouter.post('/insertCandidato', expressAdapter(admissaoController.insertCandidato))

AdmissaoRouter.post('/solicitarConferencia', expressAdapter(admissaoController.conferencia))

AdmissaoRouter.post('/insertConferencia', expressAdapter(admissaoController.insertCandidato))
module.exports = AdmissaoRouter;