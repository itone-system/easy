const { renderView } = require('../../helpers/render');

module.exports = {

  async Index (request) {
    const user = request.session.get('user');
    
    return renderView('InitMenu/MenuInicial', { dadosUser: user });
  }

};