# Base stage named "node-app"
FROM node:20 AS node-app

# RUN mkdir -p /app/node-app && chown -R node:node /app/node-app
RUN apt-get update && apt-get install -y wget gnupg && \
    wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - && \
    echo "deb http://repo.mongodb.org/apt/debian buster/mongodb-org/4.4 main" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list && \
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
