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
    'attempt,clone,create,flatten,invert,max,memoize,min,mixin,sample,template,' +
    'trim,trimLeft,trimRight,uniq,words').split(','),
  2: (
    'after,ary,assign,at,before,bind,bindKey,chunk,countBy,debounce,defaults,' +
    'delay,difference,drop,dropRight,dropRightWhile,dropWhile,endsWith,every,' +
    'filter,find,findIndex,findKey,findLast,findLastIndex,findLastKey,findWhere,' +
    'forEach,forEachRight,forIn,forInRight,forOwn,forOwn,forOwnRight,groupBy,' +
    'has,includes,indexBy,indexOf,intersection,invoke,isEqual,isMatch,lastIndexOf,' +
    'map,mapValues,matchesProperty,maxBy,merge,minBy,omit,pad,padLeft,padRight,' +
    'parseInt,partition,pick,pluck,pull,pullAt,random,range,rearg,reject,remove,' +
    'repeat,result,runInContext,some,sortBy,sortByAll,sortedIndex,sortedLastIndex,' +
    'startsWith,take,takeRight,takeRightWhile,takeWhile,throttle,times,trunc,' +
    'union,uniqBy,uniqueId,where,without,wrap,xor,zip,zipObject').split(','),
  3:
    'slice,reduce,reduceRight,transform'.split(','),
  4:
    ['fill', 'inRange']
};

/** Used to map ary to rearg configs. */
var aryReargMap = {
  2: [1, 0],
  3: [2, 0, 1],
  4: [3, 2, 0, 1]
};

/** Used to map keys to other keys. */
var keyMap = {
  'maxBy': 'max',
  'minBy': 'min',
  'uniqBy': 'uniq'
};

/** Used to track methods that skip `_.rearg`. */
var skipReargMap = {
  'range': true,
  'random': true
};

/*----------------------------------------------------------------------------*/

/**
 * Wraps `func` of `name` to create an auto-curried iteratee-first version. If
 * `name` is an object the methods on it will be wrapped and the object returned.
 *
 * @param {string} name The name of the function to wrap.
 * @param {Function} func The function to wrap.
 * @returns {Function|Object} Returns the wrapped function or object of wrapped functions.
 */
function mixin(name, func) {
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
    'rearg': require('lodash-compat/function/rearg')
  };

  var wrap = function(name, func) {
    var cap = 0,
        capLimit = 5;

    while (++cap < capLimit) {
      var names = aryMethodMap[cap],
          nameIndex = -1,
          namesLength = names.length;

      while (++nameIndex < namesLength) {
        if (names[nameIndex] === name) {
          if (cap > 1 && !skipReargMap[name]) {
            func = _.rearg(func, aryReargMap[cap]);
          }
          return _.curry(_.ary(func, cap), cap);
        }
      }
    }
    return func;
  };

  // Disable custom `_.indexOf` use by these methods.
  if (isLib) {
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
  }
  if (!(isLib || isObj)) {
    return wrap(name, func);
  }
  var ary = _.ary,
      callback = _.callback,
      cap = 0,
      capLimit = 5,
      pairs = [];

  pairs.push(['callback', function(func, thisArg, argCount) {
    argCount = argCount > 2 ? (argCount - 2) : 1;
    return ary(callback(func, thisArg), argCount);
  }]);

  pairs.push(['iteratee', pairs[0][1]]);

  while (++cap < capLimit) {
    // Iterate over methods for the current ary cap.
    var names = aryMethodMap[cap],
        nameIndex = -1,
        namesLength = names.length;

    while (++nameIndex < namesLength) {
      var otherName = names[nameIndex],
          fn = _[keyMap[otherName] || otherName];

      if (fn) {
        // Wrap the lodash method and its aliases.
        var wrapped = wrap(otherName, fn),
            allIndex = -1,
            allNames = [otherName].concat(aliasMap[otherName] || []),
            allLength = allNames.length;

        while (++allIndex < allLength) {
          pairs.push([allNames[allIndex], wrapped]);
        }
      }
    }
  }
  var pairsIndex = -1,
      pairsLength = pairs.length;

  // Assign to `_` leaving `_.prototype` unchanged to allow chaining.
  while (++pairsIndex < pairsLength) {
    var pair = pairs[pairsIndex];
    _[pair[0]] = pair[1];
  }
  return _;
}

module.exports = mixin;
