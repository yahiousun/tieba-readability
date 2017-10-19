import { TiebaStream } from '../src/stream';

const TEST_URL = 'https://tieba.baidu.com/p/5346624244?see_lz=1';

describe('TiebaStream', function() {
  it('parse thread', function(done) {
    
    fetch(TEST_URL)
      .then(res => res.text())
      .then((htmlString) => {
        const stream = new TiebaStream();
        stream.on('metadata', (metadata) => {
          console.log('metadata', metadata);
        });
        stream.on('entry', (entry) => {
          console.log('entry', entry);
        });
        stream.on('error', (error) => {
          console.log('error', error);
        });
        stream.write(htmlString);

        done();
      });
  });

});
