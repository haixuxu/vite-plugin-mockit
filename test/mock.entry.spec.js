var path = require('path');
var assert = require('assert');
var connect = require('connect');
var request = require('supertest');
var connectMock = require('../middleware');

var entryfile = path.resolve(__dirname, './fixtures/entry.js');
var mockObj = require(entryfile);

var min = 60 * 1000;

describe('mock entry object api', function () {
  before(function () {
    process.chdir(path.resolve(__dirname, '..', './test'));
  });
  beforeEach(function () {
    //create svn directory if its not already there
  });

  it('should support old entry', function (done) {
    var app = connect().use(connectMock({ entry: entryfile }));

    request(app).get('/api/user').expect(200, { username: 'admin', sex: 5 }, done);
  });

  it('should skip not match', function (done) {
    var app = connect()
      .use(connectMock(mockObj))
      .use(function (req, res, next) {
        res.end('is skiped');
      });
    request(app).get('/noapi/user').expect(200, 'is skiped', done);
  });

  it('should can mock object vlaue', function (done) {
    var app = connect().use(connectMock(mockObj));

    request(app).get('/api/user').expect(200, { username: 'admin', sex: 5 }, done);
  });
  it('should can mock with query params', function (done) {
    var app = connect().use(connectMock(mockObj));
    var obj = {
      limit: 10,
      offset: 0,
      list: [
        { username: 'admin1', sex: 1 },
        { username: 'admin2', sex: 0 },
      ],
    };
    request(app).get('/api/list?limit=10&offset=0').expect(200, obj, done);
  });
  it('should can mock function', function (done) {
    var app = connect().use(connectMock(mockObj));

    request(app).get('/repos/hello').expect(200, { text: 'this is from mock server' }, done);
  });

  it('should can mock with params', function (done) {
    var app = connect().use(connectMock(mockObj));
    let id = Math.random().toString(36).substr(3);
    request(app)
      .get('/api/userinfo/' + id)
      .expect(200, { id: id, username: 'kenny' }, done);
  });
  it('should can mock with multiple params', function (done) {
    var app = connect().use(connectMock(mockObj));
    let id = Math.random().toString(36).substr(4);
    let type = Math.random().toString(36).substr(5);
    request(app)
      .get('/api/user/list/' + id + '/' + type)
      .expect(200, { id: id, type: type }, done);
  });
  it('should can accept POST params', function (done) {
    var app = connect().use(connectMock(mockObj));
    var result = {
      status: 'ok',
      code: 0,
      token: 'sdfsdfsdfdsf',
      data: { id: 1, username: 'kenny', sex: 6 },
    };
    request(app).post('/api/login/account').send({ username: 'admin', password: '888888' }).expect(200, result, done);
  });
  it('should can accept DELETE params', function (done) {
    var app = connect().use(connectMock(mockObj));
    request(app).delete('/api/user/122').expect(200, { status: 'ok', message: '删除成功！' }, done);
  });
});
