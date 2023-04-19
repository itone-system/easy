const model = require('../../infra/dbAdapter');

const TableSolicitacao = model('Solicitacao_Item');

const TableAprovacoes = model('Aprovacoes');
const enviarEmail = require('../../infra/emailAdapter');
const { db } = require('../../config/env');
const sql = require('mssql');
const solicitacaoAprovada = require('../../template-email/solicitacao_aprovada');
const aguardandoCompra = require('../../template-email/aguardando_compra');
const tokenAdapter = require('../../infra/tokenAdapter');

exports.buscarSolicitacoesPorFiltro = async ({ data, pagina = {} }) => {
  const { Descricao, Solicitante, statusItem, centroCustoFiltro, User } = data;

  TableSolicitacao.select(
    "Codigo, Descricao, FORMAT(DataCriacao, 'dd/MM/yyyy') as DataCriacao, Quantidade, Status_Compra, Solicitante"
  ).associate({
      table: 'Aprovacoes',
      localKey: 'Codigo',
      foreignKey: 'Codigo_Solicitacao',
      select: 'Usuarios.NOME_USUARIO, Aprovacoes.Ordem',
      join:  {
        tableJoin: 'Usuarios',
        fieldJoin: 'COD_USUARIO',
        fieldTable: 'Codigo_Aprovador'
      },
      conditions: `and Aprovacoes.Status = 'N'`,
      as: 'aprovadores',
  })

  // aprovador
  if (User.Perfil === 3) {
    TableSolicitacao.innnerJoin('Aprovacoes', 'Codigo_Solicitacao', 'Codigo');

    TableSolicitacao.andWhere({
      'Aprovacoes.Codigo_Aprovador': User.codigo
    });
  }

  if (Descricao) {
    TableSolicitacao.andWhere({
      Descricao: `like %${Descricao}%`
    });
  }

  if (statusItem) {
    TableSolicitacao.andWhere({
      Status_Compra: statusItem
    });
  }

  // comprador ou aprovador
  if (User.Perfil === 1 || User.Perfil === 3) {
    if (Solicitante) {
      TableSolicitacao.andWhere({
        Solicitante: `like %${Solicitante}%`
      });
    }

    if (centroCustoFiltro) {
      TableSolicitacao.andWhere({
        Centro_de_Custo: centroCustoFiltro
      });
    }
  }

  // solicitante
  if (User.Perfil === 2) {
    TableSolicitacao.andWhere({
      Solicitante: User.nome
    });
  }

  TableSolicitacao.orderBy('Codigo', 'desc');

  if (pagina.limite) {
    TableSolicitacao.paginate(pagina.offset, pagina.limite);
  }

  return await TableSolicitacao.execute();
};

exports.obterServicoPorCodigo = async (Codigo) => {
  TableSolicitacao.select();
  const solicitacao = await TableSolicitacao.andWhere({
    Codigo
  }).execute();

  if (!solicitacao?.data) {
    return null;
  }

  return solicitacao?.data[0];
};

exports.buscarStatus = (codigoAprovador, codigoSolicitacao) => {
  return TableAprovacoes.select('Status')
    .andWhere({
      Codigo_Aprovador: codigoAprovador,
      Codigo_Solicitacao: codigoSolicitacao
    })
    .execute();
};

exports.enviarEmail = async (email, token) => {
  enviarEmail(email, token);
};

