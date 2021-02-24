const chalk = require('chalk');
const path = require('path');
const middleware = require('../middleware');
const requireUncache = require('./requireUncache');
const fsWatch = require('./fsWatch');
const logcat = require('./logger');
const utils = require('./utils');

let isDebug = false;
let apiMocker;

module.exports = function (options) {
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

  const vitepkg = utils.resolveModulePkg('vite');
  if (/^1\./.test(vitepkg.version)) {
    logcat.log('detect vite 1.x');
    apiMocker = middleware.koa;
  } else {
    logcat.log('detect vite >2.x');
    apiMocker = middleware.connect;
  }

  fsWatch(options, refreshMock);

  return {
    configureServer: function (viteServer) {
      const app = viteServer.middlewares || viteServer.app;
      const middleware = apiMocker({}, mocklogFn);
      app.use(middleware);
    },
  };

  function refreshMock(filename) {
    try {
      const mockObj = requireUncache(options.entry);
      apiMocker.refresh(mockObj);
      isDebug && logcat.debug('filename change from ' + filename);
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
