'use strict';

// custom modules
import app from '#src/app.js';

// =============================================================================
// start server
// =============================================================================
const PORT = process.env.PORT || 8080;

app.listen({ host: '0.0.0.0', port: PORT }, () => {
  console.log(`Server ready and listening on port ${PORT}.`);
});

// handle SIGINT/SIGTERM signals gracefully
process.on('SIGINT', () => {
  console.info('Received SIGINT, performing graceful shutdown.');
  shutdown();
});

process.on('SIGTERM', () => {
  console.info('Received SIGTERM, performing graceful shutdown.');
  shutdown();
})

let sockets = {}, nextSocketId = 0;
app.server.on('connection', (socket) => {
  const socketId = nextSocketId++;
  sockets[socketId] = socket;

  socket.once('close', () => {
    delete sockets[socketId];
  });
});

function shutdown() {
  waitForSocketsToClose(10);

  app.server.close((error) => {
    if (error) {
      console.error(error);
      process.exitCode = 1;
    }

    process.exit();
  });
}

function waitForSocketsToClose(counter) {
  if (counter > 0) {
    console.log(
      `Waiting ${counter} more ${counter !== 1 ? 'seconds' : 'second'}` +
      ' for all connections to close...'
    );

    return setTimeout(waitForSocketsToClose, 1000, counter - 1);
  }

  console.log('Forcing all connections to close');
  sockets.forEach((socket) => {
    sockets[socket].destroy();
  });
}