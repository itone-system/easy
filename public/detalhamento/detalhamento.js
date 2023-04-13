$(document).ready(function () {
  const status = $('#status').val();

  if (status == 'A') {
    $('#one').addClass('active');
    $('#two').addClass('active');
  }

  if (status == 'P') {
    $('#one').addClass('active');
  }

  if (status == 'C') {
    $('#one').addClass('active');
    $('#three').addClass('active');
    $('#two').addClass('active');
  }
  conveniaCentroCusto()



  const downloadArquivoNF = document.getElementById("baixararq");
  downloadArquivoNF.addEventListener("click", function(){

    downloadItem()

  });

});

window.onload = () => {
  const toggle = body.querySelector(".toggle")
  const clickEvent = new MouseEvent('click');
  toggle.dispatchEvent(clickEvent);
};

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
  if(valor == 'NaN') elemento.value = '';
}

function adicionarCampoParcelas() {
  var campoColaborador = document.querySelector('#divParcela');
  campoColaborador.innerHTML = `

    <div class="row g-3">
    <div class="col-lg-2 ">
        <label for="fname">Quantidade de Parcelas:</label>
        <input id="quantidadeDeParcelas" class="form-control" style="margin-bottom: 10%;" type="number" name="quantidadeDeParcelas">
    </div>
    <div class="col-lg-2">
         <label for="fname">Data da primeira parcela:</label>
        <input id="dataDaPrimeiraParcela" class="form-control" style="margin-bottom: 10%;" type="date" name="dataDaPrimeiraParcela">
    </div>
</div>
    `;
}

function removerCampoParcelas() {
  $('#divParcela').empty();
  // var campoColaborador = document.getElementById('divParcela')
  // campoColaborador.innerHTML = ``
}

function aprovarSolicitacao() {
  const codigoSolicitacao = document.getElementById('codigoSolicitacao').value;

  const corpo = {
    codigoSolicitacao: codigoSolicitacao
  };

  fetch(endpoints.AprovarSolicitacao, {
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

function reprovarSolicitacao() {
  const codigoSolicitacao = document.getElementById('codigoSolicitacao').value;
  const motivo = document.getElementById('motivoRep').value;

  if (motivo.length == 0) {
    document.getElementById('descricaoObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Campo obrigatório</h1>';
    return;
  }

  if (motivo.length < 5) {
    document.getElementById('descricaoObrigatorio').innerHTML =
      '<h1 style="color: red; font-size: 12px;">* Detalhe um motivo válido</h1>';
    return;
  }

  const corpo = {
    codigoSolicitacao: codigoSolicitacao,
    motivoReprovacao: motivo
  };

  fetch(endpoints.ReprovarSolicitacao, {
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
  console.log(dados)

      if (dados) {
        alert(dados);
      }
      window.location.reload();
    });
}

function insertCompra (codigo) {
  let quantidadeDeParcelas = null;
  let dataDaPrimeiraParcela = null;

  if (!document.getElementById('quantidadeDeParcelas')) {
    quantidadeDeParcelas = 0;
    dataDaPrimeiraParcela = '';
  } else {
    quantidadeDeParcelas = document.getElementById(
      'quantidadeDeParcelas'
    ).value;
    dataDaPrimeiraParcela = document.getElementById(
      'dataDaPrimeiraParcela'
    ).value;
  }

  const dataDaCompra = document.getElementById('dataDaCompra').value;
  const valorDaCompra = document.getElementById('valor').value;
  const previsaoDeEntrega = document.getElementById('previsaoDeEntrega').value;
  const codigo2 = codigo;
  const metodoDePagamento = document.getElementById('metPagamento').value;
  const comprador = document.getElementById('comprador').value;

  const dados = {
    dataDaCompra: dataDaCompra,
    valorDaCompra: valorDaCompra,
    quantidadeDeParcelas: quantidadeDeParcelas,
    dataDaPrimeiraParcela: dataDaPrimeiraParcela,
    previsaoDeEntrega: previsaoDeEntrega,
    codigo: codigo2,
    metodoDePagamento: metodoDePagamento,
    comprador: comprador
  };

  fetch(endpoints.Comprar, {
    method: 'POST',
    body: JSON.stringify(dados),
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
      $('#botao-solicitar').attr('hidden', true);
      window.location.reload();
    });
};

function updateSolicitacao(){
  const descricao = document.getElementById('descricaoModal').value;
  const motivo = document.getElementById('motivoModal').value;
  const quantidade = document.getElementById('quantidadeModal').value;
  const centroDeCusto = $('#CentroCustoModal').val();
  const deal = document.getElementById('dealModal').value;
  const codigo = document.getElementById('codigoSolicitacao').value;

  const data = {
    descricao: descricao,
    motivo: motivo,
    quantidade: quantidade,
    centroDeCusto: centroDeCusto,
    deal: deal,
    codigo: codigo
  };


  fetch(endpoints.editarSolicitacao, {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
    .then((dados) => {
      return dados.json();
    })
    .then((dados) => {
      // clique no botão fechar
      $('#fecharModal').click();

      if (dados) {
        alert(dados);
      }

      window.location.reload();
    });
};

function conveniaCentroCusto() {
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

      dados.forEach((element) => {
        var localCC = document.getElementById('CentroCustoModal');
        var option = document.createElement('option');
        option.textContent = element.name;
        localCC.appendChild(option);
      });
    });
};

function addAnex() {
  // const select = document.getElementById("metPagamento");

  $('#metPagamento').change(function () {
    var selectedOption = $(this).val();
    if (selectedOption === 'Boleto' && $('#file-input').length == 0) {
      $('#anexo').after('<input type="file" id="file-input">');
    } else {
      // $('#file-input').remove();
      removeAnex();
    }
  });
}

function removeAnex() {
  // $('#anexo').empty();
  document.getElementById('file-input').remove();
}


function downloadItem(){

  baixar = document.getElementById('baixar')

  // var codigoNF = document.getElementById("NumeroSolicitacaoModal").value;
  const codigo = document.getElementById('codigoSolicitacao').value;

  var arquivo = 'SLT-'+codigo+' '+document.getElementById('NomeAnexo').innerText

  baixar.href = endpoints.downloadItem+arquivo
}
