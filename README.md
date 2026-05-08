# loja-fullstack

## Database

Para rodar o banco de dados:

```bash
cd database
docker build -t loja-db .
docker run -d -p 1433:1433 --name loja-db-container loja-db
```

Diagrama:
![](images/loja-bd-diagrama.png)
![](images/loja-bd.png)

Tabela Cliente:
![](images/loja-bd-tb-cliente.png)

Tabela Produto:
![](images/loja-bd-tb-produto.png)

Tabela Pedido:
![](images/loja-bd-tb-pedido.png)

Tabela ItensPedido:
![](images/loja-bd-tb-itenspedido.png)
