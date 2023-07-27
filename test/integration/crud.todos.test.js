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
  ],
};

beforeAll(async () => {
  // clear todos
  await db('todos').truncate();
});

afterAll(async () => {
  // clear todos
  await db('todos').truncate();
});

// =============================================================================
// CRUD
// =============================================================================
describe('CRUD for Todos', () => {
  it('has 0 todos', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: null,
      data: null,
    };

    const outputs = {
      status: 200,
      data: {
        results: [],
        total: 0,
      },
    };

    // trigger
    const response = await client.get('/todos');

    // evaluate
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });

  it('creates 3 todos', async () => {
    expect.assertions(2);

    // setup
    await db('users').insert(testData.users);
    //await db('todos').insert(testData.todos);

    const inputs = [
      {
        params: null,
        data: {
          title: 'House Chores',
          description: 'Wash Dishes',
          done: false,
          userId: testData.todos[0].user_id,
        },
      },
      {
        params: null,
        data: {
          title: 'House Chores',
          description: 'Clean Room',
          done: false,
          userId: testData.todos[1].user_id,
        },
      },
      {
        params: null,
        data: {
          title: 'School Work',
          description: 'Finish Homework in English',
          done: false,
          userId: testData.todos[2].user_id,
        },
      },
    ];

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            //id: 1,
            title: testData.todos[0].title,
            description: testData.todos[0].description,
            done: testData.todos[0].done,
            userId: testData.todos[0].user_id,
          },
          {
            //id: 2,
            title: testData.todos[1].title,
            description: testData.todos[1].description,
            done: testData.todos[1].done,
            userId: testData.todos[1].user_id,
          },
          {
            //id: 3,
            title: testData.todos[2].title,
            description: testData.todos[2].description,
            done: testData.todos[2].done,
            userId: testData.todos[2].user_id,
          },
        ],
        total: 3,
      },
    };

    // trigger
    await client.post('/todos', inputs[0].data).then((res) => {
      testData.todos[0].id = res.data.id;
      outputs.data.results[0].id = res.data.id;
    });

    await client.post('/todos', inputs[1].data).then((res) => {
      testData.todos[1].id = res.data.id;
      outputs.data.results[1].id = res.data.id;
    });
    await client.post('/todos', inputs[2].data).then((res) => {
      testData.todos[2].id = res.data.id;
      outputs.data.results[2].id = res.data.id;
    });

    // evaluate
    const response = await client.get('/todos');
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });

  it('reads todo 1', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: {
        id: testData.todos[0].id,
      },
      data: null,
    };
    const outputs = {
      status: 200,
      data: {
        id: 1,
        title: testData.todos[0].title,
        description: testData.todos[0].description,
        done: testData.todos[0].done,
        userId: testData.todos[0].user_id,
      },
    };

    // trigger
    const response = await client.get(`/todos/${inputs.params.id}`);

    // evaluate
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });

  it('updates todo 2', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: {
        id: testData.todos[1].id,
      },
      data: testData.todos[1],
    };

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            id: testData.todos[0].id,
            title: testData.todos[0].title,
            description: testData.todos[0].description,
            done: testData.todos[0].done,
            userId: testData.todos[0].user_id,
          },
          {
            id: testData.todos[1].id,
            title: testData.todos[1].title,
            description: testData.todos[1].description,
            done: testData.todos[1].done,
            userId: testData.todos[1].user_id,
          },
          {
            id: testData.todos[2].id,
            title: testData.todos[2].title,
            description: testData.todos[2].description,
            done: testData.todos[2].done,
            userId: testData.todos[2].user_id,
          },
        ],
        total: 3,
      },
    };

    // trigger
    await client.put(`/todos/${inputs.params.id}`, inputs.data);

    // evaluate
    const response = await client.get('/todos');
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });

  it('deletes todo 3', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: {
        id: testData.todos[2].id,
      },
      data: null,
    };

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            id: testData.todos[0].id,
            title: testData.todos[0].title,
            description: testData.todos[0].description,
            done: testData.todos[0].done,
            userId: testData.todos[0].user_id,
          },
          {
            id: testData.todos[1].id,
            title: testData.todos[1].title,
            description: testData.todos[1].description,
            done: testData.todos[1].done,
            userId: testData.todos[1].user_id,
          },
        ],
        total: 2,
      },
    };

    // trigger
    await client.delete(`/todos/${inputs.params.id}`);

    // evaluate
    const response = await client.get('/todos');
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  });
});
