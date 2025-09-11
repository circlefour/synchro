// import the express library
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { avgChaos } = require('./utils/chaos');

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // actually put in vercel url here when deployed
    methods: ["GET", "POST"],
  }
});

app.get('/', (req, res) => {
  res.send('<p>it is working</p>');
});

let watcher = null;

const axisChaos = {
  x: new Map(),
  y: new Map(),
  z: new Map(),
};

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('watcher', () => {
    console.log('watcher connected:', socket.id);
    watcher = socket;
  });
  socket.on('shake', (chaos) => {
    if (socket !== watcher) {
      axisChaos.x.set(socket.id, chaos.x);
      axisChaos.y.set(socket.id, chaos.y);
      axisChaos.z.set(socket.id, chaos.z);
      //console.log('chaos total', axisChaos);
    }
    if (watcher) {
      // actually averaging on this side, not sure if that's better or worse for ahh whateva
      const axisAvg = {
        x: avg(Array.from(axisChaos.x.values())),
        y: avg(Array.from(axisChaos.y.values())),
        z: avg(Array.from(axisChaos.z.values())),
      }
      console.log(axisAvg);
      watcher.emit('chaos', axisAvg);
    }
  });
  socket.on("disconnect", () => {
    console.log("device disconnected:", socket.id);
    ['x','y','z'].forEach(axis => axisChaos[axis].delete(socket.id));
  });
});

function avg(arr){
  return arr.length ? arr.reduce((a,b) => a + b, 0) / arr.length : 0;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});
