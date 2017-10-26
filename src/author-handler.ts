import { noprotocol } from './utilities';

export interface TiebaUserObject {
  id: number;
  name: string;
  avatar?: string;
}

export class AuthorHandler {
  static get REGEX() {
    return {
      NAME: /class="d_name"[^>]*>\s*<a[^>]*>(.*?)<\/a>/,
      ID: /class="d_name"\sdata-field=[^\d]*(\d*)[^>]*>/,
      AVATAR: /<img\susername="[^>]*?(data-tb-lazyload="([^"]*?)"|src="([^"]*?)")[^>]*?>/
    };
  }
  static extract(property: string, source: string) {
    let match, result;
    switch (property) {
      case 'id': {
        match = AuthorHandler.REGEX.ID.exec(source);
        if (match && match[1]) {
          result = +match[1];
        }
        break;
      }
      case 'name': {
        match = AuthorHandler.REGEX.NAME.exec(source);
        if (match && match[1]) {
          result = match[1].trim();
        }
        break;
      }
      case 'avatar': {
        match = AuthorHandler.REGEX.AVATAR.exec(source);
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
    const id = AuthorHandler.extract('id', source);
    const name = AuthorHandler.extract('name', source);
    let avatar = AuthorHandler.extract('avatar', source);
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
