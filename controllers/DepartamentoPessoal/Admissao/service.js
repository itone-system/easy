const { db } = require('../../../config/env');
const sql = require('mssql');
const solicitacaoAprovada = require('../../../template-email/Vagas/solicitacaoAprovada')
const { domain } = require('../../../config/env');
const tokenAdapter = require('../../../infra/tokenAdapter');
const processoSeletivo = require('../../../template-email/Vagas/processo_seletivo')
const enviarEmail = require('../../../infra/emailAdapter');

exports.insert = async (dados) => {
    console.log(dados)
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
    console.log('dados', result.recordset[0].CODIGO)
    return result.recordset[0].CODIGO
}

exports.solicitacaoUnica = async (codigo) => {
    const conexao = await sql.connect(db);

    const solicitacao = await conexao.request().query(`select * from SOLICITACAO_ADMISSAO where CODIGO = ${codigo}`)


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
            U.NOME_USUARIO AS NOME_SOLICITANTE, UA.STATUS
    FROM UserAccess AS UA
    JOIN Usuarios AS U ON UA.SOLICITANTE = U.COD_USUARIO
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
                FROM Aprovacoes 
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
                    Aprovacoes t0 
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

        const emailRH = 'gustavo@gustavo'

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
                FROM Aprovacoes
                WHERE Codigo_Solicitacao = @input_param 
                AND Status = 'Y'
            `);

        let ultimaOrdemAprovada = ultimaOrdemAprovadaResult.recordset[0]?.UltimaOrdemAprovada;

        let result = await conexao.request()
            .input('input_param1', sql.Int, codigoSolicitacao)
            .input('input_param2', sql.Int, codigoAprovador)
            .query(`
                SELECT Ordem 
                FROM Aprovacoes
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
