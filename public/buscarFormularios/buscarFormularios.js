let pagina = 1;
let arraySolicitacao = [];
let totalPaginas = null;
let codigoForm = '';
let tipoModalAtivo = ''
let descricaoTipoForm = ''
let codigoRetornoNF = '';
let tokenAtivo = false;
let camposButtonHTML = ''
let camposStatusHTML = ''
let tabelaBanco = ''
let codigoSolicitanteForm = '';
let SolicitanteNome = '';

window.onload = function () {
  const toggle = body.querySelector('.toggle');
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);

  conveniaCentroCusto();
  conveniaColaborares();

  let elementModalFerias = document.getElementById('openModalFerias');
  let elementModalDesligamento = document.getElementById('openModalDesligamento');
  let elementModalAlteracao = document.getElementById('openModalAlteracao');

  let tabelaNF = document.querySelectorAll('#tabelaNF');

  tabelaNF.forEach((row) => {
    row.addEventListener('click', () => {
      switch(row.cells[3].innerText){
        case "Férias":
          elementModalFerias.click();
          codigoForm = row.cells[0].innerText
          tipoModalAtivo = 'Ferias'
          descricaoTipoForm = "Férias"
          tabelaBanco = "FERIAS"
          gerarDadosModalFerias(row.cells[0].innerText, 'FERIAS_VIEW');
          break
        case "Desligamento":
          codigoForm = row.cells[0].innerText
          tipoModalAtivo = 'Deslig'
          descricaoTipoForm = "Desligamento"
          elementModalDesligamento.click();
          tabelaBanco = "RESCISAO"
          gerarDadosModalDesligamento(row.cells[0].innerText, 'RESCISAO_VIEW');
          break
        case "Alteração Cadastral":
          codigoForm = row.cells[0].innerText
          tipoModalAtivo = 'Alter'
          descricaoTipoForm = "Alteração Cadastral"
          tabelaBanco = "ALTERACAO_CADASTRAL"
          elementModalAlteracao.click();
          gerarDadosModalAlteracaoCad(row.cells[0].innerText, 'ALTERACAO_VIEW');
          break
      }
    });
  });


}

const atualizarStatusFormAprov = () => {

  colaboradorModal = document.getElementById('ModColaborador'+tipoModalAtivo).value;
  codigoUser = document.getElementById('codigoUsuario').innerText;


let headersList = {
    'Content-Type': 'application/json'
  };

  let bodyContent = JSON.stringify({
    codigo: codigoForm,
    usuario: codigoUser,
    tipo: tipoModalAtivo.substr(0, 1),
    tabelaBanco: tabelaBanco,
    descricaoTipo: descricaoTipoForm,
    solicitanteNome: SolicitanteNome,
    colaborador: colaboradorModal,
    dataAprovacao: new Date(),
    aprovado: 'S'

  });

  let response = fetch(endpoints.aprovacaoForms, {
    method: 'POST',
    body: bodyContent,
    headers: headersList
  });

  alert('Solicitação n° ' + codigoForm + ' aprovada.');
  window.location.reload();
};

const atualizarStatusFormReprov = (motivo) => {

  // Solicitante = document.getElementById('ModSolicitante'+tipoModalAtivo).value;
   colaboradorModal = document.getElementById('ModColaborador'+tipoModalAtivo).value;
   codigoUser = document.getElementById('codigoUsuario').innerText;

 let headersList = {
     'Content-Type': 'application/json'
   };

   let bodyContent = JSON.stringify({
     codigo: codigoForm,
     usuario: codigoUser,
     tipo: tipoModalAtivo.substr(0, 1),
     tabelaBanco: tabelaBanco,
     descricaoTipo: descricaoTipoForm,
     solicitanteNome: SolicitanteNome,
     colaborador: colaboradorModal,
     dataAprovacao: new Date(),
     aprovado: 'R',
     obsRecusa: motivo
   });

   let response = fetch(endpoints.aprovacaoForms, {
     method: 'POST',
     body: bodyContent,
     headers: headersList
   });

   alert('Solicitação n° ' + codigoForm + ' reprovada.');
   window.location.reload();
 };

const conveniaCentroCusto = () => {
  fetch('http://itonerdp06/formularios/departamentos', {
    method: 'GET',
    redirect: 'follow',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  })
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      var dados = result;
      let listaCC = [];

      dados.forEach((element) => {
        if (element) {
          listaCC.push(element.DESCRICAO);
          listaCC.sort();
        }
      });

      listaCC.forEach((element) => {
        var localCC = document.getElementById('CentroCusto');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      });
    });
};

