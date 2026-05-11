# loja-fullstack

Novo deploy (fresh start) com docker-compose:
```bash
docker-compose down -v
docker-compose up --build -d
```

## Database

```bash
cd database
docker build -t loja-db .
docker run -d -p 1433:1433 --name loja-db-container loja-db
```

### Tabelas:
![](images/bd.png)

### Diagrama:
![](images/bd-diagrama.png)

### Tabela Cliente:
![](images/bd-tb-cliente.png)

### Tabela Produto:
![](images/bd-tb-produto.png)

### Tabela Pedido:
![](images/bd-tb-pedido.png)

### Tabela ItensPedido:
![](images/bd-tb-itenspedido.png)

---

## Backend

```bash
cd backend\LojaFullStack.API
docker build -t loja-backend .
docker run -d -p 5000:5000 -e ConnectionStrings__DefaultConnection="Server=host.docker.internal,1433;Database=LojaDB;User Id=sa;Password=SenhaForte!123;TrustServerCertificate=True;" --name loja-backend-container loja-backend
```

![alt text](images/backend-swagger.png)

---

## Frontend

```bash
cd frontend
npm run dev -p 4000
```

![alt text](images/frontend.png)

---

## Docker Compose

```bash
docker-compose up -d --build
```