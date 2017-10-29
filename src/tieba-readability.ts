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