function gerarDadosModalFerias(codigo, tipo) {
  // localRetorno = document.getElementById('RetornoStatusNF');

  let bodyContent = {
    codigo: codigo,
    tipo: tipo
  };
  fetch(endpoints.formUnico, {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      return dados.json();
    })
    .then((dados) => {
      let data = dados;
      console.log(data)

      document.getElementById('NumeroSolicitacaoModalFerias').value = data[0].ID;
      document.getElementById('ModColaboradorFerias').value = data[0].Nome;
      document.getElementById('ModDataSolcitacao').value = data[0].DATA_SOLICITACAO;
      document.getElementById('ModabonoFerias').value = data[0].ABONO_FERIAS;
      document.getElementById('ModAdiantamento').value = data[0].ADIANTAMENTO;
      document.getElementById('ModDataInicio').value = data[0].DATA_INICIO;
      document.getElementById('ModDataFim').value = data[0].DATA_FIM;
      document.getElementById('ModnumDias').value = data[0].NUM_DIAS;
      var permissao = document.getElementById('permissaoFerias').innerText
      var obsRecusa = data[0].STATUS === 'I' ? data[0].OBS_INDEFERIDO : data[0].OBS_RECUSA
      codigoSolicitanteForm = data[0].COD_SOLICITANTE
      SolicitanteNome = data[0].SOLICITANTE

      gerarHTMLcamposButton(data[0].APROVACAO_DP, data[0].APROVADO, 'Ferias', data[0].PROX_APROV, data[0].STATUS, permissao, obsRecusa)

      gerarDadosHistAprovacoes(codigo, tipo)


    });
}

function gerarDadosModalAlteracaoCad(codigo, tipo) {
  // localRetorno = document.getElementById('RetornoStatusNF');

  let bodyContent = {
    codigo: codigo,
    tipo: tipo
  };
  fetch(endpoints.formUnico, {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      // console.log(dados)
      return dados.json();
    })
    .then((dados) => {
      let data = dados;
      console.log(data)

      document.getElementById('NumeroSolicitacaoModalAlter').value = data[0].ID;
      document.getElementById('ModSolicitanteAlter').value = data[0].SOLICITANTE;
      document.getElementById('ModDataSolcitacaoAlter').value = data[0].DATA_SOLICITACAO;
      document.getElementById('ModDataMovimentacaoAlter').value = data[0].DATA_MOVIMENTACAO;
      document.getElementById('ModColaboradorAlter').value = data[0].NOME;
      document.getElementById('ModFilialAtualAlter').value = data[0].FILIAL_ATUAL;
      document.getElementById('ModFilialNovoAlter').value = data[0].FILIAL_NOVO;
      document.getElementById('ModDPAtualAlter').value = data[0].DEPARTAMENTO_ATUAL;
      document.getElementById('ModDPNovoAlter').value = data[0].DEPARTAMENTO_NOVO;
      document.getElementById('ModCCAtualAlter').value = data[0].CC_ATUAL;
      document.getElementById('ModCCNovoAlter').value = data[0].CC_NOVO;
      document.getElementById('ModCargoAtualAlter').value = data[0].CARGO_ATUAL;
      document.getElementById('ModCargoNovoAlter').value = data[0].CARGO_NOVO;
      document.getElementById('ModSalarioAtualAlter').value = 'R$ '+data[0].SALARIO_ATUAL;
      document.getElementById('ModSalarioNovoAlter').value = 'R$ '+data[0].SALARIO_NOVO;
      document.getElementById('ModGestorAtualAlter').value = data[0].GESTOR_ATUAL;
      document.getElementById('ModGestorNovoAlter').value = data[0].GESTOR_NOVO;
      document.getElementById('Justificativa').value = data[0].JUSTIFICATIVA;
      var permissao = document.getElementById('permissaoAlter').innerText
      var obsRecusa = data[0].STATUS === 'I' ? data[0].OBS_INDEFERIDO : data[0].OBS_RECUSA
      codigoSolicitanteForm = data[0].COD_SOLICITANTE
      SolicitanteNome = data[0].SOLICITANTE

      gerarHTMLcamposButton(data[0].APROVACAO_DP, data[0].APROVADO, 'Alter', data[0].PROX_APROV, data[0].STATUS, permissao, obsRecusa)

      gerarDadosHistAprovacoes(codigo, tipo)

    });
}

