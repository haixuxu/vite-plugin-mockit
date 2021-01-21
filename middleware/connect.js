const bodyParser = require('body-parser');
const path = require('path');
const parseUrl = require('parseurl');
const qs = require('qs');
const parse = require('url').parse;
let debug = require('debug')('express:mock');
const utils = require('./utils');
const transform = require('./transform');
const response = require('./response');

let cwd = process.cwd();
let mockRouteMap = {};

let debugFn = function (type, msg) {
  debug(type + msg);
};

// 用于刷新mock设置
createMiddleware.refresh = function (mockObj) {
  mockRouteMap = {};
  createRoute(mockObj);
};

module.exports = createMiddleware;

function createMiddleware(mockObj, logfn) {
  if (mockObj.entry) {
    let entry = mockObj.entry;
    if (path.isAbsolute(entry)) {
      mockObj = require(entry);
    } else {
      mockObj = require(path.resolve(cwd, entry));
    }
  }
  if (logfn && typeof logfn === 'function') {
    debugFn = logfn;
  }

  createRoute(mockObj);

  return function (req, res, next) {
    let route = matchRoute(req);
    if (route) {
      try {
        if (!req.query) {
          var val = parseUrl(req).query;
          req.query = qs.parse(val);
        }
        //match url
        debugFn('matched', `${route.method.toUpperCase()} ${route.path}`);
        let bodyParserMethd = bodyParser.json();
        let headers = req.headers;
        const contentType = headers['Content-Type'];
        if (contentType === 'text/plain') {
          bodyParserMethd = bodyParser.raw({ type: 'text/plain' });
        } else if (contentType === 'application/x-www-form-urlencoded') {
          bodyParserMethd = bodyParser.urlencoded({ extended: false });
        }
        bodyParserMethd(req, res, function () {
          fixResponse(res);
          const result = utils.pathMatch({ sensitive: false, strict: false, end: false });
          const match = result(route.path);
          req.params = match(parse(req.url).pathname);
          route.handler(req, res, next);
        });
      } catch (err) {
        next(err);
      }
    } else {
      next();
    }
  };
}

function fixResponse(res) {
  res.status = res.status || response.status.bind(res);
  res.set = res.set || response.set.bind(res);
  res.get = res.get || response.get.bind(res);
  res.send = res.send || response.send.bind(res);
  res.json = res.json || response.json.bind(res);
}

function createRoute(mockModule) {
  let mockConfList;
  if (!Array.isArray(mockModule)) {
    mockConfList = transform(mockModule);
  } else {
    mockConfList = mockModule;
  }
  mockConfList.forEach((mockConf, index) => {
    let method = mockConf.method || 'get';
    let path = mockConf.path;
    let handler = mockConf.handler;
    if (!path || !handler) {
      throw Error(`missing path or handler at index ${index} with path: ${path}`);
    }
    let regexp = new RegExp('^' + path.replace(/(:\w*)[^/]/gi, '(.*)') + '$');
    let route = { path, method: method.toLowerCase(), regexp, handler };
    if (!mockRouteMap[method]) {
      mockRouteMap[method] = [];
    }
    debugFn('createRoute', ': path:' + route.path + '  method:' + route.method);
    mockRouteMap[method].push(route);
  });
}

function matchRoute(req) {
  let url = req.url;
  let method = req.method.toLowerCase();
  let uri = url.replace(/\?.*$/, '');
  debugFn('matchRoute', ':(path:' + url + '  method:' + method + ')');
  let routerList = mockRouteMap[method];
  return routerList && routerList.find((item) => item.path === uri || item.regexp.test(uri));
}
