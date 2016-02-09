var http = require('http');
var amqp = require('amqplib/callback_api');
//Lets define a port we want to listen to

var server = http.createServer(handleRequest);
var io = require('socket.io')(server);

var x;
const PORT=8081;

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.end('It Works!! Path Hit: ' + request.url);
}


//Create a server

//Lets start our server
server.listen(PORT, function(){
  //Callback triggered when server is successfully listening. Hurray!
  console.log("Server listening on: http://localhost:%s", PORT);
});

function emitOrder(socket){
  return function(msg){
    socket.emit('order.new', msg.content.toString());
  }
}


function consumeHutch(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'hutch';
    ch.assertExchange(ex, 'topic', {durable: true});
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(' [*] Waiting for logs. To exit press CTRL+C');
      ch.bindQueue(q.queue, ex, 'sockets.orders');
      ch.consume(q.queue, function(msg) {
        var object = JSON.parse(msg.content.toString());
        io.to(object.user_id).emit('order.new', object);
      }, {noAck: false});
    });
  });
}


function onSocketConnection(socket){
  socket.on('establish_connection', function (data){
    socket.join(data.user_id);
  })
}

amqp.connect('amqp://localhost', consumeHutch);
io.on('connection', onSocketConnection);
