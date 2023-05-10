const { Router } = require('express');
const AdmissaoRouter = Router();
const admissaoController = require('./controller')
const { expressAdapter } = require('../../../infra/expressAdapter');
AdmissaoRouter.get('/', (request, response) => {
    response.render('home/Movimentacao/Admissao/Create', { nome: 'Gustavo Costa' })
})
AdmissaoRouter.get('/index', expressAdapter(admissaoController.listar))
            
AdmissaoRouter.post('/insert', expressAdapter(admissaoController.insert))

AdmissaoRouter.get('/:codigo/detail', expressAdapter(admissaoController.detail))

AdmissaoRouter.post('/aprovar', expressAdapter(admissaoController.aprovar))

AdmissaoRouter.post('/insertCandidato', expressAdapter(admissaoController.insertCandidato))
module.exports = AdmissaoRouter;
