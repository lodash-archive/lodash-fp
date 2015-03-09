# lodash-fp v0.4.0

[lodash](https://lodash.com/) with auto-curried iteratee-first methods.

## Installation

Using npm:

```bash
$ {sudo -H} npm i -g npm
$ npm i --save lodash-fp
```

In Node.js/io.js:

```js
var _ = require('lodash-fp');

var items = [
  { 'value': _.constant('a') },
  { 'value': _.constant(['a', 'b']) },
  { 'value': _.constant(['b', 'c']) }
];

var getValue = _.map(_.result('value')),
    getValues = _.flow(getValue, _.flatten, _.uniq);

getValues(items);
// => ['a', 'b', 'c']

// lazy evaluation is supported too
_(_.range(0, 10))
  .map(function(value) { console.log('map'); return value * value; })
  .filter(function(value) { console.log('filter'); return value % 2 == 0; })
  .take(2)
  .value();

// logs map, filter, map, filter, map, filter
// => [0, 4]
```

See the [package source](https://github.com/lodash/lodash-fp/tree/0.4.0) for more details.

**Note:**<br>
Don’t assign values to the [special variable](http://nodejs.org/api/repl.html#repl_repl_features) `_` when in the REPL.<br>
Install [n_](https://www.npmjs.com/package/n_) for a REPL that includes lodash by default.
