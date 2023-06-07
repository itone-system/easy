let conteudoCLT = '';
let conteudoPJ = '';
let conteudoEstag = '';
let listaErros = [];
let valorCampo = [];
let nomeCampo = [];
let tipoDesligamento = 1;
let regime = "CLT";
let linhaTabelaSelecionada = ".linha1CLT";
const dadosDesligamento = new Object()

window.onload = function () {
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);

  conteudoCLT = document.querySelector('form .show1');
  conteudoPJ = document.querySelector('form .show2');
  conteudoEstag = document.querySelector('form .show3');
  conteudoCLT.style.display = "block";

  const botaoForms = document.getElementById("solicitarDesligamento");

  botaoForms.addEventListener('click', function(){
    getValores()

  });
}

function validarCamposTeste(formData) {

  for (const [key, value] of formData) {

    var camposObr = document.querySelector('.obrigatorio-'+key)

    const busca = listaErros.find(element => element == key)

    console.log(key)

    if (value == '' && !busca && key!= 'OBSERVACAO') {
      adicionarCampoErro(key)
    }

    else if(camposObr && value != '')  {
      removerCampoErro(key)
    }
}
confValoresTabela()


  if(listaErros == '' || listaErros == undefined ){
      return true
  }else{
    return false
  }

};

function getValores() {

  const form = document.getElementById("form");

  const formData = new FormData(form);

  // console.log(formData)

  // const output = document.getElementById("output");

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
      // alert("Solicitação de Férias Enviada!"),
      // console.log(2);
      // console.log(valorCampo),
      // console.log(nomeCampo);


      centroCustosplitPonto = valorCampo[1].split('. ')
      centroCustoSplitTraco = valorCampo[1].split(' - ')
      centroCustoSplit = centroCustosplitPonto.length == 1  ? centroCustoSplitTraco : centroCustosplitPonto

      dadosDesligamento.NOME = valorCampo[1];
      dadosDesligamento.CC = document.getElementById('departamentoUser').innerText;
      dadosDesligamento.DATA_AVISO = valorCampo[2]
      dadosDesligamento.ULTIMO_DIA = valorCampo[3]
      dadosDesligamento.TIPO_REGIME = valorCampo[0].substr(0,1);
      dadosDesligamento.OBSERVACAO = valorCampo[7]
      dadosDesligamento.SUBSTITUICAO = valorCampo[8].substr(0,1)
      dadosDesligamento.NOME_SOLICITANTE = document.getElementById('nomeUser').innerText
      dadosDesligamento.SOLICITANTE = document.getElementById('codigoUser').innerText
      dadosDesligamento.DATA_SOLICITACAO = new Date()
      dadosDesligamento.APROVADOR1 = 3
      dadosDesligamento.APROVADOR2 = 4



      console.log(dadosDesligamento)

      jsonDesligamento = JSON.stringify(dadosDesligamento);

      enviaDados(jsonDesligamento)
  }
}

function confValoresTabela(){

  let camposTabela = []

  contadorCampos = 0

  var tabelas = document.querySelectorAll(linhaTabelaSelecionada)

  var celulas = tabelas[0].children

  var selecaoValor = celulas[0].children

  var busca = listaErros.find(element => element == "TABELA"+regime)

  console.log(celulas)

  for(var i = 0; i < celulas.length; i++){
    var selecaoValor = celulas[i].children

    if(selecaoValor.length > 0){
      contadorCampos = contadorCampos+1
      selecaoValor[0].value == ''? '' : camposTabela.push(selecaoValor[0].value)
      console.log(selecaoValor[0].value)
  }else{
    camposTabela.push(celulas[i].innerText)
    contadorCampos = contadorCampos+1

  }
};

  console.log(camposTabela)

  if(camposTabela.length < contadorCampos && !busca){
    adicionarCampoErro("TABELA"+regime)
  }
  else if(document.querySelector('.obrigatorio-'+"TABELA"+regime) && camposTabela.length >= contadorCampos)
  {
    removerCampoErro("TABELA"+regime)
  }

  if(camposTabela.length >= contadorCampos){
    getValoresTabela(camposTabela, regime)
  }


};


function getValoresTabela(camposTabela){
  switch(regime){
    case "CLT":
      dadosDesligamento.TIPO_DESLIGAMENTO = tipoDesligamento
      dadosDesligamento.TIPO_AVISO = camposTabela[1]
      dadosDesligamento.DESCONTO = camposTabela[2]
      dadosDesligamento.MOTIVO = camposTabela[3]
      break
    case "PJ":
      dadosDesligamento.TIPO_DESLIGAMENTO = tipoDesligamento
      dadosDesligamento.TIPO_AVISO = ''
      dadosDesligamento.DESCONTO = camposTabela[1]
      dadosDesligamento.MOTIVO = camposTabela[2]
      break
    case "Estag":
      dadosDesligamento.TIPO_DESLIGAMENTO = tipoDesligamento
      dadosDesligamento.TIPO_AVISO = ''
      dadosDesligamento.DESCONTO = ''
      dadosDesligamento.MOTIVO = camposTabela[1]
      break
  }
}



