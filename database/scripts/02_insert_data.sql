-- Script 02: Dados Iniciais
USE LojaDB;
GO

-- Clientes
IF NOT EXISTS (SELECT 1 FROM dbo.Cliente WHERE CNPJ = '11222333000181')
BEGIN
    INSERT INTO dbo.Cliente (CNPJ, Nome, Email, DataCadastro) VALUES
    ('11222333000181', 'João da Silva',  'joao.silva@email.com',      GETDATE()),
    ('22333444000192', 'Maria Oliveira', 'maria.oliveira@email.com',  GETDATE()),
    ('33444555000103', 'Tech Solutions', 'contato@techsolutions.com', GETDATE()),
    ('44555666000114', 'Papelaria',      'papelaria@brasil.com',      GETDATE());
END
GO

-- Produtos
IF NOT EXISTS (SELECT 1 FROM dbo.Produto WHERE Nome = 'Monitor 24" Full HD')
BEGIN
    INSERT INTO dbo.Produto (Nome, Preco, Estoque) VALUES
    ('Monitor 24" Full HD',      899.90,  5),
    ('Teclado USB',               89.90,  0),
    ('Mouse Óptico USB',          49.90, 12),
    ('Headset Gamer',            199.90,  8),
    ('Webcam Full HD',           249.90,  6),
    ('Notebook Stand Ajustável', 159.90,  4),
    ('Hub USB 4 Portas',          69.90, 15),
    ('Cabo HDMI 2m',              29.90, 20),
    ('SSD Externo 480GB',        319.90,  7);
END
GO

-- Pedidos de exemplo
IF NOT EXISTS (SELECT 1 FROM dbo.Pedido)
BEGIN
    -- Pedido 1: Maria Oliveira — 2 Headsets + 1 Webcam
    INSERT INTO dbo.Pedido (CodCliente, DataPedido, ValorTotal)
    VALUES (2, DATEADD(DAY, -3, GETDATE()), 649.70);

    INSERT INTO dbo.ItensPedido (CodPedido, CodProduto, Quantidade, PrecoUnitario) VALUES
    (1, 4, 2, 199.90),
    (1, 5, 1, 249.90);

    -- Pedido 2: Tech Solutions — 3 Hubs USB + 5 Cabos HDMI
    INSERT INTO dbo.Pedido (CodCliente, DataPedido, ValorTotal)
    VALUES (3, DATEADD(DAY, -1, GETDATE()), 359.20);

    INSERT INTO dbo.ItensPedido (CodPedido, CodProduto, Quantidade, PrecoUnitario) VALUES
    (2, 7, 3, 69.90),
    (2, 8, 5, 29.90);
END
GO

PRINT 'Dados iniciais inseridos com sucesso!';
GO
