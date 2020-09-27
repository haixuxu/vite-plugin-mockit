const fs = require('fs');
const chalk = require('chalk');
const chokidar = require('chokidar');
const path = require('path');
const logcat = require('./logger');
const toString = Object.prototype.toString;
/**
 * use fs.watchFile
 */
module.exports = function(options, callback) {
  logcat.log('watch mock file:' + options.entry);
  callback();

  const entry = options.entry;
  const watchFiles = options.watchFiles || [];
  const watchOptions = options.watchOptions || {};
  const ignore = options.ignore;

  watchFiles.unshift(entry, path.dirname(entry));
  //watch file change to create route map
  chokidar.watch(watchFiles).on('all', (event, path) => {
    if (isFunction(ignore) && ignore(path)) {
      return;
    }
    if (isRegExp(ignore) && ignore.test(path)) {
      return;
    }
    try {
      delete require.cache[require.resolve(path)];
      callback();
    } catch (e) {
      // ignore
    }
  });
};

function isFunction(val) {
  return val && toString.call(val) === `[object Function]`;
}

function isRegExp(val) {
  return val && toString.call(val) === `[object RegExp]`;
}
