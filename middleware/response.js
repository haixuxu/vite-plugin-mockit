const res = {};
module.exports = res;

res.status = function (code) {
  this.statusCode = code;
  return this;
};
res.send = function send(body) {
  var chunk = body;
  var bodyType = typeof body;
  var encoding = 'utf-8';

  if (!/(string|boolean|number)/.test(bodyType)) {
    chunk = JSON.stringify(body);
  }
  // populate Content-Length
  var len;
  if (chunk !== undefined) {
    if (Buffer.isBuffer(chunk)) {
      // get length of Buffer
      len = chunk.length;
    } else {
      // convert chunk to Buffer and calculate
      chunk = Buffer.from(chunk, encoding);
      encoding = undefined;
      len = chunk.length;
    }
    this.set('Content-Length', len);
  }
  // content-type
  if (!this.get('Content-Type')) {
    this.set('Content-Type', 'application/json');
  }
  // respond
  this.end(chunk, 'utf8');
  return this;
};

res.json = function (obj) {
  var val = obj;
  // settings
  var body = JSON.stringify(val);
  return this.send(body);
};

/**
 * Set header `field` to `val`, or pass
 * an object of header fields.
 *
 * Examples:
 *
 *    res.set('Foo', ['bar', 'baz']);
 *    res.set('Accept', 'application/json');
 *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
 *
 * Aliased as `res.header()`.
 *
 * @param {String|Object} field
 * @param {String|Array} val
 * @return {ServerResponse} for chaining
 * @public
 */

res.set = res.header = function header(field, val) {
  if (arguments.length === 2) {
    var value = Array.isArray(val) ? val.map(String) : String(val);

    // add charset to content-type
    if (field.toLowerCase() === 'content-type') {
      if (Array.isArray(value)) {
        throw new TypeError('Content-Type cannot be set to an Array');
      }
    }

    this.setHeader(field, value);
  } else {
    for (var key in field) {
      this.set(key, field[key]);
    }
  }
  return this;
};

/**
 * Get value for header `field`.
 *
 * @param {String} field
 * @return {String}
 * @public
 */

res.get = function (field) {
  return this.getHeader(field);
};