function gerarDadosModalDesligamento(codigo, tipo) {
  // localRetorno = document.getElementById('RetornoStatusNF');

  let bodyContent = {
    codigo: codigo,
    tipo: tipo
  };
  fetch(endpoints.formUnico, {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      // console.log(dados)
      return dados.json();
    })
    .then((dados) => {
      let data = dados;
      console.log(data)

      document.getElementById('NumeroSolicitacaoModalDeslig').value = data[0].ID;
      document.getElementById('ModSolicitanteDeslig').value = data[0].SOLICITANTE;
      document.getElementById('ModDataSolcitacaoDeslig').value = data[0].DATA_SOLICITACAO;
      document.getElementById('ModColaboradorDeslig').value = data[0].NOME;
      document.getElementById('ModDataAvisoDeslig').value = data[0].DATA_AVISO;
      document.getElementById('ModUltimoDiaDeslig').value = data[0].ULTIMO_DIA;
      document.getElementById('ModtipoRegimeDeslig').value = data[0].TIPO_REGIME;
      document.getElementById('ModTipoDeslig').value = data[0].RESCISAO_TP_DESLIG;
      document.getElementById('ModtipoAvisoDeslig').value = data[0].RESCISAO_TIPO_AVISO;
      document.getElementById('ModDescontoDeslig').value = data[0].RESCISAO_DESCONTO;
      document.getElementById('ModMotivosDeslig').value = data[0].RESCISAO_MOTIVOS;
      document.getElementById('ModSubstituicaoDeslig').value = data[0].SUBSTITUICAO;
      document.getElementById('ModObservacaoDeslig').value = data[0].OBSERVACAO;
      var permissao = document.getElementById('permissaoDeslig').innerText
      var obsRecusa = data[0].STATUS === 'I' ? data[0].OBS_INDEFERIDO : data[0].OBS_RECUSA
      codigoSolicitanteForm = data[0].COD_SOLICITANTE
      SolicitanteNome = data[0].SOLICITANTE

      gerarHTMLcamposButton(data[0].APROVACAO_DP, data[0].APROVADO, 'Deslig', data[0].PROX_APROV, data[0].STATUS, permissao,  obsRecusa)
      gerarDadosHistAprovacoes(codigo, tipo)

    });
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
          var localColab = document.getElementById('nomeColaborador')
          var option = document.createElement('option');
          option.textContent = element;
          localColab.appendChild(option);

  });
})

};

function gerarHTMLcamposButton(aprovacaoDP, aprovado, tipo, proxAprovador, status, permissaoDeferimento, obsRecusa){

  let campoStatus = document.querySelector('.camposStatus'+tipo)
  let campusButton = document.querySelector('.camposButton'+ tipo)
  let campusStatus = document.getElementById('statusModal'+ tipo)
  codigoUser = document.getElementById('codigoUsuario').innerText;

  console.log(aprovado)
  console.log(aprovacaoDP)
  console.log(permissaoDeferimento)

  if(status === 'A'){
      campusStatus.innerHTML = '<span class="badge badge-primary" style="margin-top: 2.5%">Aprovado</span>'
    }else if(status === 'R'){
      campusStatus.innerHTML = '<span class="badge badge-danger" style="margin-top: 2.5%">Reprovado</span>'
    }else{
      campusStatus.innerHTML = '<span class="badge badge-secondary" style="margin-top: 2.5%">Aguardando Aprovação</span>'
  }

  campusButton.innerHTML = ''
  campoStatus.innerHTML = ''

  if (status == 'N' && aprovacaoDP == 'N' && permissaoDeferimento) {
      camposButtonHTML = `  <!-- Modal footer -->
      <div class="row g-3" style="width: 450px; ">

        <div class="col">
            <button id="salvarCompra" onclick="atualizarStatusFormAprovDP()" value="Salvar" type="submit"
              class="btn btn-success" style="margin-right: 0%; ">Validar</button>
        </div>
        <div class="col">
          <button id="salvarCompra" onclick="observacaoReprovacaoDP()" value="Salvar" type="submit"
            class="btn btn-danger" style="margin-left: 43%;">Reprovar</button>
        </div>
      </div>
  `
    campusButton.innerHTML = camposButtonHTML

  }
  else if (aprovado == 'N' && codigoUser == proxAprovador){
    camposButtonHTML = `  <!-- Modal footer -->
    <div class="row g-3" style="width: 450px; ">

      <div class="col">
          <button id="salvarCompra" onclick="atualizarStatusFormAprov()" value="Salvar" type="submit"
            class="btn btn-success" style="margin-right: 0%; ">Aprovar</button>
      </div>
      <div class="col">
        <button id="salvarCompra" onclick="observacaoReprov()" value="Salvar" type="submit"
          class="btn btn-danger" style="margin-left: 43%;">Reprovar</button>
      </div>
    </div>
`
  campusButton.innerHTML = camposButtonHTML


  }else if(status === "I" || status === "R") {
    campoStatus.innerHTML = `<div class="col salvarCompra">
    <label>Motivo da Recusa:</label>
    <input id="Recusa" for="Recusa" style="margin-bottom: 5%; font-size:13px"  value="${obsRecusa}" type="text" class="form-control is-invalid" readonly>
    </div>`
    campusButton.innerHTML = ''

  }else{
    campusButton.innerHTML = ''
    campoStatus.innerHTML = ''

  }
}

 function observacaoReprov(){

  var motivo = prompt("Informe o motivo:");
  if (motivo) {
    atualizarStatusFormReprov(motivo)
  } else{
    alert("Prenchimento obrigatório.")
  }
}

