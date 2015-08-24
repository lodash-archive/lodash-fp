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
      'attempt,create,curry,invert,memoize,method,methodOf,restParam,sample,' +
      'template,trim,trimLeft,trimRight,uniq,words').split(','),
    2: (
      'ary,assign,at,bind,bindKey,cloneDeepWith,cloneWith,countBy,curryN,debounce,' +
      'defaults,defaultsDeep,delay,difference,drop,dropRight,dropRightWhile,' +
      'dropWhile,endsWith,every,extend,filter,find,find,findIndex,findKey,findLast,' +
      'findLastIndex,findLastKey,forEach,forEachRight,forIn,forInRight,forOwn,' +
      'forOwnRight,get,groupBy,includes,indexBy,indexOf,intersection,invoke,' +
      'isMatch,lastIndexOf,map,mapKeys,mapValues,maxBy,minBy,merge,omit,pad,padLeft,' +
      'padRight,parseInt,partition,pick,pull,pullAt,random,range,rearg,reject,' +
      'remove,repeat,result,set,some,sortBy,sortByOrder,sortedIndexBy,' +
      'sortedLastIndexBy,startsWith,sumBy,take,takeRight,takeRightWhile,' +
      'takeWhile,throttle,times,trunc,union,uniqBy,uniqueId,without,wrap,xor,' +
      'zip,zipObject').split(','),
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
    'curryN': 'curry'
  },

  /** Used to track methods that skip `_.rearg`. */
  'skipReargMap': {
    'difference': true,
    'range': true,
    'random': true,
    'zipObject': true
  }
};
