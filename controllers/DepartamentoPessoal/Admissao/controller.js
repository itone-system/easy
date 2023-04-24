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

            const buscaAprovadores = await conexao.request().query(`
            SELECT Usuarios.COD_USUARIO as codigoDiretor, diretorFinanceiro.codigo as codigoDiretorFinanceiro
            FROM Usuarios
            INNER JOIN centrocusto ON Usuarios.COD_USUARIO = centrocusto.codigoDiretor
            LEFT JOIN diretorFinanceiro ON diretorFinanceiro.id = 1
            WHERE centroDeCusto = 6
            `)
            let aprovadores = [
                {
                    codigo: buscaAprovadores.recordset[0].codigoDiretor
                },
                {
                    codigo: buscaAprovadores.recordset[0].codigoDiretorFinanceiro
                }
            ]

            let ordem = 1;

            for await (const { codigo } of aprovadores) {
                await conexao
                    .request()
                    .query(
                        `INSERT INTO Aprovacoes ( Codigo_Solicitacao, Codigo_Aprovador, Ordem, Tipo) VALUES (${codigoInsert}, ${codigo}, ${ordem}, 3)`
                    );
                ordem++
            }


            const token = tokenAdapter({
                codigoInsert,
                aprovador: aprovadores[0].codigo,
                id: aprovadores[0].codigo,
                router: `/vagas/${codigoInsert}/detail`
            });

            const link = `${domain}/vagas/${codigoInsert}/detail?token=${token}`
            
            const emailDiretor = await conexao.request().query(`select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${aprovadores[0].codigo}`)

            const emailOptionsDiretorArea = {
                to: emailDiretor.recordset[0].EMAIL_USUARIO,
                subject: 'Solicitação de Aprovação',
                content: aprovacaoPendente({
                    link,
                    codigoSolicitacao:codigoInsert,
                    cargo: cargo,
                    unidade: unidade,
                    departamento: departamento,
                    gestorImediato: gestorImediato

                }),
                isHtlm: true
            };

            enviarEmail(emailOptionsDiretorArea)

            return renderJson(codigoInsert)


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

    async detail(request) {
        console.log(request.codigo)
        const solicitacao = await solicitacaoService.solicitacaoUnica(request.codigo)

        return renderView('home/Movimentacao/Admissao/Detail', {solicitacao});
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
                router: `/vagas/${codigoInsert}/edit`
            });

            const link = `${domain}/vagas/${token}`

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