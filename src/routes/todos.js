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
    handler: getTodos,
  });
  fastify.route({
    method: 'POST',
    url: '/todos',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    schema: {
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          userId: { type: 'integer' },
        },
        required: ['title'],
      },
    },
    handler: createTodos,
  });

  fastify.route({
    method: 'GET',
    url: '/todos/{id}',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    handler: getTodo,
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
        title: 'title',
        description: 'description',
        done: 'done',
        userId: 'user_id',
      })
      .orderBy('id')
      .offset(request.query.offset ? request.query.offset : 0)
      .limit(limit);

    console.log('***test ');
    total = await db('todos').count('id', { as: 'count' });
  } catch (error) {
    /* istanbul ignore next */
    return reply.code(500).send({ message: error.message });
  }

  // build response
  const response = {
    results: todos,
    total: total[0].count,
  };

  // send response
  return reply.code(200).send(response);
}

async function createTodos(request, reply) {
  console.log(request.body);
  try {
    const { title, description, user_id } = request.body;

    // Check if the required properties are present in the request body
    if (!request.body) {
      reply.code(400).send('Missing required properties');
      return;
    }

    // Check if the required properties are present in the request body
    if (request.body === null) {
      reply.code(400).send('Missing required properties');
      return;
    }

    // Check if the required properties are present in the request body
    if (!title) {
      reply.code(400).send('Missing required properties');
      return;
    }

    // Check if the specified user exists
    const user = await db('users').where({ id: user_id }).first();
    if (!user) {
      reply.code(404).send('User not found');
      return;
    }

    // Insert the new todo into the database
    const [id] = await db('todos').insert({
      title,
      description,
      done: false,
      user_id: user_id,
    });

    const response = {
      // How do I get it to return the id of the number created?
      id: 1,
    };

    // Return the newly created todo ID in the response
    reply.code(201).send(response);
  } catch (error) {
    console.error(error);
    reply.code(500).send('Internal Server Error');
  }
}

// retrieves all todos
async function getTodo(request, reply) {
  // attempt to lookup todo
  const { id } = request.body;
  let todo;
  let total;
  try {
    todo = await db('todos')
      .select({
        id: 'id',
        title: 'title',
        description: 'description',
        done: 'done',
        userId: 'user_id',
      })
      .where({ id: id });

    console.log('***test ');
  } catch (error) {
    /* istanbul ignore next */
    return reply.code(500).send({ message: error.message });
  }

  // build response
  const response = {
    results: todo,
  };

  // send response
  return reply.code(200).send(response);
}
