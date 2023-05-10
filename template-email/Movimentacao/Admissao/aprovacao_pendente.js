module.exports = ({ link, codigoSolicitacao, cargo, unidade, departamento, gestorImediato }) => {
    return `<body style="background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <!-- Header -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td align="center" bgcolor="#002f71" style="padding: 50px 0 60px 0;">
                <img src="https://uploaddeimagens.com.br/images/004/276/696/thumb/logo_branca.png?1672249934" alt="Logo" width="150">
              </td>
            </tr>
          </table>
         
          <!-- Content -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td bgcolor="#ffffff" style="padding: 30px; color: #313131;">
                <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 20px 0;">Você tem uma solicitação pendente</h1>
                <p style="font-size: 16px; line-height: 1.5em; margin: 0 0 10px 0;">Easy informa que a solicitação abaixo está aguardando aprovação:</p>
                <ul style="font-size: 16px; line-height: 1.5em; margin: 0;">
                  <li><strong>Solicitação n°:</strong> ${codigoSolicitacao}</li>
                  <li><strong>Cargo:</strong> ${cargo}</li>
                  <li><strong>Unidade:</strong> ${unidade}</li>
                  <li><strong>Departamento:</strong> ${departamento}</li>
                  <li><strong>Gestor Imediato:</strong> ${gestorImediato}</li>
                </ul>
              </td>
            </tr>
          </table>

          <!-- Footer -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
              <td bgcolor="#002f71" style="padding: 20px;">
                <p style="color: #ffffff; font-size: 16px; line-height: 1.5em; margin: 0;">
                  Para acessar a plataforma, clique no botão abaixo:
                </p>
                <p style="margin: 20px 0 0 0; text-align: center;">
                  <a href="${link}" style="background-color: #ffffff; border: none; border-radius: 4px; color: #002f71; display: inline-block; font-size: 16px; font-weight: bold; padding: 20px 40px; text-decoration: none; text-transform: uppercase;">Acessar plataforma</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>`
}


