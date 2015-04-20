'use strict';

/** Used to map method names to their aliases. */
var aliasMap = {
  'assign': ['extend'],
  'callback': ['iteratee'],
  'every': ['all'],
  'filter': ['select'],
  'find': ['detect'],
  'first': ['head'],
  'forEach': ['each'],
  'forEachRight': ['eachRight'],
  'includes': ['contains', 'include'],
  'map': ['collect'],
  'reduce': ['foldl', 'inject'],
  'reduceRight': ['foldr'],
  'rest': ['tail'],
  'some': ['any'],
  'uniq': ['unique'],
  'zipObject': ['object']
};

/** Used to map ary to method names. */
var aryMethodMap = {
  1: (
    'attempt,clone,create,curry,flatten,invert,max,memoize,method,methodOf,min,' +
    'mixin,restParam,sample,sum,template,trim,trimLeft,trimRight,uniq,words').split(','),
  2: (
    'add,after,ary,assign,at,before,bind,bindKey,chunk,countBy,curryN,debounce,' +
    'defaults,delay,difference,drop,dropRight,dropRightWhile,dropWhile,endsWith,' +
    'every,filter,find,findIndex,findKey,findLast,findLastIndex,findLastKey,' +
    'findWhere,forEach,forEachRight,forIn,forInRight,forOwn,forOwnRight,groupBy,' +
    'has,includes,indexBy,indexOf,intersection,invoke,isEqual,isMatch,lastIndexOf,' +
    'map,mapKeys,mapValues,matchesProperty,maxBy,merge,minBy,omit,pad,padLeft,' +
    'padRight,parseInt,partition,pick,pluck,pull,pullAt,random,range,rearg,reject,' +
    'remove,repeat,result,set,some,sortBy,sortByAll,sortedIndex,sortedLastIndex,' +
    'startsWith,sumBy,take,takeRight,takeRightWhile,takeWhile,throttle,times,trunc,' +
    'union,uniqBy,uniqueId,unzipWith,where,without,wrap,xor,zip,zipObject').split(','),
  3:
    'slice,sortByOrder,reduce,reduceRight,transform,zipWith'.split(','),
  4:
    ['fill', 'inRange']
};

/** Used to map ary to rearg configs. */
var aryReargMap = {
  2: [1, 0],
  3: [2, 0, 1],
  4: [3, 2, 0, 1]
};

/** Used to track methods that accept an iteratee. */
var iterateeMap = {
  2: (
    'dropRightWhile,dropWhile,every,filter,find,findIndex,findKey,findLast,' +
    'findLastIndex,findLastKey,forEach,forEachRight,forIn,forInRight,forOwn,' +
    'forOwnRight,groupBy,indexBy,map,mapValues,maxBy,minBy,omit,partition,pick,' +
    'remove,some,sortBy,sortByAll,sumBy,takeRightWhile,takeWhile,times,uniqBy,').split(','),
  3:
    'sortByOrder,reduce,reduceRight,transform'.split(',')
};

/** Used to map keys to other keys. */
var keyMap = {
  'curryN': 'curry',
  'maxBy': 'max',
  'minBy': 'min',
  'sumBy': 'sum',
  'uniqBy': 'uniq'
};

/** Used to track methods that skip `_.rearg`. */
var skipReargMap = {
  'range': true,
  'random': true
};

/** Used to iterate `aryMethodMap` keys */
var caps = ['1', '2', '3', '4'];

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
  var type = typeof func,
      isLib = type == 'function' && typeof func.VERSION == 'string',
      isObj = func != null && (type == 'function' || type == 'object');

  if (name == null && !isObj) {
    throw new TypeError;
  }
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
    each(caps, function(cap) {
      each(aryMethodMap[cap], function(otherName) {
        if (name == otherName) {
          result = (cap > 1 && !skipReargMap[name])
            ? rearg(func, aryReargMap[cap])
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
  each(caps, function(cap) {
    // Iterate over methods for the current ary cap.
    each(aryMethodMap[cap], function(name) {
      var func = _[keyMap[name] || name];
      if (func) {
        // Wrap the lodash method and its aliases.
        var wrapped = wrap(name, func);
        pairs.push([name, wrapped]);
        each(aliasMap[name], function(alias) { pairs.push([alias, wrapped]); });
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
