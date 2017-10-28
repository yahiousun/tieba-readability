import { TiebaThread, TiebaThreadObject } from './tieba-thread';

export interface TiebaReadabilityObject extends TiebaThreadObject {
  content: string;
}

export class TiebaReadability {
  static get REGEX() {
    return {
      HTML_TAGS: /(<([^>]+)>)/ig,
      H3: /^\u7b2c.{1,4}\u7ae0/,
      H4: /^\d{1,2}$/,
      BLOCKQUOTE: /([^@]*@.*?)/,
      BLOCKQUOTE_AND_HR: /={3,}([^=]*)={3,}/,
      IMG: /<img[^>]*src="([^"]*)"[^>]*>/g,
      HR: /={3,}/
    };
  }
  static parse(content: string) {
    const section = [];
    content.split('<br>').forEach((item, index, array) => {
      const line = item.trim();
      if (line !== '') {
        if (
          section.length > 0
          && TiebaReadability.REGEX.BLOCKQUOTE.test(array[index - 1])
          && TiebaReadability.REGEX.HR.test(line)
        ) {
          const last = section.pop().trim();
          section.push(`> ${last}`);
          section.push('-----');
        } else if (TiebaReadability.REGEX.BLOCKQUOTE_AND_HR.test(line)) {
          section.push(`> ${line.replace(TiebaReadability.REGEX.BLOCKQUOTE_AND_HR, '$1').trim()}`);
          section.push('-----');
        } else if (TiebaReadability.REGEX.H3.test(line)) {
          section.push(`### ${line}`);
        } else if (TiebaReadability.REGEX.H4.test(line)) {
          section.push(`#### ${line}`);
        } else if (TiebaReadability.REGEX.IMG.test(line)) {
          section.push(`![](${line.replace(TiebaReadability.REGEX.IMG, '$1')})`);
        } else {
          section.push(`${line}\n`);
        }
      }
    });
    return section;
  }
  private thread: TiebaThread;
  constructor() {
    this.thread = TiebaThread.create();
  }
  parse(source: string): TiebaReadabilityObject {
    this.thread.source = source;
    const thread = this.thread.toJSON();
    let content = [];
    if (typeof thread === 'undefined') {
      throw new Error('Parser failure');
    }
    thread.posts.forEach((post) => {
      content = content.concat(TiebaReadability.parse(post.content));
    });
    if (!content.length) {
      throw new Error('Content not found');
    }
    return { ...thread, content: content.join('\n') };
  }
}
