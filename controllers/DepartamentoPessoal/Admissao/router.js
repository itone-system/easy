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

AdmissaoRouter.post('/insertConferencia', expressAdapter(admissaoController.insertConferencia))

AdmissaoRouter.post('/recomecarProcessoSeletivo', expressAdapter(admissaoController.recomecarProcessoSeletivo))

AdmissaoRouter.post('/finalizarProcessoDP', expressAdapter(admissaoController.finalizarProcessoDP))

AdmissaoRouter.post('/reprovar', expressAdapter(admissaoController.Reprovar))

AdmissaoRouter.post('/cancelarAdmissao', expressAdapter(admissaoController.cancelarVaga)) 

AdmissaoRouter.post('/updateVaga', expressAdapter(admissaoController.update))

module.exports = AdmissaoRouter;