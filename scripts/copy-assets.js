/**
 * tieba-readability
 *
 * Copyright © 2017 yahiousun. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const del = require('del');
const pkg = require('../package.json');

let promise = Promise.resolve();

promise = promise.then(() => del(['dist/*']));

// Copy package.json and LICENSE
promise = promise.then(() => {
  delete pkg.devDependencies;
  delete pkg.scripts;

  Object.assign(pkg, {
    main: 'index.js',
    typings: 'index.d.ts',
  });

  fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, '  '), 'utf-8');
  fs.writeFileSync('dist/LICENSE', fs.readFileSync('LICENSE', 'utf-8'), 'utf-8');
  fs.writeFileSync('dist/README.md', fs.readFileSync('README.md', 'utf-8'), 'utf-8');
});

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console