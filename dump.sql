CREATE DATABASE ADM_WEB
GO

USE ADM_WEB
GO

CREATE TABLE [dbo].[Aprovacoes] (
	Codigo_Solicitacao int NULL,
	Status char(1) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'N' NULL,
	Ordem int NULL,
	Codigo_Aprovador int NULL,
	id int IDENTITY(1,1) NOT NULL,
	Tipo int NULL,
	CONSTRAINT PK__Aprovaco__3213E83FF21AD256 PRIMARY KEY (id)
);


CREATE TABLE [dbo].[Compras] (
	idCompra int IDENTITY(1,1) NOT NULL,
	dataDaCompra date DEFAULT NULL NULL,
	previsaoDeEntrega date DEFAULT NULL NULL,
	dataDaPrimeiraParcela date DEFAULT NULL NULL,
	valorDaCompra numeric(18,2) NULL,
	quantidadeDeParcelas int NULL,
	codigo_solicitacao int NULL,
	metodo_De_Pagamento varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	id_Comprador int NULL,
	anexo varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK__Compras__48B99DB7E180E16E PRIMARY KEY (idCompra)
);

CREATE TABLE [dbo].[DiretorFinanceiro] (
	id int IDENTITY(1,1) NOT NULL,
	codigo int NULL,
	CONSTRAINT PK__DiretorF__3213E83FDFE23559 PRIMARY KEY (id)
);

CREATE TABLE [dbo].[MODULOS] (
	ID int IDENTITY(1,1) NOT NULL,
	MODULO varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK__MODULOS__3214EC27F5B631F9 PRIMARY KEY (ID)
);


CREATE TABLE [dbo].[NotaFiscal] (
	Codigo int IDENTITY(1,1) NOT NULL,
	Solicitante varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CentroCusto varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Fornecedor varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Descricao varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TipoContrato varchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TipoPagamento varchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DadosBanc varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DataPagamento date NULL,
	Deal int NULL,
	Observacao varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	PossuiColaborador varchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'N' NULL,
	Colaborador varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Status_NF varchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'N' NULL,
	StatusNF varchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'A' NULL,
	Anexo varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	ValorNF varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CodigoSolicitacao int NULL,
	Aprovada char(1) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'N' NULL,
	CONSTRAINT PK__NotaFisc__06370DAD5131FF9D PRIMARY KEY (Codigo)
);

CREATE TABLE [dbo].[PERMISSOES] (
	ID int IDENTITY(1,1) NOT NULL,
	COD_USUARIO int NULL,
	COD_PERMISSAO int NULL,
	COD_MODULO int NULL,
	CONSTRAINT PK__PERMISSO__3214EC2745B379F0 PRIMARY KEY (ID)
);

