'use strict';

// common modules
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

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
});

afterEach(async () => {
  // clear todos
  await db('todos').truncate();
});

// =============================================================================
// Endpoint: /todos
// =============================================================================
describe('Endpoint: /todos', () => {
  describe('GET', () => {
    it('returns 200', async () => {
      expect.assertions(2);

      // setup
      await db('users').insert(testData.users);
      await db('todos').insert(testData.todos);

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
      };

      const outputs = {
        status: 200,
        body: {
          results: [
            {
              id: 1,
              title: testData.todos[0].title,
              description: testData.todos[0].description,
              done: testData.todos[0].done,
              userId: testData.todos[0].user_id,
            },
            {
              id: 2,
              title: testData.todos[1].title,
              description: testData.todos[1].description,
              done: testData.todos[1].done,
              userId: testData.todos[1].user_id,
            },
            {
              id: 3,
              title: testData.todos[2].title,
              description: testData.todos[2].description,
              done: testData.todos[2].done,
              userId: testData.todos[2].user_id,
            },
            {
              id: 4,
              title: testData.todos[3].title,
              description: testData.todos[3].description,
              done: testData.todos[3].done,
              userId: testData.todos[0].user_id,
            },
            {
              id: 5,
              title: testData.todos[4].title,
              description: testData.todos[4].description,
              done: testData.todos[4].done,
              userId: testData.todos[1].user_id,
            },
            {
              id: 6,
              title: testData.todos[5].title,
              description: testData.todos[5].description,
              done: testData.todos[5].done,
              userId: testData.todos[2].user_id,
            },
          ],
          total: 6,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: '/todos',
        headers: { Authorization: inputs.authorization },
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
          title: 'Clean House',
          description: 'Wash dishes',
          userId: 1,
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
        url: '/todos',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 400, if no body', async () => {
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
      };

      const outputs = {
        status: 400,
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/todos',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    it('returns 400, if empty body', async () => {
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
        body: {}
      };

      const outputs = {
        status: 400,
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/todos',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    it('returns 400, no valid properties', async () => {
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
        body: {
          prop1: '1',
          prop2: '2',
        }
      };

      const outputs = {
        status: 400,
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/todos',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    it('returns 400, if no title', async () => {
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
          // title: 'Clean House',
          description: 'Wash dishes',
          userId: 1,
        },
      };

      const outputs = {
        status: 400,
      };

      // trigger
      const response = await app.inject({
        method: 'POST',
        url: '/todos',
        headers: { Authorization: inputs.authorization },
        payload: inputs.body,
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });

    // TODO: returns 400, invalid userId
  });
});

// =============================================================================
// Endpoint: /todos/:id:
// =============================================================================
describe('Endpoint: /todos/:id:', () => {
  describe('GET', () => {
    it('returns 200', async () => {
      expect.assertions(2);

      // setup
      await db('users').insert(testData.users[0]);
      await db('todos').insert(testData.todos[0]);

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
          title: testData.todos[0].title,
          description: testData.todos[0].description,
          done: testData.todos[0].done,
          userId: testData.todos[0].user_id,
        },
      };

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: `/todos/${inputs.params.id}`,
        headers: { Authorization: inputs.authorization },
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });

    it('returns 404, if no todo matching id', async () => {
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
        url: `/todos/${inputs.params.id}`,
        headers: { Authorization: inputs.authorization },
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
    });
  });

  describe('PUT', () => { });

  describe('DELETE', () => { });
});