exports.buscarProximoAprovador = async (codigo) => {
  const conexao = await sql.connect(db);

  const solicitacao = await conexao.request().query(`select * from Solicitacao_Item where Codigo = ${codigo}`)

  const busca = await conexao.request().query(`select top 1
        t1.EMAIL_USUARIO, t1.COD_USUARIO
    from
        Aprovacoes t0
        INNER JOIN Usuarios t1 ON t1.COD_USUARIO = t0.Codigo_Aprovador
    where
        t0.Status = 'N'
        and
        t0.Codigo_Solicitacao = ${codigo}
    order by
        t0.Ordem asc`);

  if (busca.recordsets[0].length == 0) {
    console.log('todos aprovaram');

    if (solicitacao.recordset[0].pix) {
      const alterarStatusServicoAdiantamento = await conexao
      .request()
      .query(
        `update Solicitacao_Item set Status_Compra = 'E' where Codigo = ${codigo}`
      );
      // email solicitante
      // const emailOptions = {
      //   to: 'gustavo.pereira@itone.com.br',
      //   subject: 'Solicitção Aprovada',
      //   content: solicitacaoAprovada({
      //     descricao: queryDesc.recordset[0].Descricao,
      //     codigo
      //   }),
      //   isHtlm: true
      // };

      // const emailOptionsFinanceiro = {
      //   to: 'gustavo.pereira@itone.com.br',
      //   subject: 'Solicitção Aguardando Pagamento',
      //   content: solicitacaoAprovada({
      //     descricao: queryDesc.recordset[0].Descricao,
      //     codigo
      //   }),
      //   isHtlm: true
      // };
      // enviarEmail(emailOptions)
      // enviarEmail(emailOptionsFinanceiro)
      return
    }

    const alterarStatus = await conexao
      .request()
      .query(
        `update Solicitacao_Item set Aprovado = 'Y' where Codigo = ${codigo}`
      );

    const alterarStatus2 = await conexao
      .request()
      .query(
        `update Solicitacao_Item set Status_Compra = 'A' where Codigo = ${codigo}`
      );

    const query = await conexao.request().query(`SELECT usuarios.EMAIL_USUARIO
        FROM usuarios
        INNER Join Solicitacao_Item
        ON Usuarios.NOME_USUARIO = Solicitacao_Item.Solicitante
        WHERE Codigo = ${codigo}`);

    const queryDesc = await conexao
      .request()
      .query(`select Descricao from Solicitacao_Item where Codigo =${codigo}`);

    const email = query.recordset[0].EMAIL_USUARIO;

    const emailOptions = {
      to: email,
      subject: 'Solicitção Aprovada',
      content: solicitacaoAprovada({
        descricao: queryDesc.recordset[0].Descricao,
        codigo
      }),
      isHtlm: true
    };
    // const token = tokenAdapter({
    //   codigo,
    //   aprovador:1010 ,
    //   router: `/solicitacoes/${codigo}/edit`
    // });

    const emailOptionsComprador = {
      to: 'compras@itone.com.br',
      subject: 'Aguardando Compra',
      content: aguardandoCompra({
        descricao: queryDesc.recordset[0].Descricao,
        codigo: codigo
      }),
      isHtlm: true
    }
    enviarEmail(emailOptions);
    enviarEmail(emailOptionsComprador)
    return;
  }

  const email = busca.recordset[0].EMAIL_USUARIO;
  const codigoUsuario = busca.recordset[0].COD_USUARIO;

  return {
    email,
    codigoUsuario
  };
};

exports.obterDadosUser = async (codigo) => {
  const conexao = await sql.connect(db);

  const query = await conexao.request()
    .query(`SELECT Usuarios.COD_USUARIO, Usuarios.LOGIN_USUARIO, Usuarios.VALIDACAO_SENHA, Usuarios.NOME_USUARIO, Usuarios.EMAIL_USUARIO, Usuarios.ID_DEPARTAMENTO, Usuarios.Perfil, TIPO_PERMISSAO.PERMISSAO, MODULOS.MODULO
    FROM Usuarios
    LEFT JOIN PERMISSOES ON Usuarios.COD_USUARIO = PERMISSOES.COD_USUARIO
    LEFT JOIN TIPO_PERMISSAO ON TIPO_PERMISSAO.ID = PERMISSOES.COD_PERMISSAO
    LEFT JOIN MODULOS ON MODULOS.ID = PERMISSOES.COD_MODULO
    WHERE Usuarios.COD_USUARIO = ${codigo}`);

  const dadosUserSolicitacao = {};

  if (query.recordset) {
    (dadosUserSolicitacao.codigo = query.recordset[0].COD_USUARIO),
      (dadosUserSolicitacao.loginUsuario = query.recordset[0].LOGIN_USUARIO),
      (dadosUserSolicitacao.nome = query.recordset[0].NOME_USUARIO),
      (dadosUserSolicitacao.email = query.recordset[0].EMAIL_USUARIO),
      (dadosUserSolicitacao.departamento = query.recordset[0].ID_DEPARTAMENTO),
      (dadosUserSolicitacao.Perfil = query.recordset[0].Perfil),
      (dadosUserSolicitacao.permissao = '');
    dadosUserSolicitacao.permissoesNotaFiscal = '';
    dadosUserSolicitacao.validacao = query.recordset[0].VALIDACAO_SENHA;

    for (const item of query.recordset) {
      if (item.MODULO == 'COMPRAS') {
        dadosUserSolicitacao.permissao += item.PERMISSAO + ',';
      }

      if (item.MODULO == 'NOTA FISCAL') {
        dadosUserSolicitacao.permissoesNotaFiscal += item.PERMISSAO + ',';
      }
    }
  }
  const dados = {
    dadosUserSolicitacao
  };

  return dados;
};

exports.create = async (data, returnField = null) => {
  try {
    return await TableSolicitacao.insert(data, returnField);
  } catch (error) {
    console.log(error)
    throw new Error('Ocorreu uma excecao');
  }
};

