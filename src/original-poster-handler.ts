import { TiebaUserObject } from './author-handler';
import { noprotocol } from './utilities';

export class OriginalPosterHandler {
  static get REGEX() {
    return {
      NAME: /author:\s"([^"]*)"/,
      ID: /authorId:\s?(\d+),/
    };
  }
  static extract(property: string, source: string) {
    let match, result, name;
    switch (property) {
      case 'id': {
        match = OriginalPosterHandler.REGEX.ID.exec(source);
        if (match && match[1]) {
          result = +match[1];
        }
        break;
      }
      case 'name': {
        match = OriginalPosterHandler.REGEX.NAME.exec(source);
        if (match && match[1]) {
          result = match[1].trim();
        }
        break;
      }
      case 'avatar': {
        name = OriginalPosterHandler.extract('name', source);
        if (name) {
          const regex = new RegExp(`<img\\susername="${name.trim()}"[^>]*?(data-tb-lazyload="([^"]*?)"|src="([^"]*?)")[^>]*?>`);
          match = source.match(regex);
        }
        if (match) {
          if (match[2]) {
            result = match[2].trim();
          } else if (match[3]) {
            result = match[3].trim();
          }
        }
        break;
      }
      default: {
        throw new Error('Unknown Author property');
      }
    }
    return result;
  }
  static parse(source: string): TiebaUserObject {
    const id = OriginalPosterHandler.extract('id', source);
    const name = OriginalPosterHandler.extract('name', source);
    let avatar = OriginalPosterHandler.extract('avatar', source);
    avatar = noprotocol(avatar);
    if (id && name) {
      return {
        id,
        name,
        avatar
      };
    }
    return;
  }
}
