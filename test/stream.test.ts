import { TiebaStream } from '../src/stream';

const TEST_URL = 'http://localhost:9876/base/test/test.html';

describe('TiebaStream', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((htmlString) => {
        const stream = new TiebaStream();
        stream.on('metadata', (metadata) => {});
        stream.on('entry', (entry) => {});
        stream.on('error', (error) => {});
        stream.write(htmlString);

        done();
      });
  });

});
