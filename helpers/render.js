module.exports = {
  renderView: (caminho, params) => ({
    caminho,
    params,
    tipo: 'render'
  }),
  renderJson: (corpo, statusCode = 200) => ({
    corpo,
    statusCode,
    tipo: 'json'
  }),
  redirect: (caminho) => ({
    caminho,
    tipo: 'redirect'
  })
};
