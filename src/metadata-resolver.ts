import { TiebaUserObject } from './author-handler';
import { PostHandler } from './post-handler';
import { OriginalPosterHandler } from './original-poster-handler';
import { noprotocol, absolute } from './utilities';

export interface TiebaThreadMetadataObject {
  id: number;
  title: string;
  url: string; // URL
  page_count: number;
  reply_count?: number;
  author?: TiebaUserObject;
  previous_page_url?: string;
  next_page_url?: string;
  first_page_url?: string;
  last_page_url?: string;
  summary?: string;
}

export interface MetadataResolverOptions {
  generate_summary?: boolean;
  max_summary_length?: number;
}

export class MetadataResolver {
  static get REGEX() {
    return {
      HTML: /(<([^>]+)>)/ig,
      LINE_FEED: /(\n|\r)/g,
      BR: /(<br(\\|\s)?>)/ig,
      TITLE: /<h3[^>]*class="core_title_txt[^>]*?>(.*?)<\/h3>/,
      PAGE_COUNT: /<li[^>]*class="l_reply_num.*?<\/span>[^<]*?<span[^>]*?>(.*?)<\/span>/,
      REPLY_COUNT: /<li\sclass="l_reply_num"[^>]*><span[^>]*>(\d+)<\/span>/,
      CANONICAL_URL: /<link[^>]*rel="canonical"[^>]*href="([^"]*)"/,
      PREVIOUS_PAGE_URL: /<a\shref="([^>]*)">\d+<\/a>\n?<span[^>]*class="tP">[^<]*<\/span>/i,
      NEXT_PAGE_URL: /<span[^>]*class="tP">[^<]*<\/span>\n?<a\shref="([^>]*)">\d+<\/a>/i,
      FIRST_PAGE_URL: /<a href="([^>]*)">\u9996\u9875<\/a>/i,
      LAST_PAGE_URL: /<a href="([^>]*)">\u5c3e\u9875<\/a>/i,
      ID: /<a\sid="lzonly_cntn"\shref="\/p\/(\d+)/,
    };
  }
  static get OPTIONS() {
    return {
      generate_summary: true,
      max_summary_length: 140
    };
  }
  static get BASE_URL() {
    return '//tieba.baidu.com';
  }
  static fixurl(url: string) {
    let result;
    if (!url) {
      return;
    }
    result = noprotocol(url);
    result = absolute(MetadataResolver.BASE_URL, url);
    return result;
  }
  static extract(property: string, source: string) {
    let match, result;
    switch (property) {
      case 'title': {
        match = MetadataResolver.REGEX.TITLE.exec(source);
        if (match && match[1]) {
          result = match[1];
        }
        break;
      }
      case 'id': {
        match = MetadataResolver.REGEX.ID.exec(source);
        if (match && match[1]) {
          result = +match[1];
        }
        break;
      }
      case 'page-count': {
        match = MetadataResolver.REGEX.PAGE_COUNT.exec(source);
        if (match && match[1]) {
          result = +match[1];
        }
        break;
      }
      case 'reply-count': {
        match = MetadataResolver.REGEX.REPLY_COUNT.exec(source);
        if (match && match[1]) {
          result = +match[1];
        }
        break;
      }
      case 'url': {
        match = MetadataResolver.REGEX.CANONICAL_URL.exec(source);
        if (match && match[1]) {
          result = match[1];
        }
        break;
      }
      case 'previous-page-url': {
        match = MetadataResolver.REGEX.PREVIOUS_PAGE_URL.exec(source);
        if (match && match[1]) {
          result = match[1];
        }
        break;
      }
      case 'next-page-url': {
        match = MetadataResolver.REGEX.NEXT_PAGE_URL.exec(source);
        if (match && match[1]) {
          result = match[1];
        }
        break;
      }
      case 'first-page-url': {
        match = MetadataResolver.REGEX.FIRST_PAGE_URL.exec(source);
        if (match && match[1]) {
          result = match[1];
        }
        break;
      }
      case 'last-page-url': {
        match = MetadataResolver.REGEX.LAST_PAGE_URL.exec(source);
        if (match && match[1]) {
          result = match[1];
        }
        break;
      }
      case 'author': {
        result = OriginalPosterHandler.parse(source);
        break;
      }
      default: {
        return result;
      }
    }
    return result;
  }
  private options: MetadataResolverOptions;
  constructor(options?: MetadataResolverOptions) {
    this.options = { ...MetadataResolver.OPTIONS, ...options };
  }
  parse(source: string): TiebaThreadMetadataObject {
    const { generate_summary, max_summary_length } = this.options;
    const id = MetadataResolver.extract('id', source);
    const title = MetadataResolver.extract('title', source);
    const reply_count = MetadataResolver.extract('reply-count', source);
    const page_count = MetadataResolver.extract('page-count', source);
    const author = OriginalPosterHandler.parse(source);
    let url = MetadataResolver.extract('url', source);
    let previous_page_url = MetadataResolver.extract('previous-page-url', source);
    let next_page_url = MetadataResolver.extract('next-page-url', source);
    let first_page_url = MetadataResolver.extract('first-page-url', source);
    let last_page_url = MetadataResolver.extract('last-page-url', source);
    let metadata, opening, summary;

    url = MetadataResolver.fixurl(url);
    previous_page_url = MetadataResolver.fixurl(previous_page_url);
    next_page_url = MetadataResolver.fixurl(next_page_url);
    first_page_url = MetadataResolver.fixurl(first_page_url);
    last_page_url = MetadataResolver.fixurl(last_page_url);

    metadata = {
      id,
      title,
      url,
      reply_count,
      page_count,
      author,
      previous_page_url,
      next_page_url,
      first_page_url,
      last_page_url
    };

    if (generate_summary) {
      // Get first post
      opening = PostHandler.extract('content', source);
      if (opening && opening.length) {
        // Strip all links leave text
        summary = opening.replace(PostHandler.REGEX.LINK, '$1');
        summary = summary.replace(MetadataResolver.REGEX.LINE_FEED, '');
        // Replace <br> with \n
        summary = summary.replace(MetadataResolver.REGEX.BR, '\n');
        // Strip all HTML tags
        summary = summary.replace(MetadataResolver.REGEX.HTML, '');
        // Strip extra spaces
        summary = summary.trim();
      }
      if (summary !== '') {
        metadata.summary = summary.substr(0, max_summary_length);
      }
    }

    if (id && title) {
      return metadata;
    }
    return;
  }
}
