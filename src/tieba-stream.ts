import { TiebaParser } from './tieba-parser';

enum TIEBA_STREAM_EVENT {
  DATA = 'data',
  TITLE = 'title',
  PAGE_COUNT = 'pagecount',
  POST = 'post',
  ERROR = 'error',
  END = 'end'
}

export type TIEBA_STREAM_EVENT_TYPE = 'data' | 'title' | 'pagecount' | 'post' | 'error' | 'end';
export type TIEBA_STREAM_EVENT_LISTENER = (event?: any) => void;

export class TiebaStream {
  private events: { [type: string]: Array<TIEBA_STREAM_EVENT_LISTENER> };
  private parser: TiebaParser;
  private emit(event, ...args) {
    let i, listeners;
    if (typeof this.events[event] === 'object') {
      listeners = this.events[event].slice();
      for (i = 0; i < listeners.length; i++) {
        listeners[i].apply(this, args);
      }
    }
  }
  constructor() {
    this.events = {};
    this.parser = new TiebaParser();
    this.parser.ontitle = (title) => {
      this.emit(TIEBA_STREAM_EVENT.TITLE, title);
    }
    this.parser.onpagecount = (pagecount) => {
      this.emit(TIEBA_STREAM_EVENT.PAGE_COUNT, pagecount);
    }
    this.parser.onpost = (post) => {
      this.emit(TIEBA_STREAM_EVENT.POST, post);
    }
    this.parser.onerror = () => {
      this.emit(TIEBA_STREAM_EVENT.ERROR);
    }
    this.parser.onend = () => {
      this.emit(TIEBA_STREAM_EVENT.END);
    }
    this.on(TIEBA_STREAM_EVENT.DATA, (data: string) => {
      this.parser.src = data;
    });
    this.parser;
  }
  on(event: TIEBA_STREAM_EVENT_TYPE, listener: TIEBA_STREAM_EVENT_LISTENER) {
    if (typeof this.events[event] !== 'object') {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  off(event: TIEBA_STREAM_EVENT_TYPE, listener: TIEBA_STREAM_EVENT_LISTENER) {
    let index;
    if (typeof this.events[event] === 'object') {
      index = this.events[event].indexOf(listener);
      if (index > -1) {
        this.events[event].splice(index, 1);
      }
    }
  }
  write(data: string) {
    this.emit(TIEBA_STREAM_EVENT.DATA, data);
  }
}
