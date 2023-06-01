const express = require('express');
const FormularioRouter = express.Router();
const Formularios = require('../Formularios/controller');
const { expressAdapter } = require('../../../infra/expressAdapter');

// Formulários
FormularioRouter.get('/', expressAdapter(Formularios.criarHomeForms));
FormularioRouter.get('/consultar', expressAdapter(Formularios.listarForms));
FormularioRouter.get('/:id/:tipo/detalhamento', expressAdapter(Formularios.detalhamentoForms));
FormularioRouter.post('/formUnico', expressAdapter(Formularios.formUnico));
FormularioRouter.post('/statusForms', expressAdapter(Formularios.statusForms));
FormularioRouter.post('/histAprovacoes', expressAdapter(Formularios.histAprovacoes));
FormularioRouter.get('/departamentos', expressAdapter(Formularios.dadosDepartamento));
FormularioRouter.post('/validacaoFormDP', expressAdapter(Formularios.validacaoFormDP));

// Férias
FormularioRouter.get('/Ferias', expressAdapter(Formularios.criarFerias));
FormularioRouter.post('/insertFerias', Formularios.insertFerias);

// Desligamento
FormularioRouter.get('/Desligamento', expressAdapter(Formularios.CriarDesligamento));
FormularioRouter.post('/insertDesligamento', Formularios.insertDesligamento);

// Alteracao
FormularioRouter.get('/AlteracaoCadastral', expressAdapter(Formularios.CriarAlteracao));
FormularioRouter.post('/insertAlteracao', Formularios.insertAlteracao);

module.exports = FormularioRouter;
