module.exports = (request) => ({
  get (key) {
    return request.session[key] || null;
  },
  set (key, value) {
    request.session[key] = value;
  },
  append (key, value) {
    if (!request.session[key]) {
      request.session[key] = value;
    } else {
      if (typeof value !== 'object') {
        throw new Error(`expects a object, given a ${typeof value}`);
      }
      request.session[key] = { ...request.session[key], ...value };
    }
  },
  destroy() {
    request.session.destroy()
  },
  message: ({ text = null, type = null, title = null } = {}) => {
    if (!text) {
      if (!request.session.flash) {
        return {
          text: null,
          type: null,
          title: null
        };
      }
      const { text, type, title } = request.session.flash;
      request.session.flash = null;
      return {
        title,
        type,
        text
      };
    } else {
      if (!title) {
        if (type === 'info') {
          title = 'Tudo certo!';
        } else if (type === 'warning') {
          title = 'Atenção!';
        } else if (type === 'danger') {
          title = 'Ops, Algo de errado ocorreu!';
        } else {
          throw new Error('Tipo não encontrado!');
        }
      }
      request.session.flash = {
        text,
        type,
        title
      };
    };
  }
});
