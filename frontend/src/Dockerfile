# Estágio de Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código e gerar o build
COPY . .
RUN npm run build

# Estágio de Execução
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar apenas o necessário do estágio de build
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000

CMD ["npm", "start"]
