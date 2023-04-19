const { Router } = require('express');
const AdmissaoRouter = Router();
const admissaoController = require('./controller')
const { expressAdapter } = require('../../../infra/expressAdapter');
AdmissaoRouter.get('/', (request, response) => {
    response.render('home/Movimentacao/Admissao/Create', { nome: 'Gustavo Costa' })
})
AdmissaoRouter.get('/index', (request, response) => {
    response.render('home/Movimentacao/Index', {
        nome: 'Gustavo Costa', solicitacoes: [
            {
                Codigo: 49,
                Descricao: 'teclado',
                DataCriacao: '06/04/2023',
                Quantidade: 1,
                Status_Compra: 'P',
                Solicitante: 'Gustavo Costa',
                listaAprovadores: 'Sebastião Gomes, Manoel Gomes, Malaquias masckeico'
            },
            {
                Codigo: 49,
                Descricao: 'teclado',
                DataCriacao: '06/04/2023',
                Quantidade: 1,
                Status_Compra: 'P',
                Solicitante: 'Gustavo Costa',
                listaAprovadores: 'Sebastião Gomes, Manoel Gomes, Malaquias masckeico'
            },
            {
                Codigo: 49,
                Descricao: 'teclado',
                DataCriacao: '06/04/2023',
                Quantidade: 1,
                Status_Compra: 'P',
                Solicitante: 'Gustavo Costa',
                listaAprovadores: 'Sebastião Gomes, Manoel Gomes, Malaquias masckeico'
            },
            {
                Codigo: 49,
                Descricao: 'teclado',
                DataCriacao: '06/04/2023',
                Quantidade: 1,
                Status_Compra: 'P',
                Solicitante: 'Gustavo Costa',
                listaAprovadores: 'Sebastião Gomes, Manoel Gomes, Malaquias masckeico'
            },
            {
                Codigo: 49,
                Descricao: 'teclado',
                DataCriacao: '06/04/2023',
                Quantidade: 1,
                Status_Compra: 'P',
                Solicitante: 'Gustavo Costa',
                listaAprovadores: 'Sebastião Gomes, Manoel Gomes, Malaquias masckeico'
            },
            {
                Codigo: 49,
                Descricao: 'teclado',
                DataCriacao: '06/04/2023',
                Quantidade: 1,
                Status_Compra: 'P',
                Solicitante: 'Gustavo Costa',
                listaAprovadores: 'Sebastião Gomes, Manoel Gomes, Malaquias masckeico'
            },
            {
                Codigo: 49,
                Descricao: 'teclado',
                DataCriacao: '06/04/2023',
                Quantidade: 1,
                Status_Compra: 'P',
                Solicitante: 'Gustavo Costa',
                listaAprovadores: 'Sebastião Gomes, Manoel Gomes, Malaquias masckeico'
            },
            {
                Codigo: 49,
                Descricao: 'teclado',
                DataCriacao: '06/04/2023',
                Quantidade: 1,
                Status_Compra: 'P',
                Solicitante: 'Gustavo Costa',
                listaAprovadores: 'Sebastião Gomes, Manoel Gomes, Malaquias masckeico'
            }
            

           
        ]
    })
})
AdmissaoRouter.post('/insert', expressAdapter(admissaoController.insert))

module.exports = AdmissaoRouter;
