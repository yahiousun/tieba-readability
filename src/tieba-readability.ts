import { TiebaThreadParser } from './tieba-thread-parser';
import { PostHandler } from './post-handler';
import { TiebaThreadMetadataObject } from './metadata-resolver';
import { TiebaThreadPostObject } from './post-handler';

export interface TiebaReadabilityObject extends TiebaThreadMetadataObject {
  word_count?: number;
  content: string;
}

export interface TiebaReadabilityOptions {
  strip_images: boolean;
}

export class TiebaReadability {
  static get OPTIONS() {
    return {
      strip_images: false
    };
  }
  static get REGEX() {
    return {
      HTML_TAGS: /(<([^>]+)>)/g,
      H3: /^\u7b2c.{1,4}\u7ae0/,
      H4: /^\d{1,2}$/,
      BLOCKQUOTE: /([^@]*@.*?)/,
      BLOCKQUOTE_AND_HR: /={3,}([^=]*)={3,}/,
      IMG: /<img[^>]*src="([^"]*)"[^>]*>/g,
      HR: /={3,}/,
      OL: /(^\d{1,2}\.)[^\d]/,
      LINE_FEED: /\n/g
    };
  }
  static parse(content: string) {
    const section = [];
    content.split('<br>')
      .filter(item => item.trim() !== '')
      .forEach((item, index, array) => {
        let line = item.trim(), previous = section[section.length - 1];
        if (
          typeof previous !== 'undefined'
          && TiebaReadability.REGEX.OL.test(previous)
          && !TiebaReadability.REGEX.OL.test(line)
        ) {
          section.push('\n');
        }
        if (
          typeof previous !== 'undefined'
          && TiebaReadability.REGEX.BLOCKQUOTE.test(previous)
          && TiebaReadability.REGEX.HR.test(line)
        ) {
          previous = section.pop().replace(TiebaReadability.REGEX.LINE_FEED, '');
          section.push(`> ${previous}`);
          section.push('-----\n');
        } else if (TiebaReadability.REGEX.OL.test(line)) {
          if (
            !TiebaReadability.REGEX.OL.test(previous)
            && !TiebaReadability.REGEX.LINE_FEED.test(previous)
          ) {
            section[section.length - 1] = `${previous}\n`;
          }
          line = line.replace(TiebaReadability.REGEX.OL, (str, $1) => (`${$1} ${str.replace($1, '').trim()}`));
          if (index === array.length - 1) {
            section.push(`${line}\n`);
          } else {
            section.push(line);
          }
        } else if (TiebaReadability.REGEX.BLOCKQUOTE_AND_HR.test(line)) {
          section.push(`> ${line.replace(TiebaReadability.REGEX.BLOCKQUOTE_AND_HR, '$1').trim()}`);
          section.push('-----\n');
        } else if (TiebaReadability.REGEX.H3.test(line)) {
          section.push(`### ${line}`);
        } else if (TiebaReadability.REGEX.H4.test(line)) {
          section.push(`#### ${line}`);
        } else if (TiebaReadability.REGEX.IMG.test(line)) {
          section.push(`![](${line.replace(TiebaReadability.REGEX.IMG, '$1')})`);
        } else {
          section.push(`${line}\n`);
        }
      });
    return section;
  }
  private parser: TiebaThreadParser;
  private thread: { metadata?: TiebaThreadMetadataObject, posts?: Array<TiebaThreadPostObject> };
  private options: TiebaReadabilityOptions;
  constructor(options?: TiebaReadabilityOptions) {
    this.options = { ...TiebaReadability.OPTIONS, ...options };
    this.parser = new TiebaThreadParser(undefined, undefined, new PostHandler(this.options));
    this.parser.onmetadata = (metadata) => {
      this.thread.metadata = metadata;
    };
    this.parser.onpost = (post) => {
      this.thread.posts.push(post);
    };
  }
  parse(source: string): TiebaReadabilityObject {
    this.thread = { posts: [] };
    this.parser.source = source;
    const { metadata, posts } = this.thread;
    let content = [], word_count;
    if (typeof metadata === 'undefined') {
      throw new Error('Parser failure');
    }
    posts.forEach((post) => {
      content = content.concat(TiebaReadability.parse(post.content));
    });
    if (!content.length) {
      throw new Error('Content not found');
    }
    word_count = posts
      .slice()
      .map(item => item.content.trim())
      .join()
      .replace(TiebaReadability.REGEX.HTML_TAGS, '')
      .length;
    return {
      ...metadata,
      word_count,
      content: content.join('\n')
    };
  }
}
