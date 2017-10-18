import { TiebaStream } from '../src/tieba-stream';

const TEST_URL = 'https://tieba.baidu.com/p/5346624244?see_lz=1';

describe('TiebaStream', function() {
  it('parse thread', function(done) {
    
    fetch(TEST_URL)
      .then(res => res.text())
      .then((htmlString) => {
        const stream = new TiebaStream();
        stream.on('title', (title) => {
          console.log('title', title);
        });
        stream.on('pagecount', (numberOfPages) => {
          console.log('numberOfPages', numberOfPages);
        });
        stream.on('post', (post) => {
          console.log('post', post.length);
        });
        stream.on('error', (error) => {
          console.log('error', error);
        });
        stream.write(htmlString);

        done();
      });
  });

});
