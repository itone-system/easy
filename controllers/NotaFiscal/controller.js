const { db, domain, pathNf } = require('../../config/env');
const ejs = require('ejs');
const sql = require('mssql');
const enviarEmail = require('../../infra/emailAdapter');
const { renderView, renderJson, redirect } = require('../../helpers/render');
const jwt = require('jsonwebtoken');
const { Keytoken } = require('../../config/env');

paginacaoTotal = 1;
paginates = 1;
descricaoSalva = '';
fornecedorSalva = '';
solicitanteSalva = '';
centroCustoSalva = '';
centroCustoExtensoSalva = '';

module.exports = {
  async insertNotas(req, res) {
    const {
      codsolicitante,
      dataSolicitacao,
      solicitante,
      CentroCusto,
      fornecedor,
      Descricao,
      tipoContrato,
      valorNF,
      dataPagamento,
      deal,
      Observacao,
      possuiColaborador,
      Colaborador,
      Anexo,
      Boleto,
      codigoSolicitacao = ''
    } = req.body;

    const conexao = await sql.connect(db);

    let result = await conexao
      .request()

      .input('codsolicitante', sql.Int, codsolicitante)
      .input('dataSolicitacao', sql.DateTime, dataSolicitacao)
      .input('Solicitante', sql.VarChar, solicitante)
      .input('CentroCusto', sql.VarChar, CentroCusto)
      .input('Fornecedor', sql.VarChar, fornecedor)
      .input('Descricao', sql.VarChar, Descricao)
      .input('TipoContrato', sql.VarChar, tipoContrato)
      .input('valorNF', sql.Float, valorNF)
      .input('DataPagamento', sql.VarChar, dataPagamento)
      .input('Deal', sql.Int, deal)
      .input('Observacao', sql.VarChar, Observacao)
      .input('PossuiColaborador', sql.VarChar, possuiColaborador)
      .input('Colaborador', sql.VarChar, Colaborador)
      .input('Anexo', sql.VarChar, Anexo)
      .input('Boleto', sql.VarChar, Boleto)
      .input('CodigoSolicitacao', sql.Int, codigoSolicitacao)

      .query(
        'INSERT INTO NotaFiscal (COD_SOLICITANTE,DATA_SOLICITACAO, Solicitante, CentroCusto, Fornecedor, Descricao, TipoContrato, valorNF, DataPagamento, Deal, Observacao, PossuiColaborador, Colaborador, Anexo, Boleto, CodigoSolicitacao )    OUTPUT Inserted.Codigo,  Inserted.Descricao, Inserted.Fornecedor, Inserted.Solicitante VALUES (@codsolicitante, @dataSolicitacao, @solicitante, @centroCusto, @fornecedor, @Descricao, @tipoContrato, @valorNF, @dataPagamento, @deal, @Observacao, @possuiColaborador, @Colaborador, @Anexo, @Boleto,  @codigoSolicitacao)'
      );

    const codigo = result.recordset[0].Codigo;

    const dadosEmail = {
      codigoEmail: result.recordset[0].Codigo,
      descricao: Descricao,
      fornecedor: fornecedor,
      solicitante: solicitante
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
      'template-email/retornoEmail.ejs',
      { dadosEmail, href },
      function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);

          var emailFinanceiro = 'financeiro@itone.com.br';

          const emailOptions = {
            to: emailFinanceiro,
            subject: 'Recebimento de Nota Fiscal',
            content: data,
            isHtlm: true
          };

          let emailContabil = 'entradasnf@itone.com.br';

          const emailOptionsContabil = {
            to: emailContabil,
            subject: 'Recebimento de Nota Fiscal',
            content: data,
            isHtlm: true
          };

          enviarEmail(emailOptions);
          enviarEmail(emailOptionsContabil);
        }
      }
    );

    // console.log(codigo)

    // var emailFinanceiro = 'wesley.silva@itone.com.br'

    // enviarEmail(emailFinanceiro, html)

    return res.json(codigo);
  },

  async listarNotas(request, res) {
    const conexao = await sql.connect(db);

    const user = request.session.get('user');
    console.log(user);
    const message = await request.session.message();

    let {
      paginate,
      limite = 10,
      Descricao,
      Fornecedor,
      Solicitante,
      CentroCusto,
      filtroAplicado,
      tokenReceive,
      codigoNF
    } = request;

    CentroCusto =
      CentroCusto == 'Centro de Custo' || CentroCusto == undefined
        ? ''
        : CentroCusto.split('. ');

    const requ = {
      pagina: paginate === 'prox' ? 1 : paginate === 'prev' ? -1 : 0,
      limite: 10,
      Descricao: Descricao == undefined ? '' : Descricao,
      Fornecedor: Fornecedor == undefined ? '' : Fornecedor,
      Solicitante: Solicitante == undefined ? '' : Solicitante,
      CentroCusto: CentroCusto ? CentroCusto[0] : '',
      CentroCustoExtenso: CentroCusto,
      filtroAplicado: request.buscar == undefined ? false : true,
      codigoNFUnic: codigoNF == undefined ? 1 : codigoNF
    };

    console.log(requ);

    const descricaoSalva = requ.Descricao ? requ.Descricao : '';
    const fornecedorSalva = requ.Fornecedor ? requ.Fornecedor : '';
    const solicitanteSalva = requ.Solicitante ? requ.Solicitante : '';
    const centroCustoExtensoSalva = requ.CentroCustoExtenso
      ? requ.CentroCustoExtenso
      : '';

    condicao = 1;

    listacondicoes = {
      Descricao: requ.Descricao,
      Fornecedor: requ.Fornecedor,
      Solicitante: requ.Solicitante,
      CentroCusto: requ.CentroCusto
    };

          // INÍCIO Restrição de Dados

          let tipoRestricao = user.tipoAcessos.NOTA_FISCAL;

          let condicaoResticaoDados = '';

          console.log(tipoRestricao);

          switch (tipoRestricao) {
            case 'FULL':
              condicaoResticaoDados = '';
              break;
            case 'DIRETOR':
              condicaoResticaoDados = ` (NOTA_FISCAL_VIEW.SOLICITANTE = '${user.nome}' OR NOTA_FISCAL_VIEW.DIRETOR = '${user.codigo}' )`;
              break;
            case 'GERENTE':
              condicaoResticaoDados = ` (NOTA_FISCAL_VIEW.SOLICITANTE = '${user.nome}' OR NOTA_FISCAL_VIEW.GESTOR = '${user.codigo}' )`;
              break;
            case 'COORDENADOR':
              // listacondicoes.SOLICITANTE = user.nome;
              condicaoResticaoDados = ` (NOTA_FISCAL_VIEW.SOLICITANTE = '${user.nome}' OR NOTA_FISCAL_VIEW.COORDENADOR = '${user.codigo}' )`;
              break;
            case 'COLABORADOR':
              condicaoResticaoDados = ` NOTA_FISCAL_VIEW.SOLICITANTE = '${user.nome}'`;
              break;
            case 'CENTRO DE CUSTO':
              condicaoResticaoDados = ` NOTA_FISCAL_VIEW.ID_DEPARTAMENTO = '${user.departamento}'`;
              break;
          }

          // FIM Restrição de Dados

    condicaoGeral = '';

    for (const [key, value] of Object.entries(listacondicoes)) {
      if (value) {
        if (condicao == 1) {
          condicaoQueryPart =
            key != 'CentroCusto'
              ? ` where ${key} like '%${value}%' `
              : ` where ${key} = '${value}' `;
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
      `SELECT COUNT (Codigo) as total FROM NOTA_FISCAL_VIEW ${condicaoGeral} ${condicaoResticaoDados} `
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
      await conexao.query(`SELECT	  *
   FROM	NOTA_FISCAL_VIEW  ${condicaoGeral} ${condicaoResticaoDados}
   ORDER BY Codigo desc
   OFFSET	${offset} ROWS FETCH NEXT ${limite} ROWS ONLY`);

    const obterNFUnica = await conexao.query(
      `SELECT * FROM	notaFiscal  where Codigo = '${requ.codigoNFUnic}'`
    );

    const notaUnica = obterNFUnica.recordsets[0];

    const notasRecebidas = obterSolicitacoes.recordsets[0];

    itens = obterSolicitacoes.recordsets[0];

    var dados = itens;

    if (tokenReceive) {
      const tokenRecebido = request.tokenReceive;

      dadosToken = jwt.verify(tokenRecebido, Keytoken.secret);
      // console.log('teste obter serviço', dadosToken);
      let = codigoToken = dadosToken.Codigo;
    } else {
      let = codigoToken = '';
    }
    // console.log(user.permissoes.NOTA_FISCAL.RETORNAR)
    if (!user.tipoAcessos.NOTA_FISCAL) {
      return redirect('/menu');
    } else {
    return renderView('home/NotaFiscal/DetailNF', {
      dados,
      notaUnica,
      descricaoSalva,
      fornecedorSalva,
      solicitanteSalva,
      centroCustoExtensoSalva,
      retornoUser: user.permissoes.NOTA_FISCAL.RETORNAR,
      nome: user.nome,
      codigoUsuario: user.codigo,
      codigoToken
    });

    // return ({ notasRecebidas, notaUnica, totalPaginas, paginate, descricaoSalva, fornecedorSalva, solicitanteSalva, centroCustoExtensoSalva})
  }
  },

  async atualizarStatusNota(req, res) {
    const { Codigo, StatusNF, Solicitante, Descricao, Fornecedor } = req;

    const conexao = await sql.connect(db);

    let result = await conexao
      .request()

      .input('Codigo', sql.Int, Codigo)
      .input('StatusNF', sql.VarChar, StatusNF)
      .query(
        'update NotaFiscal set StatusNF = @StatusNF where Codigo = @Codigo'
      );



      const dadosEmail = {
        codigoEmail: Codigo,
        descricao: Descricao,
        fornecedor: Fornecedor,
        solicitante: Solicitante
      };

      console.log(dadosEmail);

      // console.log(dadosEmail)

      const token = jwt.sign(
        {
          Codigo: Codigo,
          Descricao: Descricao

        },
        Keytoken.secret,
        {
          expiresIn: '100d'
        }
      );

      href = domain + '/notafiscal/buscarNotas?tokenReceive=' + token;

      ejs.renderFile(
        'template-email/retornoEmail.ejs',
        { dadosEmail, href },
        function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);

            var emailFinanceiro = 'financeiro@itone.com.br';

            const emailOptions = {
              to: emailFinanceiro,
              subject: 'Recebimento de Nota Fiscal',
              content: data,
              isHtlm: true
            }
            enviarEmail(emailOptions);

          }
        }
      )
    return result;

  },

  async Criar(request) {
    // Controller destinado apenas para abrir a página de inserir uma nova solicitação
    const user = request.session.get('user');
    console.log(user);
    const message = await request.session.message();
    const dados = {};
    if (!user.tipoAcessos.NOTA_FISCAL) {
      return redirect('/menu');
    } else {
    return renderView('home/NotaFiscal/CreateNF', {
      codigoUsuario: user.codigo,
      nome: user.nome,
      message,
      dados
    });
    //   return renderView('home/NotaFiscal/CreateNF', { nome: user.nome, message });
  }
  },

  async uploadNF(request, response) {
    response.send('Arquivo Recebido');
  },

  async pageInsert(request) {
    const {
      solicitante,
      descricao,
      observacao,
      centroCusto,
      deal,
      valor,
      codigo
    } = request;
    const user = request.session.get('user');
    const message = await request.session.message();

    const dados = {
      solicitante: solicitante,
      descricao: descricao,
      observacao: observacao,
      centroCusto: centroCusto,
      deal: deal,
      valor: valor,
      codigo: codigo
    };

    return renderView('home/NotaFiscal/CreateNF', {
      nome: user.nome,
      message,
      dados
    });
  },

  async downloadNF(request, response) {
    response.download(`${pathNf}` + request.params.path);
  },

  async notaUnica(request) {
    let { codigoNF } = request;

    codigoNFInt = codigoNF == undefined ? '' : codigoNF;

    const conexao = await sql.connect(db);

    const obterNFUnica = await conexao.query(
      `SELECT concat(format(datapagamento,'dd'),'/',format(datapagamento,'MM'),'/',year(datapagamento)) as [Data_Pagamento],* FROM	notaFiscal  where Codigo = '${codigoNFInt}'`
    );
    const dados = obterNFUnica.recordsets[0];

    // console.log(dados[0].Solicitante)

    return renderJson(dados);

    // return ({ notasRecebidas, notaUnica, totalPaginas, paginate, descricaoSalva, fornecedorSalva, solicitanteSalva, centroCustoExtensoSalva})
  },

  async downloadNF(request, response) {
    response.download(`${pathNf}` + request.params.path);
  },

  async criarHome (request) {
    // Controller destinado apenas para abrir a página de inserir uma nova solicitação
    const user = request.session.get('user');

    console.log(user);

    const message = await request.session.message();
    const dados = {};

    if (!user.tipoAcessos.NOTA_FISCAL) {
      return redirect('/menu');
    } else {
      return renderView('home/NotaFiscal/Index.ejs', {
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
};

