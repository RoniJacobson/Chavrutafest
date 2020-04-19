var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');

var listOfUnconnectedSockets = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Chavrutafest.html');
  console.log("you just got served!")
});

app.get('/client-side.js', (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/javascript'});
  res.end(fs.readFileSync(__dirname + '/client-side.js'));
  console.log("you just got served javascript!")
});

console.log("loaded")

var connectUsers = function() {
  if(listOfUnconnectedSockets.length > 1) {
    console.log(listOfUnconnectedSockets);
    //there are two users. let's match them up. 1) grab their information
    var secondUserInfo = listOfUnconnectedSockets.pop().id;
    var firstUserInfo = listOfUnconnectedSockets.pop().id;
    //2) grab them
    var secondUser = io.sockets.sockets[secondUserInfo];
    var firstUser = io.sockets.sockets[firstUserInfo];
    var roomName =  firstUserInfo + "+" + secondUserInfo;
    console.log("room "+roomName+" was created, with"+firstUser+" and "+secondUser)
    //3) join them to a room
    firstUser.join(roomName);
    secondUser.join(roomName);
    //4) send room name to the firstUser
    firstUser.emit('roomCall', roomName);
  }
}

//what to do when a new user connects
io.on('connection', (socket) => {
  console.log('a user connected');
  //add the new user to the list of unconnected users.
  listOfUnconnectedSockets.push({'id': socket.id});
  //connect the socket to an unconnected user, if such user exists
  connectUsers();
});

http.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});