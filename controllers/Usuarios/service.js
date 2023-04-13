const sql = require('mssql');
const { db } = require('../../config/env');

exports.getAprovadores = async (user) => {

  const conexao = await sql.connect(db);

  const result = await conexao.request().query(`(
    SELECT
      CONCAT(
        PRIMEIRO_APROVADOR, ',',
        SEGUNDO_APROVADOR, ',',
        TERCEIRO_APROVADOR
      ) as aprovadores FROM Usuarios
     WHERE TERCEIRO_APROVADOR is not NULL AND SEGUNDO_APROVADOR IS NOT NULL and COD_USUARIO = ${user}
  )UNION
  (
    SELECT
      CONCAT(
          PRIMEIRO_APROVADOR, ',',
        SEGUNDO_APROVADOR
      ) as aprovadores FROM Usuarios
    WHERE TERCEIRO_APROVADOR is NULL and SEGUNDO_APROVADOR is not NULL and COD_USUARIO = ${user}
  )UNION
  (
    SELECT PRIMEIRO_APROVADOR as aprovadores
    FROM Usuarios WHERE SEGUNDO_APROVADOR is NULL and  COD_USUARIO = ${user}
  )`)

  if (result.recordset[0].aprovadores == null) {
    return false
  }
  return result;
};

exports.getNameAprovadores = async (arrayCodigos) => {
  const conexao = await sql.connect(db);

  let nomes = []
  let contador = 0

  for (let index = 0; index < arrayCodigos.length; index++) {
    let resultado = await conexao
      .request()
      .query(
        `select NOME_USUARIO from Usuarios where COD_USUARIO = ${arrayCodigos[index]}`
      );
      nomes[index] = resultado.recordset[0].NOME_USUARIO
      contador++
  }

  return nomes
}
