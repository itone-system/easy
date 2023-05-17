const sql = require('mssql');
const { db, domain, pathNf } = require('../../../config/env');
const enviarEmail = require('../../../infra/emailAdapter');
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const { Keytoken } = require('../../../config/env.js');

exports.buscarAprovadoresFerias = async (codigo, solicitante, tipo, colaboradorModal) => {
  const conexao = await sql.connect(db);

  const buscarAprovador = await conexao.query(
    `SELECT COORDENADOR, GESTOR, DIRETOR FROM Usuarios WHERE  COD_USUARIO = '${solicitante}'`
  );

  if (buscarAprovador.recordset[0].COORDENADOR) {
    aprovacaoes = [buscarAprovador.recordset[0].COORDENADOR];
    eColaboradorComum = true;
  } else if (!buscarAprovador.recordset[0].COORDENADOR && buscarAprovador.recordset[0].GESTOR) {
    aprovacaoes = [buscarAprovador.recordset[0].GESTOR];
    eColaboradorComum = false;
  } else if (!buscarAprovador.recordset[0].COORDENADOR && !buscarAprovador.recordset[0].GESTOR && buscarAprovador.recordset[0].DIRETOR) {
    aprovacaoes = [buscarAprovador.recordset[0].DIRETOR];
    eColaboradorComum = false;
  }

  this.insertAprovadores(codigo, aprovacaoes, eColaboradorComum, solicitante, tipo, colaboradorModal);

  // return [aprovacaoes, eColaboradorComum];
};

exports.buscarAprovadores = async (codigo, codSolicitante, nomeColaborador, tipoForm) => {
  const conexao = await sql.connect(db);

  const buscarAprovador = await conexao.query(
    `SELECT DIRETOR FROM Usuarios WHERE  COD_USUARIO   = '${codSolicitante}'`
  );

  const diretorADMFinanceiro = await conexao.query(
    'SELECT TOP 1 COD_USUARIO FROM Usuarios WHERE CARGO = \'DIRETOR(A) ADMINISTRATIVO\' AND ATIVO = \'S\''
  );

  if (buscarAprovador.recordset[0].DIRETOR) {
    aprovacaoes = [buscarAprovador.recordset[0].DIRETOR, diretorADMFinanceiro.recordset[0].COD_USUARIO];
  } else {
    aprovacaoes = [diretorADMFinanceiro.recordset[0].COD_USUARIO];
  }

  const tipo = tipoForm.substr(0, 1);

  const obterEmailPrimeiroAprovador = await conexao.query(
    `select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${aprovacaoes[0]} `
  );

  console.log(obterEmailPrimeiroAprovador);

  for (i in aprovacaoes) {
    const resultAprovacoes = await conexao
      .request()

      .input('COD_SOLICITACAO', sql.Int, codigo)
      .input('TIPO', sql.VarChar, tipo)
      .input('ORDEM', sql.Int, i)
      .input('COD_APROVADOR', sql.Int, aprovacaoes[i])

      .query(
        'INSERT INTO APROVACOES_FORMS (COD_SOLICITACAO, TIPO, ORDEM, COD_APROVADOR)  VALUES   (@COD_SOLICITACAO, @TIPO, @ORDEM, @COD_APROVADOR)'
      );
  }

  const dadosEmail = {
    codigoEmail: codigo,
    nome: nomeColaborador,
    tipo: tipoForm,
    solicitante: codSolicitante
  };

  console.log(dadosEmail);

  // console.log(dadosEmail)

  const token = jwt.sign(
    {
      Codigo: codigo
    },
    Keytoken.secret,
    {
      expiresIn: '100d'
    }
  );

  href = domain + '/notafiscal/buscarNotas?tokenReceive=' + token;

  ejs.renderFile(
    'template-email/retornoEmailForms.ejs',
    { dadosEmail, href },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);

        const emailAprovador = obterEmailPrimeiroAprovador.recordset[0].EMAIL_USUARIO;

        const emailOptions = {
          to: emailAprovador,
          subject: 'Solicitação de Desligamento',
          content: data,
          isHtlm: true
        };

        enviarEmail(emailOptions);
      }
    }
  );
};

exports.insertAprovadores = async (codigo, aprovacaoes, eColaboradorComum, solicitante, tipo, colaboradorModal) => {
  let statusAprov = '';
  const conexao = await sql.connect(db);

  if (aprovacaoes) {
    const obterEmailPrimeiroAprovador = await conexao.query(
    `select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${aprovacaoes[0]} `
    );

    console.log(obterEmailPrimeiroAprovador);

    for (i in aprovacaoes) {
      await conexao
        .request()

        .input('COD_SOLICITACAO', sql.Int, codigo)
        .input('TIPO', sql.VarChar, tipo)
        .input('ORDEM', sql.Int, i)
        .input('COD_APROVADOR', sql.Int, aprovacaoes[i])

        .query(
          'INSERT INTO APROVACOES_FORMS (COD_SOLICITACAO, TIPO, ORDEM, COD_APROVADOR)  VALUES   (@COD_SOLICITACAO, @TIPO, @ORDEM, @COD_APROVADOR)'
        );
    };
    proxEmail = [obterEmailPrimeiroAprovador.recordset[0].EMAIL_USUARIO];
  } else {
    console.log('finalizou as aprovações');

    const buscarEmailSolicitante = await conexao.query(
      `select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${solicitante} `
    );

    if (eColaboradorComum) {
      const obterEmailGestor = await conexao.query(
        `select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${buscarAprovador.recordset[0].GESTOR} `
      );

      proxEmail = [obterEmailGestor.recordset[0].email_usuario, buscarEmailSolicitante.recordset[0].email_usuario, 'wesley.silva@itone.com.br', 'wesley.silva@itone.com.br'];
    } else {
      proxEmail = [buscarEmailSolicitante.recordset[0].email_usuario, 'wesley.silva@itone.com.br', 'wesley.silva@itone.com.br'];
    }
    statusAprov = 'Aprovada';
  }

  tipoForm = tipo === 'F' ? 'Férias' : tipo;

  this.enviarEmail(codigo, colaboradorModal, solicitante, proxEmail, tipoForm, statusAprov);
};

exports.enviarEmail = async (codigo, nome_colaborador, nome_solicitante, proxEmail, tipoForm, statusAprov) => {
  statusAprov = statusAprov === undefined ? '' : statusAprov;

  const token = jwt.sign(
    {
      Codigo: codigo
    },
    Keytoken.secret,
    {
      expiresIn: '100d'
    }
  );

  href = domain + '/notafiscal/buscarNotas?tokenReceive=' + token;

  console.log(proxEmail);

  const dadosEmail = {
    codigoEmail: codigo,
    nome: nome_colaborador,
    tipo: tipoForm,
    solicitante: nome_solicitante
  };

  ejs.renderFile(
    'template-email/retornoEmailForms.ejs',
    { dadosEmail, href },
    function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data);

        for (i in proxEmail) {
          const emailOptions = {
            to: proxEmail[i],
            subject: `Solicitação de ${tipoForm} ${statusAprov}`,
            content: data,
            isHtlm: true
          };

          enviarEmail(emailOptions);
        }
      }
    }
  );
};
