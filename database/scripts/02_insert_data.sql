-- Script 02: Dados Iniciais
USE LojaDB;

GO
-- Clientes
IF NOT EXISTS (
    SELECT
        1
    FROM
        Cliente
    WHERE
        CNPJ = '11.222.333/0001-81'
) BEGIN
INSERT INTO
    Cliente (CNPJ, Nome, Email, DataCadastro)
VALUES
    (
        '11.222.333/0001-81',
        'João da Silva',
        'joao.silva@email.com',
        GETDATE ()
    ),
    (
        '22.333.444/0001-92',
        'Maria Oliveira',
        'maria.oliveira@email.com',
        GETDATE ()
    ),
    (
        '33.444.555/0001-03',
        'Tech Solutions',
        'contato@techsolutions.com',
        GETDATE ()
    ),
    (
        '44.555.666/0001-14',
        'Papelaria',
        'papelaria@brasil.com',
        GETDATE ()
    );

END GO
-- Produtos
IF NOT EXISTS (
    SELECT
        1
    FROM
        Produto
    WHERE
        Nome = 'Monitor 24" Full HD'
) BEGIN
INSERT INTO
    Produto (Nome, Preco, Estoque)
VALUES
    ('Monitor 24" Full HD', 899.90, 5),
    ('Teclado USB', 89.90, 0),
    ('Mouse Óptico USB', 49.90, 12),
    ('Headset Gamer', 199.90, 8),
    ('Webcam Full HD', 249.90, 6),
    ('Notebook Stand Ajustável', 159.90, 4),
    ('Hub USB 4 Portas', 69.90, 15),
    ('Cabo HDMI 2m', 29.90, 20),
    ('SSD Externo 480GB', 319.90, 7);

END GO
-- Pedidos de exemplo (para a tela inicial já ter conteúdo)
IF NOT EXISTS (
    SELECT
        1
    FROM
        Pedido
) BEGIN
-- Pedido 1: Maria Oliveira — 2 Headsets + 1 Webcam
INSERT INTO
    Pedido (CodCliente, DataPedido, ValorTotal)
VALUES
    (2, DATEADD (DAY, -3, GETDATE ()), 649.70);

INSERT INTO
    ItensPedido (CodPedido, CodProduto, Quantidade, PrecoUnitario)
VALUES
    (2, 4, 2, 199.90), -- 2 Headsets
    (2, 5, 1, 249.90);

-- 1 Webcam
-- Pedido 2: Tech Solutions — 3 Hubs USB + 5 Cabos HDMI
INSERT INTO
    Pedido (CodCliente, DataPedido, ValorTotal)
VALUES
    (3, DATEADD (DAY, -1, GETDATE ()), 359.20);

INSERT INTO
    ItensPedido (CodPedido, CodProduto, Quantidade, PrecoUnitario)
VALUES
    (3, 7, 3, 69.90), -- 3 Hubs USB
    (3, 8, 5, 29.90);

-- 5 Cabos HDMI
END GO PRINT 'Dados iniciais inseridos com sucesso!';

GO