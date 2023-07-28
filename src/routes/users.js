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
    url: '/users',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    handler: getUsers,
  });
  fastify.route({
    method: 'POST',
    url: '/users',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    schema: {
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          userName: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
        required: ['email', 'userName', 'firstName', 'lastName'],
      },
    },
    handler: createUser,
  });

  fastify.route({
    method: 'GET',
    url: '/users/:id',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    handler: getUser,
  });

  fastify.route({
    method: 'PUT',
    url: '/users/:id',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    schema: {
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          userName: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
        },
      },
    },
    handler: updateUser,
  });

  fastify.route({
    method: 'DELETE',
    url: '/users/:id',
    // preValidation: [fastify.authenticate, fastify.authorize],
    // config: {
    //   validScopes: ['Todos.Read', 'Todos.Manage'],
    //   validRoles: ['Administrator', 'Client']
    // },
    handler: deleteUser,
  });
}

// =============================================================================
// business logic
// =============================================================================
// retrieves all users
async function getUsers(request, reply) {
  // add upper bound for limit
  let limit = 50;
  if (request.query.limit) {
    limit = Math.min(Math.round(request.query.limit), 250);
  }

  // attempt to lookup users
  let users;
  let total;
  try {
    users = await db('users')
      .select({
        id: 'id',
        email: 'email',
        userName: 'user_name',
        firstName: 'first_name',
        lastName: 'last_name',
      })
      .orderBy('id')
      .offset(request.query.offset ? request.query.offset : 0)
      .limit(limit);

    total = await db('users').count('id', { as: 'count' });
  } catch (error) {
    // istanbul ignore next
    return reply.code(500).send({ message: error.message });
  }

  // build response
  const response = {
    results: users,
    total: total[0].count,
  };

  // send response
  return reply.code(200).send(response);
}

async function createUser(request, reply) {
  // attempt to create user
  let result;
  try {
    const { email, userName, firstName, lastName } = request.body;

    // Insert the new user into the database
    result = await db('users').insert(
      {
        email,
        user_name: userName,
        first_name: firstName,
        last_name: lastName,
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

// retrieves user
async function getUser(request, reply) {
  // attempt to lookup todo
  let user;
  try {
    user = await db('users')
      .select({
        id: 'id',
        email: 'email',
        userName: 'user_name',
        firstName: 'first_name',
        lastName: 'last_name',
      })
      .where({ id: request.params.id })
      .first();
  } catch (error) {
    //istanbul ignore next
    return reply.code(500).send({ message: error.message });
  }

  // User: check User was found
  if (!user) {
    return reply.code(404).send('User not found');
  }

  // send response
  return reply.code(200).send(user);
}

async function updateUser(request, reply) {
  const userId = request.params.id;

  const existingUser = await db('users').where('id', userId).first();

  if (!existingUser) {
    return reply.code(404).send({ message: error.message });
  }
  // attempt to lookup user
  const { email, userName, firstName, lastName } = request.body;
  let user;
  try {
    await db('users').where({ id: request.params.id }).update({
      email: email,
      user_name: userName,
      first_name: firstName,
      last_name: lastName,
    });

    user = await db('users')
      .where({ id: request.params.id })
      .select({
        id: 'id',
        email: 'email',
        userName: 'user_name',
        firstName: 'first_name',
        lastName: 'last_name',
      })
      .first();
  } catch (error) {
    //istanbul ignore next
    return reply.code(500).send({ message: error.message });
  }

  // send response
  return reply.code(201).send(user);
}

async function deleteUser(request, reply) {
  // attempt to lookup user
  let result;
  try {
    result = await db('users').del().where({ id: request.params.id });
  } catch (error) {
    //istanbul ignore next
    return reply.code(500).send({ message: error.message });
  }

  // check delete succeeded
  if (!result) {
    return reply.code(404).send();
  }

  // send response
  return reply.code(204).send();
}
