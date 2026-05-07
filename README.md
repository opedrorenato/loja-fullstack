# loja-fullstack

## Database

Para rodar o banco de dados:

```bash
docker build -t loja-db .
docker run -d -p 1433:1433 --name loja-db-container loja-db
```
