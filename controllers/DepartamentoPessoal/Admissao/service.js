const { db } = require('../../../config/env');
const sql = require('mssql');
const solicitacaoAprovada = require('../../../template-email/Vagas/solicitacaoAprovada')
const { domain } = require('../../../config/env');
const tokenAdapter = require('../../../infra/tokenAdapter');
const processoSeletivo = require('../../../template-email/Vagas/processo_seletivo')
const revisao = require('../../../template-email/Vagas/revisao')
const enviarEmail = require('../../../infra/emailAdapter');
const aprovacaoPendente = require('../../../template-email/Vagas/aprovacao_pendente')
const verifyIndiceAdapter = require('../../../infra/verifyIndiceAdapter');

exports.insert = async (dados) => {
    const conexao = await sql.connect(db);
    const result = await conexao.request().query(`INSERT INTO SOLICITACAO_ADMISSAO 
    (TIPO_DE_ADMISSAO, SUBSTITUICAO, UNIDADE, DEPARTAMENTO,
     CENTRO_DE_CUSTO, SALARIO, CLIENTE, GESTOR_IMEDIATO,
     CARGO, DEAL, HORARIO, EQUIPAMENTO, CARTAO_DE_VISITA, CELULAR_CORPORATIVO, USUARIO_SIMILARATIVO,
     ACESSOS_ESPECIFICOS, DATA_DE_ABERTURA, SOLICITANTE, STATUS, PCD) 
OUTPUT Inserted.CODIGO 
VALUES 
    ('${dados.tipoDeAdmissao}', '${dados.substituicao}', '${dados.unidade}', '${dados.departamento}',
     '${dados.centroDecusto}', '${dados.salario}', '${dados.cliente}',
     '${dados.gestorImediato}', '${dados.cargo}', '${dados.deal}', '${dados.horario}', '${dados.equipamento}',
     '${dados.cartaoDeVisita}', '${dados.celularCorporativo}', '${dados.usuarioSimilarAtivo}',
     '${dados.acessosEspecificos}', '${dados.dataDeAbertura.toISOString()}', ${dados.solicitante}, 'A', '${dados.pcd}');

    `)
    return result.recordset[0].CODIGO
}

exports.solicitacaoUnica = async (codigo) => {
    const conexao = await sql.connect(db);

    const solicitacao = await conexao.request().query(`SELECT
    *,
    FORMAT(SALARIO * 1000, 'N', 'pt-BR') AS FormattedSALARIO
    FROM SOLICITACAO_ADMISSAO
    WHERE CODIGO = ${codigo}`)

    return solicitacao.recordset[0]

}

exports.listar = async (filtros, page, user) => {

    const conexao = await sql.connect(db);

    const offset = 8

    const solicitacoes = await conexao.request().query(`
    DECLARE @userCode INT = ${user.codigo};
    DECLARE @userAccessType VARCHAR(50) = '${user.tipoAcessos.ADMISSAO === 'GERENTE' ? 'GESTOR' : user.tipoAcessos.ADMISSAO}';
    
    DECLARE @filterSolicitante INT = NULLIF(${filtros.solicitante || 0}, 0);
    DECLARE @filterDepartamento VARCHAR(50) = NULLIF('${filtros.departamento || ''}', '');
    DECLARE @filterUnidade VARCHAR(50) = NULLIF('${filtros.unidade || ''}', '');
    DECLARE @filterStatus VARCHAR(50) = NULLIF('${filtros.status || ''}', '');

    DECLARE @currentPage INT = ${page};
    DECLARE @itemsPerPage INT = ${offset};

    WITH UserAccess AS (
        SELECT SA.*
        FROM SOLICITACAO_ADMISSAO AS SA
        JOIN Usuarios AS U ON SA.SOLICITANTE = U.COD_USUARIO
        WHERE ((@userAccessType = 'FULL')
        OR (@userAccessType = 'COLABORADOR' AND SA.SOLICITANTE = @userCode)
        OR (@userAccessType IN ('DIRETOR', 'GESTOR', 'COORDENADOR') AND (U.DIRETOR = @userCode OR U.GESTOR = @userCode OR U.COORDENADOR = @userCode) OR SA.SOLICITANTE = @userCode))
        AND (SA.SOLICITANTE = @filterSolicitante OR @filterSolicitante IS NULL)
        AND (SA.DEPARTAMENTO = @filterDepartamento OR @filterDepartamento IS NULL)
        AND (SA.UNIDADE = @filterUnidade OR @filterUnidade IS NULL)
        AND (SA.STATUS = @filterStatus OR @filterStatus IS NULL)
    )

    SELECT UA.CODIGO, UA.TIPO_DE_ADMISSAO, UA.SUBSTITUICAO, UA.UNIDADE, UA.DEPARTAMENTO, UA.CENTRO_DE_CUSTO, UA.SALARIO, 
            UA.CLIENTE, UA.GESTOR_IMEDIATO, UA.CARGO, UA.DEAL, UA.HORARIO, UA.EQUIPAMENTO, UA.CARTAO_DE_VISITA, UA.CELULAR_CORPORATIVO, 
            UA.USUARIO_SIMILARATIVO, UA.ACESSOS_ESPECIFICOS, CONVERT(VARCHAR(10), UA.DATA_DE_ABERTURA, 103) AS DATA_DE_ABERTURA, DATEDIFF(day, UA.DATA_DE_ABERTURA, GETDATE()) AS DIAS_EM_ABERTO, 
            U.NOME_USUARIO AS NOME_SOLICITANTE, UA.STATUS,
            AP.Aprovadores_Pendentes
    FROM UserAccess AS UA
    JOIN Usuarios AS U ON UA.SOLICITANTE = U.COD_USUARIO
    LEFT JOIN (
        SELECT A.Codigo_Solicitacao, 
               STRING_AGG(U.NOME_USUARIO, ', ') AS Aprovadores_Pendentes
        FROM APROVACOES_VAGAS A
        JOIN Usuarios U ON A.Codigo_Aprovador = U.COD_USUARIO
        WHERE A.Status = 'N'
        GROUP BY A.Codigo_Solicitacao
    ) AS AP ON UA.CODIGO = AP.Codigo_Solicitacao
    ORDER BY UA.CODIGO DESC
    OFFSET (@currentPage - 1) * @itemsPerPage ROWS
    FETCH NEXT @itemsPerPage ROWS ONLY;`)


    return solicitacoes.recordset
}

