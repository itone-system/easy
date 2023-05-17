const { db, domain, pathNf } = require('../../../config/env');
const ejs = require('ejs');
const sql = require('mssql');
const enviarEmail = require('../../../infra/emailAdapter');
const { renderView, renderJson, redirect } = require('../../../helpers/render');
const jwt = require('jsonwebtoken');
const { Keytoken } = require('../../../config/env.js');
const formsService = require('../Formularios/service');

pagina = 0;
nomeColaboradorSalva = '';
StatusSalva = '';
TipoSalva = '';
centroCustoExtensoSalva = '';

// proxEmail = '';
module.exports = {
  async listarForms (request, res) {
    try {
      const conexao = await sql.connect(db);

      const user = request.session.get('user');

      console.log(user);

      const message = await request.session.message();

      let {
        paginate,
        limite = 10,
        nomeColaborador,
        Tipo,
        CentroCusto,
        filtroAplicado,
        Status
        // tokenReceive,
        // codigoNF
      } = request;

      // CentroCusto =
      //   CentroCusto == 'Centro de Custo' || CentroCusto == undefined
      //     ? ''
      //     : CentroCusto.split('. ');

      const requ = {
        pagina: paginate === 'prox' ? 1 : paginate === 'prev' ? -1 : 0,
        limite: 10,
        nomeColaborador: nomeColaborador == undefined ? '' : nomeColaborador,
        Status: Status == undefined ? '' : Status,
        Tipo: Tipo == undefined ? '' : Tipo,
        CentroCusto: CentroCusto == undefined ? '' : CentroCusto,
        // CentroCustoExtenso: CentroCusto,
        filtroAplicado: request.buscar != undefined
        // codigoNFUnic: codigoNF == undefined ? 1 : codigoNF
      };

      console.log(requ);

      const nomeColaboradorSalva = requ.nomeColaborador ? requ.nomeColaborador : '';
      const StatusSalva = requ.Status ? requ.Status : '';
      const TipoSalva = requ.Tipo ? requ.Tipo : '';
      const centroCustoExtensoSalva = requ.CentroCusto ? requ.CentroCusto : '';

      condicao = 1;

      // listacondicoes = {
      //   NOME: nomeColaboradorSalva,
      //   STATUS: StatusSalva,
      //   TIPO: TipoSalva
      //   // CentroCusto: user.Perfil == 3 ? user.departamento : requ.CentroCusto
      // };
      const listacondicoes = {};

      listacondicoes.NOME = nomeColaboradorSalva;
      listacondicoes.STATUS = StatusSalva;
      listacondicoes.TIPO = TipoSalva;
      listacondicoes.DESCRICAO = centroCustoExtensoSalva;

      // INÍCIO Restrição de Dados

      let tipoRestricao = '';

      for (const [key, value] of Object.entries(user.tipoAcessos)) {
        console.log(key + ' ' + value);
        if (key === 'FERIAS' || key === 'ALTERACAO_CADASTRAL' || key === 'RESCISAO') {
          tipoRestricao = value;
        }
      };

      let condicaoResticaoDados = '';

      console.log(tipoRestricao);

      switch (tipoRestricao) {
        case 'FULL':
          condicaoResticaoDados = '';
          break;
        case 'DIRETOR':
          condicaoResticaoDados = ` (FORMULARIOS_WEB.SOLICITANTE = '${user.nome}' OR Usuarios.DIRETOR = '${user.codigo}' )`;
          break;
        case 'GERENTE':
          condicaoResticaoDados = ` (FORMULARIOS_WEB.SOLICITANTE = '${user.nome}' OR Usuarios.GESTOR = '${user.codigo}' )`;
          break;
        case 'COORDENADOR':
          // listacondicoes.SOLICITANTE = user.nome;
          condicaoResticaoDados = ` (FORMULARIOS_WEB.SOLICITANTE = '${user.nome}' OR Usuarios.COORDENADOR = '${user.codigo}' )`;
          break;
        case 'COLABORADOR':
          condicaoResticaoDados = ` SOLICITANTE = '${user.nome}'`;
          break;
        case 'CENTRO DE CUSTO':
          condicaoResticaoDados = ` Usuarios.ID_DEPARTAMENTO = '${user.departamento}'`;
          break;
      }

      // FIM Restrição de Dados

      condicaoGeral = '';

      for (const [key, value] of Object.entries(listacondicoes)) {
        if (value) {
          if (condicao == 1) {
            condicaoQueryPart =
              key != 'CentroCusto' ? ` where ${key} like '%${value}%' ` : ` where ${key} = '${value}' `;
          } else {
            condicaoQueryPart =
              key != 'CentroCusto'
                ? `and ${key} like '%${value}%' `
                : `and ${key} = '${value}' `;
          }
          condicao = condicao + 1;
          condicaoGeral = condicaoGeral + condicaoQueryPart;
        }
      }
      console.log(condicaoGeral);

      if (condicaoResticaoDados) {
        condicaoResticaoDados = condicaoGeral === '' ? ` where ${condicaoResticaoDados}` : ` and ${condicaoResticaoDados}`;
      }

      if (filtroAplicado) {
        requ.pagina = 1;
      }

      const obterTotalSolicitacoes = await conexao.query(
        `SELECT COUNT (FORMULARIOS_WEB.ID) as total    FROM FORMULARIOS_WEB
        LEFT JOIN USUARIOS ON USUARIOS.NOME_USUARIO = FORMULARIOS_WEB.SOLICITANTE
        LEFT JOIN DEPARTAMENTO ON USUARIOS.DEPARTAMENTO = DEPARTAMENTO.ID ${condicaoGeral} ${condicaoResticaoDados} `
      );

      const totalPaginas = Math.ceil(
        obterTotalSolicitacoes.recordsets[0][0].total / limite
      );

      console.log(totalPaginas);

      paginates = paginates + requ.pagina;

      if (paginates > totalPaginas) {
        paginates = totalPaginas;
      } else if (paginates < 0) {
        paginates = 1;
      }

      limite = Math.min(10, limite);

      let offset = 0;

      if (paginates > 1) {
        offset = paginates * limite - limite;
      }

      console.log('OFFSET: ' + offset);
      console.log('paginates: ' + paginates);
      console.log('limite: ' + limite);

      const obterSolicitacoes =
        await conexao.query(`SELECT FORMULARIOS_WEB.*, Usuarios.ID_DEPARTAMENTO, Usuarios.COORDENADOR,Usuarios.GESTOR,
        Usuarios.DIRETOR,      DEPARTAMENTO.DESCRICAO
        FROM FORMULARIOS_WEB
        LEFT JOIN USUARIOS ON USUARIOS.NOME_USUARIO = FORMULARIOS_WEB.SOLICITANTE
        LEFT JOIN DEPARTAMENTO ON USUARIOS.DEPARTAMENTO = DEPARTAMENTO.ID
        ${condicaoGeral} ${condicaoResticaoDados} ORDER BY DATA_SOLICITACAO DESC
      OFFSET ${offset} ROWS FETCH NEXT ${limite} ROWS ONLY`);

      itens = obterSolicitacoes.recordsets[0];

      const dados = itens;

      const codigoToken = '';

      // if (tokenReceive) {
      //   const tokenRecebido = req.tokenReceive;

      //   dadosToken = jwt.verify(tokenRecebido, Keytoken.secret);
      //   // console.log('teste obter serviço', dadosToken);
      //   codigoToken = dadosToken.Codigo;
      // } else {
      //   codigoToken = '';
      // }

      return renderView('home/Movimentacao/Formularios/indexFormularios', {
        dados,
        retornoUser: user.permissoesNotaFiscal,
        nome: user.nome,
        acesso: user.tipoAcessos,
        permissoes: user.permissoes,
        tipoRegime: user.tipoRegime,
        codigoUsuario: user.codigo,
        codigoToken,
        nomeColaboradorSalva,
        StatusSalva,
        TipoSalva,
        centroCustoExtensoSalva
      });
    } catch (error) {
      console.log(error);
      return redirect('/formularios');
    }
    // return ({ notasRecebidas, notaUnica, totalPaginas, paginate, descricaoSalva, fornecedorSalva, solicitanteSalva, centroCustoExtensoSalva})
  },

  async formUnico (request) {
    const { codigo, tipo } = request;

    codigoInt = codigo === undefined ? '' : codigo;

    const conexao = await sql.connect(db);

    const obterForm = await conexao.query(
      `select * from ${tipo} WHERE ID = '${codigoInt}'`
    );

    const dados = obterForm.recordsets[0];

    return renderJson(dados);
  },

  async histAprovacoes (request) {
    const { codigo, tipo } = request;

    codigoInt = codigo === undefined ? '' : codigo;

    tipoInicial = tipo.substr(0, 1) === 'R' ? 'D' : tipo.substr(0, 1);

    const conexao = await sql.connect(db);

    const obterHistAprovadores = await conexao.query(
      `select * from HIST_APROVACOES WHERE COD_SOLICITACAO = '${codigoInt}' AND TIPO = '${tipoInicial}' ORDER BY ORDEM`
    );
    const aprovacoes = obterHistAprovadores.recordset;

    return renderJson(aprovacoes);
  },

  async statusForms (request) {
    const { codigo, tipo, usuario, tabelaBanco, descricaoTipo, solicitanteNome, colaborador, aprovado, obsRecusa, dataAprovacao } = request;

    console.log(request);

    const conexao = await sql.connect(db);

    const updateAprovacao = await conexao.query(
      `update APROVACOES_FORMS SET STATUS = '${aprovado}', DATA = '${dataAprovacao}' WHERE COD_SOLICITACAO ='${codigo}' AND TIPO = '${tipo}' AND COD_APROVADOR = '${usuario}' `
    );

    const numAprovavoes = await conexao.query(
      `select COUNT(ID) as TOTAL from Aprovacoes_FORMS where COD_SOLICITACAO ='${codigo}' AND TIPO = '${tipo}'`
    );

    const numAprovadas = await conexao.query(
      `select COUNT(ID) as TOTAL from Aprovacoes_FORMS WHERE STATUS = 'S' AND COD_SOLICITACAO ='${codigo}' AND TIPO = '${tipo}'`
    );

    console.log(numAprovadas.recordset[0].TOTAL);
    console.log(numAprovavoes.recordset[0].TOTAL);

    let proxEmail = [];

    if (numAprovadas.recordset[0].TOTAL < numAprovavoes.recordset[0].TOTAL && aprovado === 'S') {
      const buscarProxAprovador = await conexao.query(
        `SELECT TOP 1 COD_APROVADOR FROM APROVACOES_FORMS WHERE STATUS = 'N' AND COD_SOLICITACAO ='${codigo}' AND TIPO = '${tipo}' ORDER BY ORDEM`
      );

      const proxAprov = buscarProxAprovador.recordset[0].COD_APROVADOR;

      console.log(buscarProxAprovador);

      const buscarEmailProxAprovador = await conexao.query(
        `select top 1 email_usuario from Usuarios WHERE COD_USUARIO = '${proxAprov}'`
      );
      statusAprov = '';
      proxEmail = [buscarEmailProxAprovador.recordset[0].email_usuario];
      console.log(buscarEmailProxAprovador.recordset[0].email_usuario);
    } else if (aprovado === 'R') {
      const buscarEmailSolicitante = await conexao.query(
        `select top 1 email_usuario from Usuarios WHERE NOME_USUARIO = '${solicitanteNome}'`
      );

      console.log('Solicitação Reprovada');

      proxEmail = [buscarEmailSolicitante.recordset[0].email_usuario];

      statusAprov = 'Reprovada';

      await conexao.query(
        `update ${tabelaBanco}  SET APROVADO = 'N', STATUS = 'R', OBS_RECUSA = '${obsRecusa}' WHERE ID ='${codigo}'`
      );
    } else {
      const buscarEmailSolicitante = await conexao.query(
        `select top 1 email_usuario from Usuarios WHERE NOME_USUARIO = '${solicitanteNome}'`
      );

      console.log('finalizou as aprovações');
      if (tipo === 'F') {
        const buscarCodGestor = await conexao.query(
          `select top 1 GESTOR from Usuarios WHERE NOME_USUARIO = '${solicitanteNome}'`
        );
        if (buscarCodGestor.recordset[0].GESTOR) {
          const buscarEmailGestor = await conexao.query(`select top 1 email_usuario from Usuarios WHERE COD_USUARIO = '${buscarCodGestor.recordset[0].GESTOR}'`);
          proxEmail = [buscarEmailSolicitante.recordset[0].email_usuario, buscarEmailGestor.recordset[0].email_usuario, 'wesley.silva@itone.com.br', 'wesley.silva@itone.com.br'];
        } else {
          proxEmail = [buscarEmailSolicitante.recordset[0].email_usuario, 'wesley.silva@itone.com.br', 'wesley.silva@itone.com.br'];
        }
      } else {
        proxEmail = [buscarEmailSolicitante.recordset[0].email_usuario, 'wesley.silva@itone.com.br', 'wesley.silva@itone.com.br'];
      }
      statusAprov = 'Aprovada';

      await conexao.query(
        `update ${tabelaBanco}  SET APROVADO = 'Y', STATUS = 'A' WHERE ID ='${codigo}'`
      );
    }

    const dadosEmail = {
      codigoEmail: codigo,
      nome: colaborador,
      tipo: descricaoTipo,
      solicitante: solicitanteNome
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

          for (i in proxEmail) {
            const emailOptions = {
              to: proxEmail[i],
              subject: `Solicitação de ${descricaoTipo} ${statusAprov} `,
              content: data,
              isHtlm: true
            };

            enviarEmail(emailOptions);
          }
        }
      }
    );

    return renderJson(dadosEmail);
  },

  async dadosDepartamento (request) {
    const conexao = await sql.connect(db);

    const obterDepart = await conexao.query(
      'select DESCRICAO from DEPARTAMENTO '
    );

    const dados = obterDepart.recordsets[0];

    // console.log(dados[0].Solicitante)
    // console.log(dados[0].DESCRICAO);

    return renderJson(dados);

    // return ({ notasRecebidas, notaUnica, totalPaginas, paginate, descricaoSalva, fornecedorSalva, solicitanteSalva, centroCustoExtensoSalva})
  },

  async validacaoFormDP (request) {
    const { CODIGO, COLABORADOR, SOLICITANTE, TIPO, STATUS, MOTIVO_RECUSA, DATA_APROVACAO, TIPO_FORM, APROVADOR } = request;

    console.log(request);

    const conexao = await sql.connect(db);

    if (STATUS === 'R') {
      await conexao.query(
        `      update ${TIPO} SET STATUS = '${STATUS}', OBS_RECUSA = '${MOTIVO_RECUSA}', USUARIO_DP = '${APROVADOR}' WHERE ID ='${CODIGO}'`
      );

      const buscarEmailSolicitante = await conexao.query(
        `select top 1 email_usuario from Usuarios WHERE COD_USUARIO = '${SOLICITANTE}'`
      );

      console.log('Solicitação Reprovada');

      proxEmail = [buscarEmailSolicitante.recordset[0].email_usuario];

      statusAprov = 'Reprovada';

      formsService.enviarEmail(CODIGO, COLABORADOR, SOLICITANTE, proxEmail, TIPO_FORM, statusAprov);
    } else {
      await conexao.query(
        `      update ${TIPO} SET APROVACAO_DP = '${STATUS}', DATA_APROVACAO_DP = '${DATA_APROVACAO}', USUARIO_DP = '${APROVADOR}'   WHERE ID ='${CODIGO}'`
      );

      if (STATUS === 'S' && TIPO === 'FERIAS') {
        formsService.buscarAprovadoresFerias(CODIGO, SOLICITANTE, 'F', COLABORADOR);
      } else {
        formsService.buscarAprovadores(CODIGO, SOLICITANTE, COLABORADOR, TIPO_FORM);
      }
    }

    return SOLICITANTE;
  },

  // Férias
  async insertFerias (req, res) {
    const {
      NOME,
      CC,
      DATA_INICIO,
      NUM_DIAS,
      ABONO_FERIAS,
      ADIANTAMENTO,
      SOLICITANTE,
      NOME_SOLICITANTE,
      DATA_SOLICITACAO,
      DATA_FIM
    } = req.body;

    console.log(req.body);

    const conexao = await sql.connect(db);

    const result = await conexao
      .request()

      .input('NOME', sql.VarChar, NOME)
      .input('CC', sql.VarChar, CC)
      .input('DATA_INICIO', sql.VarChar, DATA_INICIO)
      .input('NUM_DIAS', sql.Int, NUM_DIAS)
      .input('ABONO_FERIAS', sql.VarChar, ABONO_FERIAS)
      .input('ADIANTAMENTO', sql.VarChar, ADIANTAMENTO)
      .input('SOLICITANTE', sql.VarChar, SOLICITANTE)
      .input('DATA_SOLICITACAO', sql.VarChar, DATA_SOLICITACAO)
      .input('DATA_FIM', sql.VarChar, DATA_FIM)

      .query(
        'INSERT INTO ferias (NOME, CC, DATA_INICIO, NUM_DIAS, ABONO_FERIAS, ADIANTAMENTO, SOLICITANTE, DATA_SOLICITACAO, DATA_FIM)    OUTPUT Inserted.ID,  Inserted.NOME, Inserted.DATA_INICIO, Inserted.ID_USUARIO VALUES   (@nome, @CC, @DATA_INICIO, @NUM_DIAS, @ABONO_FERIAS, @ADIANTAMENTO, @SOLICITANTE, @DATA_SOLICITACAO, @DATA_FIM)'
      );

    const codigo = result.recordset[0].ID;

    const buscaremailDP = await conexao.query('select * from Emails where ID = 2');

    proxEmail = [buscaremailDP.recordset[0].EMAIL];

    formsService.enviarEmail(codigo, NOME, NOME_SOLICITANTE, proxEmail, 'Férias');

    return res.json(codigo);
  },

  async criarFerias (request) {
    // Controller destinado apenas para abrir a página de inserir uma nova solicitação
    const user = request.session.get('user');

    console.log(user);

    const message = await request.session.message();
    const dados = {};

    if (!user.tipoAcessos.FERIAS) {
      return redirect('/home');
    } else {
      return renderView('home/Movimentacao/Ferias/CreateFerias', {
        nome: user.nome,
        codigo: user.codigo,
        departamento: user.departamento,
        nomeCompleto: user.nomeCompleto,
        acesso: user.tipoAcessos,
        tipoRegime: user.tipoRegime,
        permissoes: user.permissoes,
        message,
        dados
      });
    }
    //   return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message });
  },

  // Alteracao
  async insertAlteracao (req, res) {
    const {
      NOME,
      DATA_MOVIMENTACAO,
      DATA_SOLICITACAO,
      SOLICITANTE,
      FILIAL_ATUAL,
      FILIAL_NOVO,
      DEPARTAMENTO_ATUAL,
      DEPARTAMENTO_NOVO,
      CC_ATUAL,
      CC_NOVO,
      CARGO_ATUAL,
      CARGO_NOVO,
      SALARIO_ATUAL,
      SALARIO_NOVO,
      GESTOR_ATUAL,
      GESTOR_NOVO,
      JUSTIFICATIVA,
      NOME_SOLICITANTE,
      CC_SOLICITANTE
    } = req.body;

    const conexao = await sql.connect(db);

    const result = await conexao
      .request()

      .input('NOME', sql.VarChar, NOME)
      .input('DATA_MOVIMENTACAO', sql.VarChar, DATA_MOVIMENTACAO)
      .input('DATA_SOLICITACAO', sql.VarChar, DATA_SOLICITACAO)
      .input('SOLICITANTE', sql.VarChar, SOLICITANTE)
      .input('FILIAL_ATUAL', sql.VarChar, FILIAL_ATUAL)
      .input('FILIAL_NOVO', sql.VarChar, FILIAL_NOVO)
      .input('DEPARTAMENTO_ATUAL', sql.VarChar, DEPARTAMENTO_ATUAL)
      .input('DEPARTAMENTO_NOVO', sql.VarChar, DEPARTAMENTO_NOVO)
      .input('CC_ATUAL', sql.VarChar, CC_ATUAL)
      .input('CC_NOVO', sql.VarChar, CC_NOVO)
      .input('CARGO_ATUAL', sql.VarChar, CARGO_ATUAL)
      .input('CARGO_NOVO', sql.VarChar, CARGO_NOVO)
      .input('SALARIO_ATUAL', sql.Float, SALARIO_ATUAL)
      .input('SALARIO_NOVO', sql.Float, SALARIO_NOVO)
      .input('GESTOR_ATUAL', sql.VarChar, GESTOR_ATUAL)
      .input('GESTOR_NOVO', sql.VarChar, GESTOR_NOVO)
      .input('JUSTIFICATIVA', sql.VarChar, JUSTIFICATIVA)
      .input('CC_SOLICITANTE', sql.VarChar, CC_SOLICITANTE)

      .query(
        'INSERT INTO ALTERACAO_CADASTRAL (NOME, DATA_MOVIMENTACAO, DATA_SOLICITACAO, SOLICITANTE, FILIAL_ATUAL, FILIAL_NOVO, DEPARTAMENTO_ATUAL, DEPARTAMENTO_NOVO, CC_ATUAL, CC_NOVO, CARGO_ATUAL, CARGO_NOVO, SALARIO_ATUAL,SALARIO_NOVO,GESTOR_ATUAL,GESTOR_NOVO,JUSTIFICATIVA,CC_SOLICITANTE)    OUTPUT Inserted.ID,  Inserted.NOME VALUES   (@NOME, @DATA_MOVIMENTACAO, @DATA_SOLICITACAO, @SOLICITANTE, @FILIAL_ATUAL, @FILIAL_NOVO, @DEPARTAMENTO_ATUAL, @DEPARTAMENTO_NOVO, @CC_ATUAL, @CC_NOVO, @CARGO_ATUAL, @CARGO_NOVO, @SALARIO_ATUAL,@SALARIO_NOVO,@GESTOR_ATUAL,@GESTOR_NOVO,@JUSTIFICATIVA, @CC_SOLICITANTE)'
      );

    const codigo = result.recordset[0].ID;

    const buscaremailDP = await conexao.query('select * from Emails where ID = 2');

    proxEmail = [buscaremailDP.recordset[0].EMAIL];

    formsService.enviarEmail(codigo, NOME, NOME_SOLICITANTE, proxEmail, 'Alteração Cadastral');

    return res.json(codigo);
  },

  async CriarAlteracao (request) {
    // Controller destinado apenas para abrir a página de inserir uma nova solicitação
    const user = request.session.get('user');
    console.log(user);
    const message = await request.session.message();
    const dados = {};
    if (!user.tipoAcessos.ALTERACAO_CADASTRAL) {
      return redirect('/formularios');
    } else {
      return renderView('home/Movimentacao/alteracaoCadastral/CreateAlteracao', {
        nome: user.nome,
        acesso: user.tipoAcessos,
        codigo: user.codigo,
        permissoes: user.permissoes,
        departamento: user.departamento,
        message,
        dados
      });
    //   return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message });
    }
  },

  // Desligamento
  async insertDesligamento (req, res) {
    const {
      NOME,
      CC,
      DATA_AVISO,
      ULTIMO_DIA,
      DATA_SOLICITACAO,
      TIPO_REGIME,
      TIPO_AVISO,
      TIPO_DESLIGAMENTO,
      DESCONTO,
      MOTIVO,
      OBSERVACAO,
      SUBSTITUICAO,
      SOLICITANTE,
      NOME_SOLICITANTE

    } = req.body;

    const conexao = await sql.connect(db);

    const result = await conexao
      .request()

      .input('NOME', sql.VarChar, NOME)
      .input('CC', sql.VarChar, CC)
      .input('DATA_AVISO', sql.VarChar, DATA_AVISO)
      .input('ULTIMO_DIA', sql.VarChar, ULTIMO_DIA)
      .input('DATA_SOLICITACAO', sql.VarChar, DATA_SOLICITACAO)
      .input('TIPO_REGIME', sql.VarChar, TIPO_REGIME)
      .input('TIPO_AVISO', sql.Int, TIPO_AVISO)
      .input('TIPO_DESLIGAMENTO', sql.Int, TIPO_DESLIGAMENTO)
      .input('DESCONTO', sql.Int, DESCONTO)
      .input('MOTIVO', sql.Int, MOTIVO)
      .input('OBSERVACAO', sql.VarChar, OBSERVACAO)
      .input('SUBSTITUICAO', sql.VarChar, SUBSTITUICAO)
      .input('SOLICITANTE', sql.VarChar, SOLICITANTE)

      .query(
        'INSERT INTO rescisao (NOME, CC, DATA_AVISO, ULTIMO_DIA, DATA_SOLICITACAO, TIPO_REGIME, TIPO_AVISO, TIPO_DESLIGAMENTO, DESCONTO, MOTIVO, OBSERVACAO, SUBSTITUICAO, SOLICITANTE)    OUTPUT Inserted.ID,  Inserted.NOME, Inserted.ULTIMO_DIA, Inserted.SOLICITANTE VALUES   (@NOME, @CC, @DATA_AVISO, @ULTIMO_DIA, @DATA_SOLICITACAO, @TIPO_REGIME, @TIPO_AVISO, @TIPO_DESLIGAMENTO, @DESCONTO, @MOTIVO, @OBSERVACAO, @SUBSTITUICAO, @SOLICITANTE)'
      );

    const codigo = result.recordset[0].ID;

    const buscaremailDP = await conexao.query('select * from Emails where ID = 2');

    proxEmail = [buscaremailDP.recordset[0].EMAIL];

    formsService.enviarEmail(codigo, NOME, NOME_SOLICITANTE, proxEmail, 'Desligamento');

    return res.json(codigo);
  },

  async CriarDesligamento (request) {
    // Controller destinado apenas para abrir a página de inserir uma nova solicitação
    const user = request.session.get('user');
    console.log(user);
    const message = await request.session.message();
    const dados = {};
    if (!user.tipoAcessos.RESCISAO) {
      return redirect('/formularios');
    } else {
      return renderView('home/Movimentacao/Desligamento/CreateRescisao', {
        nome: user.nome,
        codigo: user.codigo,
        departamento: user.departamento,
        acesso: user.tipoAcessos,
        tipoRegime: user.tipoRegime,
        permissoes: user.permissoes,
        message,
        dados
      });
    }
  },

  async criarHomeForms (request) {
    // Controller destinado apenas para abrir a página de inserir uma nova solicitação
    const user = request.session.get('user');

    const message = await request.session.message();
    const dados = {};

    if (!user.tipoAcessos.FERIAS) {
      return redirect('/home');
    } else {
      return renderView('home/Movimentacao/Formularios/Index', {
        nome: user.nome,
        codigo: user.codigo,
        departamento: user.departamento,
        nomeCompleto: user.nomeCompleto,
        tipoRegime: user.tipoRegime,
        acesso: user.tipoAcessos,
        message,
        dados
      });
    }
    //   return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message });
  }
  // async statusFormsDeferimento (request) {
  //   const { codigo, tabelaBanco, descricaoTipo, solicitanteNome, colaborador, deferimento, obsIndeferido } = request;

  //   console.log(request);
  //   const conexao = await sql.connect(db);

  //   const updateForm = await conexao.query(
  //     `update ${tabelaBanco}  SET STATUS = '${deferimento}', OBS_INDEFERIDO = '${obsIndeferido}' WHERE ID ='${codigo}'`
  //   );

  //   if (deferimento === 'D') {
  //     statusAprov = 'Deferida';
  //   } else {
  //     statusAprov = 'Indeferida';
  //   }
  //   const buscarEmailSolicitante = await conexao.query(
  //     `select top 1 email_usuario from Usuarios WHERE NOME_USUARIO = '${solicitanteNome}'`
  //   );

  //   if (descricaoTipo === 'Férias') {
  //     const buscarCodGestor = await conexao.query(
  //       `select top 1 GESTOR from Usuarios WHERE NOME_USUARIO = '${solicitanteNome}'`
  //     );
  //     if (buscarCodGestor.recordset[0].GESTOR) {
  //       const buscarEmailGestor = await conexao.query(`select top 1 email_usuario from Usuarios WHERE COD_USUARIO = '${buscarCodGestor.recordset[0].GESTOR}'`);
  //       emailSolicitante = [buscarEmailSolicitante.recordset[0].email_usuario, buscarEmailGestor.recordset[0].email_usuario];
  //     } else {
  //       emailSolicitante = [buscarEmailSolicitante.recordset[0].email_usuario];
  //     }
  //   } else {
  //     emailSolicitante = [buscarEmailSolicitante.recordset[0].email_usuario];
  //   }

  //   const dadosEmail = {
  //     codigoEmail: codigo,
  //     nome: colaborador,
  //     tipo: descricaoTipo,
  //     solicitante: solicitanteNome
  //   };

  //   console.log(dadosEmail);

  //   // console.log(dadosEmail)

  //   const token = jwt.sign(
  //     {
  //       Codigo: codigo
  //     },
  //     Keytoken.secret,
  //     {
  //       expiresIn: '100d'
  //     }
  //   );

  //   href = domain + '/notafiscal/buscarNotas?tokenReceive=' + token;

  //   ejs.renderFile(
  //     'template-email/retornoEmailForms.ejs',
  //     { dadosEmail, href },
  //     function (err, data) {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         console.log(data);

  //         for (i in emailSolicitante) {
  //           const emailOptions = {
  //             to: emailSolicitante[i],
  //             subject: `Solicitação de ${descricaoTipo} ${statusAprov} `,
  //             content: data,
  //             isHtlm: true
  //           };
  //           enviarEmail(emailOptions);
  //         }
  //       }
  //     }
  //   );
  //   const dados = updateForm.recordsets[0];

  //   // console.log(dados[0].Solicitante)

  //   return renderJson(dados);

  //   // return ({ notasRecebidas, notaUnica, totalPaginas, paginate, descricaoSalva, fornecedorSalva, solicitanteSalva, centroCustoExtensoSalva})
  // },
};
