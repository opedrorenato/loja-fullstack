#!/bin/bash
/opt/mssql/bin/sqlservr &

# espera o SQL subir
sleep 5

# roda os scripts
echo "Criando banco de dados..."
/opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "$SA_PASSWORD" \
    -i /docker-entrypoint-initdb/01_create_tables.sql \
    -No

if [ $? -eq 0 ]; then
    echo ">>> Tabelas criadas!"
else
    echo ">>> Erro ao criar tabelas"
    exit 1
fi

echo "Inserindo dados iniciais..."
/opt/mssql-tools18/bin/sqlcmd \
    -S localhost \
    -U sa \
    -P "$SA_PASSWORD" \
    -i /docker-entrypoint-initdb/02_insert_data.sql \
    -No

if [ $? -eq 0 ]; then
    echo ">>> Dados inseridos!"
else
    echo ">>> Erro ao inserir dados"
    exit 1
fi

wait
