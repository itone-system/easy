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
                <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 20px 0;">Atualização de Vaga</h1>
                <p style="font-size: 16px; line-height: 1.5em; margin: 0 0 10px 0;">EASY informa que a vaga abaixo foi editada:</p>
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
          <tr>
          <td style="padding: 20px; background-color:#002f71;">
               <center><table border="0" width="600px" cellpadding="0" cellspacing="0">
                   <tr>
                       <td width="85%">

                       <div style="font-family: Arial, sans-serif; line-height: 19px; color: #a71616; font-size: 13px; text-align: center;">

                           <a  href=${link}  style="color: #000000; text-decoration: none; margin: 0px; text-align: center; vertical-align: baseline; border: 4px solid #ffffff; padding: 4px 9px; font-size: 13px; line-height: 21px; background-color: #fbfbfc;">&nbsp; Acessar Plataforma &nbsp;</a></center>
                       </div>

               </table></center>
           </td>
       </tr>
        </td>
      </tr>
    </table>
  </body>`
}

