var _ = require('underscore');
var env = process.argv.slice(-1).pop()
var CONFIG = require('../configs/'+ env + '/CONFIG.json');
module.exports =  (function (){
   var obj = {
    NodeServerPort: '',
    RabbitMqServerPort: '',
    RabbitMqServerHost: '',
    RabbitMqProtocol: 'amqp',
    init: function(CONFIG) {
      _.extend(this, CONFIG);
      return this;
    }
  };
  obj.init(CONFIG);
  return obj;
})();
