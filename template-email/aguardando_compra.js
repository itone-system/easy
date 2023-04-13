module.exports = ({ codigo, descricao }) => {
  return `<body style="margin: 0; padding:0; font-family: Arial, Helvetica, sans-serif;" >
  <table border="0" width="100%" cellpadding="0" cellspacing="0">
      <tr>
          <td>
              <!---------Header------>
              <table align="center" border="0" width="600px" cellpadding="0" cellspacing="0">
                  <tr>
                      <td align="center" style="padding: 60px 0 50px 0; background-color:#002f71">
                          <img src="https://uploaddeimagens.com.br/images/004/276/696/thumb/logo_branca.png?1672249934" style="width: 150px;">
                      </td>
                  </tr>
                  <!-----Corpo---->
                  <tr>
                      <td bgcolor="#fff" align="center" style="background-color: #ffffff;">
                          <table border="0" width="600px" cellpadding="0" cellspacing="0" style="padding: 30px; color: #313131;" >
                              <tr align="left">
                                  <td>
                                      <center><h3 >Aguardando Compra.</h3></center><br></br>

                                      <span>A solicitação abaixo está aguardando compra</span> <br></br>
                                      <span>Solicitação n° ${codigo}</span><br></br>
                                      <span>Descrição: ${descricao}</span><br></br>
                                  </td>
                              </tr>
                          </table>
                          <table border="0" width="600px" cellpadding="0" cellspacing="0" style="padding: 15px;">

                          </table>
                      </td>
                  </tr>
                  <!-----Footer----->
                  <tr>
                      <td style="padding: 20px; background-color:#002f71;">
                          <table border="0" width="600px" cellpadding="0" cellspacing="0">
                              <tr>
                                  <td width="85%">

                          </table>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
  </table>
</body> `
}


