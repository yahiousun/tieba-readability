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
const { TiebaReadability } = require('../dist/tieba-readability');

let promise = Promise.resolve();

promise = promise.then(() => del(['SAMPLE.md']));

// Copy package.json and LICENSE
promise = promise.then(() => {
  fs.readFile('./test/sample.html', 'utf8', function(err, data) {
    if (err) throw err;
    const parser = new TiebaReadability();
    const thread = parser.parse(data);
    if (thread.content) {
      fs.writeFileSync('SAMPLE.md', thread.content, 'utf-8');
    }
  });
});

promise.catch(err => console.error(err.stack)); // eslint-disable-line no-console