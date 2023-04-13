const { renderJson, redirect } = require('../../helpers/render');
const SolicitacaoService = require('./service');

module.exports = {

  async List (request) {

    // try {
      const user = request.session.get('user');

      const aprovadores = await SolicitacaoService.getAprovadores(user.codigo)

      const codigosAprovadores = aprovadores.recordset[0].aprovadores.split(',');

      const nomes = await SolicitacaoService.getNameAprovadores(codigosAprovadores)

      return renderJson(nomes);
    // } catch (error) {
    //   console.log('error ', error);
    //   request.session.message({
    //     title: 'Ops!',
    //     text: error.message,
    //     type: 'danger'
    //   });

    //   return redirect('/');
    // }

  }

};
