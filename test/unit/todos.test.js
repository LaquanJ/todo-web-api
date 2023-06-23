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
  todos: [
    {
      app_id: 1,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100000',
      client_group_id: '98c7391d-b536-4ee8-963b-e438e432eda2',
      project_name: 'AIS Engagement 1',
      project_number: '00000001',
      category: 'My Audit Engagements',
      item_name: 'AIS Todo 1',
      item_url: 'https://fake.url/1',
      due_date: '04/06/2023',
      status: 'In Progress',
    }, // AIS 1
    {
      app_id: 1,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100000',
      client_group_id: '98c7391d-b536-4ee8-963b-e438e432eda2',
      project_name: 'AIS Engagement 1',
      project_number: '00000001',
      category: 'My Audit Engagements',
      item_name: 'AIS Todo 2',
      item_url: 'https://fake.url/2',
      due_date: '04/06/2023',
      status: 'In Progress',
    }, // AIS 2
    {
      app_id: 1,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100000',
      client_group_id: '98c7391d-b536-4ee8-963b-e438e432eda2',
      project_name: 'AIS Engagement 1',
      project_number: '00000001',
      category: 'My Audit Engagements',
      item_name: 'AIS Todo 3',
      item_url: 'https://fake.url/3',
      due_date: '04/06/2023',
      status: 'In Progress',
    }, // AIS 3
    {
      app_id: 1,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100000',
      client_group_id: '98c7391d-b536-4ee8-963b-e438e432eda2',
      project_name: 'AIS Engagement 1',
      project_number: '00000001',
      category: 'My Audit Engagements',
      item_name: 'AIS Todo 4',
      item_url: 'https://fake.url/4',
      due_date: '04/26/2023',
      status: 'Not Started',
    }, // AIS 4
    {
      app_id: 1,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100001',
      client_group_id: 'a4490ef6-20e7-4493-9ebf-3583490404b6',
      project_name: 'AIS Engagement 2',
      project_number: '00000002',
      category: 'My Audit Engagements',
      item_name: 'AIS Todo 5',
      item_url: 'https://fake.url/5',
      due_date: '04/26/2023',
      status: 'Not Started',
    }, // AIS 5
    {
      app_id: 3,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100000',
      client_group_id: '98c7391d-b536-4ee8-963b-e438e432eda2',
      project_name: '990 Engagement 1',
      project_number: '00000003',
      category: '990 Exchange',
      item_name: '990 Exchange Todo 1',
      item_url: 'https://fake.url/6',
      due_date: '04/06/2023',
      status: 'In Progress',
    }, // 990 Exchange 1
    {
      app_id: 3,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100000',
      client_group_id: '98c7391d-b536-4ee8-963b-e438e432eda2',
      project_name: '990 Engagement 1',
      project_number: '00000003',
      category: '990 Exchange',
      item_name: '990 Exchange Todo 2',
      item_url: 'https://fake.url/7',
      due_date: '04/06/2023',
      status: 'In Progress',
    }, // 990 Exchange 2
    {
      app_id: 3,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100001',
      client_group_id: 'a4490ef6-20e7-4493-9ebf-3583490404b6',
      project_name: '990 Engagement 2',
      project_number: '00000004',
      category: '990 Exchange',
      item_name: '990 Exchange Todo 3',
      item_url: 'https://fake.url/8',
      due_date: '04/06/2023',
      status: 'In Progress',
    }, // 990 Exchange 3
    {
      app_id: 3,
      created_at: '2023-01-07T18:30:50.321Z',
      created_by: 'administrator@claconnect.com',
      updated_at: '2023-01-07T18:30:50.321Z',
      updated_by: 'administrator@claconnect.com',
      client_number: 'A100000',
      client_group_id: '98c7391d-b536-4ee8-963b-e438e432eda2',
      project_name: '990 Engagement 1',
      project_number: '00000003',
      category: '990 Exchange',
      item_name: '990 Exchange Todo 4',
      item_url: 'https://fake.url/9',
      due_date: '04/06/2023',
      status: 'In Progress',
    }, // 990 Exchange 4
  ]
};

beforeEach(async () => {
  // clear todos
  await db('todos').truncate();
})

afterEach(async () => {
  // clear todos
  await db('todos').truncate();
})

