import { TiebaParser } from '../src/parser';

const TEST_URL = 'https://tieba.baidu.com/p/5346624244?see_lz=1';

describe('TiebaParser', function() {
  it('parse thread', function(done) {
    fetch(TEST_URL)
      .then(res => res.text())
      .then((htmlString) => {
        const parser = new TiebaParser();
        parser.onmetadata = (metadata) => {
          done();
        }
        parser.src = htmlString;        
      });
  });

});
