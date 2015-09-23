var baseConvert = require('./baseConvert.js');

/*----------------------------------------------------------------------------*/

/**
 * Converts `lodash` to an auto-curried iteratee-first data-last version.
 *
 * @param {Function} lodash The lodash function.
 * @returns {Function} Returns the new converted lodash function.
 */
function bowerConvert(lodash) {
  return baseConvert(lodash, lodash);
}

module.exports = bowerConvert;
