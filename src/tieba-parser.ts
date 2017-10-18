const TIEBA_PARSER_REGEX = {
  SPECIAL: /<(script|style)\b[^<]*(?:(?!<\/(script|style)>)<[^<]*)*<\/(script|style)>/g,
  LINE_FEED: /(\n|\r)/g,
  TITLE: /<h3\sclass=\"core_title_txt.*?>(.*?)<\/h3>/ig,
  NUMBER_OF_PAGES: /<li\sclass=\"l_reply_num.*?<\/span>.*?<span.*?>(.*?)<\/span>/i,
  POST: /<cc>.*?<div\sid=\"post_content_.*?>(.*?)<\/div>.*?<\/cc>/ig
}

const MAX_POST_COUNT = 100;

export type TIEBA_PARSER_HANDLER = (data?: any) => void;

export class TiebaParser {
  private html: string;
  private parse(input: string) {
    // Preprocess html string, remove style and script tags
    const html = input.replace(TIEBA_PARSER_REGEX.SPECIAL, '').replace(TIEBA_PARSER_REGEX.LINE_FEED, '');
    let title, numberOfPages, post, count = 0;
    // Get thread title
    title = TIEBA_PARSER_REGEX.TITLE.exec(input);
    if (title) {
      this.ontitle && this.ontitle(title[1]);
    } else {
      this.onerror && this.onerror('Title not found');
    }
    // Get total number of pages
    numberOfPages = TIEBA_PARSER_REGEX.NUMBER_OF_PAGES.exec(input);
    if (numberOfPages) {
      this.onpagecount && this.onpagecount(+numberOfPages[1]);
    } else {
      this.onerror && this.onerror('Page not found');
    }
    // Get all posts
    while(true && count < MAX_POST_COUNT) {
      post = TIEBA_PARSER_REGEX.POST.exec(input);
      count ++;
      if (post && this.onpost) {
        this.onpost && this.onpost(post[1]);
      } else {
        break;
      }
    }
    // End process, ready to parse
    if (this.onend) {
      this.onend();
    }
  }
  public ontitle: TIEBA_PARSER_HANDLER;
  public onpagecount: TIEBA_PARSER_HANDLER;
  public onpost: TIEBA_PARSER_HANDLER;
  public onerror: TIEBA_PARSER_HANDLER;
  public onend: TIEBA_PARSER_HANDLER;
  public set src(html: string) {
    this.html = html;
    this.parse(html);
  }
  public get src() {
    return this.html;
  }
  constructor() {}
}
