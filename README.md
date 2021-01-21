# vite-plugin-mockit

![Build Status](https://github.com/xuxihai123/vite-plugin-mockit/workflows/test.yml/badge.svg)

local mock data functionality for vite, support **vite 1.x** and **vite 2.x**

- Simple writing(express.js style)
- watch file change
- auto reload mock server
- support cjs style Module

## Install

```bash
yarn add vite-plugin-mockit
```

## example app

https://github.com/xuxihai123/vite-mock-example

## Usage

1. writing a entry file. for examples ./mock/index.js

- mock file example one

```js
module.exports = {
  'GET /api/user': { username: 'admin', sex: 5 },
  'GET /api/list': function (req, res) {
    let query = req.query || {};
    return res.json({
      limit: query.limit,
      offset: query.offset,
      list: [
        { username: 'admin1', sex: 1 },
        { username: 'admin2', sex: 0 },
      ],
    });
  },
  'GET /repos/hello': (req, res) => {
    return res.json({
      text: 'this is from mock server',
    });
  },
  'GET /api/userinfo/:id': (req, res) => {
    return res.json({
      id: req.params.id,
      username: 'kenny',
    });
  },
  'GET /api/user/list/:id/:type': (req, res) => {
    return res.json({
      id: req.params.id,
      type: req.params.type,
    });
  },

  'POST /api/login/account': (req, res) => {
    const { password, username } = req.body;
    if (password === '888888' && username === 'admin') {
      return res.json({
        status: 'ok',
        code: 0,
        token: 'sdfsdfsdfdsf',
        data: {
          id: 1,
          username: 'kenny',
          sex: 6,
        },
      });
    } else {
      return res.json({ status: 'error', code: 403 });
    }
  },
  'DELETE /api/user/:id': (req, res) => {
    res.send({ status: 'ok', message: '删除成功！' });
  },
};
```

- mock file example two

```js
module.exports = [
  {
    path: '/api/user',
    handler: (req, res) => {
      return res.json({ username: 'admin', sex: 5 });
    },
  },
  {
    path: '/api/list',
    handler: function (req, res) {
      let query = req.query || {};
      return res.json({
        limit: query.limit,
        offset: query.offset,
        list: [
          { username: 'admin1', sex: 1 },
          { username: 'admin2', sex: 0 },
        ],
      });
    },
  },
  {
    path: '/repos/hello',
    handler: (req, res) => {
      return res.json({ text: 'this is from mock server' });
    },
  },
  {
    path: '/api/userinfo/:id',
    handler: (req, res) => {
      return res.json({
        id: req.params.id,
        username: 'kenny',
      });
    },
  },
  {
    path: '/api/user/list/:id/:type',
    handler: (req, res) => {
      return res.json({
        id: req.params.id,
        type: req.params.type,
      });
    },
  },
  {
    path: '/api/login/account',
    method: 'post',
    handler: (req, res) => {
      const { password, username } = req.body;
      if (password === '888888' && username === 'admin') {
        return res.json({
          status: 'ok',
          code: 0,
          token: 'sdfsdfsdfdsf',
          data: {
            id: 1,
            username: 'kenny',
            sex: 6,
          },
        });
      } else {
        return res.json({ status: 'error', code: 403 });
      }
    },
  },
  {
    method: 'delete',
    path: '/api/user/:id',
    handler: (req, res) => {
      res.send({ status: 'ok', message: '删除成功！' });
    },
  },
];
```

2. Add configuration options in vite.config.js for vite

```js
const mockPlugin = require("vite-plugin-mockit");

module.exports = {
  plugins: [
    mockPlugin({
      entry: "./mock/index.js",
      watchFiles: [], // watch file or dir change refresh mock
      watchOptions: {}, //extension option from chokidar option
      ignore: /_test/ // ignore change, support function or regex
      //   debug: true, // debug log
      disable: false // default false
    })
  ]
};

```

3. test mock with curl

```bash
➜  ~ curl -X GET http://127.0.0.1:4000/api/user
{"id":1,"username":"kenny","sex":6}
➜  ~ curl -X GET http://127.0.0.1:4000/api/user/list
[{"id":1,"username":"kenny","sex":6},{"id":2,"username":"kenny","sex":6}]
➜  ~ curl -H "Accept: application/json" -H "Content-type: application/json" -X POST -d '{"username":"admin","password":"888888"}' http://127.0.0.1:4000/api/login/account
{"status":"ok","code":0,"token":"sdfsdfsdfdsf","data":{"id":1,"username":"kenny","sex":6}}
➜  ~ curl -X DELETE http://127.0.0.1:4000/api/user/88
{"status":"ok","message":"delete success!"}
```

## Options

### entry

mock config entry，The default value is./mock/index.js.

### watchFiles

watch file or dir change refresh mock, include default entry and entry file directory

### watchOptions

extension option from chokidar option

### ignore

ignore file change, support function or regex, It is used to prevent refresh

### debug

Whether to turn on local debugging information，The default value is false

### disable

The plugin will only work in a development environment , if you want to disable it, set disable to true, The default value is false
