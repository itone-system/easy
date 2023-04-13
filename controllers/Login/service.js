const sql = require('mssql');
const { db } = require('../../config/env');

exports.obterDadosUser = async (codigo) => {
  const conexao = await sql.connect(db);

  let query = await conexao.request()
    .query(`SELECT Usuarios.COD_USUARIO, Usuarios.LOGIN_USUARIO, Usuarios.VALIDACAO_SENHA, Usuarios.NOME_USUARIO, Usuarios.EMAIL_USUARIO, Usuarios.ID_DEPARTAMENTO, Usuarios.Perfil, TIPO_PERMISSAO.PERMISSAO, MODULOS.MODULO
    FROM Usuarios
    LEFT JOIN PERMISSOES ON Usuarios.COD_USUARIO = PERMISSOES.COD_USUARIO
    LEFT JOIN TIPO_PERMISSAO ON TIPO_PERMISSAO.ID = PERMISSOES.COD_PERMISSAO
    LEFT JOIN MODULOS ON MODULOS.ID = PERMISSOES.COD_MODULO
    WHERE Usuarios.COD_USUARIO = ${codigo}`);

  function set(obj, prop, value) {
    obj[prop] = value;
  }

  let dadosUserSolicitacao = {};
  let permissaoSolicitacoes = '';
  let permissaoNotaFiscal = '';

  let permissaoSolicitacoesSplit = null;
  let permissaoNotaFiscalSplit = null;

  if (query.recordset) {
    (dadosUserSolicitacao.codigo = query.recordset[0].COD_USUARIO),
      (dadosUserSolicitacao.loginUsuario = query.recordset[0].LOGIN_USUARIO),
      (dadosUserSolicitacao.nome = query.recordset[0].NOME_USUARIO),
      (dadosUserSolicitacao.email = query.recordset[0].EMAIL_USUARIO),
      (dadosUserSolicitacao.departamento = query.recordset[0].ID_DEPARTAMENTO),
      (dadosUserSolicitacao.Perfil = query.recordset[0].Perfil),
      (dadosUserSolicitacao.permissaoCompras = '');
    dadosUserSolicitacao.permissoesNotaFiscal = '';
    dadosUserSolicitacao.validacao = query.recordset[0].VALIDACAO_SENHA;

    for (const item of query.recordset) {
      if (item.MODULO == 'COMPRAS') {
        permissaoSolicitacoes += item.PERMISSAO + ',';
      }

      if (item.MODULO == 'NOTA FISCAL') {
        permissaoNotaFiscal += item.PERMISSAO + ',';
      }
    }

    permissaoSolicitacoesSplit = permissaoSolicitacoes.split(',');
    permissaoNotaFiscalSplit = permissaoNotaFiscal.split(',');

    permissaoSolicitacoesSplit.pop();
    permissaoNotaFiscalSplit.pop();

    dadosUserSolicitacao.permissaoCompras = {};
    dadosUserSolicitacao.permissoesNotaFiscal = {};

    for (let index = 0; index < permissaoSolicitacoesSplit.length; index++) {
      set(
        dadosUserSolicitacao.permissaoCompras,
        permissaoSolicitacoesSplit[index],
        true
      );
    }

    for (let index = 0; index < permissaoNotaFiscalSplit.length; index++) {
      set(
        dadosUserSolicitacao.permissoesNotaFiscal,
        permissaoNotaFiscalSplit[index],
        true
      );
    }
  }

  const dados = {
    dadosUserSolicitacao
  };

  return dados;
};

exports.verifyUser = async (usuario, senha) => {
  const conexao = await sql.connect(db);

  let result = await conexao
    .request()
    // sql injection teste
    .input('senha', sql.NVarChar, senha)
    .input('usuario', sql.NVarChar, usuario)
    .query(
      'select * from Usuarios where PWDCOMPARE(@senha, SENHA) = 1 and login_usuario = @usuario'
    );

  return result;
};

exports.changePass = async (usuario, senha) => {
  const conexao = await sql.connect(db);

  const query = `declare
        @pwd1 varchar(20),
        @pwd2 varbinary(100),
        @pwd3 varchar(1)

        set @pwd1 = '${senha}'

        set @pwd2 = Convert(varbinary(100), pwdEncrypt(@pwd1))

        set @pwd3 = 'Y'

        update Usuarios
        set SENHA = @pwd2, VALIDACAO_SENHA = @pwd3
        WHERE LOGIN_USUARIO = '${usuario}'`;

  const result = await conexao.request().query(query);
};

exports.simpleUserVerification = async (usuario) => {

  const conexao = await sql.connect(db);
  const result = await conexao.request().query(`select VALIDACAO_SENHA from Usuarios where LOGIN_USUARIO = '${usuario}'`)
  if (result.recordset[0]) {
    return(result.recordset[0].VALIDACAO_SENHA)
  } else {
    return ('error')
  }
}
