const ws = require('ws');
const net = require('net');
const fs = require('fs');

const SOCKETFILE = '/var/run/user/1000/spicetify.sock';
let connections = [];
let SHUTDOWN = false;

/** @type {net.Server} */
let socketServer;
let wsServer = new ws.WebSocketServer({ port: 42069 });

fs.existsSync(SOCKETFILE) && fs.unlinkSync(SOCKETFILE);

wsServer
  .on('connection', (ws) => {
    fs.existsSync(SOCKETFILE) && fs.unlinkSync(SOCKETFILE);
    socketServer = net
      .createServer((stream) => {
        let self = Date.now();
        connections[self] = stream;
        stream.on('end', () => {
          delete connections[self];
        });

        stream.on('data', (msg) => {
          msg = msg.toString();

          ws.send(msg);
          console.log(msg);
        });
      })
      .listen(SOCKETFILE);
  })
  .on('close', () => {
    socketServer.close();
    fs.existsSync(SOCKETFILE) && fs.unlinkSync(SOCKETFILE);
  });

process.on('SIGINT', () => {
  if (!SHUTDOWN) {
    SHUTDOWN = true;
    console.log('Terminating.');
    if (Object.keys(connections).length) {
      let clients = Object.keys(connections);
      while (clients.length) {
        let client = clients.pop();
        connections[client].write('__disconnect');
        connections[client].end();
      }
    }
    wsServer.clients.forEach((ws) => ws.close());

    socketServer && socketServer.close();
    fs.existsSync(SOCKETFILE) && fs.unlinkSync(SOCKETFILE);
    wsServer.close();
    process.exit(0);
  }
});
