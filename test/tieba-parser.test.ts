import { TiebaParser } from '../src/tieba-parser';

const TEST_URL = 'https://tieba.baidu.com/p/5346624244?see_lz=1';

describe('TiebaParser', function() {
  it('parse thread', function(done) {
    
    fetch(TEST_URL)
      .then(res => res.text())
      .then((htmlString) => {
        const parser = new TiebaParser();
        parser.ontitle = (title) => {
          console.log('title', title);
        }
        parser.onpagecount = (numberOfPages) => {
          console.log('numberOfPages', numberOfPages);
        }
        parser.onpost = (post) => {
          console.log('post', post.length);
        }
        parser.onerror = (error) => {
          console.log('error', error);
        }
        parser.src = htmlString;

        done();
      });
  });

});
