import {} from 'jasmine';
import { TiebaThread } from '../src/tieba-thread';

const TEST_URL = 'http://localhost:9876/base/test/sample.html';

describe('TiebaThread', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((res) => {
        const thread = new TiebaThread();
        thread.source = res;
        expect(thread.number).toBeDefined();
        expect(thread.pages).toBeDefined();
        expect(thread.posts).toBeDefined();
        expect(thread.replies).toBeDefined();
        expect(thread.title).toBeDefined();
        expect(thread.url).toBeDefined();
        done();
      });
  });
});
