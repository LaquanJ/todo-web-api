'use strict';

// =============================================================================
// setup application insights
// this must be done prior to any other imports to ensure proper instrumentation
import appInsights from 'applicationinsights';

/* istanbul ignore next */
if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY
  && process.env.APPINSIGHTS_INSTRUMENTATIONKEY
  !== '00000000-0000-0000-0000-000000000000') {
  appInsights.setup(process.env.APPINSIGHTS_INSTRUMENTATIONKEY)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)

    // disabling live metrics due to suspected memory leak
    .setSendLiveMetrics(false)

    .setDistributedTracingMode(
      appInsights.DistributedTracingModes.AI_AND_W3C
    );
  appInsights.defaultClient.context.tags[
    appInsights.defaultClient.context.keys.cloudRole
  ] = process.env.APPINSIGHTS_ROLENAME;
  appInsights.start();
}
// =============================================================================


// common modules
import axios from 'axios';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import compress from '@fastify/compress';
import jwt from '@fastify/jwt';
import jwksClient from 'jwks-rsa';

// custom modules
import { initialize as initializeDb } from '#database/index.js';
import routes from '#routes/index.js';

// =============================================================================
// initialize loggers
// =============================================================================
const environmentLoggers = {
  development: true,
  test: false,
  production: true
}


// =============================================================================
// initialize databases
// =============================================================================
await initializeDb();

// =============================================================================
// initialize app
// =============================================================================
/* istanbul ignore next */
const fastify = Fastify({
  logger: environmentLoggers[process.env.NODE_ENV] ?? true,
  ignoreTrailingSlash: true,
  ignoreDuplicateSlashes: true
});

// setup CORS
await fastify.register(cors, {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  origin: '*' // typically overridden by deployment proxy (e.g. Azure)
});

// setup reply compression
await fastify.register(compress);

// setup authentication
/* istanbul ignore else */
if ((process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
  && process.env.AZURE_AD_TENANT === '00000000-0000-0000-0000-000000000000'
  && process.env.AZURE_AD_CLIENT_ID === '00000000-0000-0000-0000-000000000000'
) {
  // register local development authentication
  await fastify.register(jwt, {
    secret: '00000000-0000-0000-0000-000000000000',
    verify: {
      algorithms: ['HS256']
    }
  });
} else {
  // create jwks client for azure
  let authAzureIssuer, authAzureJwksUri;
  try {
    // obtain OpenID configuration details
    const oidConfigResponse = await axios.get(
      `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT}`
      + '/v2.0/.well-known/openid-configuration'
    );

    authAzureJwksUri = oidConfigResponse.data.jwks_uri;
    authAzureIssuer = oidConfigResponse.data.issuer;
  } catch (error) {
    console.error(`Could not retrieve OpenID configuration: ${error.message}`);
    process.exit(1);
  }

  const azureJwksClient = jwksClient({ jwksUri: authAzureJwksUri });

  // register azure authentication
  await fastify.register(jwt, {
    decode: { complete: true },
    secret: (request, token, callback) => {
      // retrieve signing key from azure
      azureJwksClient.getSigningKey(token.header.kid, (error, key) => {
        if (error) {
          return callback(error, null);
        } else {
          return callback(null, key.publicKey || key.rsaPublicKey);
        }
      });
    },
    verify: {
      algorithms: ['HS256', 'RS256'],
      allowedAud: process.env.AZURE_AD_CLIENT_ID,
      allowedIss: authAzureIssuer
    }
  })
}

fastify.decorate('authenticate', async (request, reply) => {
  try {
    // validate the token
    await request.jwtVerify()
  } catch (error) {
    // send unauthorized response
    return reply.code(401).send({ message: error.message });
  }
});

fastify.decorate('authorize', async (request, reply) => {
  try {
    // check scopes
    if (!request.user.scp.split(' ').some((el) => {
      return (request.routeConfig.validScopes.indexOf(el) >= 0)
    })) {
      throw new Error('Client not allowed.')
    }

    // check roles
    if (!request.user.roles.some((el) => {
      return (request.routeConfig.validRoles.indexOf(el) >= 0)
    })) {
      throw new Error('User not allowed.')
    }
  } catch (error) {
    return reply.code(403).send({ message: error.message });
  }
});

// setup routes
await fastify.register(routes);

export default fastify;