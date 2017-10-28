import {} from 'jasmine';
import { MetadataResolver } from '../src/metadata-resolver';

const TEST_URL = 'http://localhost:9876/base/test/sample.html';

describe('MetadataResolver', function() {
  it('parse metadata', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((res) => {
        const resolver = new MetadataResolver({ generate_summary: true });
        const html = res.replace(/(\r|\n)/g, '');
        const metadata = resolver.parse(html);
        expect(metadata.title).toBeDefined();
        done();
      });
  });
});
