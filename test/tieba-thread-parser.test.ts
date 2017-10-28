import {} from 'jasmine';
import { TiebaThreadParser } from '../src/tieba-thread-parser';

const TEST_URL = 'http://localhost:9876/base/test/sample.html';

describe('TiebaThreadParser', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((res) => {
        const parser = new TiebaThreadParser();
        parser.onmetadata = (metadata) => {
          expect(metadata).toBeDefined();
        };

        parser.onpost = (post) => {
          expect(post).toBeDefined();
        };

        parser.source = res;

        done();
      });
  });
});
