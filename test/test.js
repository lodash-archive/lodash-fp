var _ = require('lodash-compat'),
    convert = require('../convert.js'),
    fp = require('../index.js'),
    mapping = require('../lib/mapping.js');

global.QUnit = require('qunitjs');
require('qunit-extras').runInContext(global);

/*----------------------------------------------------------------------------*/

/** Used as the size to cover large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/** Used for native method references. */
var arrayProto = Array.prototype;

/** Method and object shortcuts. */
var slice = arrayProto.slice;

/*----------------------------------------------------------------------------*/

QUnit.module('method aliases');

(function() {
  test('should have correct aliases', 1, function() {
    var actual = _.transform(mapping.aliasMap, function(result, aliases, methodName) {
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
    var funcMethods = ['curry', 'memoize', 'method', 'methodOf', 'restParam'],
        exceptions = funcMethods.concat('mixin', 'template'),
        expected = _.map(mapping.aryMethodMap[1], _.constant(true));

    var actual = _.map(mapping.aryMethodMap[1], function(methodName) {
      var arg = _.includes(funcMethods, methodName) ? _.noop : '',
          result = fp[methodName](arg),
          type = typeof result;

      return _.includes(exceptions, methodName)
        ? type == 'function'
        : type != 'function';
    });

    deepEqual(actual, expected);
  });

  test('should have a cap of 2', 1, function() {
    var funcMethods = ['after', 'ary', 'before', 'bind', 'bindKey', 'curryN', 'debounce', 'delay', 'rearg', 'throttle', 'wrap'],
        exceptions = _.without(funcMethods.concat('matchesProperty'), 'delay'),
        expected = _.map(mapping.aryMethodMap[2], _.constant(true));

    var actual = _.map(mapping.aryMethodMap[2], function(methodName) {
      var isException = _.includes(exceptions, methodName),
          arg = _.includes(funcMethods, methodName) ? [methodName == 'curryN' ? 1 : _.noop, _.noop] : [1, []],
          result = fp[methodName](arg[0])(arg[1]),
          type = typeof result;

      return _.includes(exceptions, methodName)
        ? type == 'function'
        : type != 'function';
    });

    deepEqual(actual, expected);
  });

  test('should have a cap of 3', 1, function() {
    var expected = _.map(mapping.aryMethodMap[3], _.constant(true));

    var actual = _.map(mapping.aryMethodMap[3], function(methodName) {
      var result = fp[methodName](0)(1)([]);
      return typeof result != 'function';
    });

    deepEqual(actual, expected);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('methods that use `indexOf`');

(function() {
  test('should work with `fp.indexOf`', 9, function() {
    var array = ['a', 'b', 'c'],
        other = ['b', 'b', 'd'],
        object = { 'a': 1, 'b': 2, 'c': 2 },
        actual = fp.difference(array, other);

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

QUnit.module('fp.callback');

(function() {
  test('should return a callback with capped params', 1, function() {
    var func = fp.callback(function(a, b, c) { return [a, b, c]; }, undefined, 3);
    deepEqual(func(1, 2, 3), [1, undefined, undefined]);
  });

  test('should convert by name', 1, function() {
    var callback = convert('callback', _.callback),
        func = callback(function(a, b, c) { return [a, b, c]; }, undefined, 3);

    deepEqual(func(1, 2, 3), [1, undefined, undefined]);
  });

  test('should be aliased', 1, function() {
    strictEqual(fp.iteratee, fp.callback);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.curry');

(function() {
  test('should accept only a `func` param', 1, function() {
    raises(function() { fp.curry(1, _.noop); }, TypeError);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.curryN');

(function() {
  test('should accept an `arity` param', 1, function() {
    var actual = fp.curryN(1, function(a, b) { return [a, b]; })('a');
    deepEqual(actual, ['a', undefined]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.difference');

(function() {
  test('should return the elements of the first array not included in the second array', 1, function() {
    deepEqual(fp.difference([1, 2])([2, 3]), [1]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.flow and fp.flowRight');

_.each(['flow', 'flowRight'], function(methodName, index) {
  var func = fp[methodName],
      isFlow = methodName == 'flow';

  test('`fp.' + methodName + '` should support shortcut fusion', 6, function() {
    var filterCount,
        mapCount;

    var filter = fp.filter(function(value) { filterCount++; return value % 2 == 0; }),
        map = fp.map(function(value) { mapCount++; return value * value; }),
        take = fp.take(2);

    _.times(2, function(index) {
      var combined = isFlow
        ? func(map, filter, fp.compact, take)
        : func(take, fp.compact, filter, map);

      filterCount = mapCount = 0;

      deepEqual(combined(fp.range(0, LARGE_ARRAY_SIZE)), [4, 16]);
      strictEqual(filterCount, 5, 'filterCount');
      strictEqual(mapCount, 5, 'mapCount');
    });
  });
});

/*----------------------------------------------------------------------------*/

QUnit.module('fp.maxBy and fp.minBy');

_.each(['maxBy', 'minBy'], function(methodName, index) {
  var array = [1, 2, 3],
      func = fp[methodName],
      isMax = !index;

  test('`fp.' + methodName + '` should work with an `iteratee` argument', 1, function() {
    var actual = func(function(num) {
      return -num;
    })(array);

    strictEqual(actual, isMax ? 1 : 3);
  });

  test('`fp.' + methodName + '` should provide the correct `iteratee` arguments', 1, function() {
    var args;

    func(function() {
      args || (args = slice.call(arguments));
    })(array);

    deepEqual(args, [1]);
  });
});

/*----------------------------------------------------------------------------*/

QUnit.module('fp.mixin');

(function() {
  var source = { 'a': _.noop };

  test('should mixin static methods but not prototype methods', 2, function() {
    fp.mixin(source);

    strictEqual(typeof fp.a, 'function');
    ok(!('a' in fp.prototype));

    delete fp.a;
    delete fp.prototype.a;
  });

  test('should not assign inherited `source` methods', 2, function() {
    function Foo() {}
    Foo.prototype.a = _.noop;
    fp.mixin(new Foo);

    ok(!('a' in fp));
    ok(!('a' in fp.prototype));

    delete fp.a;
    delete fp.prototype.a;
  });

  test('should not remove existing prototype methods', 2, function() {
    var each1 = fp.each,
        each2 = fp.prototype.each;

    fp.mixin({ 'each': source.a });

    strictEqual(fp.each, source.a);
    strictEqual(fp.prototype.each, each2);

    fp.each = each1;
    fp.prototype.each = each2;
  });

  test('should convert by name', 3, function() {
    var object = { 'mixin': convert('mixin', _.mixin) };

    function Foo() {}
    Foo.mixin = object.mixin;
    Foo.mixin(source);

    strictEqual(typeof Foo.a, 'function');
    ok(!('a' in Foo.prototype));

    object.mixin(source);
    strictEqual(typeof object.a, 'function');
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

QUnit.module('fp.range');

(function() {
  test('should have an argument order of `start` then `end`', 1, function() {
    deepEqual(fp.range(1)(4), [1, 2, 3]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.runInContext');

(function() {
  test('should return a converted lodash instance', 1, function() {
    ok(typeof fp.runInContext({}).curryN == 'function');
  });

  test('should convert by name', 1, function() {
    var runInContext = convert('runInContext', _.runInContext);
    ok(typeof runInContext({}).curryN == 'function');
  });
}());

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

QUnit.module('fp.zipObject');

(function() {
  test('should accept `keys` and `values` params', 1, function() {
    deepEqual(fp.zipObject(['a', 'b'])([1, 2]), { 'a': 1, 'b': 2 });
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.config.asyncRetries = 10;
QUnit.config.hidepassed = true;
QUnit.config.noglobals = true;
QUnit.load();
