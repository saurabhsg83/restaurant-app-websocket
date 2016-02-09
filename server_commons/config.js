var _ = require('underscore');
var CONFIG = require('../configs/'+ process.argv[2] + '/CONFIG.json');
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