exports.solicitantes = async (user) => {
    const conexao = await sql.connect(db);

    const busca = await conexao.request().query(`
    DECLARE @userCode INT = ${user.codigo};
DECLARE @userAccessType VARCHAR(50) = '${user.tipoAcessos.ADMISSAO}';

SELECT U.NOME_USUARIO, U.COD_USUARIO
FROM Usuarios AS U
WHERE (@userAccessType = 'FULL')
    OR (@userAccessType = 'COLABORADOR' AND (U.COD_USUARIO = @userCode))
    OR (@userAccessType = 'GERENTE' AND (U.GESTOR = @userCode OR U.COD_USUARIO = @userCode))
    OR (@userAccessType = 'DIRETOR' AND (U.DIRETOR = @userCode OR U.COD_USUARIO = @userCode))
    OR (@userAccessType = 'COORDENADOR' AND (U.COORDENADOR = @userCode OR U.COD_USUARIO = @userCode))
ORDER BY U.NOME_USUARIO;
    `)
    return busca.recordset
}

exports.buscaAprovadores = async (user) => {

    const conexao = await sql.connect(db);


    const busca = await conexao.request().query(`DECLARE @userCode INT = ${user.codigo}; 
  
    DECLARE @coordenador INT, @gestor INT, @diretor INT;
    SELECT @coordenador = COORDENADOR, @gestor = GESTOR, @diretor = DIRETOR
    FROM Usuarios
    WHERE COD_USUARIO = @userCode;
    
    DECLARE @diretorAdministrativo INT;
    SELECT @diretorAdministrativo = COD_USUARIO
    FROM Usuarios
    WHERE CARGO = 'DIRETOR(a) ADMINISTRATIVO' AND ATIVO = 'S';
    
    WITH Aprovadores AS (
        SELECT COD_USUARIO,
            CASE
                WHEN @gestor IS NOT NULL THEN 1
                ELSE NULL
            END AS Ordem
        FROM Usuarios
        WHERE COD_USUARIO = @gestor
        UNION ALL
        SELECT COD_USUARIO,
            CASE
                WHEN @diretor IS NOT NULL AND @gestor IS NULL AND @diretor <> @diretorAdministrativo THEN 1
                WHEN @diretor IS NOT NULL AND @gestor IS NOT NULL AND @diretor <> @diretorAdministrativo THEN 2
                ELSE NULL
            END AS Ordem
        FROM Usuarios
        WHERE COD_USUARIO = @diretor AND COD_USUARIO <> @diretorAdministrativo
        UNION ALL
        SELECT COD_USUARIO,
            CASE
                WHEN @diretorAdministrativo IS NOT NULL AND (@diretor IS NULL OR @diretor = @diretorAdministrativo) AND @gestor IS NULL THEN 1
                WHEN @diretorAdministrativo IS NOT NULL AND (@diretor IS NOT NULL OR @gestor IS NOT NULL) THEN 2
                ELSE NULL
            END AS Ordem
        FROM Usuarios
        WHERE COD_USUARIO = @diretorAdministrativo
    )
    SELECT *
    FROM Aprovadores
    WHERE Ordem IS NOT NULL
    ORDER BY Ordem;
`)




    return busca.recordset


}

