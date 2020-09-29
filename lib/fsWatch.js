const fs = require('fs');
const chalk = require('chalk');
const chokidar = require('chokidar');
const path = require('path');
const logcat = require('./logger');
const utils = require('./utils');

/**
 * use fs.watchFile
 */
module.exports = function (options, callback) {
  logcat.log('watch mock file:' + options.entry);

  const entry = options.entry;
  const watchFiles = options.watchFiles || [];
  const watchOptions = options.watchOptions || {};
  const ignore = options.ignore;
  const debounceCallback = utils.debounce(callback, 100, true);

  watchFiles.unshift(entry, path.dirname(entry));
  //watch file change to create route map
  chokidar.watch(watchFiles, watchOptions).on('all', (event, path) => {
    if (utils.isFunction(ignore) && ignore(path)) {
      return;
    }
    if (utils.isRegExp(ignore) && ignore.test(path)) {
      return;
    }
    try {
      delete require.cache[require.resolve(path)];
      debounceCallback(path);
    } catch (e) {
      // ignore
    }
  });
};
