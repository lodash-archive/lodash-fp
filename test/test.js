var _ = require('lodash'),
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
  QUnit.test('should have correct aliases', function(assert) {
    assert.expect(1);

    var actual = _.transform(mapping.aliasMap, function(result, aliases, methodName) {
      var func = fp[methodName];
      _.each(aliases, function(alias) {
        result.push(fp[alias] === func);
      });
    }, []);

    assert.ok(_.every(actual));
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('method ary caps');

(function() {
  QUnit.test('should have a cap of 1', function(assert) {
    assert.expect(1);

    var funcMethods = ['curry', 'memoize', 'method', 'methodOf', 'restParam'],
        exceptions = funcMethods.concat('mixin', 'template'),
        expected = _.map(mapping.aryMethodMap[1], _.constant(true));

    var actual = _.map(mapping.aryMethodMap[1], function(methodName) {
      var arg = _.includes(funcMethods, methodName) ? _.noop : 1,
          result = _.attempt(function() { return fp[methodName](arg); });

      if (_.includes(exceptions, methodName)
            ? typeof result == 'function'
            : typeof result != 'function'
          ) {
        return true;
      }
      console.log(methodName, result);
      return false;
    });

    assert.deepEqual(actual, expected);
  });

  QUnit.test('should have a cap of 2', function(assert) {
    assert.expect(1);

    var funcMethods = [
      'after', 'ary', 'before', 'bind', 'bindKey', 'cloneDeepWith', 'cloneWith',
      'curryN', 'debounce', 'delay', 'rearg', 'throttle', 'wrap'
    ];

    var exceptions = _.difference(funcMethods.concat('matchesProperty'), ['cloneDeepWith', 'cloneWith', 'delay']),
        expected = _.map(mapping.aryMethodMap[2], _.constant(true));

    var actual = _.map(mapping.aryMethodMap[2], function(methodName) {
      var args = _.includes(funcMethods, methodName) ? [methodName == 'curryN' ? 1 : _.noop, _.noop] : [1, []],
          result = _.attempt(function() { return fp[methodName](args[0])(args[1]); });

      if (_.includes(exceptions, methodName)
            ? typeof result == 'function'
            : typeof result != 'function'
          ) {
        return true;
      }
      console.log(methodName, result);
      return false;
    });

    assert.deepEqual(actual, expected);
  });

  QUnit.test('should have a cap of 3', function(assert) {
    assert.expect(1);

    var funcMethods = [
      'assignWith', 'extendWith', 'isEqualWith', 'isMatchWith', 'omitBy',
      'pickBy', 'reduce', 'reduceRight', 'transform', 'zipWith'
    ];

    var expected = _.map(mapping.aryMethodMap[3], _.constant(true));

    var actual = _.map(mapping.aryMethodMap[3], function(methodName) {
      var args = _.includes(funcMethods, methodName) ? [_.noop, 0, 1] : [0, 1, []],
          result = _.attempt(function() { return fp[methodName](args[0])(args[1])(args[2]); });

      if (typeof result != 'function') {
        return true;
      }
      console.log(methodName, result);
      return false;
    });

    assert.deepEqual(actual, expected);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('methods that use `indexOf`');

(function() {
  QUnit.test('should work with `fp.indexOf`', function(assert) {
    assert.expect(10);

    var array = ['a', 'b', 'c'],
        other = ['b', 'b', 'd'],
        object = { 'a': 1, 'b': 2, 'c': 2 },
        actual = fp.difference(array, other);

    assert.deepEqual(actual, ['a', 'c'], 'fp.difference');

    actual = fp.includes('b', array);
    assert.strictEqual(actual, true, 'fp.includes');

    actual = fp.intersection(other, array);
    assert.deepEqual(actual, ['b'], 'fp.intersection');

    actual = fp.omit(other, object);
    assert.deepEqual(actual, { 'a': 1, 'c': 2 }, 'fp.omit');

    actual = fp.union(other, array);
    assert.deepEqual(actual, ['a', 'b', 'c', 'd'], 'fp.union');

    actual = fp.uniq(other);
    assert.deepEqual(actual, ['b', 'd'], 'fp.uniq');

    actual = fp.uniqBy(_.identity, other);
    assert.deepEqual(actual, ['b', 'd'], 'fp.uniqBy');

    actual = fp.without('b', array);
    assert.deepEqual(actual, ['a', 'c'], 'fp.without');

    actual = fp.xor(other, array);
    assert.deepEqual(actual, ['a', 'c', 'd'], 'fp.xor');

    actual = fp.pull('b', array);
    assert.deepEqual(actual, ['a', 'c'], 'fp.pull');
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('cherry-picked methods');

(function() {
  QUnit.test('should provide the correct `iteratee` arguments', function(assert) {
    assert.expect(1);

    var args,
        array = [1, 2, 3],
        map = convert('map', _.map);

    map(function() {
      args || (args = slice.call(arguments));
    })(array);

    assert.deepEqual(args, [1]);
  });

  QUnit.test('should not support shortcut fusion', function(assert) {
    assert.expect(3);

    var array = fp.range(0, LARGE_ARRAY_SIZE),
        filterCount = 0,
        mapCount = 0;

    var iteratee = function(value) {
      mapCount++;
      return value * value;
    };

    var predicate = function(value) {
      filterCount++;
      return value % 2 == 0;
    };

    var map1 = convert('map', _.map),
        filter1 = convert('filter', _.filter),
        take1 = convert('take', _.take);

    var filter2 = filter1(predicate),
        map2 = map1(iteratee),
        take2 = take1(2);

    var combined = fp.flow(map2, filter2, fp.compact, take2);

    assert.deepEqual(combined(array), [4, 16]);
    assert.strictEqual(filterCount, 200, 'filterCount');
    assert.strictEqual(mapCount, 200, 'mapCount');
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.curry');

(function() {
  QUnit.test('should accept only a `func` param', function(assert) {
    assert.expect(1);

    assert.raises(function() { fp.curry(1, _.noop); }, TypeError);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.curryN');

(function() {
  QUnit.test('should accept an `arity` param', function(assert) {
    assert.expect(1);

    var actual = fp.curryN(1, function(a, b) { return [a, b]; })('a');
    assert.deepEqual(actual, ['a', undefined]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.difference');

(function() {
  QUnit.test('should return the elements of the first array not included in the second array', function(assert) {
    assert.expect(1);

    assert.deepEqual(fp.difference([1, 2])([2, 3]), [1]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.flow and fp.flowRight');

_.each(['flow', 'flowRight'], function(methodName, index) {
  var func = fp[methodName],
      isFlow = methodName == 'flow';

  QUnit.test('`fp.' + methodName + '` should support shortcut fusion', function(assert) {
    assert.expect(6);

    var filterCount,
        mapCount,
        array = fp.range(0, LARGE_ARRAY_SIZE);

    var iteratee = function(value) {
      mapCount++;
      return value * value;
    };

    var predicate = function(value) {
      filterCount++;
      return value % 2 == 0;
    };

    var filter = fp.filter(predicate),
        map = fp.map(iteratee),
        take = fp.take(2);

    _.times(2, function(index) {
      var combined = isFlow
        ? func(map, filter, fp.compact, take)
        : func(take, fp.compact, filter, map);

      filterCount = mapCount = 0;

      assert.deepEqual(combined(array), [4, 16]);
      assert.strictEqual(filterCount, 5, 'filterCount');
      assert.strictEqual(mapCount, 5, 'mapCount');
    });
  });
});

/*----------------------------------------------------------------------------*/

QUnit.module('fp.iteratee');

(function() {
  QUnit.test('should return a iteratee with capped params', function(assert) {
    assert.expect(1);

    var func = fp.iteratee(function(a, b, c) { return [a, b, c]; }, undefined, 3);
    assert.deepEqual(func(1, 2, 3), [1, undefined, undefined]);
  });

  QUnit.test('should convert by name', function(assert) {
    assert.expect(1);

    var iteratee = convert('iteratee', _.iteratee),
        func = iteratee(function(a, b, c) { return [a, b, c]; }, undefined, 3);

    assert.deepEqual(func(1, 2, 3), [1, undefined, undefined]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.maxBy and fp.minBy');

_.each(['maxBy', 'minBy'], function(methodName, index) {
  var array = [1, 2, 3],
      func = fp[methodName],
      isMax = !index;

  QUnit.test('`fp.' + methodName + '` should work with an `iteratee` argument', function(assert) {
    assert.expect(1);

    var actual = func(function(num) {
      return -num;
    })(array);

    assert.strictEqual(actual, isMax ? 1 : 3);
  });

  QUnit.test('`fp.' + methodName + '` should provide the correct `iteratee` arguments', function(assert) {
    assert.expect(1);

    var args;

    func(function() {
      args || (args = slice.call(arguments));
    })(array);

    assert.deepEqual(args, [1]);
  });
});

/*----------------------------------------------------------------------------*/

QUnit.module('fp.mixin');

(function() {
  var source = { 'a': _.noop };

  QUnit.test('should mixin static methods but not prototype methods', function(assert) {
    assert.expect(2);

    fp.mixin(source);

    assert.strictEqual(typeof fp.a, 'function');
    assert.notOk('a' in fp.prototype);

    delete fp.a;
    delete fp.prototype.a;
  });

  QUnit.test('should not assign inherited `source` methods', function(assert) {
    assert.expect(2);

    function Foo() {}
    Foo.prototype.a = _.noop;
    fp.mixin(new Foo);

    assert.notOk('a' in fp);
    assert.notOk('a' in fp.prototype);

    delete fp.a;
    delete fp.prototype.a;
  });

  QUnit.test('should not remove existing prototype methods', function(assert) {
    assert.expect(2);

    var each1 = fp.each,
        each2 = fp.prototype.each;

    fp.mixin({ 'each': source.a });

    assert.strictEqual(fp.each, source.a);
    assert.strictEqual(fp.prototype.each, each2);

    fp.each = each1;
    fp.prototype.each = each2;
  });

  QUnit.test('should not export to the global when `source` is not an object', function(assert) {
    assert.expect(2);

    var props = _.without(_.keys(_), '_');

    _.times(2, function(index) {
      fp.mixin.apply(fp, index ? [1] : []);

      assert.ok(_.every(props, function(key) {
        return global[key] !== fp[key];
      }));

      _.each(props, function(key) {
        delete global[key];
      });
    });
  });

  QUnit.test('should convert by name', function(assert) {
    assert.expect(3);

    var object = { 'mixin': convert('mixin', _.mixin) };

    function Foo() {}
    Foo.mixin = object.mixin;
    Foo.mixin(source);

    assert.strictEqual(typeof Foo.a, 'function');
    assert.notOk('a' in Foo.prototype);

    object.mixin(source);
    assert.strictEqual(typeof object.a, 'function');
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.random');

(function() {
  var array = Array(1000);

  QUnit.test('should support a `min` and `max` argument', function(assert) {
    assert.expect(1);

    var min = 5,
        max = 10;

    assert.ok(_.some(array, function() {
      var result = fp.random(min)(max);
      return result >= min && result <= max;
    }));
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.range');

(function() {
  QUnit.test('should have an argument order of `start` then `end`', function(assert) {
    assert.expect(1);

    assert.deepEqual(fp.range(1)(4), [1, 2, 3]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.runInContext');

(function() {
  QUnit.test('should return a converted lodash instance', function(assert) {
    assert.expect(1);

    assert.strictEqual(typeof fp.runInContext({}).curryN, 'function');
  });

  QUnit.test('should convert by name', function(assert) {
    assert.expect(1);

    var runInContext = convert('runInContext', _.runInContext);
    assert.strictEqual(typeof runInContext({}).curryN, 'function');
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.uniqBy');

(function() {
  var objects = [{ 'a': 2 }, { 'a': 3 }, { 'a': 1 }, { 'a': 2 }, { 'a': 3 }, { 'a': 1 }];

  QUnit.test('should work with an `iteratee` argument', function(assert) {
    assert.expect(1);

    var expected = objects.slice(0, 3);

    var actual = fp.uniqBy(function(object) {
      return object.a;
    })(objects);

    assert.deepEqual(actual, expected);
  });

  QUnit.test('should provide the correct `iteratee` arguments', function(assert) {
    assert.expect(1);

    var args;

    fp.uniqBy(function() {
      args || (args = slice.call(arguments));
    })(objects);

    assert.deepEqual(args, [objects[0]]);
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('fp.zipObject');

(function() {
  QUnit.test('should accept a single key-value `pairs` params', function(assert) {
    assert.expect(1);

    assert.deepEqual(fp.zipObject([['a', 1], ['b', 2]]), { 'a': 1, 'b': 2 });
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.module('mutation methods');

(function() {
  var array = [1, 2, 3],
      object = { 'a': 1 };

  QUnit.test('should not mutate values', function(assert) {
    assert.expect(28);

    function Foo() {}
    Foo.prototype = { 'b': 2 };

    var value = _.clone(object),
        actual = fp.assign({ 'b': 2 }, value);

    assert.deepEqual(value, object, 'fp.assign');
    assert.deepEqual(actual, { 'a': 1, 'b': 2 }, 'fp.assign');

    value = _.clone(object);
    actual = fp.assignWith(function(objValue, srcValue) {
      return srcValue;
    }, { 'b': 2 }, value);

    assert.deepEqual(value, object, 'fp.assignWith');
    assert.deepEqual(actual, { 'a': 1, 'b': 2 }, 'fp.assignWith');

    value = _.clone(object);
    actual = fp.defaults({ 'a': 2, 'b': 2 }, value);

    assert.deepEqual(value, object, 'fp.defaults');
    assert.deepEqual(actual, { 'a': 1, 'b': 2 }, 'fp.defaults');

    value = _.clone(object);
    value.b = { 'c': 1 };
    actual = fp.defaultsDeep({ 'b': { 'c': 2, 'd': 2 } }, value);

    assert.deepEqual(value, { 'a': 1, 'b': { 'c': 1 } } , 'fp.defaultsDeep');
    assert.deepEqual(actual, { 'a': 1, 'b': { 'c': 1, 'd': 2 } }, 'fp.defaultsDeep');

    value = _.clone(object);
    actual = fp.extend(new Foo, value);

    assert.deepEqual(value, object, 'fp.extend');
    assert.deepEqual(actual, { 'a': 1, 'b': 2 }, 'fp.extend');

    value = _.clone(object);
    actual = fp.extendWith(function(value, other) {
      return other;
    }, new Foo, value);

    assert.deepEqual(value, object, 'fp.extendWith');
    assert.deepEqual(actual, { 'a': 1, 'b': 2 }, 'fp.extendWith');

    value = _.clone(array);
    actual = fp.fill(1, 2, '*', value);

    assert.deepEqual(value, array, 'fp.fill');
    assert.deepEqual(actual, [1, '*', 3], 'fp.fill');

    value = { 'a': { 'b': 2 } };
    actual = fp.merge({ 'a': { 'c': 3 } }, value);

    assert.deepEqual(value, { 'a': { 'b': 2 } }, 'fp.merge');
    assert.deepEqual(actual, { 'a': { 'b': 2, 'c': 3 } }, 'fp.merge');

    value = { 'a': [1] };
    actual = fp.mergeWith(function(value, other) {
      if (_.isArray(value)) {
        return value.concat(other);
      }
    }, { 'a': [2, 3] }, value);

    assert.deepEqual(value, { 'a': [1] }, 'fp.mergeWith');
    assert.deepEqual(actual, { 'a': [1, 2, 3] }, 'fp.mergeWith');

    value = _.clone(array);
    actual = fp.pull(2, value);

    assert.deepEqual(value, array, 'fp.pull');
    assert.deepEqual(actual, [1, 3], 'fp.pull');

    value = _.clone(array);
    actual = fp.pullAll([1, 3], value);

    assert.deepEqual(value, array, 'fp.pullAll');
    assert.deepEqual(actual, [2], 'fp.pullAll');

    value = _.clone(array);
    actual = fp.pullAt([0, 2], value);

    assert.deepEqual(value, array, 'fp.pullAt');
    assert.deepEqual(actual, [2], 'fp.pullAt');

    value = _.clone(array);
    actual = fp.remove(function(value) {
      return value === 2;
    }, value);

    assert.deepEqual(value, array, 'fp.remove');
    assert.deepEqual(actual, [1, 3], 'fp.remove');

    value = _.clone(array);
    actual = fp.reverse(value);

    assert.deepEqual(value, array, 'fp.reverse');
    assert.deepEqual(actual, [3, 2, 1], 'fp.reverse');
  });
}());

/*----------------------------------------------------------------------------*/

QUnit.config.asyncRetries = 10;
QUnit.config.hidepassed = true;
QUnit.config.noglobals = true;
QUnit.load();
