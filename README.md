# loja-fullstack

## Database

Para rodar o banco de dados:

```bash
cd database
docker build -t loja-db .
docker run -d -p 1433:1433 --name loja-db-container loja-db
```

Tabelas:
![](images/loja-bd.png)

Diagrama:
![](images/loja-bd-diagrama.png)

Tabela Cliente:
![](images/loja-bd-tb-cliente.png)

Tabela Produto:
![](images/loja-bd-tb-produto.png)

Tabela Pedido:
![](images/loja-bd-tb-pedido.png)

Tabela ItensPedido:
![](images/loja-bd-tb-itenspedido.png)

---

## Backend

```bash
cd backend\LojaFullStack.API
docker build -t loja-backend .
docker run -d -p 5000:5000 -e ConnectionStrings__DefaultConnection="Server=host.docker.internal,1433;Database=LojaDB;User Id=sa;Password=SenhaForte!123;TrustServerCertificate=True;" --name loja-backend-container loja-backend
```

---

## Frontend

---