exports.buscarProximoAprovador = async (codigoSolicitacao) => {
    const conexao = await sql.connect(db);

    let result1 = await conexao.request()
        .input('input_param', sql.Int, codigoSolicitacao)
        .query(`
                SELECT MAX(Ordem) as UltimaOrdemAprovada 
                FROM APROVACOES_VAGAS 
                WHERE Codigo_Solicitacao = @input_param 
                AND Status = 'Y'
            `);

    let ultimaOrdemAprovada = result1.recordset[0].UltimaOrdemAprovada;

    let result2 = await conexao.request()
        .input('input_param1', sql.Int, codigoSolicitacao)
        .input('input_param2', sql.Int, ultimaOrdemAprovada)
        .query(`
                SELECT TOP 1 
                    t1.EMAIL_USUARIO, t1.COD_USUARIO 
                FROM 
                APROVACOES_VAGAS t0 
                INNER JOIN Usuarios t1 ON t1.COD_USUARIO = t0.Codigo_Aprovador 
                WHERE 
                    t0.Status = 'N' 
                    AND t0.Codigo_Solicitacao = @input_param1
                    AND t0.Ordem > @input_param2
                ORDER BY 
                    t0.Ordem ASC
            `);

    if (result2.recordset[0] == undefined) {
        console.log('todos aprovaram');
        const alterarStatus = await conexao
            .request()
            .query(
                `update SOLICITACAO_ADMISSAO set STATUS = 'PS' where Codigo = ${codigoSolicitacao}`
            );



        const query = await conexao.request().query(`SELECT usuarios.EMAIL_USUARIO
                    FROM usuarios
                    INNER Join SOLICITACAO_ADMISSAO
                    ON Usuarios.COD_USUARIO = SOLICITACAO_ADMISSAO.SOLICITANTE
                    WHERE Codigo = ${codigoSolicitacao}`);

        const solicitacao = await conexao
            .request()
            .query(`select * from SOLICITACAO_ADMISSAO where Codigo =${codigoSolicitacao}`);

        const token = tokenAdapter({
            codigoSolicitacao,
            aprovador: solicitacao.recordset[0].SOLICITANTE,
            router: `/vagas/${codigoSolicitacao}/detail`
        });

        const email = query.recordset[0].EMAIL_USUARIO;

        const emailRH = 'rh@itone.com.br'

        const link = `${domain}/vagas/${codigoSolicitacao}/detail?token=${token}`

        const linkRH = `${domain}/vagas/${codigoSolicitacao}/detail`

        const emailOptions = {
            to: email,
            subject: 'Solicitção Aprovada',
            content: solicitacaoAprovada({
                link,
                codigoSolicitacao,
                cargo: solicitacao.recordset[0].CARGO,
                unidade: solicitacao.recordset[0].UNIDADE,
                departamento: solicitacao.recordset[0].DEPARTAMENTO
            }),
            isHtlm: true
        };

        const emailOptionsRH = {
            to: emailRH,
            subject: 'Processo Seletivo',
            content: processoSeletivo({
                link: linkRH,
                codigoSolicitacao: codigoSolicitacao,
                cargo: solicitacao.recordset[0].CARGO,
                unidade: solicitacao.recordset[0].UNIDADE,
                departamento: solicitacao.recordset[0].DEPARTAMENTO,
                gestorImediato: solicitacao.recordset[0].GESTOR_IMEDIATO

            }),
            isHtlm: true
        };



        enviarEmail(emailOptions);
        enviarEmail(emailOptionsRH)
    }

    return result2.recordset[0];
}

