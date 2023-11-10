'use strict';

// common modules
import jwt from 'jsonwebtoken';

// custom modules
import app from '#src/app.js';
import db from '#database/index.js';

// =============================================================================
// General Setup & Teardown
// =============================================================================
const testData = {
  users: [
    {
      email: 'laquan@yahoo.com',
      user_name: 'quan1',
      first_name: 'Quan',
      last_name: 'New',
    },
    {
      email: 'laquan@gmail.com',
      user_name: 'quan2',
      first_name: 'Quan',
      last_name: 'Newe',
    },
    {
      email: 'laquan@aol.com',
      user_name: 'quan3',
      first_name: 'Quan',
      last_name: 'Newel',
    },
  ],
  todos: [
    {
      title: 'House Chores',
      description: 'Wash Dishes',
      done: false,
      user_id: 1,
    },
    {
      title: 'House Chores',
      description: 'Clean Room',
      done: false,
      user_id: 2,
    },
    {
      title: 'School Work',
      description: 'Finish Homework in English',
      done: false,
      user_id: 3,
    },
    {
      title: 'School Work',
      description: 'Finish homework in History',
      done: true,
      user_id: 1,
    },
    {
      title: 'House Chores',
      description: 'Pull Weeds around house',
      done: false,
      user_id: 2,
    },
    {
      title: 'House Chores',
      description: 'Water garden',
      done: true,
      user_id: 3,
    },
  ],
};

beforeEach(async () => {
  // clear todos
  await db('todos').truncate();

  // clear users and reset auto increment
  await db('users').del();
  await db.raw(`DBCC CHECKIDENT ('users', RESEED, 0)`);
});

afterEach(async () => {
  // clear todos
  await db('todos').truncate();

  // clear users and reset auto increment
  await db('users').del();
  await db.raw(`DBCC CHECKIDENT ('users', RESEED, 0)`);
});

// =============================================================================
// Endpoint: /users
// =============================================================================
describe('Endpoint: /users', () => {
  describe('GET', () => {
    it('returns 200', async () => {
      expect.assertions(2);

      // setup
      //await db('users').insert(testData.users);

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
      };

      const outputs = {
        status: 200,
        body: {
          results: [
            {
              id: 1,
              email: testData.users[0].email,
              userName: testData.users[0].user_name,
              firstName: testData.users[0].first_name,
              lastName: testData.users[0].last_name,
            },
            {
              id: 2,
              email: testData.users[1].email,
              userName: testData.users[1].user_name,
              firstName: testData.users[1].first_name,
              lastName: testData.users[1].last_name,
            },
            {
              id: 3,
              email: testData.users[2].email,
              userName: testData.users[2].user_name,
              firstName: testData.users[2].first_name,
              lastName: testData.users[2].last_name,
            },
          ],
          total: 3,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: '/users',
        headers: { Authorization: inputs.authorization },
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 401, invalid token', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d'
          },
          'INVALID KEY'
        )}`
      }

      const outputs = {
        status: 401,
        body: {
          message: 'Authorization token is invalid: The token signature is invalid.'
        }
      }

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: '/users',
        headers: { 'Authorization': inputs.authorization }
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 403, insufficient scope', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Write',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d'
          },
          '00000000-0000-0000-0000-000000000000'
        )}`
      }

      const outputs = {
        status: 403,
        body: {
          message: 'Client not allowed.'
        }
      }

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: '/users',
        headers: { 'Authorization': inputs.authorization }
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 403, insufficient role', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Manage',
            roles: ['INVALID ROLE'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d'
          },
          '00000000-0000-0000-0000-000000000000'
        )}`
      }

      const outputs = {
        status: 403,
        body: {
          message: 'User not allowed.'
        }
      }

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: '/users',
        headers: { 'Authorization': inputs.authorization }
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });
  });

  // POST ROUTES
  describe('POST', () => {
    it('returns 201', async () => {
      expect.assertions(2);

      // setup

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Write',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        body: {
          email: 'laquan@abc.com',
          userName: 'laquan123',
          firstName: 'Laquan',
          lastName: 'Newell',
        },
      };

      const outputs = {
        status: 201,
        body: {
          id: 1,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 401, invalid token', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Write',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d'
          },
          'INVALID KEY',
          
        )}`,
        body: {
          email: 'laquan@abc.com',
          userName: 'laquan123',
          firstName: 'Laquan',
          lastName: 'Newell',
        },
      }

      const outputs = {
        status: 401,
        body: {
          message: 'Authorization token is invalid: The token signature is invalid.'
        }
      }

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/todos',
        headers: { 'Authorization': inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 403, insufficient scope', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d'
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        body: {
          email: 'laquan@abc.com',
          userName: 'laquan123',
          firstName: 'Laquan',
          lastName: 'Newell',
        },
      }

      const outputs = {
        status: 403,
        body: {
          message: 'Client not allowed.'
        }
      }

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/todos',
        headers: { 'Authorization': inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 403, insufficient role', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Manage',
            roles: ['INVALID ROLE'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d'
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        body: {
          email: 'laquan@abc.com',
          userName: 'laquan123',
          firstName: 'Laquan',
          lastName: 'Newell',
        },
      }

      const outputs = {
        status: 403,
        body: {
          message: 'User not allowed.'
        }
      }

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/todos',
        headers: { 'Authorization': inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });


    it('returns 400, if no body', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Write',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
      };

      const outputs = {
        status: 400,
        body: {
          error: 'Bad Request',
          message: 'body must be object',
          statusCode: 400,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });
      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 400, if no email', async () => {
      expect.assertions(1);

      // setup

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Manage',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        body: {
          //email: 'laquan@abc.com',
          userName: 'laquan123',
          firstName: 'Laquan',
          lastName: 'Newell',
        },
      };

      const outputs = {
        status: 400,
        body: {
          error: 'Bad Request',
          message: 'body must have required property "email"',
          statusCode: 400,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });
      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    it('returns 400, if no user name', async () => {
      expect.assertions(1);

      // setup

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Manage',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        body: {
          email: 'laquan@abc.com',
          //userName: 'laquan123',
          firstName: 'Laquan',
          lastName: 'Newell',
        },
      };

      const outputs = {
        status: 400,
        body: {
          error: 'Bad Request',
          message: 'body must have required property "userName"',
          statusCode: 400,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });
      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    it('returns 400, if no first name', async () => {
      expect.assertions(1);

      // setup

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Manage',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        body: {
          email: 'laquan@abc.com',
          userName: 'laquan123',
          //firstName: 'Laquan',
          lastName: 'Newell',
        },
      };

      const outputs = {
        status: 400,
        body: {
          error: 'Bad Request',
          message: 'body must have required property "firstName"',
          statusCode: 400,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    it('returns 400, if no last name', async () => {
      expect.assertions(1);

      // setup

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Users.Manage',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        body: {
          email: 'laquan@abc.com',
          userName: 'laquan123',
          firstName: 'Laquan',
          //lastName: 'Newell',
        },
      };

      const outputs = {
        status: 400,
        body: {
          error: 'Bad Request',
          message: 'body must have required property "lastName"',
          statusCode: 400,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/users',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });
      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });
  });
});

