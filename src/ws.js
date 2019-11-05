const WebSocket = require('ws');

module.exports.nodeWebSocketFactory = function nodeWebSocketFactory(uri, options) {
  return new WebSocket(uri, options);
}