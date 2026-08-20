FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3030

EXPOSE 3030

CMD ["npm", "run", "start", "--", "--port", "3030"]
