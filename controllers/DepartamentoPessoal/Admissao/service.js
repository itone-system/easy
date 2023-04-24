const { db } = require('../../../config/env');
const sql = require('mssql');


exports.insert = async (dados) => {

    const conexao = await sql.connect(db);
    const result = await conexao.request().query(`INSERT INTO solicitacaoAdmissao 
    (tipoDeAdmissao, substituicao, unidade, departamento,
         centroDecusto, salario, cliente, tutorOnboarding, gestorImediato,
          cargo, deal, horario, equipamento, cartaoDeVisita, celularCorporativo, usuarioSimilarAtivo,
           acessosEspecificos, observacaoTrabalho, observacaoBusiness, dataDeAbertura, solicitante) OUTPUT Inserted.Codigo 
           VALUES (${dados.tipoDeAdmissao}, '${dados.substituicao}', '${dados.unidade}', '${dados.departamento}',
            '${dados.centroDecusto}', '${dados.salario}', '${dados.cliente}', '${dados.tutorOnboarding}',
             '${dados.gestorImediato}', '${dados.cargo}', '${dados.deal}', '${dados.horario}', '${dados.equipamento}',
              '${dados.cartaoDeVisita}', '${dados.celularCorporativo}', '${dados.usuarioSimilarAtivo}',
               '${dados.acessosEspecificos}', '${dados.observacaoTrabalho}', '${dados.observacaoBusiness}', '${dados.dataDeAbertura}', ${dados.solicitante});
    `)
    console.log('dados', result.recordset[0].Codigo)
    return result.recordset[0].Codigo
}

exports.solicitacaoUnica = async (codigo) => {
    const conexao = await sql.connect(db);

    const solicitacao = await conexao.request().query(`select * from solicitacaoAdmissao where Codigo = ${codigo}`)


    return solicitacao.recordset[0]

}