'use strict';

// common modules
import fs from 'fs';

// custom modules
// import todos from '#routes/todos.js'; // TODO: Uncomment when todos routes built

// =============================================================================
// endpoints
// =============================================================================
export default async function routes(fastify, options) {
  // setup index routes
  fastify.route({
    method: 'GET',
    url: '/',
    handler: getIndex
  });

  fastify.route({
    method: 'GET',
    url: '/openapi.yaml',
    handler: getSpecification
  });

  // setup other routes
  // await fastify.register(todos); // TODO: Uncomment when todos routes built
}

// =============================================================================
// business logic
// =============================================================================
// return version
async function getIndex(request, reply) {
  // send response
  return reply.code(200).send({ version: process.env.npm_package_version });
}


// return specification
async function getSpecification(request, reply) {
  // read specification
  let specification;
  try {
    specification = await fs.readFileSync('doc/openapi.yaml', 'utf8');
  } catch (error) {
    /* istanbul ignore next */
    return reply.code(500).send({ message: error.message });
  }

  // send response
  return reply
    .code(200)
    .type('application/vnd.oai.openapi')
    .send(specification);
}