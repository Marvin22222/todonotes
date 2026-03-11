# Verwende Node.js als Basis-Image
FROM node:20-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Quelldateien kopieren
COPY . .

# Port expose
EXPOSE 5173

# Entwicklungsserver starten
CMD ["npm", "run", "dev", "--", "--host"]
