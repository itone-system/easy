const { db } = require('../../../config/env');
const enviarEmail = require('../../../infra/emailAdapter');
const tokenAdapter = require('../../../infra/tokenAdapter');
const verifyIndiceAdapter = require('../../../infra/verifyIndiceAdapter');
const aprovacaoPendente = require('../../../template-email/Vagas/aprovacao_pendente')
const processoSeletivo = require('../../../template-email/Vagas/processo_seletivo')
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
            celularCorporativo = 'S', pcd = 'S', usuarioSimilarAtivo, acessosEspecificos,
            dataDeAbertura = new Date() } = request

        try {

            const conexao = await sql.connect(db);

            const user = request.session.get('user');

            //inserir e retornar o código 
            await verifyIndiceAdapter('SOLICITACAO_ADMISSAO', 'CODIGO')

            const codigoInsert = await solicitacaoService.insert(dados = {
                tipoDeAdmissao: tipo,
                substituicao: substituicao,
                unidade: unidade,
                departamento: departamento,
                centroDecusto: centroDecusto.match(/[\d\.]+/)[0].trim(),
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
                solicitante: user.codigo,
                pcd: pcd
            })

            const buscaAprovadores = await solicitacaoService.buscaAprovadores(user)
            console.log(buscaAprovadores[0])
            for await (const { COD_USUARIO, Ordem } of buscaAprovadores) {
                await conexao
                    .request()
                    .query(
                        `INSERT INTO Aprovacoes ( Codigo_Solicitacao, Codigo_Aprovador, Ordem, Modulo) VALUES (${codigoInsert}, ${COD_USUARIO}, ${Ordem}, 3)`
                    );
            }


            const token = tokenAdapter({
                codigoInsert,
                aprovador: buscaAprovadores[0].COD_USUARIO,
                id: buscaAprovadores[0].COD_USUARIO,
                router: `/vagas/${codigoInsert}/detail`
            });

            const link = `${domain}/vagas/${codigoInsert}/detail?token=${token}`

            const firstEmail = await conexao.request().query(`select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${buscaAprovadores[0].COD_USUARIO}`)

            const emailOptions = {
                to: firstEmail.recordset[0].EMAIL_USUARIO,
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

            enviarEmail(emailOptions)
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
        const { solicitante = '', status = '', departamento = '', unidade = '', page = 1 } = request

        try {

            const user = request.session.get('user');

            const usuarios = await solicitacaoService.solicitantes(user)

            const busca = await solicitacaoService.listar({ solicitante, status, departamento, unidade }, page, user)


            const result = busca

            return renderView('homeVagas/Admissao/Index', {
                solicitacoes: result,
                nome: user.nome,
                dadosUser: user,
                usuarios: usuarios,
                page: page
            });
        } catch (error) {
            console.log(error)
            return redirect('/vagas');
        }



    },

    async detail(request) {

        const solicitacao = await solicitacaoService.solicitacaoUnica(request.codigo)
        const user = request.session.get('user')

        // solicitacao.etapas = {
        //     'aprovacao-vaga': 'done',
        //     'processo-seletivo': 'done',
        //     propostas: 'done',
        //     'exame-admissional': 'done',
        //     contratado: 'ondone'
        // };

        if (solicitacao.STATUS == 'A') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'ondone',
                'exame-admissional': 'ondone',
                contratado: 'ondone'
            };
        }
        if (solicitacao.STATUS == 'PS') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'done',
                'exame-admissional': 'ondone',
                contratado: 'ondone'
            };
        }



        if (solicitacao.STATUS == 'PA') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'done',
                'exame-admissional': 'done',
                contratado: 'ondone'
            };
        }

        if (solicitacao.STATUS == 'C') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'done',
                'exame-admissional': 'done',
                contratado: 'done'
            };
        }

        const candidato = {}

        if (solicitacao.STATUS == 'PA') {

        }

        const momentoAprovacaoPesquisa = await solicitacaoService.verifyAprovador(user.codigo, solicitacao.CODIGO)

        let momentoAprovacao = 'N'

        if (momentoAprovacaoPesquisa == 1) {
            momentoAprovacao = 'Y'
            console.log('é sua vez')
        }

        if (momentoAprovacaoPesquisa == 0) {
            console.log('não é sua vez')

        }

        return renderView('homeVagas/Admissao/Detail', { solicitacao, nome: user.nome, candidato, dadosUser: user, momentoAprovacao: momentoAprovacao });
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

        const user = request.session.get('user')

        await conexao.request().query(`INSERT INTO PROFISIONAIS (
            NOME_PROFISSIONAL,
            TUTOR_ONBOARDING,
            TELEFONE,
            EMAIL,
            INDICACAO_PREMIADA,
            EMAIL_CORPORATIVO,
            PCD,
            DATAINICIO,
            MODALIDADE,
            ESCALA,
            TREINAMENTOS,
            OBSERVACOES,
            RESPONSÁVEL_PELO_RETORNO
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
            '${observacoes}',
            ${user.codigo}
          )`)

        await conexao
            .request()
            .query(
                `UPDATE SOLICITACAO_ADMISSAO SET STATUS = 'PA' WHERE CODIGO = ${codigo}`
            );

        const corpo =
            'Usuário cadastrado';

        return renderJson(corpo);
    },

    async aprovar(request) {
        const { codigoSolicitacao } = request;

        const modulo = 3

        const user = request.session.get('user')

        const conexao = await sql.connect(db);

        await conexao
            .request()
            .query(
                `UPDATE Aprovacoes SET Status = 'Y' WHERE Codigo_Aprovador = ${user.codigo} and Codigo_Solicitacao = ${codigoSolicitacao} and MODULO = ${modulo}`
            );


        const buscarProximoAprovador = await solicitacaoService.buscarProximoAprovador(codigoSolicitacao)

        const solicitacao = await solicitacaoService.solicitacaoUnica(codigoSolicitacao)

        if (buscarProximoAprovador != undefined) {

            const token = tokenAdapter({
                codigoSolicitacao,
                aprovador: buscarProximoAprovador.COD_USUARIO,
                id: buscarProximoAprovador.COD_USUARIO,
                router: `/vagas/${codigoSolicitacao}/detail`
            });

            const link = `${domain}/vagas/${codigoSolicitacao}/detail?token=${token}`

            const emailOptions = {
                to: buscarProximoAprovador.EMAIL_USUARIO,
                subject: 'Solicitação de Aprovação',
                content: aprovacaoPendente({
                    link,
                    codigoSolicitacao: codigoSolicitacao,
                    cargo: solicitacao.CARGO,
                    unidade: solicitacao.UNIDADE,
                    departamento: solicitacao.DEPARTAMENTO,
                    gestorImediato: solicitacao.GESTOR_IMEDIATO

                }),
                isHtlm: true
            };

            enviarEmail(emailOptions)
        }
        console.log(buscarProximoAprovador)

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
    },

    async home(request) {
        const user = request.session.get('user');
        return renderView('homeVagas/index', { nome: user.nome, dadosUser: user })
    },

    async criar(request) {
        const user = request.session.get('user');
        return renderView('homeVagas/Admissao/Create', { nome: user.nome, dadosUser: user })
    }


}