const { db } = require('../config/env');
const sql = require('mssql');

module.exports = async (tableName, idColumnName) => {

    const conexao = await sql.connect(db);

    try {
        const queryLastInsertedId = `SELECT IDENT_CURRENT('${tableName}') AS LastInsertedId;`;
        const queryMaxId = `SELECT MAX(${idColumnName}) AS MaxId FROM ${tableName};`;

        const lastInsertedIdResult = await conexao.request().query(queryLastInsertedId);
        const maxIdResult = await conexao.request().query(queryMaxId);

        const lastInsertedId = parseInt(lastInsertedIdResult.recordset[0].LastInsertedId, 10);
        const maxId = maxIdResult.recordset[0].MaxId !== null ? parseInt(maxIdResult.recordset[0].MaxId, 10) : 0;

        if (lastInsertedId !== maxId + 1) {
            const reseedValue = maxId;
            const queryReseed = `DBCC CHECKIDENT ('${tableName}', RESEED, ${reseedValue});`;
            await conexao.request().query(queryReseed);
            console.log(`Tabela ${tableName} teve seu índice corrigido para ${reseedValue}.`);
        }
    } catch (error) {
        console.error(`Erro ao verificar e corrigir o índice da tabela ${tableName}:`, error);
    }

}