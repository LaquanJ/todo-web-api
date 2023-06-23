'use strict';

// common modules
/* intentionally empty */

// custom modules
import db from '#database/index.js';

// =============================================================================
// endpoints
// =============================================================================
export default async function routes(fastify, options) {
  fastify.route({
    method: 'GET',
    url: '/todos',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    handler: getTodos
  });
}

// =============================================================================
// business logic
// =============================================================================
// retrieves all todos
async function getTodos(request, reply) {
  // add upper bound for limit
  let limit = 50;
  if (request.query.limit) {
    limit = Math.min(Math.round(request.query.limit), 250);
  }

  // attempt to lookup todos
  let todos;
  let total;
  try {
    todos = await db('todos')
      .select({
        id: 'id',
        clientNumber: 'client_number',
        projectName: 'project_name',
        projectNumber: 'project_number',
        category: 'category',
        itemName: 'item_name',
        itemUrl: 'item_url',
        dueDate: 'due_date',
        status: 'status'
      })
      .orderBy('id')
      .offset(request.query.offset ? request.query.offset : 0)
      .limit(limit);

    total = await db('todos')
      .count('id', { as: 'count' });
  } catch (error) {
    /* istanbul ignore next */
    return reply.code(500).send({ message: error.message });
  }

  // build response
  const response = {
    results: todos,
    total: total[0].count
  };

  // send response
  return reply.code(200).send(response);
}