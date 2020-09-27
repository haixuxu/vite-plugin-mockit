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
