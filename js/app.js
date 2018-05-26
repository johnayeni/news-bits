// create new controller class object
const app = new Controller();

// content to web socket client
const socket = io();

// when notified that new content is needed, request for it
socket.on('new content', function() {
  app._makeRequest();
});
