'use strict';

var _ = require('lodash'),
    async = require('async'),
    fs = require('fs'),
    path = require('path'),
    uglify = require('uglify-js'),
    webpack = require('webpack');

var DedupePlugin = webpack.optimize.DedupePlugin,
    OccurenceOrderPlugin = webpack.optimize.OccurenceOrderPlugin;

var webpackConfig = {
  'entry': '.',
  'output': {
    'path': path.join(__dirname, '../dist'),
    'filename': 'lodash-fp.js',
    'library': '_',
    'libraryTarget': 'umd'
  },
  'plugins': [
    new OccurenceOrderPlugin,
    new DedupePlugin
  ]
};

var convertWebpackConfig = {
  'entry': './lib/bowerConvert.js',
  'output': {
    'path': path.join(__dirname, '../dist'),
    'filename': 'convert.js',
    'library': 'convert',
    'libraryTarget': 'umd'
  },
  'plugins': [
    new OccurenceOrderPlugin,
    new DedupePlugin
  ]
}

var uglifyConfig = {
  'mangle': true,
  'compress': {
    'comparisons': false,
    'keep_fargs': true,
    'pure_getters': true,
    'unsafe': true,
    'unsafe_comps': true,
    'warnings': false
  },
  'output': {
    'ascii_only': true,
    'beautify': false,
    'max_line_len': 500
  }
}

/*----------------------------------------------------------------------------*/

function minify(inpath, outpath, callback){
  var output = uglify.minify(path.join(__dirname, inpath), uglifyConfig);
  fs.writeFile(path.join(__dirname, outpath), output.code, 'utf-8', callback);
}

function onComplete(error) {
  if (error) {
    throw error;
  }
}

async.series([
  _.partial(webpack, webpackConfig),
  _.partial(minify, '../dist/lodash-fp.js', '../dist/lodash-fp.min.js'),
  _.partial(webpack, convertWebpackConfig),
  _.partial(minify, '../dist/convert.js', '../dist/convert.min.js')
], onComplete);
