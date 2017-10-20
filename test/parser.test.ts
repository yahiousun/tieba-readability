import {} from 'jasmine';
import { TiebaParser } from '../src/parser';

const TEST_URL = 'http://localhost:9876/base/test/test.html';

describe('TiebaParser', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((htmlString) => {
        const parser = new TiebaParser();
        parser.onmetadata = (metadata) => {
          done();
        };
        parser.src = htmlString;
      });
  });
});
