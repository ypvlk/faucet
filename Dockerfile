# Base on offical Node.js Alpine image
FROM node:12

# Set working directory
WORKDIR /app

RUN apt-get update && apt-get install -y
RUN npm install -g pm2
RUN npm install -g knex

# Copy package.json and package-lock.json before other files
# Utilise Docker cache to save re-installing dependencies if unchanged
COPY ./package*.json ./

# Install dependencies
RUN npm install --production

# Copy all files
COPY ./ ./

# Expose the listening port
EXPOSE 3000
#EXPOSE 8443

COPY docker-deploy-production.sh .
COPY wait-for-it.sh .

RUN chmod +x docker-deploy-production.sh
RUN chmod +x wait-for-it.sh

RUN chmod 777 /usr/local/bin/docker-entrypoint.sh \
    && ln -s /usr/local/bin/docker-entrypoint.sh /

RUN chmod -R 777 logs/
RUN chmod -R 777 var/tickers/
RUN chmod -R 777 var/backtesting/

# Run container as non-root (unprivileged) user
# The node user is provided in the Node.js Alpine base image
USER node