function observacaoReprovacaoDP(){

motivo = prompt("Informe o motivo:");
  if (motivo) {
    atualizarStatusFormAprovDP('R', motivo)
} else{
    alert("Prenchimento obrigatório.")
  }

}

const atualizarStatusFormAprovDP = (status,  motivoRecusa) => {

  colaboradorModal = document.getElementById('ModColaborador'+tipoModalAtivo).value;
  codigoUser = document.getElementById('codigoUsuario').innerText;
  statusForm =  status === undefined? 'aprovada' : 'reprovada'

let headersList = {
    'Content-Type': 'application/json'
  };

  let bodyContent = JSON.stringify({
    CODIGO: codigoForm,
    SOLICITANTE: codigoSolicitanteForm,
    COLABORADOR: colaboradorModal,
    TIPO: tabelaBanco,
    STATUS: status === undefined? 'S' : 'R',
    MOTIVO_RECUSA: motivoRecusa,
    DATA_APROVACAO: new Date(),
    TIPO_FORM: descricaoTipoForm,
    APROVADOR: codigoUser


  });

  let response = fetch(endpoints.aprovacaoDP, {
    method: 'POST',
    body: bodyContent,
    headers: headersList
  });

  alert('Solicitação n° ' + codigoForm + ' ' +statusForm);
  window.location.reload();

};

// const atualizarStatusFormDeferimento = (motivo) => {

//   //  Solicitante = document.getElementById('ModSolicitante'+tipoModalAtivo).value;
//    colaboradorModal = document.getElementById('ModColaborador'+tipoModalAtivo).value;
//    codigoUser = document.getElementById('codigoUsuario').innerText;
//    statusDeferimento = document.getElementById('StatusFormDeferimento').value;
//    console.log(SolicitanteNome)

//  let headersList = {
//      'Content-Type': 'application/json'
//    };

//    let bodyContent = JSON.stringify({
//      codigo: codigoForm,
//      tabelaBanco: tabelaBanco,
//      descricaoTipo: descricaoTipoForm,
//      solicitanteNome: SolicitanteNome,
//      colaborador: colaboradorModal,
//      deferimento: statusDeferimento.substr(0,1),
//      obsIndeferido: motivo
//    });

//    let response = fetch("http://itonerdp06/formularios/statusFormsDeferimento", {
//      method: 'POST',
//      body: bodyContent,
//      headers: headersList
//    });

//    alert('Solicitação n° ' + codigoForm + ' ' + statusDeferimento + '.');

//    window.location.reload();
//  };

function gerarDadosHistAprovacoes(codigo, tipo) {
  // localRetorno = document.getElementById('RetornoStatusNF');

  let bodyContent = {
    codigo: codigo,
    tipo: tipo
  };
  fetch(endpoints.histAprovacoesForms, {
    method: 'POST',
    body: JSON.stringify(bodyContent),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      console.log(dados)
      return dados.json();
    })
    .then((dados) => {
      let data = dados;
      console.log(tipo)

      let camposaprovacoes = '';
      var camposHist = document.getElementById('camposHistorico-'+tipo.substr(0,1))

      if(data.length > 1){

        camposHist.innerHTML =   `<center><div class="card-body"><ol id="hist-${tipo.substr(0,1)}" style="font-size: 12px;"> </ol></center>`

        var camposHistAprovacoes = document.getElementById('hist-'+tipo.substr(0,1))

      for(i = 0; i < data.length; i++){
        console.log(data[i].STATUS)
        if(data[i].STATUS === "Aprovada" || data[i].STATUS === "Reprovada" ){
          camposaprovacoes = camposaprovacoes + ` <li>${data[i].STATUS} por ${data[i].NOME_USUARIO} em ${data[i].DATA} às ${data[i].HORA}h</li>`
        } else{
          camposaprovacoes = camposaprovacoes +  ` <li>${data[i].STATUS}  de ${data[i].NOME_USUARIO} </li> `
        }
      }

      camposHistAprovacoes.innerHTML = camposaprovacoes
    }
    });
}

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
        var localCC = document.getElementById('CentroCusto');
        var option = document.createElement('option');
        option.textContent = element;
        localCC.appendChild(option);
      }
      });
    });
};
