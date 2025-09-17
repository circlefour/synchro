// import the express library
const express = require('express');
const path = require('path');

const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);

const io = new Server(server);

const livereloadServer = livereload.createServer();
livereloadServer.watch(path.join(__dirname, "../controller"));

app.use(express.static(path.join(__dirname, "../controller")));

app.use(connectLivereload());

app.get('/', (req, res) => {
  res.send('<p>it is working</p>');
});

const clients = new Map();

// to calculate running avg
let cSum = 0;
let cCount = 0;

let newData = false;
const OUTPUT_INTERVAL_MS = 50;

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  clients.set(socket.id, {
    x: 0,
    y:0,
    z:0,
    avg:0,
    lastUpdate: Date.now(),
  });
  cCount++;

  socket.on('shake', (chaos) => {
    if (clients.has(socket.id)) {
      const client = clients.get(socket.id);
      const oldAvg = client.avg;
      client.x = chaos.x;
      client.y = chaos.y;
      client.z = chaos.z;
      client.avg = chaos.avg;
      client.lastUpdate = Date.now();

      cSum = cSum - oldAvg + client.avg;

      newData = true;
    }
  });

  socket.on("disconnect", () => {
    console.log("device disconnected:", socket.id);
    if (clients.has(socket.id)) {
      const client = clients.get(socket.id);
      cSum -= client.avg;
      cCount--;
      clients.delete(socket.id);
    }
  });
});

function processNewData(){
  if (cCount == 0){
    console.log("no connected clients, no decision");
    return 0;
  }
  const avg = cSum / cCount;
  console.log("collective decision: ", avg);
  return avg;
}

// global output loop
let outputInterval = setInterval(() => {
  if (newData) {
    processNewData();
    newData = false;
  }
}, OUTPUT_INTERVAL_MS);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});
