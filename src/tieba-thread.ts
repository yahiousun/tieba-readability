import { TiebaUserObject } from './author-handler';
import { TiebaThreadMetadataObject } from './metadata-resolver';
import { TiebaThreadPostObject } from './post-handler';
import { TiebaThreadParser } from './tieba-thread-parser';

export interface TiebaThreadObject extends TiebaThreadMetadataObject {
  page_number: number;
  posts: Array<TiebaThreadPostObject>;
  word_count: number;
}

export class TiebaThread {
  static create() {
    return new TiebaThread();
  }
  static get REGEX() {
    return {
      CURRENT_PAGE_NUMBER: /<span[^>]*class="tP">([^<]*)<\/span>/,
      HTML_TAGS: /(<([^>]+)>)/g
    };
  }
  private html: string;
  private parser: TiebaThreadParser;
  private thread: { metadata?: TiebaThreadMetadataObject, posts?: Array<TiebaThreadPostObject> };
  constructor() {
    this.parser = new TiebaThreadParser();
    this.parser.onmetadata = (metadata) => {
      this.thread.metadata = metadata;
    };
    this.parser.onpost = (post) => {
      this.thread.posts.push(post);
    };
  }
  set source(html: string) {
    this.thread = { posts: [] };
    this.html = html;
    this.parser.source = html;
  }
  get source() {
    return this.html;
  }
  get title() {
    if (!this.thread || !this.thread.metadata) {
      return;
    }
    return this.thread.metadata.title;
  }
  get replies() {
    if (!this.thread || !this.thread.metadata) {
      return;
    }
    return this.thread.metadata.reply_count;
  }
  get pages() {
    if (!this.thread || !this.thread.metadata) {
      return;
    }
    return this.thread.metadata.page_count;
  }
  get url() {
    if (!this.thread || !this.thread.metadata) {
      return;
    }
    return this.thread.metadata.url;
  }
  get number() {
    if (!this.html) {
      return;
    }
    const match = TiebaThread.REGEX.CURRENT_PAGE_NUMBER.exec(this.html);
    let result;
    if (match && match[1]) {
      result = +match[1];
    }
    return result;
  }
  get words() {
    if (!this.thread || !this.thread.posts) {
      return;
    }
    return this.thread
      .posts
      .slice()
      .map(item => item.content.trim())
      .join()
      .replace(TiebaThread.REGEX.HTML_TAGS, '')
      .length;
  }
  get posts() {
    if (!this.thread || !this.thread.posts) {
      return;
    }
    return this.thread.posts && this.thread.posts.slice();
  }
  toJSON(): TiebaThreadObject {
    if (
      typeof this.thread !== 'undefined'
      && typeof this.thread.metadata !== 'undefined'
    ) {
      return {
        ...this.thread.metadata,
        page_number: this.number,
        word_count: this.words,
        posts: this.thread.posts.slice()
      };
    }
    return;
  }
}
