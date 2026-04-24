FROM node:24-slim AS deps
WORKDIR /ginzu/BackEnd

COPY package*.json ./

RUN npm ci --omit=dev

FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /ginzu/BackEnd

COPY --from=deps /ginzu/BackEnd/node_modules ./node_modules
COPY . .

EXPOSE 3000
CMD ["node", "src/app.js"]