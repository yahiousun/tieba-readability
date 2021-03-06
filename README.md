# tieba-readability
[![Build Status](https://travis-ci.org/yahiousun/tieba-readability.svg?branch=master)](https://travis-ci.org/yahiousun/tieba-readability)

百度贴吧脚本，将贴吧帖子转换为易读的markdown文档或JSON

## Getting started
### Installation
Via [npm](https://www.npmjs.com/):  

``` bash
npm i tieba-readability
```
### Use
Parse Tieba thread 

``` javascript
import { TiebaReadability } from 'tieba-readability';

const parser = new TiebaReadability();
const thread = parser.parse(html): TiebaReadabilityObject;
```

Custom parser  

``` javascript
import { TiebaThreadParser } from 'tieba-readability';

const parser = new TiebaThreadParser(options, metadataResolver, postHandler);

parser.onmetadata = (metadata) => {
	// handle metadata
};
parser.onpost = (post) => {
	// handle post
};
parser.onend = () => {
	// end
}
parser.source = html;
```

### Interface
贴吧 ```TiebaUserObject``` 对象  

``` typescript
interface TiebaUserObject {
  id: number; // Tieba user id
  name: string; // Tieba user name
  avatar?: string; // Tieba user avatar
}
```

贴吧帖子 ```TiebaThreadPostObject``` 对象  

``` typescript
interface TiebaThreadPostObject {
  id: number; // Tieba thread post id
  content: string; // Tieba thread post content, html
  updated?: string; // Tieba thread post update time, ISO string
  number?: number; // Tieba thread post number
  author?: TiebaUserObject; // Tieba thread post author, TiebaUserObject
  url?: string;  // Tieba thread post url
}
```
贴吧帖子 ```TiebaThreadMetadata``` 对象  

``` typescript
interface TiebaThreadMetadataObject {
  id: number; // Tieba thread id
  title: string; // Tieba thread title
  url: string; // Tieba thread url
  page_number: number; // Current page number
  page_count: number; // Tieba thread total pages
  reply_count?: number; // Tieba thread total replies
  author?: TiebaUserObject; // Tieba thread original poster
  previous_page_url?: string; // Tieba thread previous page url
  next_page_url?: string; // Tieba thread next page url
  first_page_url?: string; // Tieba thread first page url
  last_page_url?: string; // Tieba thread last page url
  summary?: string; // Tieba thread current page summary
}
```

贴吧 ```TiebaReadability ``` 对象  

``` typescript
interface TiebaReadabilityObject extends TiebaThreadMetadataObject {
  word_count: number; // How many words
  content: string; // markdown string
}
```