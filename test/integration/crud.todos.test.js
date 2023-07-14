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
          'Todos.Manage'
        ].join(' '),
        roles: [
          'Administrator'
        ],
        preferred_username: 'administrator@claconnect.com',
        name: 'CLA Administrator',
        azp: 'edea3e73-4bc9-47a9-8b6d-f8ff398fe06a'
      },
      '00000000-0000-0000-0000-000000000000'
    )}`
  }
})

const testData = {
  applications: [
    {
      name: 'AIS',
      app_id: 'edea3e73-4bc9-47a9-8b6d-f8ff398fe06a',
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      internal_group_id: 'cc0e1ab9-10a4-4736-bee9-ef2a3e9eb226',
      internal_group_name: 'AAD-AIS',
      external_group_id: 'a5761a73-31cd-4069-b407-d1423d30aa31',
      external_group_name: 'Guest_App [AIS]',
    }
  ],
  todos: [
    {
      clientGroupId: '98c7391d-b536-4ee8-963b-e438e432eda2',
      clientNumber: 'A100000',
      projectName: 'AIS Engagement 1',
      projectNumber: '00000001',
      category: 'My Audit Engagements',
      itemName: 'AIS Todo 1',
      itemUrl: 'https://fake.url/1',
      dueDate: '04/06/2023',
      status: 'Complete'
    },
    {
      clientGroupId: '98c7391d-b536-4ee8-963b-e438e432eda2',
      clientNumber: 'A100000',
      projectName: 'AIS Engagement 1',
      projectNumber: '00000001',
      category: 'My Audit Engagements',
      itemName: 'AIS Todo 2',
      itemUrl: 'https://fake.url/2',
      dueDate: '05/06/2023',
      status: 'In Progress'
    },
    {
      clientGroupId: '98c7391d-b536-4ee8-963b-e438e432eda2',
      clientNumber: 'A100000',
      projectName: 'AIS Engagement 1',
      projectNumber: '00000001',
      category: 'My Audit Engagements',
      itemName: 'AIS Todo 3',
      itemUrl: 'https://fake.url/3',
      dueDate: '06/06/2023',
      status: 'New'
    }
  ]
};

beforeAll(async () => {
  // clear todos
  await db('todos').truncate();
})

afterAll(async () => {
  // clear todos
  await db('todos').truncate();
})


// =============================================================================
// CRUD
// =============================================================================
describe('CRUD for Todos', () => {
  it('has 0 todos', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: null,
      data: null
    };

    const outputs = {
      status: 200,
      data: {
        results: [],
        total: 0
      }
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
    await db('applications').insert(testData.applications);

    const inputs = [
      {
        params: null,
        data: testData.todos[0]
      },
      {
        params: null,
        data: testData.todos[1]
      },
      {
        params: null,
        data: testData.todos[2]
      }
    ];

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            clientNumber: testData.todos[0].clientNumber,
            projectName: testData.todos[0].projectName,
            projectNumber: testData.todos[0].projectNumber,
            category: testData.todos[0].category,
            itemName: testData.todos[0].itemName,
            itemUrl: testData.todos[0].itemUrl,
            dueDate: testData.todos[0].dueDate,
            status: testData.todos[0].status
          },
          {
            clientNumber: testData.todos[1].clientNumber,
            projectName: testData.todos[1].projectName,
            projectNumber: testData.todos[1].projectNumber,
            category: testData.todos[1].category,
            itemName: testData.todos[1].itemName,
            itemUrl: testData.todos[1].itemUrl,
            dueDate: testData.todos[1].dueDate,
            status: testData.todos[1].status
          },
          {
            clientNumber: testData.todos[2].clientNumber,
            projectName: testData.todos[2].projectName,
            projectNumber: testData.todos[2].projectNumber,
            category: testData.todos[2].category,
            itemName: testData.todos[2].itemName,
            itemUrl: testData.todos[2].itemUrl,
            dueDate: testData.todos[2].dueDate,
            status: testData.todos[2].status
          }
        ],
        total: 3
      }
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
        id: testData.todos[0].id
      },
      data: null
    };
    const outputs = {
      status: 200,
      data: {
        id: 1,
        createdAt: expect.anything(),
        createdBy: 'administrator@claconnect.com',
        updatedAt: expect.anything(),
        updatedBy: 'administrator@claconnect.com',
        clientGroupId: testData.todos[0].clientGroupId,
        clientNumber: testData.todos[0].clientNumber,
        projectName: testData.todos[0].projectName,
        projectNumber: testData.todos[0].projectNumber,
        category: testData.todos[0].category,
        itemName: testData.todos[0].itemName,
        itemUrl: testData.todos[0].itemUrl,
        dueDate: testData.todos[0].dueDate,
        status: testData.todos[0].status
      }
    };

    // trigger
    const response = await client.get(`/todos/${inputs.params.id}`);

    // evaluate
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  })

  it('updates todo 2', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: {
        id: testData.todos[1].id
      },
      data: testData.todos[0]
    };

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            id: testData.todos[0].id,
            clientNumber: testData.todos[0].clientNumber,
            projectName: testData.todos[0].projectName,
            projectNumber: testData.todos[0].projectNumber,
            category: testData.todos[0].category,
            itemName: testData.todos[0].itemName,
            itemUrl: testData.todos[0].itemUrl,
            dueDate: testData.todos[0].dueDate,
            status: testData.todos[0].status
          },
          {
            id: testData.todos[1].id,
            clientNumber: testData.todos[0].clientNumber,
            projectName: testData.todos[0].projectName,
            projectNumber: testData.todos[0].projectNumber,
            category: testData.todos[0].category,
            itemName: testData.todos[0].itemName,
            itemUrl: testData.todos[0].itemUrl,
            dueDate: testData.todos[0].dueDate,
            status: testData.todos[0].status
          },
          {
            id: testData.todos[2].id,
            clientNumber: testData.todos[2].clientNumber,
            projectName: testData.todos[2].projectName,
            projectNumber: testData.todos[2].projectNumber,
            category: testData.todos[2].category,
            itemName: testData.todos[2].itemName,
            itemUrl: testData.todos[2].itemUrl,
            dueDate: testData.todos[2].dueDate,
            status: testData.todos[2].status
          }
        ],
        total: 3
      }
    };

    // trigger
    await client.put(`/todos/${inputs.params.id}`, inputs.data);

    // evaluate
    const response = await client.get('/todos');
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  })

  it('deletes todo 3', async () => {
    expect.assertions(2);

    // setup
    const inputs = {
      params: {
        id: testData.todos[2].id
      },
      data: null
    };

    const outputs = {
      status: 200,
      data: {
        results: [
          {
            id: testData.todos[0].id,
            clientNumber: testData.todos[0].clientNumber,
            projectName: testData.todos[0].projectName,
            projectNumber: testData.todos[0].projectNumber,
            category: testData.todos[0].category,
            itemName: testData.todos[0].itemName,
            itemUrl: testData.todos[0].itemUrl,
            dueDate: testData.todos[0].dueDate,
            status: testData.todos[0].status
          },
          {
            id: testData.todos[1].id,
            clientNumber: testData.todos[0].clientNumber,
            projectName: testData.todos[0].projectName,
            projectNumber: testData.todos[0].projectNumber,
            category: testData.todos[0].category,
            itemName: testData.todos[0].itemName,
            itemUrl: testData.todos[0].itemUrl,
            dueDate: testData.todos[0].dueDate,
            status: testData.todos[0].status
          },
        ],
        total: 2
      }
    };

    // trigger
    await client.delete(`/todos/${inputs.params.id}`);

    // evaluate
    const response = await client.get('/todos');
    expect(response.status).toStrictEqual(outputs.status);
    expect(response.data).toStrictEqual(outputs.data);
  })
});