# Base stage named "node-app"
FROM node:20 AS node-app

# RUN mkdir -p /app/node-app && chown -R node:node /app/node-app
RUN apt-get update && apt-get install -y wget gnupg curl && \
    curl -fsSL https://pgp.mongodb.com/server-6.0.asc | tee /etc/apt/keyrings/mongodb-server-6.0.gpg > /dev/null && \
    echo "deb [signed-by=/etc/apt/keyrings/mongodb-server-6.0.gpg] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/6.0 main" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && apt-get install -y mongodb-org && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./

# Install dependencies as root first
RUN yarn install --pure-lockfile

COPY . .

# Switch to node user AFTER dependencies are installed
# USER node

# COPY --chown=node:node . .

EXPOSE 3000
EXPOSE 27017  

CMD mongod --fork --logpath /var/log/mongodb.log && yarn start

# Final image (optional, if needed)
# FROM node:alpine AS final
# WORKDIR /app
# COPY --from=node-app /app .
# CMD ["node", "server.js"]
