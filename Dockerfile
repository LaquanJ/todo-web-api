# ==============================================================================
# server
# ==============================================================================
# using alpine node as base image
FROM node:lts-alpine3.14 as base

# set node environment defaulting to production
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# set port defaulting to 8080
ARG PORT=8080
ENV PORT $PORT
EXPOSE $PORT

# set max requests defaulting to 5
ARG MAX_REQUESTS=5
ENV MAX_REQUESTS $MAX_REQUESTS

# set log level defaulting to info
ARG LOG_LEVEL=info
ENV LOG_LEVEL $LOG_LEVEL

# install dependencies as the "node" unprivileged account for security
RUN mkdir /opt/app \
  && chown node:node /opt/app
WORKDIR /opt/app
USER node
COPY package.json ./
RUN npm install --no-optional \
  && npm cache clean --force
ENV PATH /opt/app/node_modules/.bin:$PATH

# copy solution files while setting ownership
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./doc/openapi.yaml ./doc/openapi.yaml

# copy wait-for.sh while setting ownership and execution permissions
COPY --chown=node:node ./wait-for.sh ./wait-for.sh
RUN chmod +x ./wait-for.sh

# define healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD [ "node", "./src/healthcheck.js" ]

# start development server
CMD [ "npm", "run", "start" ]