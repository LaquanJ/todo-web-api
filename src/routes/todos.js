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
    url: '/todos/:id',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    handler: getTodo,
  });

  fastify.route({
    method: 'PUT',
    url: '/todos/:id',
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
          done: { type: 'boolean' },
          userId: { type: 'integer' },
        },
      },
    },
    handler: updateTodo,
  });

  fastify.route({
    method: 'DELETE',
    url: '/todos/:id',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    handler: deleteTodo,
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
  // attempt to create todo
  let result;
  try {
    const { title, description, userId } = request.body;

    // Check if the specified user exists
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      return reply.code(400).send('User not found');
    }

    // Insert the new todo into the database
    result = await db('todos').insert(
      {
        title,
        description,
        done: false,
        user_id: userId,
      },
      'id'
    );
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: error.message });
  }

  // send response
  return reply.code(201).send({ id: result[0].id });
}

// retrieves todo
async function getTodo(request, reply) {
  // attempt to lookup todo
  let todo;
  try {
    todo = await db('todos')
      .select({
        id: 'id',
        title: 'title',
        description: 'description',
        done: 'done',
        userId: 'user_id',
      })
      .where({ id: request.params.id })
      .first();
  } catch (error) {
    /* istanbul ignore next */
    return reply.code(500).send({ message: error.message });
  }

  // TODO: check todo was found
  if (!todo) {
    return reply.code(404).send('Todo not found');
  }

  // send response
  return reply.code(200).send(todo);
}

async function updateTodo(request, reply) {
  const todoId = request.params.id;

  const existingTodo = await db('todos').where('id', todoId).first();

  if (!existingTodo) {
    return reply.code(404).send({ message: error.message });
  }
  // attempt to lookup todo
  const { title, description, done } = request.body;
  let todo;
  try {
    await db('todos')
      .where({ id: request.params.id })
      .update({ title: title, description: description, done: done });

    todo = await db('todos')
      .where({ id: request.params.id })
      .select({
        id: 'id',
        title: 'title',
        description: 'description',
        done: 'done',
        userId: 'user_id',
      })
      .first();
  } catch (error) {
    /* istanbul ignore next */
    return reply.code(500).send({ message: error.message });
  }

  // send response
  return reply.code(201).send(todo);
}

async function deleteTodo(request, reply) {
  // attempt to lookup todo
  let result;
  try {
    result = await db('todos')
      .del()
      .where({ id: request.params.id });
  } catch (error) {
    /* istanbul ignore next */
    return reply.code(500).send({ message: error.message });
  }

  // check delete succeeded
  if (!result) {
    return reply.code(404).send();
  }

  // send response
  return reply.code(204).send();
}
