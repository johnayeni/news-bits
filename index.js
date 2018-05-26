const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const serveStatic = require('serve-static');
const port = 3000;

// function to generate random content
function getContent() {
  let content = {};
  content.id = Math.floor(Math.random() * 100000);
  content.title = `News ${content.id}`;
  content.text =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sagittis pellentesque lacus eleifend lacinia';
  content.date = new Date().toDateString();
  return content;
}

app.use(serveStatic(__dirname + '/'));

// return content based on the number needed
app.get('/content/:num', (req, res) => {
  let content = [];

  for (let i = 0; i < Number(req.params.num); i++) {
    content.push(getContent());
  }

  res.json({ data: content });
});

// set up websocket client
io.on('connection', function(socket) {
  // simulate new available content after every 30 seconds
  setInterval(function() {
    io.emit('new content');
  }, 30000);
});

http.listen(port, function() {
  console.log('listening on *:' + port);
});
