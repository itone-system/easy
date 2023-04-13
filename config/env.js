require('dotenv').config();
const {
  USUARIO,
  SENHA,
  DATABASE,
  SERVER,
  PASS,
  EMAILTEST,
  SESSION_SECRET,
  ENVIRONMENT,
  SECRET,
  PORT,
  DOMAIN,
  EMAIL,
  PATHNF,
  PATHCMP
} = process.env;

const port = parseInt(PORT || 5050)
const isProd = ENVIRONMENT !== 'dev'

if (isProd && !DOMAIN) {
  throw new Error('O domínio deve ser informado!')
}

const domain = DOMAIN || (port !== 80 ? `http://localhost:${port}` : 'http://localhost')

module.exports = {
  enviroment: ENVIRONMENT,
  isProd,
  port,
  pathNf: PATHNF,
  pathCmP: PATHCMP,
  domain,
  db: {
    user: USUARIO,
    password: SENHA,
    database: DATABASE,
    server: SERVER,
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  },
  emailProvider: {
    user: EMAIL,
    pass: PASS,
    fakeEmail: EMAILTEST
  },
  session: {
    key: SESSION_SECRET,
    age: 3600000
  },
  Keytoken: {
    secret: SECRET
  }
};
