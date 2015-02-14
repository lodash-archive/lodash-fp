var _ = require('lodash-compat'),
    fp = require('../index.js');

global.QUnit = require('qunitjs');
require('qunit-extras').runInContext(global);

/*----------------------------------------------------------------------------*/

/** Used for native method references. */
var arrayProto = Array.prototype;

/** Method and object shortcuts. */
var slice = arrayProto.slice;

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
    ['fill']
};

/*----------------------------------------------------------------------------*/

QUnit.module('method aliases');

(function() {
  test('should have correct aliases', 1, function() {
    var actual = _.transform(aliasMap, function(result, aliases, methodName) {
      var func = fp[methodName];
      _.each(aliases, function(alias) {
        result.push(fp[alias] === func);
      });
    }, []);

    ok(_.every(actual));
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('method ary caps');

(function() {
  test('should have a cap of 1', 1, function() {
    var exceptions = ['memoize', 'mixin', 'template'],
        expected = _.map(aryMethodMap[1], _.constant(true));

    var actual = _.map(aryMethodMap[1], function(methodName) {
      var arg = methodName == 'memoize' ? _.noop : '',
          result = fp[methodName](arg),
          type = typeof result;

      return _.includes(exceptions, methodName)
        ? type == 'function'
        : type != 'function';
    });

    deepEqual(actual, expected);
  });

  test('should have a cap of 2', 1, function() {
    var exceptions = ['after', 'ary', 'before', 'bind', 'bindKey', 'debounce', 'delay', 'matchesProperty', 'rearg', 'runInContext', 'throttle', 'wrap'],
        expected = _.map(aryMethodMap[2], _.constant(true));

    var actual = _.map(aryMethodMap[2], function(methodName) {
      var isException = _.includes(exceptions, methodName),
          arg = isException ? [_.noop, _.noop] : [1, []],
          result = fp[methodName](arg[0])(arg[1]),
          type = typeof result;

      return (isException && methodName != 'delay')
        ? type == 'function'
        : type != 'function';
    });

    deepEqual(actual, expected);
  });

  test('should have a cap of 3', 1, function() {
    var expected = _.map(aryMethodMap[3], _.constant(true));

    var actual = _.map(aryMethodMap[3], function(methodName) {
      var result = fp[methodName](0)(1)([]);
      return typeof result != 'function';
    });

    deepEqual(actual, expected);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('methods that use `indexOf`');

(function() {
  test('should still work with a custom `_.indexOf`', 9, function() {
    var array = ['a', 'b', 'c'],
        other = ['b', 'b', 'd'],
        object = { 'a': 1, 'b': 2, 'c': 2 },
        actual = fp.difference(other, array);

    deepEqual(actual, ['a', 'c'], 'fp.difference');

    actual = fp.includes('b', array);
    strictEqual(actual, true, 'fp.includes');

    actual = fp.intersection(other, array);
    deepEqual(actual, ['b'], 'fp.intersection');

    actual = fp.omit(other, object);
    deepEqual(actual, { 'a': 1, 'c': 2 }, 'fp.omit');

    actual = fp.union(other, array);
    deepEqual(actual, ['a', 'b', 'c', 'd'], 'fp.union');

    actual = fp.uniq(other);
    deepEqual(actual, ['b', 'd'], 'fp.uniq');

    actual = fp.without('b', array);
    deepEqual(actual, ['a', 'c'], 'fp.without');

    actual = fp.xor(other, array);
    deepEqual(actual, ['a', 'c', 'd'], 'fp.xor');

    actual = fp.pull('b', array);
    deepEqual(array, ['a', 'c'], 'fp.pull');
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.range');

(function() {
  test('should have an argument order of `start` then `end`', 1, function() {
    deepEqual(fp.range(1)(4), [1, 2, 3]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.random');

(function() {
  var array = Array(1000);

  test('should support a `min` and `max` argument', 1, function() {
    var min = 5,
        max = 10;

    ok(_.some(array, function() {
      var result = fp.random(min)(max);
      return result >= min && result <= max;
    }));
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.maxBy and fp.minBy');

_.each(['maxBy', 'minBy'], function(methodName, index) {
  var array = [1, 2, 3],
      func = fp[methodName],
      isMax = !index;

  test('`_.' + methodName + '` should work with an `iteratee` argument', 1, function() {
    var actual = func(function(num) {
      return -num;
    })(array);

    strictEqual(actual, isMax ? 1 : 3);
  });

  test('`_.' + methodName + '` should provide the correct `iteratee` arguments', 1, function() {
    var args;

    func(function() {
      args || (args = slice.call(arguments));
    })(array);

    deepEqual(args, [1]);
  });
});

/*----------------------------------------------------------------------------*/

QUnit.module('fp.uniqBy');

(function() {
  var objects = [{ 'a': 2 }, { 'a': 3 }, { 'a': 1 }, { 'a': 2 }, { 'a': 3 }, { 'a': 1 }];

  test('should work with an `iteratee` argument', 1, function() {
    var expected = objects.slice(0, 3);

    var actual = fp.uniqBy(function(object) {
      return object.a;
    })(objects);

    deepEqual(actual, expected);
  });

  test('should provide the correct `iteratee` arguments', 1, function() {
    var args;

    fp.uniqBy(function() {
      args || (args = slice.call(arguments));
    })(objects);

    deepEqual(args, [objects[0], 0, objects]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.config.asyncRetries = 10;
QUnit.config.hidepassed = true;
QUnit.config.noglobals = true;
QUnit.load();
