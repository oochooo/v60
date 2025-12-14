FROM node:20-alpine

WORKDIR /app

RUN npm create vite@latest . -- --template react && npm install

COPY V60Timer.jsx src/App.jsx

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
