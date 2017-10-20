import { TiebaThreadMetadataResolver } from './metadata-resolver';
import { TiebaThreadContentHandler } from './content-handler';
import { TiebaThreadMetadata, TiebaThreadEntry } from './thread';
import { TiebaParserException, TiebaParserError } from './parser-exception';

const TIEBA_PARSER_REGEX = {
  SPECIAL: /<(script|style)\b[^<]*(?:(?!<\/(script|style)>)<[^<]*)*<\/(script|style)>/g,
  LINE_FEED: /(\n|\r)/g,
  POST: /<div\sclass=\"l_post[^>]*>(.*?)j_lzl_container/g
};

const MAX_ENTRY_COUNT = 100;
const voidFunction = () => {};

export type TIEBA_PARSER_HANDLER = (data?: any) => void;

export class TiebaParser {
  private html: string;
  private handler: TiebaThreadContentHandler;
  private error: TiebaParserError;
  private metadata: TiebaThreadMetadataResolver;
  private parse(input: string) {
    // Preprocess html string, remove style and script tags
    const html = input.replace(TIEBA_PARSER_REGEX.SPECIAL, '').replace(TIEBA_PARSER_REGEX.LINE_FEED, '');
    // Resolve metadata
    const metadata = this.metadata.resolve(html);

    let count = 0, post, entry;

    // Prevent undefined handler error
    if (!this.onmetadata) this.onmetadata = voidFunction;
    if (!this.onentry) this.onentry = voidFunction;

    if (!metadata) {
      this.throw(TiebaParserException.threadNotFound());
    }

    this.handler.setMetadata(metadata);

    if (this.onmetadata) {
      this.onmetadata({ ...metadata });
    }

    // Get all posts
    while (true && count < MAX_ENTRY_COUNT) {
      post = TIEBA_PARSER_REGEX.POST.exec(html);
      count ++;
      if (post && post[1]) {
        entry = this.handler.resolve(post[1]);
        // Drop contentless entry
        if (entry && entry.content && this.onentry) {
          this.onentry(entry);
        }
      } else {
        break;
      }
    }

    // End process, ready to parse
    if (this.onend) {
      this.onend();
    }
  }
  private throw(error: TiebaParserError) {
    this.error = { ...error };
    if (this.onerror && typeof this.onerror === 'function') {
      this.onerror(error);
    }
    throw new Error(error.message);
  }
  public onmetadata: TIEBA_PARSER_HANDLER;
  public onentry: TIEBA_PARSER_HANDLER;
  public onerror: TIEBA_PARSER_HANDLER;
  public onend: TIEBA_PARSER_HANDLER;
  public set src(html: string) {
    this.html = html;
    this.parse(html);
  }
  public get src() {
    return this.html;
  }
  constructor(handler?: TiebaThreadContentHandler, metadata?: TiebaThreadMetadataResolver) {
    this.handler = handler || new TiebaThreadContentHandler();
    this.metadata = metadata || new TiebaThreadMetadataResolver();
  }
}
