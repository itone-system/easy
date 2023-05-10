window.onload = function () {
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

function validarFormulario(event) {
  let camposVazios = [];

  // Seleciona todos os campos que são obrigatórios
  const camposObrigatorios = document.querySelectorAll('[required]');

  // Percorre todos os campos obrigatórios
  camposObrigatorios.forEach(campo => {
    if (!campo.value) { // Verifica se o campo está vazio
      camposVazios.push(campo.id); // Adiciona o id do campo vazio no array camposVazios
    }
  });

  if (camposVazios.length > 0) { // Verifica se o array camposVazios contém algum elemento
    alert(`Os seguintes campos são obrigatórios: ${camposVazios.join(", ")}`); // Exibe mensagem de erro com os campos vazios
    return false; // Impede o envio do formulário
  } else {
    enviarDados(event)
  }

}

function enviarDados(event) {
  event.preventDefault()

  const form = document.querySelector('form'); // seleciona o formulário pelo seletor CSS
  const inputs = form.querySelectorAll('input, select'); // seleciona todos os inputs e selects dentro do formulário
  const valores = {}; // objeto para armazenar os valores capturados

  // percorre todos os inputs e selects e captura seus valores
  inputs.forEach(input => {
    const nome = input.name; // pega o nome do input
    const tipo = input.type; // pega o tipo do input
    let valor; // variável para armazenar o valor do input

    // verifica o tipo do input e captura seu valor de acordo com o tipo
    switch (tipo) {
      case 'radio':
        if (input.checked) {
          valor = input.value;
        }
        break;
      case 'checkbox':
        valor = input.checked;
        break;
      default:
        valor = input.value;
        break;
    }

    // adiciona o valor capturado ao objeto de valores, usando o nome do input como chave
    valores[nome] = valor;
  });
  const codigo = document.getElementById('codigoSolicitacao').value
  valores.codigo = codigo

  fetch(endpoints.insertCandidato, {
    method: 'POST',
    body: JSON.stringify(valores),
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
        alert('Profissional Salvo!');
      }
      window.location.reload();
    });
  console.log('ola')
}

function mascaraTelefone(event) {
  var input = event.target
  let telefone = input.value.replace(/\D/g, ""); //Remove tudo o que não é dígito)

  if (telefone.length >= 12) return false
  // (99)99999-9999
  if (telefone.length > 10) {
    telefone = telefone.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    //Coloca parênteses em volta dos dois primeiros dígitos e separar entre 5 e 4 digitos entre hifen
  } else {
    telefone = telefone.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    //Coloca parênteses em volta dos dois primeiros dígitos e separar entre 4 e 4 digitos entre hifen
  }

  return event.target.value = telefone;
}
