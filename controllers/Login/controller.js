const { renderView, redirect } = require('../../helpers/render');
const solicitacaoRouter = require('../Solicitacao/router');
const SolicitacaoService = require('./service');

module.exports = {
  async Index(request) {
    return renderView('login/Index');
  },

  async Auth(request) {
    const { usuario, senha } = request;

    const type = 'warning';

    if (!usuario) {
      request.session.message({
        type,
        text: 'Usuário não informado!'
      });
      return redirect('/');
    }

    if (!senha) {
      request.session.message({
        type,
        text: 'Senha não informada!'
      });
      return redirect('/');
    }

    const user = await SolicitacaoService.verifyUser(usuario, senha);

    if (!user.recordset[0]) {
      request.session.message({
        type,
        text: 'Usuário ou senha inválidos!'
      });
      return redirect('/');
    }

    if (user.recordset[0].VALIDACAO_SENHA == 'N') {
      request.session.message({
        type,
        text: 'Acesso negado!'
      });
      return redirect('/');
    }

    const dadosUsuario = await SolicitacaoService.obterDadosUser(
      user.recordset[0].COD_USUARIO
    );

    request.session.set('user', dadosUsuario.dadosUserSolicitacao);

    if (request.token) {
      return redirect('/home?token=' + request.token);
    }

    return redirect('/home');
  },

  async ChangePass(request) {
    const { confirmacao, senha, usuario } = request;

    const validate = await SolicitacaoService.simpleUserVerification(usuario);

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
      return redirect('/');;
    }

    if (senha.length <= 6) {
      request.session.message({
        title: 'Mudança de Senha',
        text: 'Sua senha deve conter no mínimo 7 caracteres!',
        type: 'warning'
      });
      return redirect('/');;
    }

    await SolicitacaoService.changePass(usuario, senha)

    request.session.message({
      title: 'Mudança de Senha',
      text: 'Senha alterada com sucesso!',
      type: 'success'
    });

    return redirect('/');
  },

  async Logoff (request) {
    request.session.destroy()
    return redirect('/')
  }
};
