const { domain } = require('./env');

module.exports = (app) => {
  app.locals = {
    domain,
    endpoints: {
      trocarSenha: '/trocar_senha',
      login: '/',
      ListarSolicitacoes: '/listar',
      Comprar: '/compras/',
      NotaFiscal: '/notafiscal/incluirNota',
      ListarNotas: '/listarnotas',
      NovaSolicitacao: '/solicitacoes/criar',
      AtualizarNF: '/notafiscal/atualizarStatusNota',
      ListarUsuarios: '/users/listar',
      ListarItens: '/itens',
      AprovarSolicitacao: '/solicitacoes/aprovar',
      editarSolicitacao: '/solicitacoes/atualizar',
      inserirNota: '/notafiscal/insertNotaSolicitacao',
      detalhe: '/solicitacoes/detailAprovador',
      ModalNF: '/notafiscal/notaUnica',
      ReprovarSolicitacao: '/solicitacoes/reprovar',
      downloadNF: '/notafiscal/downloadNF/',
      uploadNF: '/notafiscal/uploadNF/',
      downloadItem: '/solicitacoes/downloadItem/',
      uploadItem: '/solicitacoes/uploadItem/',
      insertNF: '/notafiscal/insertnotafiscal',
      incluirFerias: '/formularios/insertFerias',
      insertDesligamento: '/formularios/insertDesligamento',
      insertAlteracao: '/formularios/insertAlteracao',
      formUnico: '/formularios/formUnico',
      aprovacaoForms: '/formularios/statusForms',
      aprovacaoDP: '/formularios/validacaoFormDP',
      histAprovacoesForms: '/formularios/histAprovacoes'

    }
  };
};