// =============================================================================
// Endpoint: /todos
// =============================================================================
describe('Endpoint: /todos', () => {
  describe('GET', () => {
    it('returns 200', async () => {
      expect.assertions(2);

      // setup
      await db('todos').insert(testData.todos);

      const inputs = {
        authorization: `Bearer ${await jwt.sign(
          {
            oid: '00000000-0000-0000-0000-000000000000',
            scp: 'Todos.Read',
            roles: ['Administrator'],
            preferred_username: 'administrator@claconnect.com',
            name: 'CLA Administrator',
            azp: '11bfa11a-7a1b-4c00-a6b1-eafdcf1d389d'
          },
          '00000000-0000-0000-0000-000000000000'
        )}`
      };

      const outputs = {
        status: 200,
        body: {
          results: [
            {
              id: 1,
              clientNumber: testData.todos[0].client_number,
              projectName: testData.todos[0].project_name,
              projectNumber: testData.todos[0].project_number,
              category: testData.todos[0].category,
              itemName: testData.todos[0].item_name,
              dueDate: testData.todos[0].due_date,
              status: testData.todos[0].status,
              itemUrl: testData.todos[0].item_url,
            },
            {
              id: 2,
              clientNumber: testData.todos[1].client_number,
              projectName: testData.todos[1].project_name,
              projectNumber: testData.todos[1].project_number,
              category: testData.todos[1].category,
              itemName: testData.todos[1].item_name,
              dueDate: testData.todos[1].due_date,
              status: testData.todos[1].status,
              itemUrl: testData.todos[1].item_url
            },
            {
              id: 3,
              clientNumber: testData.todos[2].client_number,
              projectName: testData.todos[2].project_name,
              projectNumber: testData.todos[2].project_number,
              category: testData.todos[2].category,
              itemName: testData.todos[2].item_name,
              dueDate: testData.todos[2].due_date,
              status: testData.todos[2].status,
              itemUrl: testData.todos[2].item_url
            },
            {
              id: 4,
              clientNumber: testData.todos[3].client_number,
              projectName: testData.todos[3].project_name,
              projectNumber: testData.todos[3].project_number,
              category: testData.todos[3].category,
              itemName: testData.todos[3].item_name,
              dueDate: testData.todos[3].due_date,
              status: testData.todos[3].status,
              itemUrl: testData.todos[3].item_url
            },
            {
              id: 5,
              clientNumber: testData.todos[4].client_number,
              projectName: testData.todos[4].project_name,
              projectNumber: testData.todos[4].project_number,
              category: testData.todos[4].category,
              itemName: testData.todos[4].item_name,
              dueDate: testData.todos[4].due_date,
              status: testData.todos[4].status,
              itemUrl: testData.todos[4].item_url
            },
            {
              id: 6,
              clientNumber: testData.todos[5].client_number,
              projectName: testData.todos[5].project_name,
              projectNumber: testData.todos[5].project_number,
              category: testData.todos[5].category,
              itemName: testData.todos[5].item_name,
              dueDate: testData.todos[5].due_date,
              status: testData.todos[5].status,
              itemUrl: testData.todos[5].item_url
            },
            {
              id: 7,
              clientNumber: testData.todos[6].client_number,
              projectName: testData.todos[6].project_name,
              projectNumber: testData.todos[6].project_number,
              category: testData.todos[6].category,
              itemName: testData.todos[6].item_name,
              dueDate: testData.todos[6].due_date,
              status: testData.todos[6].status,
              itemUrl: testData.todos[6].item_url
            },
            {
              id: 8,
              clientNumber: testData.todos[7].client_number,
              projectName: testData.todos[7].project_name,
              projectNumber: testData.todos[7].project_number,
              category: testData.todos[7].category,
              itemName: testData.todos[7].item_name,
              dueDate: testData.todos[7].due_date,
              status: testData.todos[7].status,
              itemUrl: testData.todos[7].item_url
            },
            {
              id: 9,
              clientNumber: testData.todos[8].client_number,
              projectName: testData.todos[8].project_name,
              projectNumber: testData.todos[8].project_number,
              category: testData.todos[8].category,
              itemName: testData.todos[8].item_name,
              dueDate: testData.todos[8].due_date,
              status: testData.todos[8].status,
              itemUrl: testData.todos[8].item_url
            },
          ],
          total: 9
        }
      };

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: '/todos',
        headers: { 'Authorization': inputs.authorization },
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    })
  });

  describe('POST', () => { });
});

// =============================================================================
// Endpoint: /todos/:id:
// =============================================================================
describe('Endpoint: /todos/:id:', () => {
  describe('GET', () => { });

  describe('PUT', () => { });

  describe('DELETE', () => { });
});