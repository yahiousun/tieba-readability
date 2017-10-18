export function stripLineFeed(input: string) {
  return input.replace(/\n/ig, '');
}

export function stripDiv(input: string) {
  return input.match(/<div\sid=\"post_content_.*?>(.*?)<\/div>/i)[1];
}

export function stripLink(input: string) {
  return input.replace(/<a\b[^>]*>/gi, '').replace(/<\/a>/gi, '');
}

export function stripBlankLine(input: Array<string>) {
  return input.filter((item) => {
    return item.replace(/\s/g, '') !== '';
  });
}

export function stripImgAttrs(input: string) {
  return input.replace(/\s(class|pic_type|size)=\"[^"]*\"/ig, '');
}

export function stripExtraBr(input: string) {
  return input.replace(/(<br>){2,}/ig, '<br>');
}

export function stripExtraTags(input: string) {
  return input.replace(/(<([^>]+)>)/g, '');
}

export function findReplies(input: string) {
  return input.match(/<cc>(.*?)<\/cc>/ig);
}
