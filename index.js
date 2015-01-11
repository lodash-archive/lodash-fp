var _ = require('lodash-compat').runInContext(),
    ary = _.ary,
    callback = _.callback;

/** Used to map method names to their aliases. */
var aliasMap = {
  'assign': ['extend'],
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
var aryMap = {
  1: (
    'clone,create,flatten,invert,max,memoize,min,mixin,sample,template,trim,' +
    'trimLeft,trimRight,uniq,words').split(','),
  2: (
    'after,ary,assign,at,before,bind,bindKey,chunk,countBy,debounce,defaults,' +
    'delay,difference,drop,dropRight,dropRightWhile,dropWhile,endsWith,every,' +
    'filter,find,findIndex,findKey,findLast,findLastIndex,findLastKey,findWhere,' +
    'forEach,forEachRight,forIn,forInRight,forOwn,forOwn,forOwnRight,groupBy,' +
    'has,includes,indexBy,indexOf,intersection,invoke,isEqual,isMatch,lastIndexOf,' +
    'map,mapValues,maxBy,merge,minBy,omit,pad,padLeft,padRight,parseInt,partition,' +
    'pick,pluck,pull,pullAt,random,range,rearg,reject,remove,repeat,result,' +
    'runInContext,some,sortBy,sortByAll,sortedIndex,sortedLastIndex,startsWith,' +
    'take,takeRight,takeRightWhile,takeWhile,throttle,times,trunc,union,uniqBy,' +
    'uniqueId,where,without,wrap,xor,zip,zipObject').split(','),
  3:
    'slice,reduce,reduceRight,transform'.split(',')
};

/** Used to map keys to other keys. */
var keyMap = {
  'maxBy': 'max',
  'minBy': 'min',
  'uniqBy': 'uniq'
};

/** Used to track methods that skip `_.rearg`. */
var skipReargMap = {
  'range': true
};

/** The source object to transform and assign to `_`. */
var source = {
  'callback': function(func, thisArg, argCount) {
    argCount = argCount > 2 ? (argCount - 2) : 1;
    return ary(callback(func, thisArg), argCount);
  }
};

source.iteratee = source.callback;

/*----------------------------------------------------------------------------*/

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

// Assign to `_` leaving `_.prototype` unchanged to allow chaining.
module.exports = _.assign(_, _.transform(aryMap, function(source, names, cap) {
  _.each(names, function(name) {
    var key = keyMap[name] || name,
        func = _[key];

    if (cap > 1 && !skipReargMap[name]) {
      func = _.rearg(func, cap > 2 ? [2, 0, 1] : [1, 0]);
    }
    func = _(func).ary(cap).curry(cap).value();
    _.each(_.union([name], aliasMap[name]), function(key) {
      source[key] = func;
    });
  });
}, source));
