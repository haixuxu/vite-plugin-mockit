module.exports = function(watchFile) {
  delete require.cache[require.resolve(watchFile)];
  return require(watchFile);
};
