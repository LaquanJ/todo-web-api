'use strict';

// common modules
import fs from 'fs';

// custom modules
import app from '#src/app.js';

// =============================================================================
// Endpoint: /
// =============================================================================
describe('Endpoint: /', () => {
  describe('GET', () => {
    it('returns 200', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        params: null,
        body: null
      };
      const outputs = {
        status: 200,
        body: {
          version: process.env.npm_package_version
        }
      }

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: '/'
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.json()).toStrictEqual(outputs.body);
    });
  });
});

describe('Endpoint: /openapi.yaml', () => {
  describe('GET', () => {
    it('returns 200', async () => {
      expect.assertions(2);

      // setup
      const inputs = {
        params: null,
        body: null
      };
      const outputs = {
        status: 200,
        body: fs.readFileSync('doc/openapi.yaml', 'utf-8')
      }

      // trigger
      const response = await app.inject({
        method: 'GET',
        url: '/openapi.yaml'
      });

      // evaluate
      expect(response.statusCode).toStrictEqual(outputs.status);
      expect(response.body).toBe(outputs.body);
    });
  });
});