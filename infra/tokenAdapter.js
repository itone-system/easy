const jwt = require('jsonwebtoken');
const { Keytoken } = require('../config/env');

module.exports = (dados) => {

  const token = jwt.sign(
    dados,
    Keytoken.secret,
    {
      expiresIn: '100d'
    }
  );

  return token

}
