var listing = require('./lib/listing.js'),
    mapping = require('./lib/mapping.js');

/*----------------------------------------------------------------------------*/

/**
 * Converts `func` of `name` to an auto-curried iteratee-first version. If `name`
 * is an object the methods on it will be converted and the object returned.
 *
 * @param {Function} lodash The lodash function.
 * @param {string} name The name of the function to wrap.
 * @param {Function} func The function to wrap.
 * @returns {Function|Object} Returns the new converted object.
 */
function convert(lodash, name, func) {
  if (!func) {
    func = name;
    name = null;
  }
  if (func == null) {
    throw new TypeError;
  }
  var ary = lodash.ary,
      curry = lodash.curry,
      each = lodash.each,
      isFunction = lodash.isFunction,
      keys = lodash.keys,
      rearg = lodash.rearg;

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
        return convert(lodash, runInContext(context));
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
          if (cap > 1) {
            result = curry(result, cap);
          }
          return false;
        }
      });
      return !result;
    });
    return result || func;
  };

  var isLib = name == null && typeof func.VERSION == 'string';
  if (!isLib) {
    return wrap(name, func);
  }
  // Disable custom `_.indexOf` use by these methods.
  var _ = func;
  _.mixin({
    'difference': lodash.difference,
    'includes': lodash.includes,
    'intersection': lodash.intersection,
    'omit': lodash.omit,
    'pull': lodash.pull,
    'union': lodash.union,
    'uniq': lodash.uniq,
    'uniqBy': lodash.uniqBy,
    'without': lodash.without,
    'xor': lodash.xor
  });

  // Iterate over methods for the current ary cap.
  var pairs = [];
  each(listing.caps, function(cap) {
    each(mapping.aryMethodMap[cap], function(name) {
      var func = _[mapping.keyMap[name] || name];
      if (func) {
        // Wrap the lodash method and its aliases.
        var wrapped = wrap(name, func);
        pairs.push([name, wrapped]);
        each(mapping.aliasMap[name] || [], function(alias) { pairs.push([alias, wrapped]); });
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
