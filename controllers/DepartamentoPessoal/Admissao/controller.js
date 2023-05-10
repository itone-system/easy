const { db } = require('../../../config/env');
const enviarEmail = require('../../../infra/emailAdapter');
const tokenAdapter = require('../../../infra/tokenAdapter');
const aprovacaoPendente = require('../../../template-email/Movimentacao/Admissao/aprovacao_pendente')
const processoSeletivo = require('../../../template-email/Movimentacao/Admissao/processo_seletivo')
const solicitacaoService = require('./service')
const sql = require('mssql');
const { domain } = require('../../../config/env');
const { renderView, renderJson, redirect } = require('../../../helpers/render');
module.exports = {

    async insert(request) {
        const { tipo, substituicao = 'S',
            unidade, departamento, centroDecusto,
            salario, cliente = 'N', gestorImediato,
            cargo, deal = 'N', horario, equipamento, cartaoDeVisita = 'S',
            celularCorporativo = 'S', usuarioSimilarAtivo, acessosEspecificos,
            dataDeAbertura = new Date() } = request

        try {

            const conexao = await sql.connect(db);

            const user = request.session.get('user');

            //inserir e retornar o código 
            const codigoInsert = await solicitacaoService.insert(dados = {
                tipoDeAdmissao: tipo,
                substituicao: substituicao,
                unidade: unidade,
                departamento: departamento,
                centroDecusto: centroDecusto,
                salario: salario,
                cliente: cliente,
                gestorImediato: gestorImediato,
                cargo: cargo,
                deal: deal,
                horario: horario,
                equipamento: equipamento,
                cartaoDeVisita: cartaoDeVisita,
                celularCorporativo: celularCorporativo,
                usuarioSimilarAtivo: usuarioSimilarAtivo,
                acessosEspecificos: acessosEspecificos,
                dataDeAbertura: dataDeAbertura,
                solicitante: user.codigo
            })

            const buscaAprovadores = await conexao.request().query(`
            SELECT Usuarios.COD_USUARIO as codigoDiretor, diretorFinanceiro.codigo as codigoDiretorFinanceiro
            FROM Usuarios
            INNER JOIN centrocusto ON Usuarios.COD_USUARIO = centrocusto.codigoDiretor
            LEFT JOIN diretorFinanceiro ON diretorFinanceiro.id = 1
            WHERE centroDeCusto = ${user.centroCusto}
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
        // let { Descricao, Solicitante, statusItem, centroCustoFiltro } = request
        try {

            const user = request.session.get('user');
    
            const conexao = await sql.connect(db);
            
    
            const busca = await conexao.request().query(`SELECT TOP 7 *
            FROM solicitacaoAdmissao
            ORDER BY dataDeAbertura DESC
            `)
    
            const result = busca.recordset
            console.log(result)
            return renderView('home/Movimentacao/Admissao/Index', {
                solicitacoes: result,
                nome: user.nome,
              });
        } catch (error) {
            console.log(error)
            return redirect('/vagas');
        }



    },

    async detail(request) {

        const solicitacao = await solicitacaoService.solicitacaoUnica(request.codigo)

        // solicitacao.etapas = {
        //     'aprovacao-vaga': 'done',
        //     'processo-seletivo': 'done',
        //     propostas: 'done',
        //     'exame-admissional': 'done',
        //     contratado: 'ondone'
        // };

        if (solicitacao.status == 'A') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'ondone',
                propostas: 'ondone',
                'exame-admissional': 'ondone',
                contratado: 'ondone'
            };
        }
        if (solicitacao.status == 'PS') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'done',
                propostas: 'ondone',
                'exame-admissional': 'ondone',
                contratado: 'ondone'
            };
        }



        if (solicitacao.status == 'E') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'done',
                propostas: 'done',
                'exame-admissional': 'done',
                contratado: 'ondone'
            };
        }

        if (solicitacao.status == 'C') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'done',
                propostas: 'done',
                'exame-admissional': 'done',
                contratado: 'done'
            };
        }

        const candidato = {}


        return renderView('home/Movimentacao/Admissao/Detail', { solicitacao, nome: 'Gustavo Costa', candidato });
    },

    async insertCandidato(request) {
        const {
            nomeProfissional,
            tutorOnboarding,
            Telefone,
            email,
            indicacaoPremiada,
            emailCorporativo,
            pcd = 'S',
            dataInicio,
            modalidade,
            escala = 'S',
            treinamentos,
            observacoes,
            codigo
        } = request

        const conexao = await sql.connect(db);
        await conexao.request().query(`INSERT INTO Profissionais (
            nomeProfissional,
            tutorOnboarding,
            Telefone,
            email,
            indicacaoPremiada,
            emailCorporativo,
            pcd,
            dataInicio,
            modalidade,
            escala,
            treinamentos,
            observacoes
          ) VALUES (
            '${nomeProfissional}',
            '${tutorOnboarding}',
            '${Telefone}',
            '${email}',
            '${indicacaoPremiada}',
            '${emailCorporativo}',
            '${pcd}',
            '${dataInicio}',
            '${modalidade}',
            '${escala}',
            '${treinamentos}',
            '${observacoes}'
          )`)

        await conexao
            .request()
            .query(
                `UPDATE solicitacaoAdmissao SET status = 'E' WHERE Codigo = ${codigo}`
            );

        const corpo =
            'Usuário cadastrado';

        return renderJson(corpo);
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

        const emailDiretorFinanceiro = await conexao.request().query(`select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${codigoDiretorFinanceiro.recordset[0].codigo}`)

        const solicitacao = await solicitacaoService.solicitacaoUnica(codigoSolicitacao)

        if (user.codigo != codigoDiretorFinanceiro.recordset[0].codigo) {

            const token = tokenAdapter({
                codigoSolicitacao,
                aprovador: codigoDiretorFinanceiro.recordset[0].codigo,
                id: codigoDiretorFinanceiro.recordset[0].codigo,
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
        await conexao
            .request()
            .query(
                `UPDATE solicitacaoAdmissao SET status = 'PS' WHERE Codigo = ${codigoSolicitacao}`
            );
        // enviar email para começar o fluxo de processo seletivo
        // criar lógica de buscar email do responsável por gente e cultura
        const emailGenteCultura = 'gustavo@.com.br'

        const token = tokenAdapter({
            codigoSolicitacao,
            aprovador: 2,
            router: `/vagas/${codigoSolicitacao}/detail`
        });

        const link = `${domain}/vagas/${codigoSolicitacao}/detail?token=${token}&approved=true`

        const emailOptionsGenteCultura = {
            to: emailGenteCultura,
            subject: 'Processo Seletivo',
            content: processoSeletivo({
                link,
                codigoSolicitacao: codigoSolicitacao,
                cargo: solicitacao.cargo,
                unidade: solicitacao.unidade,
                departamento: solicitacao.departamento,
                gestorImediato: solicitacao.gestorImediato

            }),
            isHtlm: true
        };

        enviarEmail(emailOptionsGenteCultura)

        // decidir como será o acesso deste departamento no sistema


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