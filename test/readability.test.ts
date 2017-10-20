import { TiebaReadability } from '../src/readability';

const TEST_URL = 'http://localhost:9876/base/test/test.html';

describe('TiebaReadability', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((htmlString) => {
        const parser = new TiebaReadability();
        const thread = parser.parse(htmlString);
        expect(thread.title).toBeDefined(true);
        expect(thread.content).toBeDefined(true);
        done();
        if (document) {
          const article = document.createElement('div');
          article.innerHTML = thread.content;
          document.body.appendChild(article);
        }
      });
  });

});
