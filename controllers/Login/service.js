const sql = require('mssql');
const { db } = require('../../config/env');

exports.obterDadosUser = async (codigo) => {
  const conexao = await sql.connect(db);



  const query = await conexao.request()
    .query(`SELECT Usuarios.COD_USUARIO, Usuarios.LOGIN_USUARIO, Usuarios.VALIDACAO_SENHA, Usuarios.NOME_USUARIO, Usuarios.NOME_COMPLETO, Usuarios.EMAIL_USUARIO, Usuarios.ID_DEPARTAMENTO, Usuarios.Perfil, TIPO_PERMISSAO.PERMISSAO, MODULOS.MODULO
      FROM Usuarios
      LEFT JOIN PERMISSOES ON Usuarios.COD_USUARIO = PERMISSOES.COD_USUARIO
      LEFT JOIN TIPO_PERMISSAO ON TIPO_PERMISSAO.ID = PERMISSOES.COD_PERMISSAO
      LEFT JOIN MODULOS ON MODULOS.ID = PERMISSOES.COD_MODULO
      WHERE Usuarios.COD_USUARIO = ${codigo}`);



  const queryAcessos = await conexao.request()
    .query(`SELECT Usuarios.COD_USUARIO, Usuarios.LOGIN_USUARIO, MODULOS_ACESSOS.MODULO AS MODULOS_ACESSOS, DADOS.DESCRICAO AS RESTRICAO_DADOS
      FROM Usuarios
     left join ACESSOS on ACESSOS.ID_USUARIO = Usuarios.COD_USUARIO
     JOIN  MODULOS MODULOS_ACESSOS on ACESSOS.COD_MODULO = MODULOS_ACESSOS.ID
     RIGHT join PERFIL DADOS on DADOS.ID = ACESSOS.COD_DADOS
       WHERE Usuarios.COD_USUARIO = ${codigo}`);



  function set(obj, prop, value) {
    obj[prop] = value;
  }



  const dadosUserSolicitacao = {};
  let permissaoSolicitacoes = '';
  let permissaoNotaFiscal = '';
  let permissaoSolicitacoesSplit = null;
  let permissaoNotaFiscalSplit = null;



  let modulos = '';
  let tipoAcessosModulos = '';
  let modulosSplit = null;
  let tipoAcessosModulosSplit = null;



  let modulosPermissaoSplit = null;
  let tipoPermissaoSplit = null;
  let moduloPermissao = '';
  let tipoPermissaoGeral = '';



  if (query.recordset) {
    (dadosUserSolicitacao.codigo = query.recordset[0].COD_USUARIO),
      (dadosUserSolicitacao.loginUsuario = query.recordset[0].LOGIN_USUARIO),
      (dadosUserSolicitacao.nome = query.recordset[0].NOME_USUARIO),
      (dadosUserSolicitacao.nomeCompleto = query.recordset[0].NOME_COMPLETO),
      (dadosUserSolicitacao.email = query.recordset[0].EMAIL_USUARIO),
      (dadosUserSolicitacao.departamento = query.recordset[0].ID_DEPARTAMENTO),
      (dadosUserSolicitacao.Perfil = query.recordset[0].Perfil),
      (dadosUserSolicitacao.permissaoCompras = '');
    dadosUserSolicitacao.permissoesNotaFiscal = '';
    dadosUserSolicitacao.permissoes = '';
    dadosUserSolicitacao.tipoAcessos = '';
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



    for (const acessos of queryAcessos.recordset) {
      if (acessos.MODULOS_ACESSOS) {
        modulos += acessos.MODULOS_ACESSOS + ',';
        tipoAcessosModulos += acessos.RESTRICAO_DADOS + ',';
      }
    }
    modulosSplit = modulos.split(',');
    tipoAcessosModulosSplit = tipoAcessosModulos.split(',');



    modulosSplit.pop();
    tipoAcessosModulosSplit.pop();



    for (const itemPer of query.recordset) {
      if (itemPer.MODULO) {
        moduloPermissao += itemPer.MODULO + ',';
        tipoPermissaoGeral += itemPer.PERMISSAO + ',';
      }
    }
    modulosPermissaoSplit = moduloPermissao.split(',');
    tipoPermissaoSplit = tipoPermissaoGeral.split(',');



    modulosPermissaoSplit.pop();
    tipoPermissaoSplit.pop();



    dadosUserSolicitacao.permissaoCompras = {};
    dadosUserSolicitacao.permissoesNotaFiscal = {};
    dadosUserSolicitacao.tipoAcessos = {};
    dadosUserSolicitacao.permissoes = {};



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



    for (let index = 0; index < modulosSplit.length; index++) {
      set(
        dadosUserSolicitacao.tipoAcessos,
        modulosSplit[index].replace(' ', '_'),
        tipoAcessosModulosSplit[index]
      );
    }



    for (let index = 0; index < modulosSplit.length; index++) {
      tipopermissoes = {};
      if (modulosSplit[index]) {
        for (const itemPer of query.recordset) {
          if (itemPer.MODULO === modulosSplit[index]) {
            set(
              tipopermissoes,
              itemPer.PERMISSAO,
              true
            );
          }
        }
      }
      set(
        dadosUserSolicitacao.permissoes,
        modulosSplit[index].replace(' ', '_'),
        tipopermissoes
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
    return (result.recordset[0].VALIDACAO_SENHA)
  } else {
    return ('error')
  }
}
