const utils = require('./utils');
/**
 * 转换旧的mock配置
 * @param {Object}} mockModule
 */
module.exports = function (oldMockObj) {
  return Object.keys(oldMockObj).map((key) => {
    let result = utils.parseKey(key);
    let method = result.method;
    let handler = oldMockObj[key];
    let routeConfig = { path: result.path, method };
    if (typeof handler === 'function') {
      routeConfig.handler = handler;
    } else {
      routeConfig.handler = (req, res) => res.json(oldMockObj[key]);
    }
    return routeConfig;
  });
};
