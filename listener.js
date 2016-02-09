var http = require('http'),
amqp = require('amqplib/callback_api');
server = http.createServer(handleRequest);
io = require('socket.io')(server);
CONFIG = require('./server_commons/config.js');
const PORT = CONFIG.NodeServerPort;

//We need a function which handles requests and send response
function handleRequest(request, response){
  response.end('It Works!! Path Hit: ' + request.url);
}

//start server
server.listen(PORT, function(){
  //Callback triggered when server is successfully listening.
  console.log("Server listening on", PORT);
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
console.log(CONFIG);
amqp.connect(CONFIG.RabbitMqProtocol + ':' + CONFIG.RabbitMqServerHost + ':' + CONFIG.RabbitMqServerPort, consumeHutch);
io.on('connection', onSocketConnection);