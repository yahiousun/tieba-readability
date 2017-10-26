export function noprotocol(url: string) {
  if (!url) {
    return;
  }
  return url.replace(/^https?:/, '');
}

export function absolute(baseUrl: string, url: string) {
  if (!url) {
    return;
  }
  if (!/^(https?:)?\/\//.test(url)) {
    return `${baseUrl}${url}`;
  }
  return url;
}
