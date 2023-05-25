const { render } = require('ejs');
const { renderView, redirect } = require('../../helpers/render');
const solicitacaoRouter = require('../Solicitacao/router');
const SolicitacaoService = require('./service');
const { Keytoken } = require('../../config/env');
const jwt = require('jsonwebtoken');
let tokenRecebido;

module.exports = {
  async Index (request) {
    tokenRecebido = request.id;
    auth = {};
    loginUser = '';
    // console.log(tokenRecebido);

    if (tokenRecebido) {
      const rotaAuth = await SolicitacaoService.buscarLoginToken2FA(tokenRecebido);

      if (rotaAuth === 'error') {
        auth = {
          text: 'Token inválido!',
          type: 'danger'
        };
      } else {
        auth = {
          text: 'Realize o login para concluir a autenticação',
          type: 'warning'
        };
      }
    }
    return renderView('login/Index', { auth, loginUser });
  },

  async Auth (request) {
    const { usuario, senha } = request;

    const type = 'warning';

    rotaLogin = tokenRecebido ? '/?id=' + tokenRecebido : '/';

    const codUser = await SolicitacaoService.simpleUserVerificationID(usuario);

    if (!usuario) {
      request.session.message({
        type,
        text: 'Usuário não informado!'
      });
      return redirect(rotaLogin);
    }

    if (!senha) {
      request.session.message({
        type,
        text: 'Senha não informada!'
      });
      return redirect(rotaLogin);
    }

    const user = await SolicitacaoService.verifyUser(usuario, senha);

    if (!user.recordset[0]) {
      request.session.message({
        type,
        text: 'Usuário ou senha inválidos!'
      });
      return redirect(rotaLogin);
    }

    if (user.recordset[0].VALIDACAO_SENHA == 'N') {
      request.session.message({
        type,
        text: 'Realize a alteração de senha.'
      });
      return redirect(rotaLogin);
    }

    if (user.recordset[0].AUTH_2FA === 'N' && !tokenRecebido && user.recordset[0].VALIDACAO_SENHA == 'N') {
      request.session.message({
        type,
        text: 'Realize a autenticação pelo e-mail para concluir o login'
      });
      return redirect(rotaLogin);
    }

    if (user.recordset[0].AUTH_2FA == 'N' && !tokenRecebido && user.recordset[0].VALIDACAO_SENHA == 'Y') {
      const codUser = await SolicitacaoService.simpleUserVerificationID(usuario);
      await SolicitacaoService.gerarTokenAuth(codUser);

      request.session.message({
        type,
        text: 'Realize a autenticação pelo e-mail para concluir o login'
      });
      return redirect(rotaLogin);
    }

    const validacao = await SolicitacaoService.validarTokenUsuario(tokenRecebido, codUser);

    if (tokenRecebido && validacao) {
      const dadosUsuario = await SolicitacaoService.obterDadosUser(
        user.recordset[0].COD_USUARIO);

      request.session.set('user', dadosUsuario.dadosUserSolicitacao);

      if (request.token) {
        return redirect('/home?token=' + request.token);
      }

      return redirect('/menu');
    } else if (tokenRecebido && !validacao) {
      return redirect(rotaLogin);
    }

    const dadosUsuario = await SolicitacaoService.obterDadosUser(
      user.recordset[0].COD_USUARIO);

    request.session.set('user', dadosUsuario.dadosUserSolicitacao);

    if (request.token) {
      return redirect('/home?token=' + request.token);
    }

    return redirect('/menu');
  },

  async ChangePass (request) {
    const { confirmacao, senha, usuario } = request;

    const validate = await SolicitacaoService.simpleUserVerification(usuario);

    const codUser = await SolicitacaoService.simpleUserVerificationID(usuario);

    if (validate == 'Y') {
      request.session.message({
        title: 'Mudança de Senha',
        text: 'Este não é o seu primeiro acesso, Entre na plataforma com seu usuário e senha ou contacte o time de sistemas!',
        type: 'warning'
      });
      return redirect('/');
    }

    if (validate == 'error') {
      request.session.message({
        title: 'Mudança de Senha',
        text: 'Usuário inválido!',
        type: 'danger'
      });
      return redirect('/');
    }

    if (!senha || !confirmacao) {
      request.session.message({
        title: 'Mudança de Senha',
        text: 'Necessário o preenchimento de todos os campos!',
        type: 'warning'
      });
      return redirect('/');
    }

    if (senha != confirmacao) {
      request.session.message({
        title: 'Mudança de Senha',
        text: 'As senhas não conferem!',
        type: 'danger'
      });
      return redirect('/'); ;
    }

    if (senha.length <= 6) {
      request.session.message({
        title: 'Mudança de Senha',
        text: 'Sua senha deve conter no mínimo 7 caracteres!',
        type: 'warning'
      });
      return redirect('/'); ;
    }

    await SolicitacaoService.changePass(usuario, senha);

    await SolicitacaoService.gerarTokenAuth(codUser);

    request.session.message({
      title: 'Mudança de Senha',
      text: 'Senha alterada com sucesso, realize a autenticação pelo e-mail!',
      type: 'success'
    });

    return redirect('/');
  },

  async Logoff (request) {
    request.session.destroy();
    return redirect('/');
  }
};
