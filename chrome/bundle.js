(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
/*jshint node:true, laxcomma:true */

var fs  = require('fs')
  , util = require('util');

var Configurator = function (file) {

  var self = this;
  var config = {};
  var oldConfig = {};

  this.updateConfig = function () {
    util.log('reading config file: ' + file);

    fs.readFile(file, function (err, data) {
      if (err) { throw err; }
      old_config = self.config;

      self.config = eval('config = ' + fs.readFileSync(file));
      self.emit('configChanged', self.config);
    });
  };

  this.updateConfig();

  fs.watch(file, function (event, filename) {
    if (event == 'change' && self.config.automaticConfigReload != false) {
      self.updateConfig();
    }
  });
};

util.inherits(Configurator, process.EventEmitter);

exports.Configurator = Configurator;

exports.configFile = function(file, callbackFunc) {
  var config = new Configurator(file);
  config.on('configChanged', function() {
    callbackFunc(config.config, config.oldConfig);
  });
};


}).call(this,require("UPikzY"))
},{"UPikzY":12,"fs":9,"util":14}],2:[function(require,module,exports){
/**
 * Public: test function to filter out malformed packets
 *
 * Parameters:
 *
 *   fields - Array of packet data (e.g. [ '100', 'ms', '@0.1' ])
 *
 * Returns true for a valid packet and false otherwise
 */
function isNumber(str) {
    return Boolean(str && !isNaN(str));
}

function is_valid_packet(fields) {

    // test for existing metrics type
    if (fields[1] === undefined) {
        return false;
    }

    // filter out malformed sample rates
    if (fields[2] !== undefined) {
        if (fields[2].length <= 1 || fields[2][0] != '@' || !isNumber(fields[2].substring(1))) {
            return false;
        }
    }

    // filter out invalid metrics values
    switch(fields[1]) {
        case 's':
            return true;
        case 'g':
            return isNumber(fields[0]);
        case 'ms':
            return isNumber(fields[0]) && Number(fields[0]) >= 0;
        default:
            if (!isNumber(fields[0])) {
                return false;
            }
            return true;
    }

};

exports.is_valid_packet = is_valid_packet;

},{}],3:[function(require,module,exports){
/*jshint node:true, laxcomma:true */

var Logger = function (config) {
  this.config  = config;
  this.backend = this.config.backend || 'stdout';
  this.level   = this.config.level || "LOG_INFO";
  this.base_util = require('util');
  if (this.backend == 'stdout') {
    this.util = this.base_util;
  } else {
    if (this.backend == 'console') {
        this.util = {
            format : this.base_util.format,
            debug : console.warn,
            error : console.error,
            puts : console.log,
            print : console.log,
            log : console.log,
            inspect : this.base_util.inspect,
            isArray : this.base_util.isArray,
            isRegExp : this.base_util.isRegExp,
            isDate : this.base_util.isDate,
            isError : this.base_util.isError,
            pump : this.base_util.pump,
            inherits : this.base_util.inherits,
        };
    } else {
      throw "Logger: Should be 'stdout' or 'console'.";
    }
  }
};

Logger.prototype = {
  log: function (msg, type) {
    if (this.backend == 'stdout') {
      if (!type) {
        type = 'DEBUG';
      }
      this.util.log(type + ": " + msg);
    } else {
      if (!type) {
        type = this.level;
        if (!this.util[type]) {
          throw "Undefined log level: " + type;
        }
      } else if (type == 'debug') {
        type = "LOG_DEBUG";
      }
      this.util.log(this.util[type], msg);
    }
  }
};

exports.Logger = Logger;

},{"util":14}],4:[function(require,module,exports){
/*jshint node:true, laxcomma:true */

/**
 * delete_stats - delete all matching statistics
 *
 * Side effect notes: this function works by altering stats_type in place,
 *   and calls stream.write(str) to display user feedback.
 *
 * @param stats_type array of all statistics of this type (eg~ timers) to delete from
 * @param cmdline array of all requested deletions, which can be fully qualified,
 *   or end in a .* to delete a folder, like stats.temp.*
 * @param stream buffer output for for all outgoing user feedback
 */
exports.delete_stats = function(stats_type, cmdline, stream) {

  //for each metric requested on the command line
  for (var index in cmdline) {

    //get a list of deletable metrics that match the request
    deletable = existing_stats(stats_type, cmdline[index]);

    //warn if no matches
    if (deletable.length === 0) {
      stream.write("metric " + cmdline[index] + " not found\n");
    }

    //delete all requested metrics
    for (var del_idx in deletable) {
      delete stats_type[deletable[del_idx]];
      stream.write("deleted: " + deletable[del_idx] + "\n");
    }
  }
  stream.write("END\n\n");
};

/**
 * existing_stats - find fully qualified matches for the requested stats bucket
 *
 * @param stats_type array of all statistics of this type (eg~ timers) to match
 * @param bucket string to search on, which can be fully qualified,
 *   or end in a .* to search for a folder, like stats.temp.*
 *
 * @return array of fully qualified stats that match the specified bucket. if
 *   no matches, an empty array is a valid response
 */
function existing_stats(stats_type, bucket){
  matches = [];

  //typical case: one-off, fully qualified
  if (bucket in stats_type) {
    matches.push(bucket);
  }

  //special case: match a whole 'folder' (and subfolders) of stats
  if (bucket.slice(-2) == ".*") {
    var folder = bucket.slice(0,-1);

    for (var name in stats_type) {
      //check if stat is in bucket, ie~ name starts with folder
      if (name.substring(0, folder.length) == folder) {
        matches.push(name);
      }
    }
  }

  return matches;
}

exports.existing_stats = existing_stats;

},{}],5:[function(require,module,exports){
/*jshint node:true, laxcomma:true */

var process_metrics = function (metrics, flushInterval, ts, flushCallback) {
    var starttime = Date.now();
    var key;
    var counter_rates = {};
    var timer_data = {};
    var statsd_metrics = {};
    var counters = metrics.counters;
    var timers = metrics.timers;
    var timer_counters = metrics.timer_counters;
    var pctThreshold = metrics.pctThreshold;
    var histogram = metrics.histogram;

    for (key in counters) {
      var value = counters[key];

      // calculate "per second" rate
      counter_rates[key] = value / (flushInterval / 1000);
    }

    for (key in timers) {
      var current_timer_data = {};

      if (timers[key].length > 0) {
        timer_data[key] = {};

        var values = timers[key].sort(function (a,b) { return a-b; });
        var count = values.length;
        var min = values[0];
        var max = values[count - 1];

        var cumulativeValues = [min];
        var cumulSumSquaresValues = [min * min];
        for (var i = 1; i < count; i++) {
            cumulativeValues.push(values[i] + cumulativeValues[i-1]);
            cumulSumSquaresValues.push((values[i] * values[i]) +
                                       cumulSumSquaresValues[i - 1]);
        }

        var sum = min;
        var sumSquares = min * min;
        var mean = min;
        var thresholdBoundary = max;

        var key2;

        for (key2 in pctThreshold) {
          var pct = pctThreshold[key2];
          var numInThreshold = count;

          if (count > 1) {
            numInThreshold = Math.round(Math.abs(pct) / 100 * count);
            if (numInThreshold === 0) {
              continue;
            }

            if (pct > 0) {
              thresholdBoundary = values[numInThreshold - 1];
              sum = cumulativeValues[numInThreshold - 1];
              sumSquares = cumulSumSquaresValues[numInThreshold - 1];
            } else {
              thresholdBoundary = values[count - numInThreshold];
              sum = cumulativeValues[count - 1] - cumulativeValues[count - numInThreshold - 1];
              sumSquares = cumulSumSquaresValues[count - 1] -
                cumulSumSquaresValues[count - numInThreshold - 1];
            }
            mean = sum / numInThreshold;
          }

          var clean_pct = '' + pct;
          clean_pct = clean_pct.replace('.', '_').replace('-', 'top');
          current_timer_data["count_" + clean_pct] = numInThreshold;
          current_timer_data["mean_" + clean_pct] = mean;
          current_timer_data[(pct > 0 ? "upper_" : "lower_") + clean_pct] = thresholdBoundary;
          current_timer_data["sum_" + clean_pct] = sum;
          current_timer_data["sum_squares_" + clean_pct] = sumSquares;

        }

        sum = cumulativeValues[count-1];
        sumSquares = cumulSumSquaresValues[count-1];
        mean = sum / count;

        var sumOfDiffs = 0;
        for (var i = 0; i < count; i++) {
           sumOfDiffs += (values[i] - mean) * (values[i] - mean);
        }

        var mid = Math.floor(count/2);
        var median = (count % 2) ? values[mid] : (values[mid-1] + values[mid])/2;

        var stddev = Math.sqrt(sumOfDiffs / count);
        current_timer_data["std"] = stddev;
        current_timer_data["upper"] = max;
        current_timer_data["lower"] = min;
        current_timer_data["count"] = timer_counters[key];
        current_timer_data["count_ps"] = timer_counters[key] / (flushInterval / 1000);
        current_timer_data["sum"] = sum;
        current_timer_data["sum_squares"] = sumSquares;
        current_timer_data["mean"] = mean;
        current_timer_data["median"] = median;

        // note: values bigger than the upper limit of the last bin are ignored, by design
        conf = histogram || [];
        bins = [];
        for (var i = 0; i < conf.length; i++) {
            if (key.indexOf(conf[i].metric) > -1) {
                bins = conf[i].bins;
                break;
            }
        }
        if(bins.length) {
            current_timer_data['histogram'] = {};
        }
        // the outer loop iterates bins, the inner loop iterates timer values;
        // within each run of the inner loop we should only consider the timer value range that's within the scope of the current bin
        // so we leverage the fact that the values are already sorted to end up with only full 1 iteration of the entire values range
        var i = 0;
        for (var bin_i = 0; bin_i < bins.length; bin_i++) {
          var freq = 0;
          for (; i < count && (bins[bin_i] == 'inf' || values[i] < bins[bin_i]); i++) {
            freq += 1;
          }
          bin_name = 'bin_' + bins[bin_i].toString().replace('.', '_');
          current_timer_data['histogram'][bin_name] = freq;
        }

      } else {

        current_timer_data["count"] = current_timer_data["count_ps"] = 0;

      }

      timer_data[key] = current_timer_data;
    }

    statsd_metrics["processing_time"] = (Date.now() - starttime);
    //add processed metrics to the metrics_hash
    metrics.counter_rates = counter_rates;
    metrics.timer_data = timer_data;
    metrics.statsd_metrics = statsd_metrics;

    flushCallback(metrics);
  };

exports.process_metrics = process_metrics;

},{}],6:[function(require,module,exports){
(function (process){
var util = require('util');

var conf;

exports.init = function(config) {
  conf = config;
  exports.set_title(config);

  process.on('SIGTERM', function() {
   if (conf.debug) {
     util.log('Starting Final Flush');
   }
   healthStatus = 'down';
   process.exit();
  });

}

exports.set_title = function(config) {
 if (config.title !== undefined) {
   if (config.title) {
       process.title = config.title;
   }
 } else {
   // Respect command line arguments when overriding the process title.
   cmdline = process.argv.slice(2);
   cmdline.unshift('statsd');

   process.title = cmdline.join(" ");
 }
}

}).call(this,require("UPikzY"))
},{"UPikzY":12,"util":14}],7:[function(require,module,exports){
/*jshint node:true, laxcomma:true */

var Set = function() {
  this.store = {};
};

Set.prototype = {
  has: function(value) {
    if (value) {
      return this.store.hasOwnProperty(value);
    } else {
      return false;
    }
  },
  insert: function(value) {
    if (value) {
      this.store[value] = value;
    }
  },
  clear: function() {
    this.store = {};
  },
  values: function() {
    var values = [];
    for (var value in this.store) {
      values.push(value);
    }
    return values;
  }
};

exports.Set = Set;

},{}],8:[function(require,module,exports){
(function (process){
/*jshint node:true, laxcomma:true */

document.addEventListener('DOMContentLoaded', function () {

var dgram  = require('dgram')
  , util    = require('util')
  , net    = require('net')
  , config = require('./lib/config')
  , helpers = require('./lib/helpers')
  , fs     = require('fs')
  , events = require('events')
  , logger = require('./lib/logger')
  , set = require('./lib/set')
  , pm = require('./lib/process_metrics')
  , process_mgmt = require('./lib/process_mgmt')
  , mgmt = require('./lib/mgmt_console');


// initialize data structures with defaults for statsd stats
var keyCounter = {};
var counters = {};
var timers = {};
var timer_counters = {};
var gauges = {};
var sets = {};
var counter_rates = {};
var timer_data = {};
var pctThreshold = null;
var flushInterval, keyFlushInt, server, mgmtServer;
var startup_time = Math.round(new Date().getTime() / 1000);
var backendEvents = new events.EventEmitter();
var healthStatus = config.healthStatus || 'up';
var old_timestamp = 0;
var timestamp_lag_namespace;

// Load and init the backend from the backends/ directory.
function loadBackend(config, name) {
  var backendmod = require(name);

  if (config.debug) {
    l.log("Loading backend: " + name, 'DEBUG');
  }

  var ret = backendmod.init(startup_time, config, backendEvents, l);
  if (!ret) {
    l.log("Failed to load backend: " + name);
    process.exit(1);
  }
}

// global for conf
var conf;

// Flush metrics to each backend.
function flushMetrics() {
  var time_stamp = Math.round(new Date().getTime() / 1000);
  if (old_timestamp > 0) {
    gauges[timestamp_lag_namespace] = (time_stamp - old_timestamp - (Number(conf.flushInterval)/1000));
  }
  old_timestamp = time_stamp;

  var metrics_hash = {
    counters: counters,
    gauges: gauges,
    timers: timers,
    timer_counters: timer_counters,
    sets: sets,
    counter_rates: counter_rates,
    timer_data: timer_data,
    pctThreshold: pctThreshold,
    histogram: conf.histogram
  };

  // After all listeners, reset the stats
  backendEvents.once('flush', function clear_metrics(ts, metrics) {
    // TODO: a lot of this should be moved up into an init/constructor so we don't have to do it every
    // single flushInterval....
    // allows us to flag all of these on with a single config but still override them individually
    conf.deleteIdleStats = conf.deleteIdleStats !== undefined ? conf.deleteIdleStats : false;
    if (conf.deleteIdleStats) {
      conf.deleteCounters = conf.deleteCounters !== undefined ? conf.deleteCounters : true;
      conf.deleteTimers = conf.deleteTimers !== undefined ? conf.deleteTimers : true;
      conf.deleteSets = conf.deleteSets !== undefined ? conf.deleteSets : true;
      conf.deleteGauges = conf.deleteGauges !== undefined ? conf.deleteGauges : true;
    }

    // Clear the counters
    conf.deleteCounters = conf.deleteCounters || false;
    for (var counter_key in metrics.counters) {
      if (conf.deleteCounters) {
        if ((counter_key.indexOf("packets_received") != -1) || (counter_key.indexOf("bad_lines_seen") != -1)) {
          metrics.counters[counter_key] = 0;
        } else {
         delete(metrics.counters[counter_key]);
        }
      } else {
        metrics.counters[counter_key] = 0;
      }
    }

    // Clear the timers
    conf.deleteTimers = conf.deleteTimers || false;
    for (var timer_key in metrics.timers) {
      if (conf.deleteTimers) {
        delete(metrics.timers[timer_key]);
        delete(metrics.timer_counters[timer_key]);
      } else {
        metrics.timers[timer_key] = [];
        metrics.timer_counters[timer_key] = 0;
     }
    }

    // Clear the sets
    conf.deleteSets = conf.deleteSets || false;
    for (var set_key in metrics.sets) {
      if (conf.deleteSets) {
        delete(metrics.sets[set_key]);
      } else {
        metrics.sets[set_key] = new set.Set();
      }
    }

	// normally gauges are not reset.  so if we don't delete them, continue to persist previous value
    conf.deleteGauges = conf.deleteGauges || false;
    if (conf.deleteGauges) {
      for (var gauge_key in metrics.gauges) {
        delete(metrics.gauges[gauge_key]);
      }
    }
  });

  pm.process_metrics(metrics_hash, flushInterval, time_stamp, function emitFlush(metrics) {
    backendEvents.emit('flush', time_stamp, metrics);
  });

}

var stats = {
  messages: {
    last_msg_seen: startup_time,
    bad_lines_seen: 0
  }
};

// Global for the logger
var l;

config.configFile(process.argv[2], function (config, oldConfig) {
  conf = config;

  process_mgmt.init(config);

  l = new logger.Logger(config.log || {});

  // setup config for stats prefix
  prefixStats = config.prefixStats;
  prefixStats = prefixStats !== undefined ? prefixStats : "statsd";
  //setup the names for the stats stored in counters{}
  bad_lines_seen   = prefixStats + ".bad_lines_seen";
  packets_received = prefixStats + ".packets_received";
  timestamp_lag_namespace = prefixStats + ".timestamp_lag";

  //now set to zero so we can increment them
  counters[bad_lines_seen]   = 0;
  counters[packets_received] = 0;

  if (server === undefined) {

    // key counting
    var keyFlushInterval = Number((config.keyFlush && config.keyFlush.interval) || 0);

    var udp_version = config.address_ipv6 ? 'udp6' : 'udp4';
    server = dgram.createSocket(udp_version, function (msg, rinfo) {
      backendEvents.emit('packet', msg, rinfo);
      counters[packets_received]++;
      var packet_data = msg.toString();
      if (packet_data.indexOf("\n") > -1) {
        var metrics = packet_data.split("\n");
      } else {
        var metrics = [ packet_data ] ;
      }

      for (var midx in metrics) {
        if (metrics[midx].length === 0) {
          continue;
        }
        if (config.dumpMessages) {
          l.log(metrics[midx].toString());
        }
        var bits = metrics[midx].toString().split(':');
        var key = bits.shift()
                      .replace(/\s+/g, '_')
                      .replace(/\//g, '-')
                      .replace(/[^a-zA-Z_\-0-9\.]/g, '');

        if (keyFlushInterval > 0) {
          if (! keyCounter[key]) {
            keyCounter[key] = 0;
          }
          keyCounter[key] += 1;
        }

        if (bits.length === 0) {
          bits.push("1");
        }

        for (var i = 0; i < bits.length; i++) {
          var sampleRate = 1;
          var fields = bits[i].split("|");
          if (!helpers.is_valid_packet(fields)) {
              l.log('Bad line: ' + fields + ' in msg "' + metrics[midx] +'"');
              counters[bad_lines_seen]++;
              stats.messages.bad_lines_seen++;
              continue;
          }
          if (fields[2]) {
            sampleRate = Number(fields[2].match(/^@([\d\.]+)/)[1]);
          }

          var metric_type = fields[1].trim();
          if (metric_type === "ms") {
            if (! timers[key]) {
              timers[key] = [];
              timer_counters[key] = 0;
            }
            timers[key].push(Number(fields[0] || 0));
            timer_counters[key] += (1 / sampleRate);
          } else if (metric_type === "g") {
            if (gauges[key] && fields[0].match(/^[-+]/)) {
              gauges[key] += Number(fields[0] || 0);
            } else {
              gauges[key] = Number(fields[0] || 0);
            }
          } else if (metric_type === "s") {
            if (! sets[key]) {
              sets[key] = new set.Set();
            }
            sets[key].insert(fields[0] || '0');
          } else {
            if (! counters[key]) {
              counters[key] = 0;
            }
            counters[key] += Number(fields[0] || 1) * (1 / sampleRate);
          }
        }
      }

      stats.messages.last_msg_seen = Math.round(new Date().getTime() / 1000);
    });

    mgmtServer = net.createServer(function(stream) {
      stream.setEncoding('ascii');

      stream.on('error', function(err) {
        l.log('Caught ' + err +', Moving on');
      });

      stream.on('data', function(data) {
        var cmdline = data.trim().split(" ");
        var cmd = cmdline.shift();

        switch(cmd) {
          case "help":
            stream.write("Commands: stats, counters, timers, gauges, delcounters, deltimers, delgauges, health, quit\n\n");
            break;

          case "health":
            if (cmdline.length > 0) {
              var cmdaction = cmdline[0].toLowerCase();
              if (cmdaction === 'up') {
                healthStatus = 'up';
              } else if (cmdaction === 'down') {
                healthStatus = 'down';
              }
            }
            stream.write("health: " + healthStatus + "\n");
            break;

          case "stats":
            var now    = Math.round(new Date().getTime() / 1000);
            var uptime = now - startup_time;

            stream.write("uptime: " + uptime + "\n");

            var stat_writer = function(group, metric, val) {
              var delta;

              if (metric.match("^last_")) {
                delta = now - val;
              }
              else {
                delta = val;
              }

              stream.write(group + "." + metric + ": " + delta + "\n");
            };

            // Loop through the base stats
            for (var group in stats) {
              for (var metric in stats[group]) {
                stat_writer(group, metric, stats[group][metric]);
              }
            }

            backendEvents.once('status', function(writeCb) {
              stream.write("END\n\n");
            });

            // Let each backend contribute its status
            backendEvents.emit('status', function(err, name, stat, val) {
              if (err) {
                l.log("Failed to read stats for backend " +
                        name + ": " + err);
              } else {
                stat_writer(name, stat, val);
              }
            });

            break;

          case "counters":
            stream.write(util.inspect(counters) + "\n");
            stream.write("END\n\n");
            break;

          case "timers":
            stream.write(util.inspect(timers) + "\n");
            stream.write("END\n\n");
            break;

          case "gauges":
            stream.write(util.inspect(gauges) + "\n");
            stream.write("END\n\n");
            break;

          case "delcounters":
            mgmt.delete_stats(counters, cmdline, stream);
            break;

          case "deltimers":
            mgmt.delete_stats(timers, cmdline, stream);
            break;

          case "delgauges":
            mgmt.delete_stats(gauges, cmdline, stream);
            break;

          case "quit":
            stream.end();
            break;

          default:
            stream.write("ERROR\n");
            break;
        }

      });
    });

    server.bind(config.port || 8125, config.address || undefined);
    mgmtServer.listen(config.mgmt_port || 8126, config.mgmt_address || undefined);

    util.log("server is up");

    pctThreshold = config.percentThreshold || 90;
    if (!Array.isArray(pctThreshold)) {
      pctThreshold = [ pctThreshold ]; // listify percentiles so single values work the same
    }

    flushInterval = Number(config.flushInterval || 10000);
    config.flushInterval = flushInterval;

    if (config.backends) {
      for (var i = 0; i < config.backends.length; i++) {
        loadBackend(config, config.backends[i]);
      }
    } else {
      // The default backend is graphite
      loadBackend(config, './backends/graphite');
    }

    // Setup the flush timer
    var flushInt = setInterval(flushMetrics, flushInterval);

    if (keyFlushInterval > 0) {
      var keyFlushPercent = Number((config.keyFlush && config.keyFlush.percent) || 100);
      var keyFlushLog = config.keyFlush && config.keyFlush.log;

      keyFlushInt = setInterval(function () {
        var sortedKeys = [];

        for (var key in keyCounter) {
          sortedKeys.push([key, keyCounter[key]]);
        }

        sortedKeys.sort(function(a, b) { return b[1] - a[1]; });

        var logMessage = "";
        var timeString = (new Date()) + "";

        // only show the top "keyFlushPercent" keys
        for (var i = 0, e = sortedKeys.length * (keyFlushPercent / 100); i < e; i++) {
          logMessage += timeString + " count=" + sortedKeys[i][1] + " key=" + sortedKeys[i][0] + "\n";
        }

        if (keyFlushLog) {
          var logFile = fs.createWriteStream(keyFlushLog, {flags: 'a+'});
          logFile.write(logMessage);
          logFile.end();
        } else {
          process.stdout.write(logMessage);
        }

        // clear the counter
        keyCounter = {};
      }, keyFlushInterval);
    }
  }
});

process.on('exit', function () {
  flushMetrics();
});

});

}).call(this,require("UPikzY"))
},{"./lib/config":1,"./lib/helpers":2,"./lib/logger":3,"./lib/mgmt_console":4,"./lib/process_metrics":5,"./lib/process_mgmt":6,"./lib/set":7,"UPikzY":12,"dgram":9,"events":10,"fs":9,"net":9,"util":14}],9:[function(require,module,exports){

},{}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],11:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],12:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],13:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],14:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("UPikzY"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":13,"UPikzY":12,"inherits":11}]},{},[8])