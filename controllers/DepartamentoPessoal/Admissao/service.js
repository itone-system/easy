const { db } = require('../../../config/env');
const sql = require('mssql');


exports.insert = async (dados) => {
    console.log(dados)
    const conexao = await sql.connect(db);
    const result = await conexao.request().query(`INSERT INTO SOLICITACAO_ADMISSAO 
    (TIPO_DE_ADMISSAO, SUBSTITUICAO, UNIDADE, DEPARTAMENTO,
     CENTRO_DE_CUSTO, SALARIO, CLIENTE, GESTOR_IMEDIATO,
     CARGO, DEAL, HORARIO, EQUIPAMENTO, CARTAO_DE_VISITA, CELULAR_CORPORATIVO, USUARIO_SIMILARATIVO,
     ACESSOS_ESPECIFICOS, DATA_DE_ABERTURA, SOLICITANTE, STATUS) 
OUTPUT Inserted.CODIGO 
VALUES 
    ('${dados.tipoDeAdmissao}', '${dados.substituicao}', '${dados.unidade}', '${dados.departamento}',
     '${dados.centroDeCusto}', '${dados.salario}', '${dados.cliente}',
     '${dados.gestorImediato}', '${dados.cargo}', '${dados.deal}', '${dados.horario}', '${dados.equipamento}',
     '${dados.cartaoDeVisita}', '${dados.celularCorporativo}', '${dados.usuarioSimilarAtivo}',
     '${dados.acessosEspecificos}', '${dados.dataDeAbertura.toISOString()}', ${dados.solicitante}, 'A');

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


   const busca = await conexao.request().query( `DECLARE @userCode INT = ${user.codigo}; 
  

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
            WHEN @diretor IS NOT NULL AND @gestor IS NULL THEN 1
            WHEN @diretor IS NOT NULL AND @gestor IS NOT NULL THEN 2
            ELSE NULL
        END AS Ordem
    FROM Usuarios
    WHERE COD_USUARIO = @diretor AND COD_USUARIO <> @diretorAdministrativo
    UNION ALL
    SELECT COD_USUARIO,
        CASE
            WHEN @diretorAdministrativo IS NOT NULL AND @diretor IS NULL AND @gestor IS NULL THEN 1
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