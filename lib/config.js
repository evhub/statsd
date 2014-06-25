/*jshint node:true, laxcomma:true */

var fs  = require('fs')
  , util = require('util');

var Configurator = function (file) {

  var self = this;
  var config = {};
  var oldConfig = {};

  this.updateConfig = function () {
      old_config = self.config;
      self.emit('configChanged', self.config);

      if (file == "Config.js") {
          self.config = {
                graphitePort: 2003
              , graphiteHost: "graphite.example.com"
              , port: 8125
              , backends: [ "./backends/graphite" ]
              , dumpMessages: true
              , debug: true
              , log: {
                    backend: "console"
              }
          };
      }
      else if (file == "ProxyConfig.js") {
          self.config = {
              nodes: [
                      {host: '127.0.0.1', port: 8127, adminport: 8128},
                      {host: '127.0.0.1', port: 8129, adminport: 8130},
                      {host: '127.0.0.1', port: 8131, adminport: 8132}
                      ],
              udp_version: 'udp4',
              host:  '0.0.0.0',
              port: 8125,
              checkInterval: 1000,
              cacheSize: 10000
          };
      }
      else {
          util.log("Unknown config file "+file);
      };

  };

  this.updateConfig();
};

if (! process.EventEmitter) {
    process.EventEmitter = require("events");
};

util.inherits(Configurator, process.EventEmitter);

exports.Configurator = Configurator;

exports.configFile = function(file, callbackFunc) {
  var config = new Configurator(file);
  config.on('configChanged', function() {
    callbackFunc(config.config, config.oldConfig);
  });
};

