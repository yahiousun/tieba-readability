import { PostHandler, TiebaThreadPostObject } from './post-handler';
import { MetadataResolver, TiebaThreadMetadataObject } from './metadata-resolver';

export interface TiebaPraserOptions {
  original_poster_only: boolean;
  min_post_content_length: number;
  max_posts_limit: number;
}

export class TiebaThreadParser {
  static get OPTIONS () {
    return {
      original_poster_only: false,
      min_post_content_length: 140,
      max_posts_limit: 50
    };
  }
  static get REGEX() {
    return {
      SPECIAL: /<(style)\b[^<]*(?:(?!<\/(style)>)<[^<]*)*<\/(style)>/g,
      LINE_FEED: /(\n|\r)/g,
      POST: /<div\sclass="l_post[^>]*>(.*?)j_lzl_container/g
    };
  }
  private source: string;
  private options: TiebaPraserOptions;
  private resolver: MetadataResolver;
  private handler: PostHandler;
  onerror: (error: Error) => void;
  onmetadata: (metadata: TiebaThreadMetadataObject) => void;
  onpost: (post: TiebaThreadPostObject) => void;
  onend: () => void;
  constructor(options?: TiebaPraserOptions, resolver?: MetadataResolver, handler?: PostHandler) {
    this.options = { ...TiebaThreadParser.OPTIONS, ...options };
    this.resolver = resolver || new MetadataResolver();
    this.handler = handler || new PostHandler();
  }
  parse(source: string) {
    const { original_poster_only, min_post_content_length, max_posts_limit } = this.options;
    const regex = TiebaThreadParser.REGEX;
    // Preprocess html
    const html = source
      .replace(TiebaThreadParser.REGEX.SPECIAL, '') // Remove all styles
      .replace(TiebaThreadParser.REGEX.LINE_FEED, '');
    const metadata = this.resolver.parse(html);
    let count = 0, post: TiebaThreadPostObject, match;
    this.source = html;

    if (!metadata) {
      this.onerror(new Error('Thread not found'));
      return;
    }
    if (this.onmetadata && typeof this.onmetadata === 'function') {
      this.onmetadata({ ...metadata });
    }

    // Get all posts
    while (true && count < max_posts_limit) {
      match = regex.POST.exec(html);
      count ++;
      if (match && match[1]) {
        post = this.handler.parse(match[1]);
        if (!post) {
          continue;
        }
        // Drop contentless entry
        if (
          min_post_content_length > 0
          && post.content.length < min_post_content_length
          && !PostHandler.REGEX.IMAGE.test(post.content)) {
          continue;
        }
        // Skip replies
        if (original_poster_only && post.author.id !== metadata.author.id) {
          continue;
        }
        if (this.onpost && typeof this.onpost === 'function') {
          this.onpost(post);
        }
      } else {
        break;
      }
    }

    if (this.onend && typeof this.onend === 'function') {
      this.onend();
    }
  }
}
