// const { db } = require('../../config/env');
// const sql = require('mssql');

exports.obterDadosUser = async (codigo) => {
  // const conexao = await sql.connect(db);

  // const query = await conexao.request().query(`SELECT Usuarios.COD_USUARIO, Usuarios.LOGIN_USUARIO, Usuarios.VALIDACAO_SENHA, Usuarios.NOME_USUARIO, Usuarios.EMAIL_USUARIO, Usuarios.ID_DEPARTAMENTO, Usuarios.Perfil, TIPO_PERMISSAO.PERMISSAO, MODULOS.MODULO
  //   FROM Usuarios
  //   LEFT JOIN PERMISSOES ON Usuarios.COD_USUARIO = PERMISSOES.COD_USUARIO
  //   LEFT JOIN TIPO_PERMISSAO ON TIPO_PERMISSAO.ID = PERMISSOES.COD_PERMISSAO
  //   LEFT JOIN MODULOS ON MODULOS.ID = PERMISSOES.COD_MODULO
  //   WHERE Usuarios.COD_USUARIO = ${codigo}`);

  // const dadosUserSolicitacao = {};

  // if (query.recordset) {
  //   dadosUserSolicitacao.codigo = query.recordset[0].COD_USUARIO,
  //   dadosUserSolicitacao.loginUsuario = query.recordset[0].LOGIN_USUARIO,
  //   dadosUserSolicitacao.nome = query.recordset[0].NOME_USUARIO,
  //   dadosUserSolicitacao.email = query.recordset[0].EMAIL_USUARIO,
  //   dadosUserSolicitacao.departamento = query.recordset[0].ID_DEPARTAMENTO,
  //   dadosUserSolicitacao.Perfil = query.recordset[0].Perfil,
  //   dadosUserSolicitacao.permissao = '';
  //   dadosUserSolicitacao.permissoesNotaFiscal = '';
  //   dadosUserSolicitacao.validacao = query.recordset[0].VALIDACAO_SENHA;

  //   for (const item of query.recordset) {
  //     if (item.MODULO == 'COMPRAS') {
  //       dadosUserSolicitacao.permissao += item.PERMISSAO + ',';
  //     }

  //     if (item.MODULO == 'NOTA FISCAL') {
  //       dadosUserSolicitacao.permissoesNotaFiscal += item.PERMISSAO + ',';
  //     }
  //   }
  // }
  // const dados = {
  //   dadosUserSolicitacao
  // };

  // return (dados);
};
