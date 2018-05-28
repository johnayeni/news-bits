// create new controller class object
var app = new Controller();

// content to web socket client
var socket = io();

// when notified that new content is needed, request for it
socket.on('new content', function() {
  app._makeRequest();
});
