(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["convert"] = factory();
	else
		root["convert"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var baseConvert = __webpack_require__(1);

	/**
	 * Converts `lodash` to an auto-curried iteratee-first data-last version.
	 *
	 * @param {Function} lodash The lodash function.
	 * @returns {Function} Returns the converted lodash function.
	 */
	function bowerConvert(lodash) {
	  return baseConvert(lodash, lodash);
	}

	module.exports = bowerConvert;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var listing = __webpack_require__(2),
	    mapping = __webpack_require__(3);

	/**
	 * The base implementation of `convert` which accepts a `util` object of methods
	 * required to perform conversions.
	 *
	 * @param {Object} util The util object.
	 * @param {string} name The name of the function to wrap.
	 * @param {Function} func The function to wrap.
	 * @returns {Function|Object} Returns the converted function or object.
	 */
	function baseConvert(util, name, func) {
	  if (!func) {
	    func = name;
	    name = null;
	  }
	  if (func == null) {
	    throw new TypeError;
	  }
	  var isLib = name == null && typeof func.VERSION == 'string';

	  var _ = isLib ? func : {
	    'ary': util.ary,
	    'curry': util.curry,
	    'forEach': util.forEach,
	    'isFunction': util.isFunction,
	    'iteratee': util.iteratee,
	    'keys': util.keys,
	    'rearg': util.rearg
	  };

	  var ary = _.ary,
	      curry = _.curry,
	      each = _.forEach,
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
	        return baseConvert(util, runInContext(context));
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

	  if (!isLib) {
	    return wrap(name, func);
	  }
	  // Disable custom `_.indexOf` use by these methods.
	  _.mixin({
	    'difference': util.difference,
	    'includes': util.includes,
	    'intersection': util.intersection,
	    'omit': util.omit,
	    'pull': util.pull,
	    'union': util.union,
	    'uniq': util.uniq,
	    'uniqBy': util.uniqBy,
	    'without': util.without,
	    'xor': util.xor
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	/** Used to iterate `mapping.aryMethodMap` keys. */
	exports.caps = ['1', '2', '3', '4'];


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = {

	  /** Used to map method names to their aliases. */
	  'aliasMap': {
	    'forEach': ['each'],
	    'forEachRight': ['eachRight']
	  },

	  /** Used to map method names to their iteratee ary. */
	  'aryIterateeMap': {
	    'assignWith': 2,
	    'cloneDeepWith': 1,
	    'cloneWith': 1,
	    'countBy': 1,
	    'dropRightWhile': 1,
	    'dropWhile': 1,
	    'every': 1,
	    'extendWith': 2,
	    'filter': 1,
	    'find': 1,
	    'findIndex': 1,
	    'findKey': 1,
	    'findLast': 1,
	    'findLastIndex': 1,
	    'findLastKey': 1,
	    'forEach': 1,
	    'forEachRight': 1,
	    'forIn': 1,
	    'forInRight': 1,
	    'forOwn': 1,
	    'forOwnRight': 1,
	    'groupBy': 1,
	    'indexBy': 1,
	    'isEqualWith': 2,
	    'isMatchWith': 2,
	    'map': 1,
	    'mapKeys': 1,
	    'mapValues': 1,
	    'maxBy': 1,
	    'minBy': 1,
	    'omitBy': 1,
	    'partition': 1,
	    'pickBy': 1,
	    'reduce': 2,
	    'reduceRight': 2,
	    'reject': 1,
	    'remove': 1,
	    'some': 1,
	    'sortBy': 1,
	    'sortByOrder': 1,
	    'sortedIndexBy': 1,
	    'sortedLastIndexBy': 1,
	    'sumBy': 1,
	    'takeRightWhile': 1,
	    'takeWhile': 1,
	    'times': 1,
	    'transform': 2,
	    'uniqBy': 1
	  },

	  /** Used to map ary to method names. */
	  'aryMethodMap': {
	    1: (
	      'attempt,ceil,create,curry,floor,invert,memoize,method,methodOf,restParam,' +
	      'round,sample,template,trim,trimLeft,trimRight,words,zipObject').split(','),
	    2: (
	      'ary,assign,at,bind,bindKey,cloneDeepWith,cloneWith,countBy,curryN,debounce,' +
	      'defaults,defaultsDeep,delay,difference,drop,dropRight,dropRightWhile,' +
	      'dropWhile,endsWith,every,extend,filter,find,find,findIndex,findKey,findLast,' +
	      'findLastIndex,findLastKey,forEach,forEachRight,forIn,forInRight,forOwn,' +
	      'forOwnRight,get,groupBy,includes,indexBy,indexOf,intersection,invoke,' +
	      'isMatch,lastIndexOf,map,mapKeys,mapValues,maxBy,minBy,merge,omit,pad,padLeft,' +
	      'padRight,parseInt,partition,pick,pull,pullAt,random,range,rearg,reject,' +
	      'remove,repeat,result,set,some,sortBy,sortByOrder,sortedIndexBy,sortedLastIndexBy,' +
	      'sortedUniqBy,startsWith,sumBy,take,takeRight,takeRightWhile,takeWhile,throttle,' +
	      'times,trunc,union,uniqBy,uniqueId,without,wrap,xor,zip').split(','),
	    3: (
	      'assignWith,extendWith,isEqualWith,isMatchWith,omitBy,pickBy,reduce,' +
	      'reduceRight,slice,transform,zipWith').split(','),
	    4:
	      ['fill', 'inRange']
	  },

	  /** Used to map ary to rearg configs. */
	  'aryReargMap': {
	    2: [1, 0],
	    3: [2, 0, 1],
	    4: [3, 2, 0, 1]
	  },

	  /** Used to map keys to other keys. */
	  'keyMap': {
	    'curryN': 'curry',
	    'debounceOpt': 'debounce',
	    'sampleN': 'sample',
	    'throttleOpt': 'throttle'
	  },

	  /** Used to track methods that skip `_.rearg`. */
	  'skipReargMap': {
	    'difference': true,
	    'range': true,
	    'random': true,
	    'zipObject': true
	  }
	};


/***/ }
/******/ ])
});
;