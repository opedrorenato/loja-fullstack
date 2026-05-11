-- Script 01: Criação do Banco de Dados e Tabelas
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'LojaDB')
BEGIN
    CREATE DATABASE LojaDB;
END
GO

USE LojaDB;
GO

-- Tabela: Cliente
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Cliente')
BEGIN
    CREATE TABLE Cliente (
        CodCliente    INT           NOT NULL IDENTITY(1,1),
        CNPJ          VARCHAR(14)   NOT NULL,
        Nome          VARCHAR(150)  NOT NULL,
        Email         VARCHAR(150)  NOT NULL,
        DataCadastro  DATETIME      NOT NULL DEFAULT GETDATE(),

        CONSTRAINT PK_Cliente       PRIMARY KEY (CodCliente),
        CONSTRAINT UQ_Cliente_CNPJ  UNIQUE      (CNPJ)
    );
END
GO

-- Tabela: Produto
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Produto')
BEGIN
    CREATE TABLE Produto (
        CodProduto  INT             NOT NULL IDENTITY(1,1),
        Nome        VARCHAR(150)    NOT NULL,
        Preco       DECIMAL(10, 2)  NOT NULL,
        Estoque     INT             NOT NULL DEFAULT 0,

        CONSTRAINT PK_Produto       PRIMARY KEY (CodProduto),
        CONSTRAINT CK_Produto_Preco CHECK (Preco >= 0),
        CONSTRAINT CK_Produto_Estoque CHECK (Estoque >= 0)
    );
END
GO

-- Tabela: Pedido
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Pedido')
BEGIN
    CREATE TABLE Pedido (
        CodPedido   INT             NOT NULL IDENTITY(1,1),
        CodCliente  INT             NOT NULL,
        DataPedido  DATETIME        NOT NULL DEFAULT GETDATE(),
        ValorTotal  DECIMAL(10, 2)  NOT NULL DEFAULT 0,

        CONSTRAINT PK_Pedido        PRIMARY KEY (CodPedido),
        CONSTRAINT FK_Pedido_Cliente FOREIGN KEY (CodCliente)
            REFERENCES Cliente (CodCliente)
    );
END
GO

-- Tabela: ItensPedido
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ItensPedido')
BEGIN
    CREATE TABLE ItensPedido (
        CodPedido       INT             NOT NULL,
        CodProduto      INT             NOT NULL,
        Quantidade      INT             NOT NULL,
        PrecoUnitario   DECIMAL(10, 2)  NOT NULL,

        CONSTRAINT PK_ItensPedido PRIMARY KEY (CodPedido, CodProduto),
        CONSTRAINT FK_ItensPedido_Pedido FOREIGN KEY (CodPedido)
            REFERENCES Pedido (CodPedido),
        CONSTRAINT FK_ItensPedido_Produto FOREIGN KEY (CodProduto)
            REFERENCES Produto (CodProduto),
        CONSTRAINT CK_ItensPedido_Qtd CHECK (Quantidade > 0),
        CONSTRAINT CK_ItensPedido_Preco CHECK (PrecoUnitario >= 0)
    );
END
GO

PRINT 'Banco de dados e tabelas criados com sucesso!';
GO
