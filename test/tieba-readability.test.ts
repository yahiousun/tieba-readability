import {} from 'jasmine';
import { TiebaReadability } from '../src/tieba-readability';

const TEST_URL = 'http://localhost:9876/base/test/sample.html';

describe('TiebaReadability', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((res) => {
        const parser = new TiebaReadability({ strip_images: true });
        const thread = parser.parse(res);
        expect(!/(<|>)/.test(thread.content)).toBeTruthy();
        expect(thread).toBeDefined();
        done();
      });
  });
});
