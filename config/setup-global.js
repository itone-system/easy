const { domain } = require('./env');

module.exports = async (app) => {
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
      aprovarAdmissao: '/vagas/aprovar',
      insertVaga: '/vagas/insert',
      solicitarConferencia: '/vagas/solicitarConferencia',
      insertConferencia: '/vagas/insertConferencia',
      recomecarProcessoSeletivo: '/vagas/recomecarProcessoSeletivo',
      finalizarProcessoDP: '/vagas/finalizarProcessoDP',
      reprovarAdmissao: '/vagas/reprovar',
      cancelarAdmissao:'/vagas/cancelarAdmissao',
      updateVaga: '/vagas/updateVaga',
      insertCandidato: '/vagas/insertCandidato',
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
