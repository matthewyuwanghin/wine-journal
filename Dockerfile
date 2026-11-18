# 品酒手帳 — 可選 Docker（含 SQLite 後端）
# docker build -t wine-journal .
# docker run -d -p 3000:3000 -v $(pwd)/data:/app/server/data --name wine-journal wine-journal
FROM node:20-slim

WORKDIR /app
COPY index.html ./index.html
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/server.js ./server/
RUN mkdir -p /app/server/data
ENV PORT=3000 DB_PATH=/app/server/data/wine-journal.db

EXPOSE 3000
CMD ["node", "server/server.js"]
