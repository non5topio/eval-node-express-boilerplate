# Base stage named "node-app"
FROM node:20 AS node-app

# RUN mkdir -p /app/node-app && chown -R node:node /app/node-app
RUN apt-get update && apt-get install -y wget gnupg curl && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg --dearmor -o /etc/apt/keyrings/mongodb-server-6.0.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/mongodb-server-6.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update && apt-get install -y mongodb-org && \
    rm -rf /var/lib/apt/lists/*


# Set up MongoDB required directories
RUN mkdir -p /data/db /var/log/mongodb && chown -R mongodb:mongodb /data/db

WORKDIR /app

COPY package.json yarn.lock ./

# Install dependencies as root first
RUN yarn install --pure-lockfile

COPY . .

# Switch to node user AFTER dependencies are installed
# USER node

# COPY --chown=node:node . .
ENV MONGODB_URL=mongodb://127.0.0.1:27017/node-boilerplate
ENV JWT_SECRET=thisisasamplesecret
ENV JWT_ACCESS_EXPIRATION_MINUTES=30
ENV JWT_REFRESH_EXPIRATION_DAYS=30
ENV JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
ENV JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
ENV SMTP_HOST=smtp.ethereal.email
ENV SMTP_PORT=587
ENV SMTP_USERNAME=freeman.sipes@ethereal.email
ENV SMTP_PASSWORD=Xf28B51mxCnUNETcJR
ENV EMAIL_FROM=support@yourapp.com
EXPOSE 3000
EXPOSE 27017  

CMD mongod --bind_ip_all --logpath /var/log/mongodb/mongodb.log --dbpath /data/db --fork && \
    sleep 5 && \
    yarn start
# Final image (optional, if needed)
# FROM node:alpine AS final
# WORKDIR /app
# COPY --from=node-app /app .
# CMD ["node", "server.js"]
