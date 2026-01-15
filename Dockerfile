FROM node:22-alpine

WORKDIR /app

# Сначала копируем только файлы зависимостей
COPY package*.json ./
RUN npm ci --only=production

# Копируем остальной код
COPY . .

# Создаем папку для загрузок, если её нет
RUN mkdir -p upload

EXPOSE 8800

# Убедись, что в package.json прописан скрипт start
CMD ["npm", "start"]