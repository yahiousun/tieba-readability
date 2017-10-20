import { TiebaStream } from './stream';
import { TiebaParser } from './parser';
import { TiebaThreadMetadata, TiebaThreadEntry, TiebaThreadObject } from './thread';

const TIEBA_READABILITY_REGEX = {
  HTML_TAGS: /(<([^>]+)>)/ig
};

export class TiebaReadability {
  static count(html: string) {
    const text = TiebaReadability.text(html);
    return text.length;
  }
  static text(html: string) {
    return html.replace(TIEBA_READABILITY_REGEX.HTML_TAGS, '');
  }
  private stream: TiebaStream;
  private metadata: TiebaThreadMetadata;
  private entries: Array<TiebaThreadEntry>;
  constructor() {
    this.entries = [];
    this.stream = new TiebaStream();
    this.stream.on('metadata', (metadata) => {
      this.metadata = { ...metadata };
    });
    this.stream.on('entry', (entry: TiebaThreadEntry) => {
      this.entries.push(entry);
    });
  }
  parse(html: string): TiebaThreadObject {
    this.stream.write(html);
    const content: any = this.entries.reduce((previous, next, index) => {
      const section = next.content.split('<br>').map((line) => {
        return `<p>${line}</p>\n`;
      }).join('');

      if (index !== 0) {
        return `${previous}<br>${section}`;
      }
      return section;
    }, '');
    if (!content) {
      throw new Error('Content not found');
    }
    return {
      ...this.metadata,
      content,
      word_count: TiebaReadability.count(content)
    };
  }
}
