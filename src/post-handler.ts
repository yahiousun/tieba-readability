import { TiebaThreadMetadataObject } from './metadata-resolver';
import { TiebaUserObject, AuthorHandler } from './author-handler';

export interface PostHandlerOptions {
  strip_links?: boolean;
  strip_images?: boolean;
  strip_small_images?: boolean;
  strip_stickers?: boolean;
  strip_extra_spaces: boolean;
}

export interface TiebaThreadPostObject {
  id: number;
  content: string;
  updated?: string;
  number?: number;
  author?: TiebaUserObject;
  url?: string;
}

export class PostHandler {
  static get OPTIONS() {
    return {
      strip_links: true,
      strip_images: false,
      strip_small_images: true,
      strip_stickers: true,
      strip_extra_spaces: true
    };
  }
  static get MIN_IMAGE_WIDTH() {
    return 400;
  }
  static get MIN_IMAGE_HEIGHT() {
    return 300;
  }
  static get REGEX() {
    return {
      LINK: /<a.*?>([^>]*)<\/a>/g,
      ID: /<div\sid="post_content_(\d+)"/,
      CONTENT: /<cc>.*?<div\sid="post_content_.*?>(.*?)<\/div>.*?<\/cc>/i,
      UPDATED: /<span[^>]*class="tail-info">(\d{4}-\d{2}-\d{2}[^/d]*?\d{2}:\d{2})<\/span>/,
      NUMBER: /<span[^>]*class="tail-info">(\d+)\u697c<\/span>/,
      STICKER: /<img[^>]*class="BDE_Smiley"[^>]*src="([^"]*)"[^>]*>/g,
      IMAGE: /<img[^>]*class="BDE_Image"[^>]*width="([^"]*)"[^>]*height="([^"]*)"[^>]*src="([^"]*)"[^>]*>/g
    };
  }
  static extract(property: string, source: string) {
    let match, result;
    switch (property) {
      case 'id': {
        match = PostHandler.REGEX.ID.exec(source);
        if (match && match[1]) {
          result = +match[1];
        }
        break;
      }
      case 'content': {
        match = PostHandler.REGEX.CONTENT.exec(source);
        if (match && match[1]) {
          result = match[1];
        }
        break;
      }
      case 'updated': {
        match = PostHandler.REGEX.UPDATED.exec(source);
        if (match && match[1]) {
          result = new Date(match[1]).toISOString();
        }
        break;
      }
      case 'number': {
        match = PostHandler.REGEX.NUMBER.exec(source);
        if (match && match[1]) {
          result = +match[1];
        }
        break;
      }
      case 'author': {
        result = AuthorHandler.parse(source);
        break;
      }
      default: {
        return;
      }
    }
    return result;
  }
  private options: PostHandlerOptions;
  constructor(options?: PostHandlerOptions) {
    this.options = { ...PostHandler.OPTIONS, ...options };
  }
  parse(source: string): TiebaThreadPostObject {
    const { strip_links, strip_images, strip_small_images, strip_stickers, strip_extra_spaces } = this.options;
    const id = PostHandler.extract('id', source);
    const updated = PostHandler.extract('updated', source);
    const number = PostHandler.extract('number', source);
    const author = AuthorHandler.parse(source);
    let content = PostHandler.extract('content', source);

    if (content) {
      // Strip all links leave text
      if (strip_links) {
        content = content.replace(PostHandler.REGEX.LINK, '$1');
      }
      // Strip all images
      if (strip_images) {
        content = content.replace(PostHandler.REGEX.IMAGE, '');
      } else {
        // Strip all Tieba Stickers
        if (strip_stickers) {
          content = content.replace(PostHandler.REGEX.STICKER, '');
        }
        // Strip all small images (Min Resolution: 400 x 300)
        if (strip_small_images) {
          content = content.replace(PostHandler.REGEX.IMAGE, (str, $1, $2) => {
            if ($1 > PostHandler.MIN_IMAGE_WIDTH && $2 > PostHandler.MIN_IMAGE_HEIGHT) {
              return str;
            }
            return '';
          });
        }
      }
      // Strip spaces between content
      if (strip_extra_spaces) {
        content = content.trim();
      }
    }

    if (id && content) {
      return {
        id,
        number,
        content,
        updated,
        author,
      };
    }
    return;
  }
}
