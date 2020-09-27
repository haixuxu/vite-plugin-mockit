const path = require('path');
const assert = require('assert');
const request = require('supertest');
const koaBody = require('koa-body');
const Koa = require('koa');
const mockPlugin = require('../lib');

process.chdir(path.resolve(__dirname, '..', './test'));

const entry = path.resolve('./fixtures/entry.js');

const applyPlugin = mockPlugin({ entry });

const app = new Koa();
app.use(koaBody());
applyPlugin.configureServer({ app });

app.use(function(ctx, next) {
  ctx.body = 'is skiped';
});

const server = app.listen(3000);

describe('mock api', function() {
  it('should skip not match', function(done) {
    request(server)
      .get('/noapi/user')
      .expect(200, 'is skiped', done);
  });

  it('should can mock object vlaue', function(done) {
    request(server)
      .get('/api/user')
      .expect(
        200,
        {
          username: 'admin',
          sex: 5,
        },
        done,
      );
  });
  it('should can mock with query params', function(done) {
    request(server)
      .get('/api/list?limit=10&offset=0')
      .expect(
        200,
        {
          limit: 10,
          offset: 0,
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
        },
        done,
      );
  });
  it('should can mock function', function(done) {
    request(server)
      .get('/repos/hello')
      .expect(200, { text: 'this is from mock server' }, done);
  });

  it('should can mock with params', function(done) {
    let id = Math.random()
      .toString(36)
      .substr(3);
    request(server)
      .get('/api/userinfo/' + id)
      .expect(200, { id: id, username: 'kenny' }, done);
  });
  it('should can mock with multiple params', function(done) {
    let id = Math.random()
      .toString(36)
      .substr(4);
    let type = Math.random()
      .toString(36)
      .substr(5);
    request(server)
      .get('/api/user/list/' + id + '/' + type)
      .expect(200, { id: id, type: type }, done);
  });
  it('should can accept POST params', function(done) {
    request(server)
      .post('/api/login/account')
      .send({ username: 'admin', password: '888888' })
      .expect(
        200,
        {
          status: 'ok',
          code: 0,
          token: 'sdfsdfsdfdsf',
          data: {
            id: 1,
            username: 'kenny',
            sex: 6,
          },
        },
        done,
      );
  });
  it('should can accept DELETE params', function(done) {
    request(server)
      .delete('/api/user/122')
      .expect(200, { status: 'ok', message: '删除成功！', id: 122 }, done);
  });

  after(function() {
    server.close();
  });
});
