const { EXTENSIONS } = require('rnv/dist/constants');
const config = require('../metro.config');

config.resolver.sourceExts = EXTENSIONS.kaios;
module.exports = config;
