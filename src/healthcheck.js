'use strict';

import http from 'http';

const PORT = process.env.PORT || 8080;

// make request to server root endpoint
const request = http.request(
  {
    host: 'localhost',
    port: PORT,
    timeout: 2000
  },
  (res) => {
    // exit with failure code if anything other than 200 code was received
    console.log(`STATUS: ${res.statusCode}`);
    if (res.statusCode == 200) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  }
)

// exit with failure code if an error was received
request.on('error', (error) => {
  console.log(`ERROR: ${error}`);
  process.exit(1);
})

request.end();