import { TiebaThreadMetadata, TiebaThreadEntry } from './thread';
const TIEBA_THREAD_CONTENT_HANDLER_REGEX = {
  LINK: /<a.*?>([^>]*)<\/a>/g,
  ENTRY_ID: /<div\sid=\"post_content_(\d+)\"/,
  ENTRY_CONTENT: /<cc>.*?<div\sid=\"post_content_.*?>(.*?)<\/div>.*?<\/cc>/i,
  ENTRY_UPDATED: /<span\sclass=\"tail\-info\".*?<\/span>.*?<span\sclass=\"tail\-info\">(.*?)<\/span>/,
  AUTHOR_NAME: /class=\"d_name\"[^>]*>\s*<a[^>]*>(.*?)<\/a>/,
  AUTHOR_ID: /class=\"d_name\"\sdata-field=[^\d]*(\d*)[^>]*>/,
  AUTHOR_AVATAR: /<img\susername[^>]*src=\"([^\"]*?)\"[^>]*?>/,
  AUTHRO_AVATAR_LAZYLOAD: /<img\susername[^>]*data-tb-lazyload=\"([^\"]*?)\"[^>]*?>/,
  IMG_SRC: /<img[^>]*src=\"(.*?)\"[^>]*>/g
};

export function getEntryLink(threadUrl: string, entryId: number) {
  if (!threadUrl || !entryId) {
    return;
  }
  return `${threadUrl}#post_content_${entryId}`;
}
export function getEntryId(html: string) {
  const entryId = TIEBA_THREAD_CONTENT_HANDLER_REGEX.ENTRY_ID.exec(html);
  return entryId && +entryId[1];
}

export function getEntryContent(html: string) {
  let content: any = html.match(TIEBA_THREAD_CONTENT_HANDLER_REGEX.ENTRY_CONTENT);
  // Remove all links
  content = content[1].replace(TIEBA_THREAD_CONTENT_HANDLER_REGEX.LINK, '$1').trim();
  // Strip all image attributes
  content = content.replace(TIEBA_THREAD_CONTENT_HANDLER_REGEX.IMG_SRC, '<img src="$1">');
  return content;
}

export function getEntryUpdated(html: string) {
  const updated = html.match(TIEBA_THREAD_CONTENT_HANDLER_REGEX.ENTRY_UPDATED);
  return updated && new Date(updated[1]).toISOString();
}

export function getAuthorName(html: string) {
  const authorName = html.match(TIEBA_THREAD_CONTENT_HANDLER_REGEX.AUTHOR_NAME);
  return authorName && authorName[1].trim();
}

export function getAuthorId(html: string) {
  const authorId = html.match(TIEBA_THREAD_CONTENT_HANDLER_REGEX.AUTHOR_ID);
  return authorId && +authorId[1];
}

export function getAuthorAvatar(html: string) {
  let authorAvatar = html.match(TIEBA_THREAD_CONTENT_HANDLER_REGEX.AUTHRO_AVATAR_LAZYLOAD);
  if (!authorAvatar) {
    authorAvatar = html.match(TIEBA_THREAD_CONTENT_HANDLER_REGEX.AUTHOR_AVATAR);
  }
  return authorAvatar && authorAvatar[1];
}

export class TiebaThreadContentHandler {
  private metadata: TiebaThreadMetadata;
  constructor() {
    this.metadata;
  }
  setMetadata(metadata) {
    this.metadata = { ...metadata };
  }
  resolve(html: string): TiebaThreadEntry {
    const entryId = getEntryId(html);
    const author = {
      name: getAuthorName(html),
      id: getAuthorId(html),
      avatar: getAuthorAvatar(html)
    };
    const entry = {
      id: entryId,
      link: this.metadata ? getEntryLink(this.metadata.link, entryId) : undefined,
      content: getEntryContent(html),
      updated: getEntryUpdated(html),
      author
    };
    if (!entry.id) {
      return;
    }
    return entry;
  }
}