function enviaDados(jsonDesligamento){

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

     let response =   fetch(endpoints.insertDesligamento, {
        method: "POST",
        body: jsonDesligamento,
        headers: headersList
    }).then(dados => {

        return dados.json()
    }).then(dados => {
        codigoRetornoFDeslig = dados
        alert("Solicitação de desligamento enviada!")
        window.location.reload();

    })

    resetForms()
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

function verificarSelecaoRegime(){
var res = '';
const items = document.getElementsByName('TIPO_REGIME');
for (var i = 0; i < items.length; i++) {
  if (items[i].checked) {
    res = items[i].value
    console.log(res)
    break;
  }
}
return res;

}

function verificarSelecaoDesligamento(){
const tipoRegime = verificarSelecaoRegime()

const items = document.getElementsByName('TIPO_DESLIGAMENTO'+tipoRegime);
for (var i = 0; i < items.length; i++) {
  if (items[i].checked) {
    tipoDesligamento = items[i].value
    console.log(tipoDesligamento)

    break;
  }
}
return tipoDesligamento;

}

function ocultarLinhas(){
const tipoRegime = verificarSelecaoRegime()

const escolha = verificarSelecaoDesligamento();

linhaTabelaSelecionada = ".linha"+escolha+tipoRegime

let nonChecked = [1,2,3,4]

for(i in nonChecked){
  if(nonChecked[i] == escolha){
    tabela = document.querySelectorAll(".linha"+escolha+tipoRegime)
    tabela[0].style.display = "table-row"

  }else{
    tabela = document.querySelectorAll(".linha"+nonChecked[i]+tipoRegime)
    tabela[0].style.display = "none"


  }
}

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
        var localCC = document.getElementById('CC');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
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
})

};

function ShowAndHidenCLT() {
  campoDataPJ = document.querySelector("#DataPJEncerramento")

  campoDataPJ.innerText = 'Data do Último Dia Trabalhado:'

  conteudoCLT.style.display = "block";
  conteudoPJ.style.display = 'none';
  conteudoEstag.style.display = 'none';
  linhaTabelaSelecionada = ".linha1CLT";
  regime = "CLT";

}
function ShowAndHidenPJ() {

  campoDataPJ = document.querySelector("#DataPJEncerramento")

  campoDataPJ.innerText = 'Data de Encerramento do Contrato:'

conteudoCLT.style.display = "none";
conteudoPJ.style.display = 'block';
conteudoEstag.style.display = 'none';
linhaTabelaSelecionada = ".linha1PJ";
regime = "PJ";

}
function ShowAndHidenEstag() {
  campoDataPJ = document.querySelector("#DataPJEncerramento")

  campoDataPJ.innerText = 'Data de Encerramento do Contrato:'

conteudoCLT.style.display = "none";
conteudoPJ.style.display = 'none';
conteudoEstag.style.display = 'block';
linhaTabelaSelecionada = ".linha1Estag";
regime = "Estag";

}

function ocultarDescontoPJ(){



  campostabelaDesconto = document.querySelector("#ocultarDescontoCLT")
  tabela = document.querySelectorAll(".linha2CLT")

  var celulas = tabela[0].children

  var selecaoValor = celulas[1].children


  if(selecaoValor[0].value == '6'){
  campostabelaDesconto.innerHTML =  ` <select style="font-size: 12px;"  id="descontoDeAviso" class="form-control border-secondar shadow-none"
  aria-label="Default select example" required>
  <option selected value="7">Não se aplica</option>
  </select>`
 }

 }

 function mudarListaCLTTerminoDeContrato(){
  campostabelaMotivo = document.querySelector("#mudarListaCLT")
  tabela = document.querySelectorAll(".linha3CLT")

  var celulas = tabela[0].children

  var selecaoValor = celulas[1].children

  if(selecaoValor[0].value == '7' || selecaoValor[0].value == '8' ){
  campostabelaMotivo.innerHTML =  ` <select style="font-size: 12px;"  id="motivoDesligContrato" class="form-control border-secondar shadow-none"
  aria-label="Default select example" required>
  <option selected value="">Selecione...</option>
  <option id="baixaPerfor" value="1 ">Baixa Performance </option>
  <option id="c/a incompativeis" value="3">                                        Comportamento/Atitudes incompatíveis</option>
  <option id="problemas-de-relacionamentos" value="14 ">
      Problemas de relacionamentos com pares e/ou lideres, e/ou liderados </option>
  <option id="mudancas-estrutura" value="10">Mudança de estrutura </option>
  <option id="reducao-custo" value="20">Redução de custo</option>
  <option id="mudancaPerfil" value="11">Mudança de Perfil </option>
  <option id="outros" value="12">Outros                                        (especificar no                                        campo
      observação)</option>
  </select>`
 }else{
campostabelaMotivo.innerHTML = `<select style="font-size: 12px;"  id="motivoDesligContrato" class="form-control border-secondar shadow-none"
aria-label="Default select example" required>
<option selected value="">Selecione...</option>
<option id="propostaSalarial" value="19">Proposta
    salarial mais atrativa
</option>
<option id="propostaCLT" value="18">Proposta para contrato
    CLT
</option>
<option id="beneficiosAtrativos" value="2">Benefícios mais
    atrativos
</option>
<option id="propostaVisibilidade"
    value="17">
    Proposta com maior visibilidade de carreira
</option>
<option id="melhorInvestimento"
    value="8">
    Melhores investimentos em treinamento e capacitações
</option>
<option id="incompatibilidadeLideranca"
    value="6">
    Incompatibilidade com liderança imediata
</option>
<option id="insatisfacaoClima" value="7">
    Insatisfação com o clima organizacional
</option>
<option id="faltaFeedback" value="4">
    Falta de feedback e apoio por parte da liderança
</option>
<option id="projetoPessoal" value="16">
    Projetos Pessoais
</option>
<option id="problemaSaude" value="13">
    Problema de Saúde
</option>
<option id="mudancaCidade" value="9">
    Mudança de Cidade/Estado ou País
</option>
<option id="faltaPerspectiva" value="5">
    Falta de perspectiva profissional
</option>
<option id="outros2" value="12">
    Outros (especificar no campo observação)
</option>
</select>`
 }

 }

conveniaCentroCusto();
conveniaColaborares();