CREATE TABLE [dbo].[Solicitacao_Item] (
	Codigo int IDENTITY(1,1) NOT NULL,
	Descricao nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	DataCriacao datetimeoffset NOT NULL,
	DataAtualizacao datetimeoffset NULL,
	Quantidade int NULL,
	Centro_de_Custo varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Deal varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Observacao nvarchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Solicitante nvarchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Aprovado char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Compra_Realizada char(1) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Status_Compra varchar(5) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	anexo varchar(255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Link varchar(2000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	Reprovador int NULL,
	MotivoReprovacao varchar(3000) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	valor varchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	pix varchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	filial varchar(200) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	dataPagamento datetimeoffset NULL,
	CONSTRAINT PK__Solicita__06370DADFB7F1471 PRIMARY KEY (Codigo)
);

CREATE TABLE [dbo].[TIPO_PERMISSAO] (
	ID int IDENTITY(1,1) NOT NULL,
	PERMISSAO varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK__TIPO_PER__3214EC27B73C6DD1 PRIMARY KEY (ID)
);

CREATE TABLE [dbo].[Usuarios] (
	COD_USUARIO int IDENTITY(1,1) NOT NULL,
	LOGIN_USUARIO varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	SENHA varbinary(100) NULL,
	NOME_USUARIO varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	EMAIL_USUARIO varchar(60) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	ID_DEPARTAMENTO varchar(10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	DATA_CADASTRO_USUARIO date NOT NULL,
	VALIDACAO_SENHA varchar(1) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'N' NULL,
	Perfil int DEFAULT 1 NULL,
	PRIMEIRO_APROVADOR varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	SEGUNDO_APROVADOR varchar(50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	TERCEIRO_APROVADOR varchar(40) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	CONSTRAINT PK__Usuarios__38680423D64729C0 PRIMARY KEY (COD_USUARIO)
);

CREATE TABLE [dbo].[centroCusto] (
	id int IDENTITY(1,1) NOT NULL,
	centroDeCusto varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	codigoDiretor int NULL,
	CONSTRAINT PK__centroCu__3213E83F48830229 PRIMARY KEY (id)
);

CREATE TABLE [dbo].[solicitacaoAdmissao] (
	Codigo int IDENTITY(1,1) NOT NULL,
	tipoDeAdmissao int NULL,
	substituicao char(1) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'N' NULL,
	unidade varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	departamento varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	centroDecusto varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	salario varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	cliente varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	tutorOnboarding varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	gestorImediato varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	cargo varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	deal varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	horario varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	equipamento varchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	cartaoDeVisita varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	celularCorporativo char(1) COLLATE SQL_Latin1_General_CP1_CI_AS DEFAULT 'N' NULL,
	usuarioSimilarAtivo varchar(100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	acessosEspecificos varchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	observacaoTrabalho varchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	observacaoBusiness varchar(500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
	dataDeAbertura datetimeoffset NULL,
	solicitante int NULL,
	CONSTRAINT PK__solicita__06370DADA0C84315 PRIMARY KEY (Codigo)
);

INSERT INTO [dbo].[TIPO_PERMISSAO] (PERMISSAO) VALUES
	 (N'EDITAR'),
	 (N'RETORNAR');


INSERT INTO [dbo].[MODULOS] (MODULO) VALUES
	 (N'COMPRAS'),
	 (N'NOTA FISCAL');

INSERT INTO [dbo].[PERMISSOES] (COD_USUARIO,COD_PERMISSAO,COD_MODULO) VALUES
	 (1,1,1),
	 (1,2,1),
	 (1,1,2),
	 (1,2,2),
	 (2,1,1),
	 (2,2,1),
	 (2,1,2),
	 (2,2,2),
	 (3,1,1),
	 (3,2,1),
	 (3,1,2),
	 (3,2,2);


INSERT INTO [dbo].[DiretorFinanceiro] (codigo) VALUES(3);

INSERT INTO [dbo].[centroCusto] (centroDeCusto,codigoDiretor) VALUES
	 (N'1',NULL),
	 (N'2',NULL),
	 (N'3',NULL),
	 (N'4',NULL),
	 (N'5',NULL),
	 (N'6',3);

INSERT INTO [dbo].[Usuarios] (LOGIN_USUARIO,SENHA,NOME_USUARIO,EMAIL_USUARIO,ID_DEPARTAMENTO,DATA_CADASTRO_USUARIO,VALIDACAO_SENHA,Perfil,PRIMEIRO_APROVADOR,SEGUNDO_APROVADOR,TERCEIRO_APROVADOR) VALUES
	 (N'gustavo.costa',0x020035BAA89831C04491F84CED4AE0F20F1186FD0D1EC5271AB30270115FBA392014E0F567DF59F61A193CB53ADAE2AF7F344F7E15CCFDAE465AA10A38C11492E4B455DCD3A6,N'Gustavo Costa',N'gustavo.costa@email.com',N'6.4','2023-03-17',N'Y',1,N'2',N'3',NULL),
	 (N'filipe.dias',0x020035BAA89831C04491F84CED4AE0F20F1186FD0D1EC5271AB30270115FBA392014E0F567DF59F61A193CB53ADAE2AF7F344F7E15CCFDAE465AA10A38C11492E4B455DCD3A6,N'Felipe Dias',N'felipedias@email.com',N'6.4','2023-03-17',N'Y',3,N'3',NULL,NULL),
	 (N'andrezza.rocha',0x020035BAA89831C04491F84CED4AE0F20F1186FD0D1EC5271AB30270115FBA392014E0F567DF59F61A193CB53ADAE2AF7F344F7E15CCFDAE465AA10A38C11492E4B455DCD3A6,N'Andrezza Rocha',N'andrezarocha@email.com',N'6.4','2023-03-17',N'Y',3,N'3',NULL,NULL);
