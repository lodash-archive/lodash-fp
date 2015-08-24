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
  var isLib = name == null && typeof func.VERSION == 'string';

  var _ = isLib ? func : {
    'ary': require('lodash/function/ary'),
    'curry': require('lodash/function/curry'),
    'each': require('lodash/internal/arrayEach'),
    'isFunction': require('lodash/lang/isFunction'),
    'iteratee': require('lodash/utility/iteratee'),
    'keys': require('lodash/internal/baseKeys'),
    'rearg': require('lodash/function/rearg')
  };

  var ary = _.ary,
      curry = _.curry,
      each = _.each,
      isFunction = _.isFunction,
      keys = _.keys,
      rearg = _.rearg;

  var baseAry = function(func, n) {
    return function() {
      var args = arguments,
          length = Math.min(args.length, n);

      switch (length) {
        case 1: return func(args[0]);
        case 2: return func(args[0], args[1]);
      }
      args = Array(length);
      while (length--) {
        args[length] = arguments[length];
      }
      return func.apply(undefined, args);
    };
  };

  var iterateeAry = function(func, n) {
    return function() {
      var length = arguments.length,
          args = Array(length);

      while (length--) {
        args[length] = arguments[length];
      }
      args[0] = baseAry(args[0], n);
      return func.apply(undefined, args);
    };
  };

  var wrappers = {
    'iteratee': function(iteratee) {
      return function(func, arity) {
        arity = arity > 2 ? (arity - 2) : 1;
        func = iteratee(func);
        var length = func.length;
        return length <= arity ? func : baseAry(func, arity);
      };
    },
    'mixin': function(mixin) {
      return function(source) {
        var func = this;
        if (!isFunction(func)) {
          return mixin(func, source);
        }
        var methods = [],
            methodNames = [];

        each(keys(source), function(key) {
          var value = source[key];
          if (isFunction(value)) {
            methodNames.push(key);
            methods.push(func.prototype[key]);
          }
        });

        mixin(func, source);

        each(methodNames, function(methodName, index) {
          var method = methods[index];
          if (isFunction(method)) {
            func.prototype[methodName] = method;
          } else {
            delete func.prototype[methodName];
          }
        });
        return func;
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
          result = ary(func, cap);
          if (cap > 1 && !mapping.skipReargMap[name]) {
            result = rearg(result, mapping.aryReargMap[cap]);
          }
          var n = !isLib && mapping.aryIterateeMap[name];
          if (n) {
            result = iterateeAry(result, n);
          }
          return !(result = curry(result, cap));
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
  _.iteratee = wrappers.iteratee(_.iteratee);
  _.mixin = wrappers.mixin(_.mixin);
  _.runInContext = wrappers.runInContext(_.runInContext);

  each(pairs, function(pair) { _[pair[0]] = pair[1]; });
  return _;
}

module.exports = convert;
