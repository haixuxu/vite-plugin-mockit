# vite-plugin-mockit

A package for local mock data functionality

- Simple writing(koa.js style)
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

```js
module.exports = {
  'GET /api/user': {
    username: 'admin',
    sex: 5,
  },
  'GET /api/list': function(ctx, next) {
    let query = ctx.query || {};
    ctx.body = {
      limit: query.limit,
      offset: query.offset,
      list: [
        {
          username: 'admin1',
          sex: 1,
        },
        {
          username: 'admin2',
          sex: 0,
        },
      ],
    };
  },
  'GET /repos/hello': (ctx, next) => {
    ctx.body = {
      text: 'this is from mock server',
    };
  },
  'GET /api/userinfo/:id': (ctx, next) => {
    ctx.body = {
      id: ctx.params.id,
      username: 'kenny',
    };
  },
  'GET /api/user/list/:id/:type': (ctx, next) => {
    ctx.body = {
      id: ctx.params.id,
      type: ctx.params.type,
    };
  },

  'POST /api/login/account': (ctx, next) => {
    const { password, username } = ctx.request.body;
    if (password === '888888' && username === 'admin') {
      ctx.body = {
        status: 'ok',
        code: 0,
        token: 'sdfsdfsdfdsf',
        data: {
          id: 1,
          username: 'kenny',
          sex: 6,
        },
      };
    } else {
      ctx.body = {
        status: 'error',
        code: 403,
      };
    }
  },
  'DELETE /api/user/:id': (ctx, next) => {
    ctx.body = { status: 'ok', message: '删除成功！', id: ctx.params.id };
  },
};

```

2. Add configuration options in vite.config.js for vite

```js
const mockPlugin = require("./vite-plugin-mockit");

module.exports = {
  plugins: [
    mockPlugin({
      entry: "./mock/index.js",
      watchFiles: [], // watch file or dir change refresh mock
      ignoreFiles: [], // ignore file or dir change
      //   debug: true, // debug log
      localEnabled: process.env.NODE_ENV === "development"
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

mock config entry，The default value is./mock/index.js. The file is compiled according to the project's Babel configuration

### debug

Whether to turn on local debugging information，The default value is false

### localEnabled

The plugin will only work in a development environment , if you want to disable it, set disable to true, The default value is false