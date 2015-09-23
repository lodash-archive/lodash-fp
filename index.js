var lodash = require('lodash').runInContext();

var util = {
  'ary': require('lodash/function/ary'),
  'curry': require('lodash/function/curry'),
  'difference': require('lodash/array/difference'),
  'forEach': require('lodash/internal/arrayEach'),
  'includes': require('lodash/collection/includes'),
  'intersection': require('lodash/array/intersection'),
  'isFunction': require('lodash/lang/isFunction'),
  'iteratee': require('lodash/utility/iteratee'),
  'keys': require('lodash/internal/baseKeys'),
  'omit': require('lodash/object/omit'),
  'pull': require('lodash/array/pull'),
  'rearg': require('lodash/function/rearg'),
  'union': require('lodash/array/union'),
  'uniq': require('lodash/array/uniq'),
  'uniqBy': require('lodash/array/uniqBy'),
  'without': require('lodash/array/without'),
  'xor': require('lodash/array/xor')
};

module.exports = require('./convert')(util, lodash);
