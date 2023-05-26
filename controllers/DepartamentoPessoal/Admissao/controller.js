const { db } = require('../../../config/env');
const enviarEmail = require('../../../infra/emailAdapter');
const tokenAdapter = require('../../../infra/tokenAdapter');
const verifyIndiceAdapter = require('../../../infra/verifyIndiceAdapter');
const aprovacaoPendente = require('../../../template-email/Vagas/aprovacao_pendente')
const processoSeletivo = require('../../../template-email/Vagas/processo_seletivo')
const atualizacao_aprovador = require('../../../template-email/Vagas/atualizacao_aprovador')
const atualizacao_solicitante = require('../../../template-email/Vagas/atualizacao_solicitante')
const processo_administrativo = require('../../../template-email/Vagas/processo_dp')
const processo_seletivoRec = require('../../../template-email/Vagas/processo_seletivoRec')
const vaga_reprovada = require('../../../template-email/Vagas/vaga_reprovada')
const atualizacao_aprovadorPosEdit = require('../../../template-email/Vagas/atualizacao_aprovadorPosEdit')
const contratado = require('../../../template-email/Vagas/contratado')
const solicitacaoService = require('./service')
const sql = require('mssql');
const { domain } = require('../../../config/env');
const { renderView, renderJson, redirect } = require('../../../helpers/render');
const solicitacaoAprovada = require('../../../template-email/Vagas/solicitacaoAprovada');
module.exports = {

    async insert(request) {
        const { tipo, substituicao = 'S',
            unidade, departamento, centroDecusto,
            salario, cliente = 'N', gestorImediato,
            cargo, deal = 'N', horario, equipamento, cartaoDeVisita = 'S',
            celularCorporativo = 'S', pcd = 'S', usuarioSimilarAtivo, acessosEspecificos,
            dataDeAbertura = new Date(), colaboradorSubstituido } = request

        try {

            const conexao = await sql.connect(db);

            const user = request.session.get('user');

            const cargoFormatado = await solicitacaoService.formatString(cargo)

            const colaboradorSubstituidoFormatado = await solicitacaoService.formatString(colaboradorSubstituido)

            const gestorImediatoFormatado = await solicitacaoService.formatString(gestorImediato)

            const usuarioSimilarAtivoFormatado = await solicitacaoService.formatString(usuarioSimilarAtivo)

            console.log('oioioi',colaboradorSubstituidoFormatado)
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
                gestorImediato: gestorImediatoFormatado,
                cargo: cargoFormatado,
                deal: deal,
                horario: horario,
                equipamento: equipamento,
                cartaoDeVisita: cartaoDeVisita,
                celularCorporativo: celularCorporativo,
                usuarioSimilarAtivo: usuarioSimilarAtivoFormatado,
                acessosEspecificos: acessosEspecificos,
                dataDeAbertura: dataDeAbertura,
                solicitante: user.codigo,
                pcd: pcd,
                colaboradorSubstituido: colaboradorSubstituidoFormatado
            })

            const buscaAprovadores = await solicitacaoService.buscaAprovadores(user)
            for await (const { COD_USUARIO, Ordem } of buscaAprovadores) {
                await conexao
                    .request()
                    .query(
                        `INSERT INTO APROVACOES_VAGAS ( Codigo_Solicitacao, Codigo_Aprovador, Ordem, Modulo) VALUES (${codigoInsert}, ${COD_USUARIO}, ${Ordem}, 3)`
                    );
            }

            const cargoUser = await solicitacaoService.buscarCargoUsuario(user.codigo)
            if (cargoUser != 'DIRETOR(a) ADMINISTRATIVO') {
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
                    subject: 'Abertura de Vaga',
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
            }

            if (cargoUser == 'DIRETOR(a) ADMINISTRATIVO') {
                await conexao.request().query(`update APROVACOES_VAGAS set Status = 'Y' where Codigo_Aprovador = ${user.codigo} and Codigo_Solicitacao = ${codigoInsert}`)

                await conexao.request().query(`update SOLICITACAO_ADMISSAO set STATUS = 'PS' where CODIGO = ${codigoInsert}`)

                const linkRH = `${domain}/vagas/${codigoInsert}/detail`

                const emailRH = 'rh@itone.com.br'

                const emailOptionsRH = {
                    to: emailRH,
                    subject: 'Processo Seletivo',
                    content: processoSeletivo({
                        link: linkRH,
                        codigoSolicitacao: codigoInsert,
                        cargo: cargo,
                        unidade: unidade,
                        departamento: departamento,
                        gestorImediato: gestorImediato

                    }),
                    isHtlm: true
                };



                enviarEmail(emailOptionsRH)

            }


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
        const conexao = await sql.connect(db);

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

        if (solicitacao.STATUS == 'CO') {

            solicitacao.etapas = {
                'conferencia-vaga': 'done',
                'aprovacao-vaga': 'ondone',
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

        if (solicitacao.STATUS == 'R') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'done',
                'exame-admissional': 'done',
                contratado: 'done',
                'indeferido': 'done'
            };
        }

        if (solicitacao.STATUS == 'CA') {

            solicitacao.etapas = {
                'aprovacao-vaga': 'done',
                'processo-seletivo': 'done',
                'exame-admissional': 'done',
                contratado: 'done',
                'indeferido': 'done',
                'vaga-cancelada': 'done'
            };
        }

        const buscaNomeSolicitante = await conexao.request().query(`select NOME_USUARIO from Usuarios where COD_USUARIO = ${solicitacao.SOLICITANTE}`)

        solicitacao.NOME_SOLICITANTE = buscaNomeSolicitante.recordset[0].NOME_USUARIO


        let dadosParaConferencia = null

        if (solicitacao.STATUS == 'CO') {

            dadosParaConferencia = await solicitacaoService.buscarCamposConferencia(solicitacao.ATUAL_CONFERENCIA)
        }

        let candidato = ''
        let candidatoTratado = ''
        let candidatoContratado = ''
        let candidatoContratadoTratado = ''

        if (solicitacao.STATUS == 'PA') {
            candidato = await conexao.request().query(`SELECT *, CONVERT(VARCHAR(10), DATAINICIO, 103) AS DATAINICIO_FORMATTED
            FROM PROFISIONAIS
            WHERE SOLICITACAO = ${solicitacao.CODIGO} AND ATIVO = 'S'`)
            candidatoTratado = candidato.recordset[0]
        }

        if (solicitacao.STATUS == 'C') {
            candidatoContratado = await conexao.request().query(`SELECT *, CONVERT(VARCHAR(10), DATAINICIO, 103) AS DATAINICIO_FORMATTED
            FROM PROFISIONAIS
            WHERE SOLICITACAO = ${solicitacao.CODIGO} AND ATIVO = 'S'`)
            candidatoContratadoTratado = candidatoContratado.recordset[0]
        }


        const momentoAprovacaoPesquisa = await solicitacaoService.verifyAprovador(user.codigo, solicitacao.CODIGO)

        let momentoAprovacao = 'N'

        if (momentoAprovacaoPesquisa == 1) {
            momentoAprovacao = 'Y'
        }

        let semAprovacao = ''

        const semAprovacaoVerify = await solicitacaoService.semAprovacaoVerify(solicitacao.CODIGO)
        if (semAprovacaoVerify == 1) {
            semAprovacao = 'Y'
        } else {
            semAprovacao = 'N'
        }
        console.log(solicitacao)
        return renderView('homeVagas/Admissao/Detail', {
            solicitacao, nome: user.nome, candidato: candidatoTratado, contratado: candidatoContratadoTratado,
            dadosUser: user, momentoAprovacao: momentoAprovacao, dadosParaConferencia,
            semAprovacao
        });
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
            codigo,
            dataCriacao = new Date()
        } = request

        const conexao = await sql.connect(db);

        const user = request.session.get('user')
        console.log(tutorOnboarding)
        console.log(indicacaoPremiada)
        const tutorOnboardingFormat = await solicitacaoService.formatString(tutorOnboarding)

        const indicacaoPremiadaFormat = await solicitacaoService.formatString(indicacaoPremiada)

        await verifyIndiceAdapter('PROFISIONAIS', 'ID')

        await conexao.request().query(`INSERT INTO PROFISIONAIS (
            NOME_PROFISSIONAL,
            TUTOR_ONBOARDING,
            TELEFONE,
            DATA_CRIACAO,
            SOLICITACAO,
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
            '${tutorOnboardingFormat}',
            '${Telefone}',
            '${dataCriacao.toISOString()}',
            ${codigo},
            '${email}',
            '${indicacaoPremiadaFormat}',
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


        const buscaEmailAprovadores = await conexao.request().query(`
                SELECT EMAIL_USUARIO
            FROM Usuarios
                WHERE COD_USUARIO IN (SELECT Codigo_Aprovador FROM APROVACOES_VAGAS WHERE Codigo_Solicitacao = ${codigo})
                `)

        const buscaEmailSolicitante = await conexao.request().query(`SELECT EMAIL_USUARIO
        FROM Usuarios
        WHERE COD_USUARIO = (SELECT SOLICITANTE FROM SOLICITACAO_ADMISSAO WHERE CODIGO = ${codigo})`)


        const emailsAprovadores = buscaEmailAprovadores.recordset.map(record => record.EMAIL_USUARIO).join(', ');
        const emailSolicitante = buscaEmailSolicitante.recordset[0].EMAIL_USUARIO
        const emailDP = 'dp@itone.com.br'

        const link = `${domain}/vagas/${codigo}/detail`

        const emailOptionsAprovadores = {
            to: emailsAprovadores,
            subject: 'Atualização Vaga',
            content: atualizacao_aprovador({
                link,
                codigoSolicitacao: codigo,
            }),
            isHtlm: true
        };

        const emailOptionSolicitante = {
            to: emailSolicitante,
            subject: 'Atualização Vaga',
            content: atualizacao_solicitante({
                link,
                codigoSolicitacao: codigo,
            }),
            isHtlm: true
        };

        const emailOptionDP = {
            to: emailDP,
            subject: 'Processo Admissional',
            content: processo_administrativo({
                link,
                codigoSolicitacao: codigo,
            }),
            isHtlm: true
        };

        enviarEmail(emailOptionsAprovadores)
        enviarEmail(emailOptionSolicitante)
        enviarEmail(emailOptionDP)

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
                `UPDATE APROVACOES_VAGAS SET Status = 'Y' WHERE Codigo_Aprovador = ${user.codigo} and Codigo_Solicitacao = ${codigoSolicitacao} and MODULO = ${modulo}`
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
                subject: 'Abertura de Vaga',
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

        const corpo =
            'Solicitação N° ' + codigoSolicitacao + ' aprovada com sucesso';

        return renderJson(corpo);
    },

    async Reprovar(request) {
        const { codigoSolicitacao, motivoReprovacao } = request;

        const user = request.session.get('user');

        const conexao = await sql.connect(db);

        await conexao
            .request()
            .query(
                `UPDATE APROVACOES_VAGAS SET Status = 'R' WHERE Codigo_Solicitacao = ${codigoSolicitacao}`
            );

        await conexao
            .request()
            .query(
                `update SOLICITACAO_ADMISSAO set STATUS = 'R' where CODIGO = ${codigoSolicitacao}`
            );





        const corpo = 'Solicitação N° ' + codigoSolicitacao + ' foi reprovada';

        const emailSolicitante = await conexao.request().query(`SELECT EMAIL_USUARIO
        FROM Usuarios
        WHERE COD_USUARIO = (
            SELECT SOLICITANTE
            FROM SOLICITACAO_ADMISSAO
            WHERE CODIGO = ${codigoSolicitacao}
        );`)

        const solicitacao = await solicitacaoService.solicitacaoUnica(
            codigoSolicitacao
        );

        const reprovador = await conexao.request().query(`select NOME_USUARIO from Usuarios where COD_USUARIO = ${user.codigo}`)

        const emailOptions = {
            to: emailSolicitante,
            subject: 'Vaga Reprovada',
            content: vaga_reprovada({
                codigo: codigoSolicitacao,
                motivo: motivoReprovacao
                
            }),
            isHtlm: true
        };

        enviarEmail(emailOptions);

        return renderJson(corpo);
    },

    async cancelarVaga(request) {
        const { codigoSolicitacao, motivoReprovacao } = request;

        const user = request.session.get('user');

        const conexao = await sql.connect(db);

        await conexao
            .request()
            .query(
                `UPDATE APROVACOES_VAGAS SET Status = 'R' WHERE Codigo_Solicitacao = ${codigoSolicitacao}`
            );

        await conexao
            .request()
            .query(
                `update SOLICITACAO_ADMISSAO set STATUS = 'CA' where CODIGO = ${codigoSolicitacao}`
            );




        const corpo = 'Solicitação N° ' + codigoSolicitacao + ' foi cancelada';

        const emailSolicitante = await conexao.request().query(`SELECT EMAIL_USUARIO
        FROM Usuarios
        WHERE COD_USUARIO = (
            SELECT SOLICITANTE
            FROM SOLICITACAO_ADMISSAO
            WHERE CODIGO = ${codigoSolicitacao}
        );`)

        const solicitacao = await solicitacaoService.solicitacaoUnica(
            codigoSolicitacao
        );

        const reprovador = await conexao.request().query(`select NOME_USUARIO from Usuarios where COD_USUARIO = ${user.codigo}`)

        const emailOptions = {
            to: emailSolicitante,
            subject: 'Vaga Cancelada',
            content: vaga_reprovada({
                codigo: codigoSolicitacao,
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
    },

    async conferencia(request) {

        try {

            const body = { salario, unidade, horario, tipoAdmissao, pcd, cargo, motivo, codigo } = request
            const user = request.session.get('user')

            let variaveisComS = "";

            for (const key in body) {
                if (key === "motivo") continue;
                if (body.hasOwnProperty(key) && body[key] === 's') {
                    variaveisComS += variaveisComS === "" ? key : "," + key;
                }
            }

            await solicitacaoService.alterarStatusCO(codigo)

            await solicitacaoService.insertPedidoConferencia(variaveisComS, motivo, user.codigo, codigo)

            return renderJson('Revisão Solicitada com Suscesso')


        } catch (error) {
            console.log('error ', error);
            request.session.message({
                title: 'Ops!',
                text: error.message,
                type: 'danger'
            });
        }
    },

    async insertConferencia(request) {

        const { valorConf = '', unidadeConf = '', horarioConf = '', tipoAdmissaoConf = '', cargoConf = '', pcdConf = '', codigoSolicitacao } = request

        let cargoFormat = ''
        if (cargoConf != '') {
            cargoFormat = await solicitacaoService.formatString(cargoConf)
        }


        const user = request.session.get('user')

        const conexao = await sql.connect(db);

        const cargoUser = await solicitacaoService.buscarCargoUsuario(user.codigo)

        const solicitacao = await solicitacaoService.solicitacaoUnica(codigoSolicitacao)

        const query = await solicitacaoService.criarQueryUpdate(codigoSolicitacao, { valorConf, unidadeConf, horarioConf, tipoAdmissaoConf, cargoFormat, pcdConf });

        await conexao.request().query(`update SOLICITACAO_ADMISSAO set STATUS = 'A' where CODIGO = ${codigoSolicitacao}`)

        if (cargoUser != 'DIRETOR(a) ADMINISTRATIVO') {

            const buscaAprovadores = await solicitacaoService.buscaAprovadores(user)

            const token = tokenAdapter({
                codigoSolicitacao,
                aprovador: buscaAprovadores[0].COD_USUARIO,
                id: buscaAprovadores[0].COD_USUARIO,
                router: `/vagas/${codigoSolicitacao}/detail`
            });

            const link = `${domain}/vagas/${codigoSolicitacao}/detail?token=${token}`

            const firstEmail = await conexao.request().query(`select EMAIL_USUARIO from Usuarios where COD_USUARIO = ${buscaAprovadores[0].COD_USUARIO}`)

            const emailOptions = {
                to: firstEmail.recordset[0].EMAIL_USUARIO,
                subject: 'Solicitação de Aprovação',
                content: aprovacaoPendente({
                    link,
                    codigoSolicitacao: codigoSolicitacao,
                    cargo: cargoConf,
                    unidade: unidadeConf,
                    departamento: solicitacao.DEPARTAMENTO,
                    gestorImediato: solicitacao.GESTOR_IMEDIATO

                }),
                isHtlm: true
            };

            enviarEmail(emailOptions)

            return renderJson(`Vaga ${codigoSolicitacao} enviada para aprovação`)
        }


        if (cargoUser == 'DIRETOR(a) ADMINISTRATIVO') {
            await conexao.request().query(`update SOLICITACAO_ADMISSAO set STATUS = 'PS' where CODIGO = ${codigoSolicitacao}`)
            await conexao.request().query(`update APROVACOES_VAGAS set Status = 'Y' where Codigo_Solicitacao = ${codigoSolicitacao}`)
        }


        return renderJson('Revisão Finalizada')

    },

    async recomecarProcessoSeletivo(request) {

        const { codigo, motivo } = request


        const conexao = await sql.connect(db);

        const user = request.session.get('user')

        await conexao.request().query(`update SOLICITACAO_ADMISSAO set STATUS = 'PS' where CODIGO = ${codigo}`)

        await conexao.request().query(`update PROFISIONAIS set ATIVO = 'N' where SOLICITACAO = ${codigo}`)


        const solicitacao = await solicitacaoService.solicitacaoUnica(codigo)



        const emailRH = 'rh@itone.com.br'

        const linkRH = `${domain}/vagas/${codigo}/detail`

        const emailOptionsRH = {
            to: emailRH,
            subject: 'Recomeço de Processo Seletivo',
            content: processo_seletivoRec({
                link: linkRH,
                codigoSolicitacao: codigo,
                cargo: solicitacao.CARGO,
                unidade: solicitacao.UNIDADE,
                departamento: solicitacao.DEPARTAMENTO,
                gestorImediato: solicitacao.GESTOR_IMEDIATO,
                motivo: motivo

            }),
            isHtlm: true
        };



        enviarEmail(emailOptionsRH)

        return renderJson('Recomeço de Processo seletivo Solicitado com Suscesso')

    },

    async finalizarProcessoDP(request) {

        const { codigo } = request


        const conexao = await sql.connect(db);

        const user = request.session.get('user')

        await conexao.request().query(`update SOLICITACAO_ADMISSAO set STATUS = 'C' where CODIGO = ${codigo}`)


        const solicitacao = await solicitacaoService.solicitacaoUnica(codigo)


        const buscaEmailSolicitante = await conexao.request().query(`SELECT EMAIL_USUARIO
        FROM Usuarios
        WHERE COD_USUARIO = (SELECT SOLICITANTE FROM SOLICITACAO_ADMISSAO WHERE CODIGO = ${codigo})`)

        const buscaEmailAprovadores = await conexao.request().query(`
        SELECT EMAIL_USUARIO
    FROM Usuarios
        WHERE COD_USUARIO IN (SELECT Codigo_Aprovador FROM APROVACOES_VAGAS WHERE Codigo_Solicitacao = ${codigo})
        `)

        const emailsAprovadores = buscaEmailAprovadores.recordset.map(record => record.EMAIL_USUARIO).join(', ');
        const emailRH = 'rh@itone.com.br'
        const emailDP = 'dp@itone.com.br'

        const candidato = await conexao.request().query(`SELECT *, CONVERT(VARCHAR(10), DATAINICIO, 103) AS DATAINICIO_FORMATTED
        FROM PROFISIONAIS
        WHERE SOLICITACAO = ${solicitacao.CODIGO} AND ATIVO = 'S'`)

        const link = `${domain}/vagas/${codigo}/detail`

        const emailOptionsSolicitante = {
            to: buscaEmailSolicitante,
            subject: 'Contratado',
            content: contratado({
                link: link,
                codigoSolicitacao: codigo,
                cargo: solicitacao.CARGO,
                dataInicio: candidato.recordset[0].DATAINICIO_FORMATTED,
                departamento: solicitacao.DEPARTAMENTO,
                unidade: solicitacao.UNIDADE,
                gestorImediato: solicitacao.GESTOR_IMEDIATO,
                nomeContratado: candidato.recordset[0].NOME_PROFISSIONAL
            }),
            isHtlm: true
        };

        const emailOptionsAprovadores = {
            to: emailsAprovadores,
            subject: 'Contratado',
            content: contratado({
                link: link,
                codigoSolicitacao: codigo,
                cargo: solicitacao.CARGO,
                dataInicio: candidato.recordset[0].DATAINICIO_FORMATTED,
                departamento: solicitacao.DEPARTAMENTO,
                unidade: solicitacao.UNIDADE,
                gestorImediato: solicitacao.GESTOR_IMEDIATO,
                nomeContratado: candidato.recordset[0].NOME_PROFISSIONAL
            }),
            isHtlm: true
        };

        const emailOptionsRH = {
            to: emailRH,
            subject: 'Contratado',
            content: contratado({
                link: link,
                codigoSolicitacao: codigo,
                cargo: solicitacao.CARGO,
                dataInicio: candidato.recordset[0].DATAINICIO_FORMATTED,
                departamento: solicitacao.DEPARTAMENTO,
                unidade: solicitacao.UNIDADE,
                gestorImediato: solicitacao.GESTOR_IMEDIATO,
                nomeContratado: candidato.recordset[0].NOME_PROFISSIONAL
            }),
            isHtlm: true
        };

        const emailOptionsDP = {
            to: emailDP,
            subject: 'Contratado',
            content: contratado({
                link: link,
                codigoSolicitacao: codigo,
                cargo: solicitacao.CARGO,
                dataInicio: candidato.recordset[0].DATAINICIO_FORMATTED,
                departamento: solicitacao.DEPARTAMENTO,
                unidade: solicitacao.UNIDADE,
                gestorImediato: solicitacao.GESTOR_IMEDIATO,
                nomeContratado: candidato.recordset[0].NOME_PROFISSIONAL
            }),
            isHtlm: true
        };


        enviarEmail(emailOptionsSolicitante)
        enviarEmail(emailOptionsAprovadores)
        enviarEmail(emailOptionsRH)
        enviarEmail(emailOptionsDP)

        return renderJson('Fim de Processo')

    },

    async update(request) {

        const { ColaboradorEdit, acessosEspecificos, cargo, cartaoVisita, celularCorporativo,
            centroDecusto, cliente, deal, departamento, horarioTrabalho, salario, substituicao,
            tipoAdmissao, tipoEquipamento, unidadeContratacao, usuarioSimilar, vagaEspecificaPCD, solicitacao, gestorImediato } = request

        const conexao = await sql.connect(db);

        const user = request.session.get('user')

        const cargoFormatado = await solicitacaoService.formatString(cargo)

        const colaboradorSubstituidoFormatado = await solicitacaoService.formatString(ColaboradorEdit)

        const gestorImediatoFormatado = await solicitacaoService.formatString(gestorImediato)

        await conexao.request().query(`UPDATE SOLICITACAO_ADMISSAO
        SET ACESSOS_ESPECIFICOS = '${acessosEspecificos}',
            CARGO = '${cargoFormatado}',
            CARTAO_DE_VISITA = '${cartaoVisita}',
            CELULAR_CORPORATIVO = '${celularCorporativo}',
            CENTRO_DE_CUSTO = '${centroDecusto}',
            CLIENTE = '${cliente}',
            GESTOR_IMEDIATO = '${gestorImediatoFormatado}',
            DEAL = '${deal}',
            DEPARTAMENTO = '${departamento}',
            HORARIO = '${horarioTrabalho}',
            SALARIO = '${salario}',
            SUBSTITUICAO = '${substituicao}',
            TIPO_DE_ADMISSAO = '${tipoAdmissao}',
            EQUIPAMENTO = '${tipoEquipamento}',
            UNIDADE = '${unidadeContratacao}',
            USUARIO_SIMILARATIVO = '${usuarioSimilar}',
            COLABORADOR_SUBSTITUIDO = '${colaboradorSubstituidoFormatado}',
            PCD = '${vagaEspecificaPCD}'
        WHERE CODIGO = ${solicitacao}`)

        const link = `${domain}/vagas/${solicitacao}/detail`

        const emailAprovador = await solicitacaoService.buscarPrimeiroAprovador(solicitacao)

        const emailOptionsAprovadores = {
            to: emailAprovador,
            subject: 'Atualização Vaga',
            content: atualizacao_aprovadorPosEdit({
                link,
                codigoSolicitacao: solicitacao,
                cargo: cargoFormatado,
                unidade: unidadeContratacao,
                departamento: departamento,
                gestorImediato: gestorImediatoFormatado
            }),
            isHtlm: true
        };

        enviarEmail(emailOptionsAprovadores)

        return renderJson(`solicitação ${solicitacao} editada com sucesso`)

    }

}