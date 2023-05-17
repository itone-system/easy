
  let listaErros = [];

  let valorCampo = []

  let nomeCampo = []

window.onload = function () {
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);

  // cria a variavel pegando o elemento ID
  const botaoForms = document.querySelector("#solicitarFerias")

  //executa a função quando clicar o botao
  botaoForms.addEventListener('click', function () {

    getValores();
    // enviaDados()

  });


}


function bodyFerias(){

  this.NOME = nome;
  this.CC = centroCusto;
  this.DATA_INICIO = dataInicio
  this.NUM_DIAS = numDias
  this.ABONO_FERIAS = abono
  this.ADIANTAMENTO = adiantamento
  this.SOLICITANTE = solicitante
  this.DATA_SOLICITACAO = dataSolicitacao
  this.DATA_FIM = dataFim
  this.NOME_SOLICITANTE = nomeSolicitante
  }

function validarCamposTeste(formData) {

  for (const [key, value] of formData) {

    var camposObr = document.querySelector('.obrigatorio-'+key)

    const busca = listaErros.find(element => element == key)


    if (value == '' && !busca) {

        const campoObrigatorio = document.querySelector('.error.' + key)
        var labelObrigatorio = document.createElement('label')
        labelObrigatorio.setAttribute('ID', 'obrigatorio');
        labelObrigatorio.setAttribute('class','obrigatorio-'+key);
        labelObrigatorio.textContent = '* Campo obrigatório';
        campoObrigatorio.appendChild(labelObrigatorio)
        listaErros.push(key)
    }

    else if(camposObr && value != '')  {
        camposObr.remove()

        listaErros.splice(listaErros.indexOf(key), 1);

    }

}

  if(listaErros == '' || listaErros == undefined ){
      return true
  }else{
    return false
  }

};

function getValores () {

  const form = document.getElementById("form");

  const formData = new FormData(form);

  const output = document.getElementById("output");

  if (validarCamposTeste(formData) == false){
      console.log("Campos não foram preenchidos!")
      alert("Favor verificar, os campos novamente!");
      return;
  } else {

      for (const [key, value] of formData) {
        console.log(key + ': ' + value)
        valorCampo.push(value);
        nomeCampo.push(key);
      }
      // alert("Alteração feita!"),
      console.log(document.getElementById('departamentoUser').innerText);
      console.log(document.getElementById('codigoUser').innerText);

      const objetoPrimeiro = new bodyFerias(nome = valorCampo[0], centroCusto = document.getElementById('departamentoUser').innerText, dataInicio = valorCampo[1], numDias = valorCampo[2], abono = valorCampo[3].slice(0,1), adiantamento = valorCampo[4].slice(0,1), solicitante = document.getElementById('codigoUser').innerText, dataSolicitacao = new Date(), dataFim = document.getElementById('DATA_FIM').value, nomeSolicitante = document.getElementById('nomeUser').innerText)

      dadosFerias = JSON.stringify(objetoPrimeiro);

      enviaDados(dadosFerias)
  }
}

// function validarCampos() {
//   const buscarArray = document.getElementsByTagName('input')
//   const divs =  document.querySelectorAll(".error")

//   let contador = 0
//   let contVezes = 0

//   for (const buscarValue of buscarArray) {
//       if (buscarValue.value == "") {
//           divs[contador].innerHTML = `*Campo Obrigatório`
//           contador++
//       } else if (buscarValue.type == "date" && buscarValue.value == ""){
//           divs[contador].innerHTML = `*Campo Obrigatório`
//           contador++
//       } else {
//           divs[contador].innerHTML = ``
//           contador++
//           contVezes++
//       }
//   }

//   if (contVezes < 15) {
//       return false;
//   } else {
//       return true;
//   }
// }



// Função limpará todo o formulário apos o envio de informações



function enviaDados(dadosFerias){

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

     let response =   fetch(endpoints.incluirFerias, {
        method: "POST",
        body: dadosFerias,
        headers: headersList
    }).then(dados => {

        return dados.json()
    }).then(dados => {
        codigoRetornoFerias = dados
        alert("Solicitação de férias enviada!")
        window.location.reload();

    })

    resetForms()

}

function resetForms() {
  document.querySelector("form").reset()
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
})

};

function calculaDataFinal() {

  const dateInicio = document.getElementById("DATA_INICIO").value;
  // transforme em int o Dias pegando o id
  const numerosDias = document.getElementById("NUM_DIAS").value; // pega o n de dias

  if (dateInicio != "" && numerosDias != "") {
      // separa as datas no padrão ISO
      const partes = dateInicio.split("-");
      var ano = partes[0];
      var mes = partes[1];
      var dia = partes[2];

      const dataFinal = new Date(ano, mes - 1, dia);

      var dd = dataFinal.getDate() - 1 + parseInt(numerosDias);
      if (dd < 10) {
          dd = '0' + dd
      };
      var mm = dataFinal.getMonth();
      if (mm < 10) {
          mm = '0' + mm
      };
      var yy = dataFinal.getFullYear();

      const dataFinalNova = new Date(yy,mm,dd);

      const dataFormartada = moment(dataFinalNova).format("YYYY-MM-DD");
      document.getElementById("DATA_FIM").value = dataFormartada;
  }
}

conveniaColaborares();


