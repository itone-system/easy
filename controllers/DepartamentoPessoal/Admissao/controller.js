const { db } = require('../../../config/env');
const enviarEmail = require('../../../infra/emailAdapter');
const tokenAdapter = require('../../../infra/tokenAdapter');
const aprovacaoPendente = require('../../../template-email/Movimentacao/aprovacao_pendente')
const solicitacaoService = require('./service')
const sql = require('mssql');
const { domain } = require('../../../config/env');
const { renderView, renderJson, redirect } = require('../../../helpers/render');
module.exports = {

    async insert(request) {
        const { tipoDeAdmissao, substituicao,
            unidade, departamento, centroDecusto,
            salario, cliente, tutorOnboarding, gestorImediato,
            cargo, deal, horario, equipamento, cartaoDeVisita,
            celularCorporativo, usuarioSimilarAtivo, acessosEspecificos,
            observacaoTrabalho, observacaoBusiness, dataDeAbertura = new Date(), solicitante } = request

        try {

            const conexao = await sql.connect(db);

            const user = request.session.get('user');

            //inserir e retornar o código 
            const codigoInsert = await solicitacaoService.insert(dados = {
                tipoDeAdmissao: tipoDeAdmissao,
                substituicao: substituicao,
                unidade: unidade,
                departamento: departamento,
                centroDecusto: centroDecusto,
                salario: salario,
                cliente: cliente,
                tutorOnboarding: tutorOnboarding,
                gestorImediato: gestorImediato,
                cargo: cargo,
                deal: deal,
                horario: horario,
                equipamento: equipamento,
                cartaoDeVisita: cartaoDeVisita,
                celularCorporativo: celularCorporativo,
                usuarioSimilarAtivo: usuarioSimilarAtivo,
                acessosEspecificos: acessosEspecificos,
                observacaoTrabalho: observacaoTrabalho,
                observacaoBusiness: observacaoBusiness,
                dataDeAbertura: dataDeAbertura,
                solicitante: solicitante
            })

            // return renderJson(corpo = codigoInsert, statusCode = 200)
            //buscar diretor da area por centro de custo e diretor financeiro, necessário garantir que o diretor da área esteja na posição 0
            // add centro de custo ao retorno do usuario 
            const centroTest = '6.4. GERENCIA DE TI E SISTEMAS'
            console.log('chegiou aq')
            const buscaAprovadores = await conexao.request().query(`SELECT Usuarios.COD_USUARIO as codigoDiretor, diretorFinanceiro.codigo as codigoDiretorFinanceiro
            FROM Usuarios
            INNER JOIN centrocusto ON Usuarios.COD_USUARIO = centrocusto.codigoDiretor
            LEFT JOIN diretorFinanceiro ON diretorFinanceiro.id = 1
            WHERE centroDeCusto = '${centroTest}'
            `)
            console.log(buscaAprovadores)
            let aprovadores = []
            aprovadores[0] = buscaAprovadores.recordset[0].codigoDiretor
            aprovadores[1] = buscaAprovadores.recordset[0].codigoDiretorFinanceiro
            console.log(codigoInsert)

            for (let index = 0; index < aprovadores.length; index++) {
                await conexao
                    .request()
                    .query(
                        `INSERT INTO AprovacoesMovimentacao ( Codigo_Solicitacao, Codigo_Aprovador, Ordem, Tipo) VALUES (${codigoInsert}, ${aprovadores[index]
                        }, ${index + 1}, 1)`
                    );
            }

            // const token = tokenAdapter({
            //     codigoInsert,
            //     aprovador: aprovadores[0],
            //     id: aprovadores[0],
            //     router: `/admissoes/${codigoInsert}/edit`
            //   });

            // const link = `${domain}//${token}`

            // emailOptionsDiretorArea = {
            //     to: aprovadores[0],
            //     subject: 'Solicitação de Aprovação',
            //     content: aprovacaoPendente({
            //         link,
            //         codigoInsert
            //     }),
            //     isHtlm: true
            // };

            // enviarEmail(emailOptionsDiretorArea)

            return renderJson(corpo = codigoInsert, statusCode = 200)


        } catch (error) {
            console.log('error ', error);
            request.session.message({
                title: 'Ops!',
                text: error.message,
                type: 'danger'
            });
        }


    },

    async listar(request) {
        const user = request.session.get('user');
        let { Descricao, Solicitante, statusItem, centroCustoFiltro } = request

    },

    async aprovar(request) {
        const { codigoSolicitacao, tipo } = request;

        const user = request.session.get('user')

        const conexao = await sql.connect(db);

        await conexao
            .request()
            .query(
                `UPDATE AprovacoesMovimentacao SET Status = 'Y' WHERE Codigo_Aprovador = ${user.codigo} and Codigo_Solicitacao = ${codigoSolicitacao}`
            );
        // add cargo no retorno do usuário
        if (user.cargo != 'Diretor Financeiro') {
            const token = tokenAdapter({
                codigoInsert,
                aprovador: aprovadores[0],
                id: aprovadores[0],
                router: `/admissoes/${codigoInsert}/edit`
            });

            const link = `${domain}//${token}`

            emailOptionsDiretorArea = {
                to: aprovadores[0],
                subject: 'Solicitação de Aprovação',
                content: aprovacaoPendente({
                    link,
                    codigoInsert
                }),
                isHtlm: true
            };

            enviarEmail(emailOptionsDiretorArea)
        }

        const corpo =
            'Solicitação N° ' + codigoSolicitacao + ' aprovada com sucesso';

        return renderJson(corpo);
    }


}