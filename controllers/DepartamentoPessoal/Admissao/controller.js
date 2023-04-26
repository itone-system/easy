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
                    codigoSolicitacao: codigoInsert,
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
        
        const solicitacao = await solicitacaoService.solicitacaoUnica(request.codigo)
      
        solicitacao.etapas = {
            'aprovacao-vaga': 'done',
            'processo-seletivo': 'done',
            propostas: 'done',
            'exame-admissional': 'done',
            contratado: 'ondone'
        };
        return renderView('home/Movimentacao/Admissao/Detail', { solicitacao, nome: 'Gustavo Costa' });
    },

    async aprovar(request) {
        const { codigoSolicitacao, tipo } = request;

        const user = request.session.get('user')

        const conexao = await sql.connect(db);

        await conexao
            .request()
            .query(
                `UPDATE Aprovacoes SET Status = 'Y' WHERE Codigo_Aprovador = ${user.codigo} and Codigo_Solicitacao = ${codigoSolicitacao} and Tipo = ${tipo}`
            );

        const codigoDiretorFinanceiro = await conexao.request().query(`select codigo from DiretorFinanceiro df `)

        const emailDiretorFinanceiro = await conexao.request().query(`select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${codigoDiretorFinanceiro}`)

        const solicitacao = await solicitacaoService.solicitacaoUnica(codigoSolicitacao)

        if (user.codigo != codigoDiretorFinanceiro.recordset[0].codigo) {

            const token = tokenAdapter({
                codigoSolicitacao,
                aprovador: codigoDiretorFinanceiro,
                id: codigoDiretorFinanceiro,
                router: `/vagas/${codigoSolicitacao}/detail`
            });

            const link = `${domain}/vagas/${codigoSolicitacao}/detail?token=${token}`

            const emailOptionsDiretorFinanceiro = {
                to: emailDiretorFinanceiro.recordset[0].EMAIL_USUARIO,
                subject: 'Solicitação de Aprovação',
                content: aprovacaoPendente({
                    link,
                    codigoSolicitacao: codigoSolicitacao,
                    cargo: solicitacao.cargo,
                    unidade: solicitacao.unidade,
                    departamento: solicitacao.departamento,
                    gestorImediato: solicitacao.gestorImediato

                }),
                isHtlm: true
            };

            enviarEmail(emailOptionsDiretorFinanceiro)

            const corpo =
                'Solicitação N° ' + codigoSolicitacao + ' aprovada com sucesso';

            return renderJson(corpo);
        }

        // enviar email para começar o fluxo de processo seletivo
        // decidir como será o acesso deste departamento no sistema
        // 

        const corpo =
            'Solicitação N° ' + codigoSolicitacao + ' aprovada com sucesso';

        return renderJson(corpo);
    },

    async Reprovar(request) {
        const { codigoSolicitacao, motivoReprovacao, Tipo } = request;

        const user = request.session.get('user');

        const conexao = await sql.connect(db);
    
        await conexao
          .request()
          .query(
            `UPDATE Aprovacoes SET Status = 'R' WHERE Codigo_Solicitacao = ${codigoSolicitacao}`
          );
    
        await conexao
          .request()
          .query(
            `update solicitacaoAdmissao set Status_Compra = 'R' where Codigo = ${codigoSolicitacao}`
          );
    
        await conexao
          .request()
          .query(
            `update Aprovacoes set Reprovador = ${user.codigo} where Codigo = ${codigoSolicitacao}`
          );
    
        await conexao
          .request()
          .query(
            `update Aprovacoes set MotivoReprovacao = '${motivoReprovacao}' where Codigo = ${codigoSolicitacao}`
          );
    
        const corpo = 'Solicitação N° ' + codigoSolicitacao + ' foi reprovada';

        const emailSolicitante = await SolicitacaoService.buscarEmailSolicitante(codigoSolicitacao);

        const solicitacao = await solicitacaoService.solicitacaoUnica(
          codigoSolicitacao
        );
    
        // const reprovador = await conexao.request().query(`SELECT u.NOME_USUARIO
        // FROM Usuarios u
        // INNER JOIN Solicitacao_Item p ON p.Reprovador= u.COD_USUARIO
        // WHERE p.Codigo = ${codigoSolicitacao} `);
        const reprovador = await conexao.request().query(`select NOME_USUARIO from Usuarios where COD_USUARIO = ${user.codigo}`)
    
        const emailOptions = {
          to: email,
          subject: 'Solicitação De Compra reprovada',
          content: solicitacaoReprovadaTemplate({
            codigo: codigoSolicitacao,
            descricao,
            reprovador: reprovador.recordset[0].NOME_USUARIO,
            motivo: motivoReprovacao
          }),
          isHtlm: true
        };
    
        enviarEmail(emailOptions);
    
        return renderJson(corpo);
      }


}