exports.verifyAprovador = async (codigoAprovador, codigoSolicitacao) => {
    const conexao = await sql.connect(db);

    try {

        let ultimaOrdemAprovadaResult = await conexao.request()
            .input('input_param', sql.Int, codigoSolicitacao)
            .query(`
                SELECT MAX(Ordem) as UltimaOrdemAprovada 
                FROM APROVACOES_VAGAS
                WHERE Codigo_Solicitacao = @input_param 
                AND Status = 'Y'
            `);

        let ultimaOrdemAprovada = ultimaOrdemAprovadaResult.recordset[0]?.UltimaOrdemAprovada;

        let result = await conexao.request()
            .input('input_param1', sql.Int, codigoSolicitacao)
            .input('input_param2', sql.Int, codigoAprovador)
            .query(`
                SELECT Ordem 
                FROM APROVACOES_VAGAS
                WHERE Codigo_Solicitacao = @input_param1
                AND Codigo_Aprovador = @input_param2
            `);

        let ordemAprovador = result.recordset[0]?.Ordem;

        if (!ordemAprovador) {
            return 0;
        }

        if (!ultimaOrdemAprovada) {
            return Number(ordemAprovador === 1);
        }

        return Number(ordemAprovador === ultimaOrdemAprovada + 1);

    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.buscarDadosCandidato = async () => {

}

exports.buscarCargoUsuario = async (codigoUsuario, codigoSolicitacao) => {
    const conexao = await sql.connect(db);

    const result = await conexao.request().query(`select CARGO from Usuarios where COD_USUARIO = ${codigoUsuario}`)


    return result.recordset[0].CARGO
}

exports.alterarStatusCO = async (codigo) => {

    const conexao = await sql.connect(db);

    await conexao.request().query(`update SOLICITACAO_ADMISSAO set STATUS = 'CO' where CODIGO = ${codigo}`)

    await conexao.request().query(`update APROVACOES_VAGAS set Status = 'N' where Codigo_Solicitacao = ${codigo}`)


}

exports.insertPedidoConferencia = async (dados, motivo, userCodigo, codigoSolicitacao) => {

    const conexao = await sql.connect(db);

    const data = new Date()

    const dataFormatada = data.toISOString().slice(0, 10);

    await verifyIndiceAdapter('CONFERENCIA', 'ID')

    const codigo = await conexao.request().query(`insert into CONFERENCIA (CODIGO_SOLICITACAO, CAMPOS, MOTIVO, SOLICITANTE_CONFERENCIA, DATA_DE_INSERCAO
        ) OUTPUT Inserted.ID values (${codigoSolicitacao},' ${dados}', '${motivo}', ${userCodigo}, '${dataFormatada}' )`)


    await conexao.request().query(`update SOLICITACAO_ADMISSAO set ATUAL_CONFERENCIA = ${codigo.recordset[0].ID} where CODIGO = ${codigoSolicitacao}`)

    const emailSolicitante = await conexao.request().query(`SELECT EMAIL_USUARIO
    FROM Usuarios
    WHERE COD_USUARIO = (
        SELECT SOLICITANTE
        FROM SOLICITACAO_ADMISSAO
        WHERE CODIGO = ${codigoSolicitacao}
    );`)

    const token = tokenAdapter({
        codigoSolicitacao,
        router: `/vagas/${codigoSolicitacao}/detail`
    });

    const link = `${domain}/vagas/${codigoSolicitacao}/detail?token=${token}`


    const emailOptions = {
        to: emailSolicitante.recordset[0].EMAIL_USUARIO,
        subject: 'Solicitação de Revisão',
        content: revisao({
            link,
            codigoSolicitacao: codigoSolicitacao,
            motivo: motivo
        }),
        isHtlm: true
    };

    enviarEmail(emailOptions)
}

exports.buscarCamposConferencia = async (codigoConferencia) => {

    const conexao = await sql.connect(db);

    const dados = await conexao.request().query(`select CAMPOS, MOTIVO from CONFERENCIA where ID = ${codigoConferencia}`)

    const campos = dados.recordset[0].CAMPOS.split(',').map(campo => campo.trim());
    const motivo = dados.recordset[0].MOTIVO
    const result = {};

    for (const campo of campos) {
        result[campo] = campo;
    }
    result.motivo = motivo
    return result;
}


exports.criarQueryUpdate = async (codigoSolicitacao, { valorConf, unidadeConf, horarioConf, tipoAdmissaoConf, cargoConf, pcdConf }) => {

    const conexao = await sql.connect(db)
    const dados = {
        salario: valorConf,
        unidade: unidadeConf,
        horario: horarioConf,
        tipoAdmissao: tipoAdmissaoConf,
        cargo: cargoConf,
        pcd: pcdConf,
    };

    const colunas = {
        salario: 'SALARIO',
        unidade: 'UNIDADE',
        horario: 'HORARIO',
        tipoAdmissao: 'TIPO_DE_ADMISSAO',
        cargo: 'CARGO',
        pcd: 'PCD'
    };

    const atualizacoes = Object.entries(dados)
        .filter(([chave, valor]) => valor !== '')
        .map(([chave, valor]) => {
            const valorFormatado = (chave === 'salario' && !isNaN(valor)) ? valor : `'${valor}'`;
            return `${colunas[chave]} = ${valorFormatado}`;
        })
        .join(', ');

    const query = `UPDATE SOLICITACAO_ADMISSAO SET ${atualizacoes} WHERE CODIGO = ${codigoSolicitacao}`;

    await conexao.request().query(query)

    return query
}

exports.semAprovacaoVerify = async (codigo) => {
    const conexao = await sql.connect(db)

    const result = await conexao.request()
        .input('input_parameter', sql.Int, codigo)
        .query('SELECT Status FROM APROVACOES_VAGAS WHERE Codigo_Solicitacao = @input_parameter');

    const hasApproved = result.recordset.some(row => row.Status === 'Y');

    if (hasApproved) {
        return 0;
    } else {
        return 1;
    }
}

