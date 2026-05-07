# database/Dockerfile
FROM mcr.microsoft.com/mssql/server:2022-latest

# Variáveis de ambiente do SQL Server
ENV ACCEPT_EULA=Y
ENV MSSQL_PID=Express
ENV SA_PASSWORD=SenhaForte!123

# Cria o diretório para os scripts de inicialização
USER root
RUN mkdir -p /docker-entrypoint-initdb

# Copia os scripts SQL para dentro da imagem
COPY scripts/01_create_tables.sql /docker-entrypoint-initdb/01_create_tables.sql
COPY scripts/02_insert_data.sql     /docker-entrypoint-initdb/02_insert_data.sql

# Copia e prepara o entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Volta ao usuário padrão do SQL Server
USER mssql

# Inicia o SQL Server e executa os scripts
CMD ["/entrypoint.sh"]
