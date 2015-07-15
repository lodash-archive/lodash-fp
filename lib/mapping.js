module.exports = {

  /** Used to map method names to their aliases. */
  'aliasMap': {
    'assign': ['extend'],
    'callback': ['iteratee'],
    'every': ['all'],
    'filter': ['select'],
    'find': ['detect'],
    'first': ['head'],
    'forEach': ['each'],
    'forEachRight': ['eachRight'],
    'includes': ['contains', 'include'],
    'isEqual': ['eq'],
    'map': ['collect'],
    'reduce': ['foldl', 'inject'],
    'reduceRight': ['foldr'],
    'rest': ['tail'],
    'some': ['any'],
    'uniq': ['unique'],
    'zipObject': ['object']
  },

  /** Used to map ary to method names. */
  'aryMethodMap': {
    1: (
      'attempt,clone,create,curry,flatten,invert,max,memoize,method,methodOf,min,' +
      'restParam,sample,sum,template,trim,trimLeft,trimRight,uniq,words').split(','),
    2: (
      'add,after,ary,assign,at,before,bind,bindKey,chunk,countBy,curryN,debounce,' +
      'defaults,defaultsDeep,delay,difference,drop,dropRight,dropRightWhile,' +
      'dropWhile,endsWith,every,filter,find,findIndex,findKey,findLast,findLastIndex,' +
      'findLastKey,findWhere,forEach,forEachRight,forIn,forInRight,forOwn,forOwnRight,' +
      'get,groupBy,gt,gte,has,includes,indexBy,indexOf,intersection,invoke,isEqual,' +
      'isMatch,lastIndexOf,lt,lte,map,mapKeys,mapValues,matchesProperty,maxBy,' +
      'merge,minBy,omit,pad,padLeft,padRight,parseInt,partition,pick,pluck,pull,' +
      'pullAt,random,range,rearg,reject,remove,repeat,result,set,some,sortBy,' +
      'sortByAll,sortedIndex,sortedLastIndex,startsWith,sumBy,take,takeRight,' +
      'takeRightWhile,takeWhile,throttle,times,trunc,union,uniqBy,uniqueId,' +
      'unzipWith,where,without,wrap,xor,zip,zipObject').split(','),
    3:
      'slice,sortByOrder,reduce,reduceRight,transform,zipWith'.split(','),
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
    'maxBy': 'max',
    'minBy': 'min',
    'sumBy': 'sum',
    'uniqBy': 'uniq'
  },

  /** Used to track methods that skip `_.rearg`. */
  'skipReargMap': {
    'difference': true,
    'range': true,
    'random': true,
    'zipObject': true
  }
};
