window.onload = function () {
  const toggle = body.querySelector(".toggle")
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);

  conveniaColaborares()
  conveniaCentroCusto()


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

  const form = document.querySelector('#formCandidato');
  // Seleciona todos os campos que são obrigatórios
  const camposObrigatorios = form.querySelectorAll('[required]');

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

function realizarConferencia() {


  // Adiciona um evento de clique ao botão

  // Obtém todos os checkboxes
  let checkboxes = document.querySelectorAll('.custom-checkbox');

  // Cria um objeto para armazenar os valores
  let checkboxValues = {};

  // Verifica o estado de cada checkbox
  checkboxes.forEach(function (checkbox) {
    let name = checkbox.getAttribute('data-name'); // Obtém o nome do checkbox
    checkboxValues[name] = checkbox.checked ? 's' : 'n'; // Adiciona o valor ao objeto
  });

  checkboxValues.motivo = document.getElementById('motivo').value
  checkboxValues.codigo = document.getElementById('codigoSolicitacao').value

  console.log(checkboxValues); // Exibe os valores quando o botão é clicado



  fetch(endpoints.solicitarConferencia, {
    method: 'POST',
    body: JSON.stringify(checkboxValues),
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

      checkboxes.forEach(function (checkbox) {
        checkbox.checked = false;
      });

      document.getElementById('motivo').value = "";

      document.getElementById('botaoConfClose').click()

      window.location.reload();
    });





}

function formatarMoeda() {
  var elemento = document.getElementById('valor');
  var valor = elemento.value;

  valor = valor + '';
  valor = parseInt(valor.replace(/[\D]+/g, ''));
  valor = valor + '';
  valor = valor.replace(/([0-9]{2})$/g, ",$1");

  if (valor.length > 6) {
      valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
  }

  elemento.value = valor;
  if (valor == 'NaN') elemento.value = '';
}

function formatarMoedaConf() {
  var elemento = document.getElementById('valorConf');
  var valor = elemento.value;

  valor = valor + '';
  valor = parseInt(valor.replace(/[\D]+/g, ''));
  valor = valor + '';
  valor = valor.replace(/([0-9]{2})$/g, ",$1");

  if (valor.length > 6) {
      valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
  }

  elemento.value = valor;
  if (valor == 'NaN') elemento.value = '';
}

function inserirConferencia() {
  
  var ids = ['valorConf', 'unidadeConf', 'horarioConf', 'tipoAdmissaoConf', 'cargoConf', 'pcdConf']; 
  var objeto = {}; 

  ids.forEach(function(id) {
      var elemento = document.getElementById(id); 
      if (elemento && elemento.value) { 
          objeto[id] = elemento.value;
      }
  });
console.log('oioioi',objeto)
  objeto.codigoSolicitacao = document.getElementById('codigoSolicitacao').value

  fetch(endpoints.insertConferencia, {
    method: 'POST',
    body: JSON.stringify(objeto),
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

  console.log(objeto); 

}

function recomecarProcessoSeletivo() {
  
  const codigo = document.getElementById('codigoSolicitacao').value

  const objeto = {
    codigo
  }

  fetch(endpoints.recomecarProcessoSeletivo, {
    method: 'POST',
    body: JSON.stringify(objeto),
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

  console.log(objeto); 

}

function finalizarProcessoDP() {
  
  const codigo = document.getElementById('codigoSolicitacao').value

  const objeto = {
    codigo
  }

  fetch(endpoints.finalizarProcessoDP, {
    method: 'POST',
    body: JSON.stringify(objeto),
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

  console.log(objeto); 

}


function reprovarAdmissao() {
  
  const codigoSolicitacao = document.getElementById('codigoSolicitacao').value
  const motivoReprovacao = document.getElementById('motivoReprov').value

  const objeto = {
    codigoSolicitacao,
    motivoReprovacao
  }

  fetch(endpoints.reprovarAdmissao, {
    method: 'POST',
    body: JSON.stringify(objeto),
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

  console.log(objeto); 

}

function cancelarAdmissao() {
  
  const codigoSolicitacao = document.getElementById('codigoSolicitacao').value
  const motivoReprovacao = document.getElementById('motivoCancelVaga').value

  const objeto = {
    codigoSolicitacao,
    motivoReprovacao
  }

  fetch(endpoints.cancelarAdmissao, {
    method: 'POST',
    body: JSON.stringify(objeto),
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

  console.log(objeto); 

}


const conveniaColaborares = () => {

  fetch("https://public-api.convenia.com.br/api/v3/employees", {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      "token": "82856aeb-fa11-4918-b2bc-f7a49322f69b"
    }
  }).then(response => {
    return response.json()
  }).then(result => {
    var dados = result.data
    let listaColab = []

    dados.forEach(element => {
      listaColab.push(element.name + ' ' + element.last_name)
      listaColab.sort()
    });

    listaColab.forEach(element => {
      var localColab = document.getElementById('ColaboradorEdit')
      var option = document.createElement('option');
      option.textContent = element;
      localColab.appendChild(option);

    });
  })
}

const conveniaCentroCusto = () => {
  fetch('https://public-api.convenia.com.br/api/v3/companies/cost-centers', {
      method: 'GET',
      redirect: 'follow',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          token: '82856aeb-fa11-4918-b2bc-f7a49322f69b'
      }
  })
      .then((response) => {
          return response.json();
      })
      .then((result) => {
          var dados = result.data;
          let listaCC = [];

          dados.forEach((element) => {
              if (element.name.substr(0, 1) <= 9) {
                  listaCC.push(element.name);
                  listaCC.sort();
              }
          });

          listaCC.forEach((element) => {
              var localCC = document.getElementById('centroCustoEdit');
              var option = document.createElement('option');
              option.textContent = element;
              localCC.appendChild(option);
          });
      });
};

function desabilitarCampoSubstituicao() {
  document.getElementById("ColaboradorEdit").disabled = true;
}

function habilitarCampoSubstituicao() {
  document.getElementById("ColaboradorEdit").disabled = false;
  return true;
}




function collectFormData() {
  let formValues = {};
  formValues['tipoAdmissao'] = document.getElementById('tipoAdmissao').value;
  formValues['unidadeContratacao'] = document.getElementById('unidadeContratacao').value;
  formValues['substituicao'] = document.querySelector('input[name="substituicao"]:checked').value;
  formValues['ColaboradorEdit'] = document.getElementById('ColaboradorEdit').value;
  formValues['cargo'] = document.getElementById('cargo').value;
  formValues['salario'] = document.getElementById('valor').value;
  formValues['usuarioSimilar'] = document.getElementById('usuarioSimilar').value;
  formValues['horarioTrabalho'] = document.getElementById('hrTrabalho').value;
  formValues['departamento'] = document.getElementById('opcaoDepartamento').value;
  formValues['centroDecusto'] = document.getElementById('centroCustoEdit').value;
  formValues['vagaEspecificaPCD'] = document.getElementById('vagaEspecificaPCD').value;
  formValues['acessosEspecificos'] = document.getElementById('acessosEspecificos').value;
  formValues['tipoEquipamento'] = document.getElementById('tipoEquipamento').value;
  formValues['cliente'] = document.getElementById('cliente').value;
  formValues['deal'] = document.getElementById('deal').value;
  formValues['celularCorporativo'] = document.getElementById('celularCorporativo').value;
  formValues['cartaoVisita'] = document.getElementById('cartaoVisita').value;
  formValues['solicitacao'] = document.getElementById('codigoSolicitacao').value;
  

  fetch(endpoints.updateVaga, {
    method: 'POST',
    body: JSON.stringify(formValues),
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

}