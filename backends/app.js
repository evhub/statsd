/*jshint node:true, laxcomma:true */

var util = require('util');
var mainwin = document;
var log = mainwin.getElementById("log");
var l;

function formatHTML(inputstring) {
    return inputstring.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;");
};

function display(item, top) {
    
    item = ""+item;
    var toappend = formatHTML(item);
    
    if (!! top) {
        toappend = "<h1>"+toappend+"</h1>";
    }
    else {
        toappend = "<p>"+toappend+"</p>";
    };
    
    log.innerHTML += toappend;
    
};

function clear() {
    
    log.innerHTML = "";
    display("Statistics:", true);
    
};

clear()
display("Loading...");

function AppBackend(startupTime, config, emitter){
  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;
  this.config = config.console || {};

  // attach
  emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
  emitter.on('status', function(callback) { self.status(callback); });
}

AppBackend.prototype.flush = function(timestamp, metrics) {

  var out = {
    counters: metrics.counters,
    timers: metrics.timers,
    gauges: metrics.gauges,
    timer_data: metrics.timer_data,
    counter_rates: metrics.counter_rates,
    sets: function (vals) {
      var ret = {};
      for (var val in vals) {
        ret[val] = vals[val].values();
      }
      return ret;
    }(metrics.sets),
    pctThreshold: metrics.pctThreshold
  };

/* ---------------------------------------------------------------------------------------
 
 // No Stats In: -------------------------------------------------------------------------
 
 { counters: { 'statsd.bad_lines_seen': 0, 'statsd.packets_received': 0 },
 timers: {},
 gauges: {},
 timer_data: {},
 counter_rates: { 'statsd.bad_lines_seen': 0, 'statsd.packets_received': 0 },
 sets: {},
 pctThreshold: [ 90 ] }
 
 // Partial Stats In: --------------------------------------------------------------------
 
 { counters:
     { 'statsd.bad_lines_seen': 0,
     'statsd.packets_received': 0,
     'rippled.full_below.size': 0,
     'rippled.jobq.job_count': 0,
     'rippled.ledger_fetches': 0 },
 timers:
     { 'rippled.jobq.writeObjects': [],
     'rippled.jobq.trustedValidation': [],
     'rippled.jobq.ledgerData': [],
     'rippled.jobq.ledgerData_q': [],
     'rippled.jobq.writeObjects_q': [],
     'rippled.jobq.heartbeat': [],
     'rippled.jobq.acceptLedger': [],
     'rippled.jobq.sweep': [],
     'rippled.jobq.makeFetchPack': [],
     'rippled.jobq.trustedValidation_q': [],
     'rippled.jobq.makeFetchPack_q': [],
     'rippled.jobq.fetchTxnData_q': [] },
 gauges: { 'statsd.timestamp_lag': 3 },
 timer_data:
     { 'rippled.jobq.writeObjects': { count_ps: 0, count: 0 },
     'rippled.jobq.trustedValidation': { count_ps: 0, count: 0 },
     'rippled.jobq.ledgerData': { count_ps: 0, count: 0 },
     'rippled.jobq.ledgerData_q': { count_ps: 0, count: 0 },
     'rippled.jobq.writeObjects_q': { count_ps: 0, count: 0 },
     'rippled.jobq.heartbeat': { count_ps: 0, count: 0 },
     'rippled.jobq.acceptLedger': { count_ps: 0, count: 0 },
     'rippled.jobq.sweep': { count_ps: 0, count: 0 },
     'rippled.jobq.makeFetchPack': { count_ps: 0, count: 0 },
     'rippled.jobq.trustedValidation_q': { count_ps: 0, count: 0 },
     'rippled.jobq.makeFetchPack_q': { count_ps: 0, count: 0 },
     'rippled.jobq.fetchTxnData_q': { count_ps: 0, count: 0 } },
 counter_rates:
     { 'statsd.bad_lines_seen': 0,
     'statsd.packets_received': 0,
     'rippled.full_below.size': 0,
     'rippled.jobq.job_count': 0,
     'rippled.ledger_fetches': 0 },
 sets: {},
 pctThreshold: [ 90 ] }
 
 // All Stats In: ------------------------------------------------------------------------
 
 { counters:
     { 'statsd.bad_lines_seen': 0,
     'statsd.packets_received': 5,
     'rippled.full_below.size': 0,
     'rippled.jobq.job_count': 37,
     'rippled.ledger_fetches': 2 },
 timers:
     { 'rippled.jobq.writeObjects': [ 19, 910, 1310 ],
     'rippled.jobq.trustedValidation': [ 154, 214, 289, 290, 291, 407, 705 ],
     'rippled.jobq.ledgerData': [],
     'rippled.jobq.ledgerData_q': [],
     'rippled.jobq.writeObjects_q': [],
     'rippled.jobq.heartbeat': [ 101, 150 ],
     'rippled.jobq.acceptLedger': [],
     'rippled.jobq.sweep': [],
     'rippled.jobq.makeFetchPack': [ 68, 367, 704 ],
     'rippled.jobq.trustedValidation_q': [ 289 ],
     'rippled.jobq.makeFetchPack_q': [ 291 ],
     'rippled.jobq.fetchTxnData_q': [ 53, 115 ] },
 gauges: { 'statsd.timestamp_lag': 1 },
 timer_data:
     { 'rippled.jobq.writeObjects':
         { count_90: 3,
         mean_90: 746.3333333333334,
         upper_90: 1310,
         sum_90: 2239,
         sum_squares_90: 2544561,
         std: 539.604999565011,
         upper: 1310,
         lower: 19,
         count: 3,
         count_ps: 0.3,
         sum: 2239,
         sum_squares: 2544561,
         mean: 746.3333333333334,
         median: 910 },
     'rippled.jobq.trustedValidation':
     { count_90: 6,
         mean_90: 274.1666666666667,
         upper_90: 407,
         sum_90: 1645,
         sum_squares_90: 487463,
         std: 167.1438339409797,
         upper: 705,
         lower: 154,
         count: 7,
         count_ps: 0.7,
         sum: 2350,
         sum_squares: 984488,
         mean: 335.7142857142857,
         median: 290 },
     'rippled.jobq.ledgerData': { count_ps: 0, count: 0 },
     'rippled.jobq.ledgerData_q': { count_ps: 0, count: 0 },
     'rippled.jobq.writeObjects_q': { count_ps: 0, count: 0 },
     'rippled.jobq.heartbeat':
         { count_90: 2,
         mean_90: 125.5,
         upper_90: 150,
         sum_90: 251,
         sum_squares_90: 32701,
         std: 24.5,
         upper: 150,
         lower: 101,
         count: 2,
         count_ps: 0.2,
         sum: 251,
         sum_squares: 32701,
         mean: 125.5,
         median: 125.5 },
     'rippled.jobq.acceptLedger': { count_ps: 0, count: 0 },
     'rippled.jobq.sweep': { count_ps: 0, count: 0 },
     'rippled.jobq.makeFetchPack':
         { count_90: 3,
         mean_90: 379.6666666666667,
         upper_90: 704,
         sum_90: 1139,
         sum_squares_90: 634929,
         std: 259.80035069688074,
         upper: 704,
         lower: 68,
         count: 3,
         count_ps: 0.3,
         sum: 1139,
         sum_squares: 634929,
         mean: 379.6666666666667,
         median: 367 },
     'rippled.jobq.trustedValidation_q':
         { count_90: 1,
         mean_90: 289,
         upper_90: 289,
         sum_90: 289,
         sum_squares_90: 83521,
         std: 0,
         upper: 289,
         lower: 289,
         count: 1,
         count_ps: 0.1,
         sum: 289,
         sum_squares: 83521,
         mean: 289,
         median: 289 },
     'rippled.jobq.makeFetchPack_q':
         { count_90: 1,
         mean_90: 291,
         upper_90: 291,
         sum_90: 291,
         sum_squares_90: 84681,
         std: 0,
         upper: 291,
         lower: 291,
         count: 1,
         count_ps: 0.1,
         sum: 291,
         sum_squares: 84681,
         mean: 291,
         median: 291 },
     'rippled.jobq.fetchTxnData_q':
         { count_90: 2,
         mean_90: 84,
         upper_90: 115,
         sum_90: 168,
         sum_squares_90: 16034,
         std: 31,
         upper: 115,
         lower: 53,
         count: 2,
         count_ps: 0.2,
         sum: 168,
         sum_squares: 16034,
         mean: 84,
         median: 84 } },
 counter_rates:
     { 'statsd.bad_lines_seen': 0,
     'statsd.packets_received': 0.5,
     'rippled.full_below.size': 0,
     'rippled.jobq.job_count': 3.7,
     'rippled.ledger_fetches': 0.2 },
 sets: {},
 pctThreshold: [ 90 ] }
 
 -------------------------------------------------------------------------------------- */

    clear()
    display("Timestamp: "+new Date(timestamp * 1000).toString()+" (Lag: "+out.gauges.statsd.timestamp_lag+")");
    if (out.counters.statsd.bad_lines_seen > 0) {
        display("WARNING: Bad lines seen = "+out.counters.statsd/bad_lines_seen);
    }
    else if (out.counters.statsd.packets_received < 1) {
        display("Waiting...");
    }
    else {
        display("Job Count: "+out.counters.rippled.jobq.job_count);
        display("Ledger Fetches: "+out.counters.rippled.ledger_fetches);
    };

};

AppBackend.prototype.status = function(write) {
  ['lastFlush', 'lastException'].forEach(function(key) {
    write(null, 'console', key, this[key]);
  }, this);
};

exports.init = function(startupTime, config, events, logger) {
  l = logger;
  var instance = new AppBackend(startupTime, config, events);
  return true;
};