// =============================================================================
// Endpoint: /users/:id:
// =============================================================================
describe('Endpoint: /users/:id:', () => {
  describe('GET', () => {
    it('returns 200', async () => {
      expect.assertions(2);

      // setup
      await db('users').insert(testData.users[0]);

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Todos.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        params: {
          id: 1,
        },
      };

      const outputs = {
        status: 200,
        body: {
          id: 1,
          email: testData.users[0].email,
          userName: testData.users[0].user_name,
          firstName: testData.users[0].first_name,
          lastName: testData.users[0].last_name,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: `/users/${inputs.params.id}`,
        headers: { Authorization: inputs.authorization },
      });
      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 404, if no user matching id', async () => {
      expect.assertions(1);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Todos.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        params: {
          id: 1,
        },
      };

      const outputs = {
        status: 404,
      };

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: `/users/${inputs.params.id}`,
        headers: { Authorization: inputs.authorization },
      });
      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });
  });

  describe('PUT', () => {
    it('returns 204', async () => {
      expect.assertions(1);

      // setup
      await db('users').insert(testData.users);

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Todos.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        body: {
          email: 'laquan@gmail.com',
          user_name: 'quan1',
          first_name: 'Quan',
          last_name: 'New',
        },
        params: {
          id: 1,
        },
      };

      const outputs = {
        status: 204,
      };

      // trigger
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${inputs.params.id}`,
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    it('returns 404, if no user matching id', async () => {
      expect.assertions(1);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Todos.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        params: {
          id: 1,
        },
        body: {
          email: 'laquan@yahoo.com',
          user_name: 'quan1',
          first_name: 'Quan',
          last_name: 'New',
        },
      };

      const outputs = {
        status: 404,
      };

      // trigger
      const response = await app.inject({
        method: 'PUT',
        url: `/users/${inputs.params.id}`,
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });
  });

  describe('DELETE', () => {
    it('returns 204', async () => {
      expect.assertions(1);

      // setup
      await db('users').insert(testData.users);

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Todos.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        params: {
          id: 1,
        },
      };

      const outputs = {
        status: 204,
      };

      // trigger
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${inputs.params.id}`,
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    it('returns 404, if no user exists', async () => {
      expect.assertions(1);

      // setup
      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Todos.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d',
          },
          '00000000-0000-0000-0000-000000000000'
        )}`,
        params: {
          id: 1,
        },
      };

      const outputs = {
        status: 404,
      };

      // trigger
      const response = await app.inject({
        method: 'DELETE',
        url: `/users/${inputs.params.id}`,
        headers: { Authorization: inputs.authorization },
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });
  });
});
