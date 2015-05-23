var listing = require('./lib/listing.js'),
    mapping = require('./lib/mapping.js');

/*----------------------------------------------------------------------------*/

/**
 * Converts `func` of `name` to an auto-curried iteratee-first version. If `name`
 * is an object the methods on it will be converted and the object returned.
 *
 * @param {string} name The name of the function to wrap.
 * @param {Function} func The function to wrap.
 * @returns {Function|Object} Returns the new converted function or object of
 *  converted functions.
 */
function convert(name, func) {
  if (!func) {
    func = name;
    name = null;
  }
  if (func == null) {
    throw new TypeError;
  }
  var isLib = typeof func.VERSION == 'string';

  var _ = isLib ? func : {
    'ary': require('lodash-compat/function/ary'),
    'callback': require('lodash-compat/utility/callback'),
    'curry': require('lodash-compat/function/curry'),
    'each': require('lodash-compat/internal/arrayEach'),
    'rearg': require('lodash-compat/function/rearg')
  };

  var ary = _.ary,
      curry = _.curry,
      each = _.each,
      rearg = _.rearg;

  var wrappers = {
    'callback': function(callback) {
      return function(func, thisArg, argCount) {
        argCount = argCount > 2 ? (argCount - 2) : 1;
        return ary(callback(func, thisArg), argCount);
      };
    },
    'runInContext': function(runInContext) {
      return function(context) {
        return convert(runInContext(context));
      };
    }
  };

  var wrap = function(name, func) {
    var wrapper = wrappers[name];
    if (wrapper) {
      return wrapper(func);
    }
    var result;
    each(listing.caps, function(cap) {
      each(mapping.aryMethodMap[cap], function(otherName) {
        if (name == otherName) {
          result = (cap > 1 && !mapping.skipReargMap[name])
            ? rearg(func, mapping.aryReargMap[cap])
            : func;

          return !(result = curry(ary(result, cap), cap));
        }
      });
      return !result;
    });
    return result || func;
  };

  if (!isLib) {
    return wrap(name, func);
  }
  // Disable custom `_.indexOf` use by these methods.
  _.mixin({
    'difference': require('lodash-compat/array/difference'),
    'includes': require('lodash-compat/collection/includes'),
    'intersection': require('lodash-compat/array/intersection'),
    'omit': require('lodash-compat/object/omit'),
    'pull': require('lodash-compat/array/pull'),
    'union': require('lodash-compat/array/union'),
    'uniq': require('lodash-compat/array/uniq'),
    'without': require('lodash-compat/array/without'),
    'xor': require('lodash-compat/array/xor')
  });

  var pairs = [];
  each(listing.caps, function(cap) {
    // Iterate over methods for the current ary cap.
    each(mapping.aryMethodMap[cap], function(name) {
      var func = _[mapping.keyMap[name] || name];
      if (func) {
        // Wrap the lodash method and its aliases.
        var wrapped = wrap(name, func);
        pairs.push([name, wrapped]);
        each(mapping.aliasMap[name], function(alias) { pairs.push([alias, wrapped]); });
      }
    });
  });

  // Assign to `_` leaving `_.prototype` unchanged to allow chaining.
  _.callback = wrappers.callback(_.callback);
  _.iteratee = _.callback;
  _.runInContext = wrappers.runInContext(_.runInContext);

  each(pairs, function(pair) { _[pair[0]] = pair[1]; });
  return _;
}

module.exports = convert;
