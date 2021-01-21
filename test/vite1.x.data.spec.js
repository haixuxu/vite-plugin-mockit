var path = require('path');
var http = require('http');
var assert = require('assert');
var Koa = require('koa');
var koaBody = require('koa-body');
var request = require('supertest');
var koaMock = require('../middleware').koa;

var entryfile = path.resolve(__dirname, './fixtures/data.js');
var mockObj = require(entryfile);

const app = new Koa();
app.use(koaBody());
app.use(koaMock(mockObj)).use(function (ctx, next) {
  ctx.body = 'is skiped';
});

const server = http.createServer(app.callback());

describe('vite1.x mock route list api', function () {
  before(function () {
    process.chdir(path.resolve(__dirname, '..', './test'));
  });

  it('should support old entry', function (done) {
    request(server).get('/api/user').expect(200, { username: 'admin', sex: 5 }, done);
  });

  it('should skip not match', function (done) {
    request(server).get('/noapi/user').expect(200, 'is skiped', done);
  });

  it('should can mock object vlaue', function (done) {
    request(server).get('/api/user').expect(200, { username: 'admin', sex: 5 }, done);
  });
  it('should can mock with query params', function (done) {
    var obj = {
      limit: 10,
      offset: 0,
      list: [
        { username: 'admin1', sex: 1 },
        { username: 'admin2', sex: 0 },
      ],
    };
    request(server).get('/api/list?limit=10&offset=0').expect(200, obj, done);
  });
  it('should can mock function', function (done) {
    request(server).get('/repos/hello').expect(200, { text: 'this is from mock server' }, done);
  });

  it('should can mock with params', function (done) {
    let id = Math.random().toString(36).substr(3);
    request(server)
      .get('/api/userinfo/' + id)
      .expect(200, { id: id, username: 'kenny' }, done);
  });
  it('should can mock with multiple params', function (done) {
    let id = Math.random().toString(36).substr(4);
    let type = Math.random().toString(36).substr(5);
    request(server)
      .get('/api/user/list/' + id + '/' + type)
      .expect(200, { id: id, type: type }, done);
  });
  it('should can accept POST params', function (done) {
    var result = {
      status: 'ok',
      code: 0,
      token: 'sdfsdfsdfdsf',
      data: { id: 1, username: 'kenny', sex: 6 },
    };
    request(server)
      .post('/api/login/account')
      .send({ username: 'admin', password: '888888' })
      .expect(200, result, done);
  });
  it('should can accept DELETE params', function (done) {
    request(server).delete('/api/user/122').expect(200, { status: 'ok', message: '删除成功！' }, done);
  });
});
