let listaChecked = []
let listaNObrigatorio = []
let listaErros = [];
let valorCampo = [];
let nomeCampo = [];
const dadosAlteracao = new Object()


window.onload = function () {
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);

    // cria a variavel pegando o elemento ID
    const botaoForms = document.querySelector("#solicitarAlteracao")

    //executa a função quando clicar o botao
    botaoForms.addEventListener('click', function () {
        getValores();
    });
    buscarChecked();
}

function buscarChecked(){
  var faqTitulo = document.querySelectorAll(".input-titulo")

  for(i = 0; i < faqTitulo.length; i++){

    const buscar = listaNObrigatorio.find(element => element == faqTitulo[i].id)

    const buscarListaErroCampoNOVO = listaErros.find(element => element == faqTitulo[i].id+"_NOVO")
    const buscarListaErroCampoATUAL = listaErros.find(element => element == faqTitulo[i].id+"_ATUAL")


    if(faqTitulo[i].checked){
      console.log(faqTitulo[i].id)
      console.log(listaNObrigatorio.indexOf(faqTitulo[i].id))

      if(listaNObrigatorio.indexOf(faqTitulo[i].id) >= 0 ){
      listaNObrigatorio.splice(listaNObrigatorio.indexOf(faqTitulo[i].id), 1);
    }
      // console.log(listaNObrigatorio)
    } else if(buscarListaErroCampoATUAL || buscarListaErroCampoNOVO){

        listaNObrigatorio.push(faqTitulo[i].id)
        removerCampoErro(faqTitulo[i].id+"_NOVO")
        removerCampoErro(faqTitulo[i].id+"_ATUAL")

    }
    else if(!buscar){
      listaNObrigatorio.push(faqTitulo[i].id)
  }

    mostrarEocultar(faqTitulo[i].id, i)
  }
  console.log("Não obrigatórios " + listaNObrigatorio)

  // console.log("Lista Obr: "+ listaChecked)
  // console.log("Lista N Obr: "+ listaNObrigatorio)

}

function validarCamposTeste(formData) {

  for (const [key, value] of formData) {

    var camposObr = document.querySelector('.obrigatorio-'+key)

    const busca = listaErros.find(element => element == key)

    if (value == '' && !busca && validarObrigacaoPreenchimento(key)==true){
      adicionarCampoErro(key)
      console.log(key + ' ' + value)
    }

    else if(camposObr && value != '')  {
      removerCampoErro(key)
    }
}

  if((listaErros == '' || listaErros == undefined) && listaNObrigatorio.length < 6 ){
      return true
  }else{
    return false
  }

};

function validarObrigacaoPreenchimento(key){
  var nomeCampoSplit = key.split("_")

  const validarObrigacao = listaNObrigatorio.find(element => element == nomeCampoSplit[0])

  if(!validarObrigacao){
    return true
  }else{
    return false
  }

}

function getValores() {


  const form = document.getElementById("form");

  const formData = new FormData(form);

  if (validarCamposTeste(formData) == false){
      console.log("Campos não foram preenchidos!")
      alert("Favor verificar, os campos novamente!");
      return;
  } else {

      for (const [key, value] of formData) {
        // console.log(key + ': ' + value)
        valorCampo.push(value);
        nomeCampo.push(key);
      }
      // alert("Alteração feita!"),
      // console.log(2);



      centroCustosplitPonto1 = valorCampo[6].split('. ')
      centroCustoSplitTraco1 = valorCampo[6].split(' - ')
      centroCustosplitPonto2 = valorCampo[7].split('. ')
      centroCustoSplitTraco2 = valorCampo[7].split(' - ')
      centroCustoSplit1 = centroCustosplitPonto1.length == 1  ? centroCustoSplitTraco1 : centroCustosplitPonto1
      centroCustoSplit2 = centroCustosplitPonto2.length == 1  ? centroCustoSplitTraco2 : centroCustosplitPonto2

      dadosAlteracao.NOME = valorCampo[0];
      dadosAlteracao.DATA_MOVIMENTACAO = valorCampo[1];
      dadosAlteracao.DATA_SOLICITACAO = new Date()
      dadosAlteracao.NOME_SOLICITANTE = document.getElementById('nomeUser').innerText
      dadosAlteracao.SOLICITANTE = document.getElementById('codigoUser').innerText
      dadosAlteracao.CC_SOLICITANTE = document.getElementById('departamentoUser').innerText
      dadosAlteracao.FILIAL_ATUAL = valorCampo[2].substr(0,4)
      dadosAlteracao.FILIAL_NOVO = valorCampo[3].substr(0,4)
      dadosAlteracao.DEPARTAMENTO_ATUAL = valorCampo[4]
      dadosAlteracao.DEPARTAMENTO_NOVO = valorCampo[5]
      dadosAlteracao.CC_ATUAL = centroCustoSplit1[0];
      dadosAlteracao.CC_NOVO = centroCustoSplit2[0];
      dadosAlteracao.CARGO_ATUAL = valorCampo[8]
      dadosAlteracao.CARGO_NOVO = valorCampo[9]
      dadosAlteracao.SALARIO_ATUAL = valorCampo[10] == ''? 0 : valorCampo[10].replace(".","").replace(",",".")
      dadosAlteracao.SALARIO_NOVO = valorCampo[11] == ''? 0 : valorCampo[11].replace(".","").replace(",",".")
      dadosAlteracao.GESTOR_ATUAL = valorCampo[12]
      dadosAlteracao.GESTOR_NOVO = valorCampo[13]
      dadosAlteracao.JUSTIFICATIVA = valorCampo[14]

      console.log(dadosAlteracao)

      jsonAlteracao = JSON.stringify(dadosAlteracao);
      console.log(jsonAlteracao)
      enviaDados(jsonAlteracao)
  }
}

