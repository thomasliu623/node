'use strict';
var common = require('../common');
var assert = require('assert');

if (!common.hasCrypto) {
  common.skip('missing crypto');
  return;
}
var tls = require('tls');

var fs = require('fs');
var util = require('util');
var join = require('path').join;

var options = {
  key: fs.readFileSync(join(common.fixturesDir, 'agent.key')),
  cert: fs.readFileSync(join(common.fixturesDir, 'multi-alice.crt'))
};
var verified = false;

var server = tls.createServer(options, function(cleartext) {
  cleartext.end('World');
});
server.listen(0, function() {
  var socket = tls.connect({
    port: this.address().port,
    rejectUnauthorized: false
  }, function() {
    var peerCert = socket.getPeerCertificate();
    console.error(util.inspect(peerCert));
    assert.deepStrictEqual(
      peerCert.subject.OU,
      ['Information Technology', 'Engineering', 'Marketing']
    );
    verified = true;
    server.close();
  });
  socket.end('Hello');
});

process.on('exit', function() {
  assert.ok(verified);
});
