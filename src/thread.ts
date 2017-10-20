export interface TiebaThreadMetadata {
  title: string;
  id: number;
  link?: string;
  page_count?: number;
  next_link?: string;
}

export interface TiebaThreadAuthor {
  name: string;
  id?: number;
  avatar?: string;
}

export interface TiebaThreadEntry {
  link?: string;
  id?: number;
  content: string;
  updated?: string;
  author?: TiebaThreadAuthor;
}

export interface TiebaThreadObject extends TiebaThreadMetadata {
  word_count?: number;
  content: string;
}
