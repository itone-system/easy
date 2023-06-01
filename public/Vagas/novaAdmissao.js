/* eslint-disable no-unused-vars */
function validarFormulario(event) {

  event.preventDefault();


  const camposObrigatorios = document.querySelectorAll('.campo-obrigatorio');


  let camposPreenchidos = true;
  camposObrigatorios.forEach(campo => {

    const mensagemErroExistente = campo.parentNode.querySelector('.mensagem-erro');
    if (mensagemErroExistente) {
      campo.parentNode.removeChild(mensagemErroExistente);
    }

    if (campo.value.trim() === '') {
      camposPreenchidos = false;

      const mensagemErro = document.createElement('div');
      mensagemErro.textContent = '* Campo obrigatório';
      mensagemErro.style.color = 'red';
      mensagemErro.style.fontSize = '12px';
      mensagemErro.classList.add('mensagem-erro');
      campo.parentNode.appendChild(mensagemErro);
    }
  });


  if (camposPreenchidos) {
    enviarDados(event)
  }
}

window.onload = () => {
  const toggle = body.querySelector(".toggle")
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);

  conveniaCentroCusto()
  conveniaColaborares()

};

function enviarDados(event) {
  event.preventDefault()
  const form = document.querySelector('form');
  const inputs = form.querySelectorAll('input, select');
  const valores = {};


  inputs.forEach(input => {
    const nome = input.name;
    const tipo = input.type;
    let valor;


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


    valores[nome] = valor;
  });

  console.log(valores);


  fetch(endpoints.insertVaga, {
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
        alert('Vaga N° ' + dados + ' Aberta com Sucesso');
      }
      window.location.reload();
    });
}

function desabilitarCampoSubstituicao () {
  document.getElementById("optionSubstituido").value = 'N/A';
  document.getElementById("ColaboradorInsert").disabled = true;

}

function habilitarCampoSubstituicao() {
  document.getElementById("ColaboradorInsert").disabled = false;
  return true;
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
        var localCC = document.getElementById('centroCusto');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });
    });
};

function verificarOpcaoSelecionada (elementoSelect) {
  const opcaoSelecionada = elementoSelect.options[elementoSelect.selectedIndex].value;

  if (opcaoSelecionada == 'Recursos Dedicado') {
    document.getElementById('cliente').disabled = false;
    document.getElementById('deal').disabled = false;
  }
  if (opcaoSelecionada != 'Recursos Dedicado') {
    document.getElementById('cliente').disabled = true;
    document.getElementById('deal').disabled = true;
  }
}

function formatarMoeda () {
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

function getFormValues () {
  const formValues = {};
  const formInputs = document.querySelectorAll("input, select");

  formInputs.forEach((input) => {
    const { name, value } = input;
    formValues[name] = value;
  });
  console.log(formValues)
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
      var localColab = document.getElementById('ColaboradorInsert')
      var option = document.createElement('option');
      option.textContent = element;
      localColab.appendChild(option);

    });
  })

}
