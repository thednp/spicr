'use strict';
import buble from '@rollup/plugin-buble';
import {terser} from 'rollup-plugin-terser';
import node from '@rollup/plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import json from '@rollup/plugin-json';
import * as pkg from "./package.json";

const STANDALONE = process.env.STANDALONE === 'true'
const MIN = process.env.MIN === 'true' // true/false|unset
const FORMAT = process.env.FORMAT // JS umd|iife|esm

const year = (new Date).getFullYear();
const distribution = STANDALONE ? 'Standalone ' : '';

const banner =
`/*!
* Spicr ${distribution}v${pkg.version} (${pkg.homepage})
* Copyright 2017-${year} © ${pkg.author}
* Licensed under MIT (https://github.com/thednp/spicr/blob/master/LICENSE)
*/`;

const miniBannerJS = `// Spicr ${distribution}v${pkg.version} | ${pkg.author} © ${year} | ${pkg.license}-License`;


let INPUTFILE = process.env.INPUTFILE ? process.env.INPUTFILE : 'src/js/index.js'
let OUTPUTFILE = process.env.OUTPUTFILE ? process.env.OUTPUTFILE : (FORMAT === 'umd' ? 'dist/js/spicr'+(MIN?'.min':'')+'.js' : 'dist/js/spicr.esm'+(MIN?'.min':'')+'.js')

const OUTPUT = {
  file: OUTPUTFILE,
  format: FORMAT // or iife
};

const PLUGINS = [ 
  json(), 
  buble(),
  node({mainFields: ['jsnext','module'], dedupe: ['shorter-js','kute.js']}) 
];

if (MIN){
  PLUGINS.push(terser({output: {preamble: miniBannerJS}}));
} else {
  OUTPUT.banner = banner;
  PLUGINS.push(cleanup());
}

if (FORMAT!=='esm') {
  OUTPUT.name = 'Spicr';
}

export default [
  {
    input: INPUTFILE,
    output: OUTPUT,
    plugins: PLUGINS
  }
]