var http = require('http'),
express = require('express'),
amqp = require('amqplib/callback_api'),
cors = require('cors'),
CONFIG = require('./server_commons/config.js');
const PORT = CONFIG.NodeServerPort;
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://restaurants.tinyowl.com');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});


//We need a function which handles requests and send response
app.get('/', function (req, res) {
  res.send('Websockets Node Server started!!!');
});

 server.listen(PORT, function() {
  //Callback triggered when server is successfully listening.
  console.log("Server listening on ", PORT);
});

function consumeHutch(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'hutch';
    ch.assertExchange(ex, 'topic', {durable: true});
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      console.log(' [*] Waiting for logs. To exit press CTRL+C');
      ch.bindQueue(q.queue, ex, 'sockets.orders');
      ch.consume(q.queue, function(msg) {
        var object = JSON.parse(msg.content.toString());
        console.log("New Order " + object.order_id + " is arrived for user_id: " + object.user_id);
        io.sockets.emit('order.new', object);
        ch.ack(msg);
      }, {noAck: false});
    });
  });
}

function onSocketConnection(socket) {
  socket.on('establish_connection', function (data){
    console.log("Connected restaurant's  user id: " + data.user_id)
    socket.join(data.user_id);
  });

  socket.on('disconnect', function () {
    console.log('Socket disconnected');
  });

  return(true);
}

console.log(CONFIG);
//FORMAT: "//amqp://user:pass@host:10000/vhost"
// amqp.connect("amqp://localhost:5672", consumeHutch); uncommnet while testing on localhost
amqp.connect(CONFIG.RabbitMqProtocol + '://' + CONFIG.RabbitMqUsername + ':' + CONFIG.RabbitMqPassword + '@' + CONFIG.RabbitMqServerHost + ':' + CONFIG.RabbitMqServerPort, consumeHutch);
io.sockets.on('connection', onSocketConnection);
