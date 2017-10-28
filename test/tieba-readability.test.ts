import {} from 'jasmine';
import { TiebaReadability } from '../src/tieba-readability';

const TEST_URL = 'http://localhost:9876/base/test/sample.html';

describe('TiebaReadability', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((res) => {
        const parser = new TiebaReadability();
        const thread = parser.parse(res);
        expect(thread).toBeDefined();
        console.log('length', thread.content.length, thread);
        done();
      });
  });
});
