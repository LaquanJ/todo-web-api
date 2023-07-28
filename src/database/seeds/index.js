'use strict';

// common modules
/* intentionally empty */

// custom modules
import db from '#database/index.js';

export async function seed() {
  // seed users
  await db('users').insert({
    id: 1,
    email: 'laquan@yahoo.com',
    user_name: 'quan1',
    first_name: 'Quan',
    last_name: 'New',
  });
  await db('users').insert({
    id: 2,
    email: 'laquan@gmail.com',
    user_name: 'quan2',
    first_name: 'Quan',
    last_name: 'Newe',
  });
  await db('users').insert({
    id: 3,
    email: 'laquan@aol.com',
    user_name: 'quan3',
    first_name: 'Quan',
    last_name: 'Newel',
  });
  // TODO: create seeds
  // seed todos
  await db('todos').insert({
    id: 1,
    title: 'House Chores',
    description: 'Wash Dishes',
    done: false,
    user_id: 1,
  });

  await db('todos').insert({
    id: 2,
    title: 'House Chores',
    description: 'Clean Room',
    done: false,
    user_id: 2,
  });

  await db('todos').insert({
    id: 3,
    title: 'School Work',
    description: 'Finish Homework in English',
    done: false,
    user_id: 3,
  });
}
