var lodash = require('lodash').runInContext();

module.exports = require('./convert')(lodash, lodash.assign(lodash, {
  'difference': require('lodash/array/difference'),
  'includes': require('lodash/collection/includes'),
  'intersection': require('lodash/array/intersection'),
  'omit': require('lodash/object/omit'),
  'pull': require('lodash/array/pull'),
  'union': require('lodash/array/union'),
  'uniq': require('lodash/array/uniq'),
  'uniqBy': require('lodash/array/uniqBy'),
  'without': require('lodash/array/without'),
  'xor': require('lodash/array/xor')
}));