exports.createSolicitacao = async (
  descricao,
  quantidade,
  deal,
  observacao,
  solicitante,
  dataCriacao,
  dataAtualizacao,
  statusCompra,
  aprovadores,
  centroCusto
) => {
  const conexao = await sql.connect(db);

  let result = await conexao
    .request()

    .input('descricao', sql.NVarChar, descricao)
    .input('quantidade', sql.Int, quantidade)
    .input('centroCusto', sql.VarChar, centroCusto)
    .input('deal', sql.VarChar, deal)
    .input('observacao', sql.VarChar, observacao)
    .input('solicitante', sql.VarChar, solicitante)
    .input('dataCriacao', sql.DateTimeOffset, dataCriacao)
    .input('dataAtualizacao', sql.DateTimeOffset, dataAtualizacao)
    .input('statusCompra', sql.Char, statusCompra)
    .query(
      `INSERT INTO Solicitacao_Item ( Descricao, Quantidade, Centro_de_Custo,deal, observacao, solicitante, DataCriacao,DataAtualizacao, Status_Compra) OUTPUT Inserted.Codigo VALUES (@descricao, @quantidade, @centroCusto, @deal, @observacao, @solicitante, @dataCriacao, @dataAtualizacao, @statusCompra)`
    );

  const codigo = result.recordset[0].Codigo;

  const ordemAprovadores = aprovadores.split(',');

  for (let index = 0; index < ordemAprovadores.length; index++) {
    let resultado = await conexao
      .request()
      .query(
        `INSERT INTO Aprovacoes ( Codigo_Solicitacao, Codigo_Aprovador, Ordem) VALUES (${codigo}, ${
          ordemAprovadores[index]
        }, ${index + 1})`
      );
  }

  return codigo;
};

exports.filterAprovador = async (codigoAprovador, codigoSolicitacao) => {
  const conexao = await sql.connect(db);
  const result = await conexao
    .request()
    .query(
      `select Ordem from Aprovacoes where Codigo_Solicitacao = ${codigoSolicitacao} and Codigo_Aprovador = ${codigoAprovador}`
    );

  if (result.recordset[0]) {
    return true;
  } else {
    return false;
  }
};

exports.verificaData = async (date1, date2) => {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.abs(new Date(date2) - new Date(date1));
  const result = Math.floor(diff / millisecondsPerDay);

  if (result <= 15) {
    return false;
  } else {
    return true;
  }
};
// const result = filterAprovador(4, 5)

exports.verifyAprovador = async (codigoAprovador, codigoSolicitacao) => {
  const conexao = await sql.connect(db);

  const ordem = await conexao
    .request()
    .query(
      `select Ordem from Aprovacoes where Codigo_Aprovador = ${codigoAprovador} and Codigo_Solicitacao = ${codigoSolicitacao}`
    );
  if (!ordem.recordset[0]) {
    return false;
  }
  const ordemFilter = ordem.recordset[0].Ordem;

  const result = await conexao
    .request()
    .query(
      `select Ordem, Status from Aprovacoes where Codigo_Solicitacao = ${codigoSolicitacao}`
    );

  const dados = result.recordset;

  for (const dado of dados) {
    if (dado.Ordem <= ordemFilter) {
      if (dado.Ordem == ordemFilter - 1) {
        if (dado.Status == 'Y') {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  return true; //significa que é o primeiro aprovador
};

exports.buscarDescricao = async (codigoSolicitacao) => {
  const conexao = await sql.connect(db);

  const result = await conexao
    .request()
    .query(
      `select Descricao from Solicitacao_Item where Codigo = ${codigoSolicitacao}`
    );

  const descricao = result.recordset[0].Descricao;

  return descricao;
};

exports.verificaNota = async (codigoSolicitacao) => {
  const conexao = await sql.connect(db);

  const result = await conexao
    .request()
    .query(
      `select CodigoSolicitacao from NotaFiscal where CodigoSolicitacao = ${codigoSolicitacao}`
    );
  if (result.recordset[0]) {
    return true;
  } else {
    return false;
  }
};

exports.verificaArquivoElink = async (codigoSolicitacao) => {
  const conexao = await sql.connect(db);

  const result = await conexao
    .request()
    .query(
      `select anexo, Link from Solicitacao_Item where Codigo = ${codigoSolicitacao}`
    );

  const objeto = result.recordset[0];

  if (objeto.anexo == '') {
    return 'link';
  }

  if (objeto.Link == '') {
    return 'anexo';
  }
};

exports.buscarEmail = async (codigoSolicitacao) => {
  const conexao = await sql.connect(db);

  const result = await conexao
    .request()
    .query(
      `SELECT u.EMAIL_USUARIO
      FROM Usuarios u
      INNER JOIN Solicitacao_Item t ON u.NOME_USUARIO = t.Solicitante
      where t.Codigo = ${codigoSolicitacao}`
    );

  const email = result.recordset[0].EMAIL_USUARIO

  return email
}

exports.verificarSeHouveAprovacao = async (codigoSolicitacao) => {
  const conexao = await sql.connect(db);

  const result = await conexao
    .request()
    .query(
      `select Status from Aprovacoes where Codigo_Solicitacao = ${codigoSolicitacao} and Status = 'Y'`
    );

  if (result.recordset[0]) {
    return true;
  } else {
    return false;
  }

};