function enviaDados(jsonAlteracao){

  let headersList = {
    "Content-Type": "application/json"
}

// let bodyContent = JSON.stringify({
//   "NOME": valorCampo[0],
//   "CC": centroCustoSplit[0],
//   "DATA_INICIO": valorCampo[2],
//   "NUM_DIAS" : valorCampo[3],
//   "ABONO_FERIAS": valorCampo[5].slice(0,1),
//   "ADIANTAMENTO" : valorCampo[6].slice(0,1),
//   "SOLICITANTE": "Wesley",
//   "DATA_SOLICITACAO": "2020-01-01",
//   "DATA_FIM": valorCampo[4],

// });

 let response =   fetch(endpoints.insertAlteracao, {
    method: "POST",
    body: jsonAlteracao,
    headers: headersList
}).then(dados => {

    return dados.json()
}).then(dados => {
    codigoRetornoFDeslig = dados
    resetForms()
    alert("Solicitação de alteração cadastral enviada!")
    location.reload()
})


}

function resetForms() {
    document.querySelector("form").reset()
}

function adicionarCampoErro(key){
  const campoObrigatorio = document.querySelector('.error.' + key)
  var labelObrigatorio = document.createElement('label')
  labelObrigatorio.setAttribute('ID', 'obrigatorio');
  labelObrigatorio.setAttribute('class','obrigatorio-'+key);
  labelObrigatorio.textContent = '* Campo obrigatório';
  campoObrigatorio.appendChild(labelObrigatorio)
  listaErros.push(key)
}

function removerCampoErro(key){
  var camposObr = document.querySelector('.obrigatorio-'+key)
  camposObr.remove()
  listaErros.splice(listaErros.indexOf(key), 1);
}

function mostrarEocultar(idCampo, codigoLinha) {
    var div = document.querySelector(".wapper-"+codigoLinha+" .row");
    const input = document.querySelector("#"+idCampo);

    if (input.checked) {
        div.style.display = "flex";
    } else {
        div.style.display = "none"
    }
}

function formatarMoeda() {
  var elemento = document.getElementById('SALARIO_ATUAL');
  var elemento1 = document.getElementById('SALARIO_NOVO');

  camposMoeda = [elemento, elemento1]

  camposMoeda.forEach((element) => {

  var valor = element.value;

  valor = valor + '';
  valor = parseInt(valor.replace(/[\D]+/g, ''));
  valor = valor + '';
  valor = valor.replace(/([0-9]{2})$/g, ",$1");

  if (valor.length > 7) {
      valor = valor.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");
  }

  element.value = valor;
  if(valor == 'NaN') element.value = '0';

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
      let listaFilial = [];

      dados.forEach((element) => {
        if (element.name.substr(0, 1) <= 9) {
          listaCC.push(element.name);
          listaCC.sort();
        }

        if (element.name.substr(0, 3) > 99) {
          listaFilial.push(element.name);
          listaFilial.sort();
        }
      });

      listaCC.forEach((element) => {
        var localCC = document.getElementById('CC_ATUAL');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });

      listaCC.forEach((element) => {
        var localCC = document.getElementById('CC_NOVO');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });


    listaFilial.forEach((element) => {
      var localFilial = document.getElementById('FILIAL_ATUAL');
      var option = document.createElement('option');
      option.textContent = element;
      localFilial.appendChild(option);
    });

    listaFilial.forEach((element) => {
      var localFilial = document.getElementById('FILIAL_NOVO');
      var option = document.createElement('option');
      option.textContent = element;
      localFilial.appendChild(option);
    });
  });
};

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
        nomeCompleto= element.name +' ' + element.last_name
        let palavras = nomeCompleto.split(" ");
        for (let i = 0; i < palavras.length; i++) {
            palavras[i] = palavras[i][0].toUpperCase() + palavras[i].substr(1).toLowerCase();
            }
          listaColab.push(palavras.join(" ") )
          listaColab.sort()
      });

      listaColab.forEach(element => {
          var localColab = document.getElementById('NOME')
          var option = document.createElement('option');
          option.textContent = element;
          localColab.appendChild(option);

  });
      listaColab.forEach(element => {
        var localColab = document.getElementById('GESTOR_ATUAL')
        var option = document.createElement('option');
        option.textContent = element;
        localColab.appendChild(option);

});

