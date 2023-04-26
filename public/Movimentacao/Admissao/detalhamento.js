window.onload = function() {
    const toggle = body.querySelector(".toggle")
    const clickEvent = new MouseEvent('click');
    toggle.dispatchEvent(clickEvent);


}

function aprovarSolicitacao() {
    const codigoSolicitacao = document.getElementById('codigoSolicitacao').value;
  
    const corpo = {
      codigoSolicitacao: codigoSolicitacao,
      tipo: 3
    };
  
    fetch(endpoints.aprovarAdmissao, {
      method: 'POST',
      body: JSON.stringify(corpo),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((dados) => {
        return dados.json();
      })
      .then((dados) => {
        if (dados) {
          alert(dados);
        }
        window.location.reload();
      });
  };