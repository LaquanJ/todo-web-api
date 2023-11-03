'use strict';

// common modules
import knex from 'knex';
import path from 'path';

// custom modules
import { seed } from '#database/seeds/index.js';

// =============================================================================
// connection and configuration
// =============================================================================
const dirModule = path.dirname(new URL(import.meta.url).pathname);
const db = knex({
  client: 'mssql',
  connection: {
    server: process.env.DB_SQL_HOST,
    port: parseInt(process.env.DB_SQL_PORT),
    user: process.env.DB_SQL_USERNAME,
    password: process.env.DB_SQL_PASSWORD,
    database: process.env.DB_SQL_DATABASE,
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  },
  useNullAsDefault: true,
  migrations: {
    directory: `${dirModule}/migrations`,
    loadExtensions: ['.js']
  }
});

export default db;

// =============================================================================
// initialization
// =============================================================================
export async function initialize() {
  // check if database is empty
  const result = await db('information_schema.tables').distinct('table_name');
  const dbIsEmpty = result.length === 0;

  // check for migrations
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'test') {
    console.info(`Current SQL Migration: ${await db.migrate.currentVersion()}`)
  }
  const migrations = await db.migrate.list();

  /* istanbul ignore next */
  if (migrations[1].length > 0) {
    // perform migrations
    console.info('New migrations detected...performing migration');
    await db.migrate.latest();
    console.info(`New SQL Migration: ${await db.migrate.currentVersion()}`);
  }

  // seed database if empty
  /* istanbul ignore next */
  if (dbIsEmpty) {
    console.log('SQL database is empty...seeding.');
    await seed();
  }

  
}