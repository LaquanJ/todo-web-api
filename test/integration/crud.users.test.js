'use strict';

// common modules
import axios from 'axios';
import jwt from 'jsonwebtoken';

// custom modules
import db from '#database/index.js';

// =============================================================================
// General Setup & Teardown
// =============================================================================
const client = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${await jwt.sign(
      {
        oid: '00000000-0000-0000-0000-000000000000',
        scp: [
          'Applications.Manage',
          'Todos.Read',
          'Todos.Write',
          'Todos.Manage',
        ].join(' '),
        roles: ['Administrator'],
        preferred_username: 'administrator@claconnect.com',
        name: 'CLA Administrator',
        azp: 'edea3e73-4bc9-47a9-8b6d-f8ff398fe06a',
      },
      '00000000-0000-0000-0000-000000000000'
    )}`,
  },
});

const testData = {
  users: [
    {
      email: 'laquan@yahoo.com',
      userName: 'quan1',
      firstName: 'Quan',
      lastName: 'New',
    },
    {
      email: 'laquan@gmail.com',
      userName: 'quan2',
      firstName: 'Quan',
      lastName: 'Newe',
    },
    {
      email: 'laquan@aol.com',
      userName: 'quan3',
      firstName: 'Quan',
      lastName: 'Newel',
    },
  ],
};

beforeAll(async () => {
  // clear users and reset auto increment
  await db('users').del();
  await db.raw(`DBCC CHECKIDENT ('users', RESEED, 0)`);
});

afterAll(async () => {
  // clear users and reset auto increment
  await db('users').del();
  await db.raw(`DBCC CHECKIDENT ('users', RESEED, 0)`);
});

// =============================================================================
// CRUD
// =============================================================================
describe('CRUD for Users', () => {
  it('has 0 users', async () => {
    expect.assertions(2);

    // setup
    const outputs = {
      status: 200,
      data: {
        results: [],
        total: 0,
      },
    };

    // trigger
    const response = await client.get('/users');

    // evaluate
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });

  it('creates 3 users', async () => {
    expect.assertions(2);

    // setup
    const inputs = [
      {
        params: null,
        data: {
          email: testData.users[0].email,
          userName: testData.users[0].userName,
          firstName: testData.users[0].firstName,
          lastName: testData.users[0].lastName,
        },
      },
      {
        params: null,
        data: {
          email: testData.users[1].email,
          userName: testData.users[1].userName,
          firstName: testData.users[1].firstName,
          lastName: testData.users[1].lastName,
        },
      },
      {
        params: null,
        data: {
          email: testData.users[2].email,
          userName: testData.users[2].userName,
          firstName: testData.users[2].firstName,
          lastName: testData.users[2].lastName,
        },
      },
    ];

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            //id: 1,
            email: testData.users[0].email,
            userName: testData.users[0].userName,
            firstName: testData.users[0].firstName,
            lastName: testData.users[0].lastName,
          },
          {
            //id: 2,
            email: testData.users[1].email,
            userName: testData.users[1].userName,
            firstName: testData.users[1].firstName,
            lastName: testData.users[1].lastName,
          },
          {
            //id: 3,
            email: testData.users[2].email,
            userName: testData.users[2].userName,
            firstName: testData.users[2].firstName,
            lastName: testData.users[2].lastName,
          },
        ],
        total: 3,
      },
    };

    // trigger
    await client.post('/users', inputs[0].data).then((res) => {
      testData.users[0].id = res.data.id;
      outputs.data.results[0].id = res.data.id;
    });

    await client.post('/users', inputs[1].data).then((res) => {
      testData.users[1].id = res.data.id;
      outputs.data.results[1].id = res.data.id;
    });

    await client.post('/users', inputs[2].data).then((res) => {
      testData.users[2].id = res.data.id;
      outputs.data.results[2].id = res.data.id;
    });

    // evaluate
    const response = await client.get('/users');
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });

  it('reads user 1', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: {
        id: testData.users[0].id,
      },
      data: null,
    };
    const outputs = {
      status: 200,
      data: {
        id: testData.users[0].id,
        email: testData.users[0].email,
        userName: testData.users[0].userName,
        firstName: testData.users[0].firstName,
        lastName: testData.users[0].lastName,
      },
    };

    // trigger
    const response = await client.get(`/users/${inputs.params.id}`);

    // evaluate
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });

  it('updates user 2', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: {
        id: testData.users[1].id,
      },
      data: testData.users[0],
    };

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            id: testData.users[0].id,
            email: testData.users[0].email,
            userName: testData.users[0].userName,
            firstName: testData.users[0].firstName,
            lastName: testData.users[0].lastName,
          },
          {
            id: testData.users[1].id,
            email: testData.users[0].email,
            userName: testData.users[0].userName,
            firstName: testData.users[0].firstName,
            lastName: testData.users[0].lastName,
          },
          {
            id: testData.users[2].id,
            email: testData.users[2].email,
            userName: testData.users[2].userName,
            firstName: testData.users[2].firstName,
            lastName: testData.users[2].lastName,
          },
        ],
        total: 3,
      },
    };

    // trigger
    await client.put(`/users/${inputs.params.id}`, inputs.data);

    // evaluate
    const response = await client.get('/users');
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });

  it('deletes user 3', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: {
        id: testData.users[2].id,
      },
      data: null,
    };

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            id: testData.users[0].id,
            email: testData.users[0].email,
            userName: testData.users[0].userName,
            firstName: testData.users[0].firstName,
            lastName: testData.users[0].lastName,
          },
          {
            id: testData.users[1].id,
            email: testData.users[0].email,
            userName: testData.users[0].userName,
            firstName: testData.users[0].firstName,
            lastName: testData.users[0].lastName,
          },
        ],
        total: 2,
      },
    };

    // trigger
    await client.delete(`/users/${inputs.params.id}`);

    // evaluate
    const response = await client.get('/users');
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });
});