listaColab.forEach(element => {
  var localColab = document.getElementById('GESTOR_NOVO')
  var option = document.createElement('option');
  option.textContent = element;
  localColab.appendChild(option);

});
})

};

const conveniaDepartamento = () => {
  fetch('https://public-api.convenia.com.br/api/v3/companies/departments', {
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
      let listaDP = [];

      dados.forEach((element) => {
        if (element) {
          if(element.name == "GENTE E CULTURA"){
            element.name = "RECURSOS HUMANOS"
          }
          let palavras = element.name.split(" ");
             for (let i = 0; i < palavras.length; i++) {
                palavras[i] = palavras[i][0].toUpperCase() + palavras[i].substr(1).toLowerCase();
              }
          listaDP.push(palavras.join(" ") )
          listaDP.sort();
        }
      });

      listaDP.forEach((element) => {

        if(element != "INOVAÇÃO"){
        var localCC = document.getElementById('DEPARTAMENTO_ATUAL');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      }
      });

      listaDP.forEach((element) => {

        if(element != "INOVAÇÃO"){
        var localCC = document.getElementById('DEPARTAMENTO_NOVO');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);

    }
      });
    });
};

const conveniaCargo = () => {
  fetch('https://public-api.convenia.com.br/api/v3/companies/jobs', {
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
      let listaCR = [];

      dados.forEach((element) => {
        if (element) {
          listaCR.push(element.name);
          listaCR.sort();
        }
      });

      listaCR.forEach((element) => {
        var localCC = document.getElementById('CARGO_NOVO');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });

      listaCR.forEach((element) => {
        var localCC = document.getElementById('CARGO_ATUAL');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });
    });
};
conveniaCentroCusto();
conveniaColaborares();
conveniaDepartamento();
conveniaCargo();


// function mudarEstado() {

//   var camponObr = document.querySelector(".n_obrigatorio.DEPARTAMENTO_ATUAL");
//   var campoErro = document.querySelector(".error.DEPARTAMENTO_ATUAL");

//   const div = document.querySelector(".wapper .row");
//   const input = document.querySelector("#faq-titulo-1");

// console.log(campoErro)

//   if (input.checked) {
//       div.style.display = "flex"
//       camponObr.setAttribute("class", "error DEPARTAMENTO_ATUAL")
//   } else {
//     campoErro.setAttribute("class", "n_obrigatorio DEPARTAMENTO_ATUAL")
//     div.style.display = "none"
//   }


// }

// function mudarEstado2() {
//   var div = document.querySelector(".wapper-2 .row");
//   const input = document.querySelector("#faq-titulo-2");

//   if (input.checked) {
//       div.style.display = "flex";
//   } else {
//       div.style.display = "none"
//   }
// }

// function mudarEstado3() {
//   var div = document.querySelector(".wapper-3 .row");
//   const input = document.querySelector("#faq-titulo-3");

//   if (input.checked) {
//       div.style.display = "flex";
//   } else {
//       div.style.display = "none"
//   }
// }

// function mudarEstado4() {
//   var div = document.querySelector(".wapper-4 .row");
//   const input = document.querySelector("#faq-titulo-4");

//   if (input.checked) {
//       div.style.display = "flex";
//   } else {
//       div.style.display = "none"
//   }
// }

// function mudarEstado5() {
//   var div = document.querySelector(".wapper-5 .row");
//   const input = document.querySelector("#faq-titulo-5");

//   if (input.checked) {
//       div.style.display = "flex";
//   } else {
//       div.style.display = "none"
//   }
// }

// function getValores() {

//     const valoresArray = document.getElementsByTagName('input')
//     const campoLabel = document.getElementsByTagName("label")

//     if (validarCampos() == false) {
//         console.log("Campos não foram preenchidos!")
//         alert("Favor verifica, os campos novamente!");
//         return;
//     } else {
//         for (const posicao in valoresArray) {
//             console.log(campoLabel[posicao].textContent + " " + valoresArray[posicao].value)
//         }
//         alert("Alteração feita!"),
//             console.log(2),
//             resetForms();
//     }
// }

// function validarCampos() {
//     const buscarArray = ['inputNome', 'inputDptAtual', 'inputDptNovo', 'inputCustosAtual',
//         'inputCustosNovo', 'inputCargo', 'inputCargoNovo', 'inputSalario', 'inputSalarioNovo',
//         'inputGestor', 'inputGestorNovo', 'inputFilial', 'inputFilialNova', 'inputJustificativa',
//         'inputData']

//     const divs = document.querySelectorAll(".error")

//     let contador = 0
//     let contVezes = 0

//     for (const buscarValue of buscarArray) {
//         let input = document.getElementById(buscarValue)
//         if (input.value == "") {
//             divs[contador].innerHTML = `*Campo Obrigatório`
//             contador++
//         } else {
//             divs[contador].innerHTML = ""
//             contador++
//             contVezes++
//             console.log(input.value)
//         }
//     }

//     if (contVezes < 15) {
//         return false;
//     } else {
//         return true;
//     }
// }

// Função limpará todo o formulário apos o envio de informações
