import {} from 'jasmine';
import { TiebaReadability } from '../src/tieba-readability';

const TEST_URL = 'http://localhost:9876/base/test/test.html';

describe('TiebaReadability', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((res) => {
        const parser = new TiebaReadability();
        const thread = parser.parse(res);
        expect(thread).toBeDefined();
        done();
      });
  });
});
