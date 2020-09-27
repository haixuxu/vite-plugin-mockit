const chalk = require('chalk');
const path = require('path');
const apiMocker = require('koa-mock-restful');
const requireUncache = require('./requireUncache');
const fsWatch = require('./fsWatch');
const logcat = require('./logger');

let isDebug = false;

module.exports = function(options) {
  options = options || {};
  if (options.disable) {
    return {};
  }

  if (process.env.NODE_ENV === 'production') {
    return {};
  }

  isDebug = options.debug;
  options.entry = options.entry || './mock/index.js';

  if (path.isAbsolute(options.entry) === false) {
    options.entry = path.resolve(process.cwd(), options.entry);
  }

  fsWatch(options, refreshMock);

  return {
    configureServer: function({ app }) {
      const middleware = apiMocker({}, mocklogFn);
      app.use(middleware);
    },
  };

  function refreshMock(filename) {
    try {
      const mockObj = requireUncache(options.entry);
      apiMocker.refresh(mockObj);
      logcat.log('Done: Hot Mocker file replacement success!');
    } catch (err) {
      console.log(chalk.red(err.stack));
    }
  }

  function mocklogFn(type, msg) {
    if (type === 'matched') {
      logcat.log(type + ' ' + msg);
    } else {
      isDebug && logcat.debug(type + ' ' + msg);
    }
  }
};
