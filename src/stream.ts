import { TiebaParser } from './parser';

export enum TIEBA_STREAM_EVENT {
  DATA = 'data',
  ENTRY = 'entry',
  ERROR = 'error',
  END = 'end',
  METADATA = 'metadata'
}

export type TIEBA_STREAM_EVENT_TYPE = 'data' | 'metadata' | 'entry' | 'error' | 'end';
export type TIEBA_STREAM_EVENT_LISTENER = (event?: any) => void;

export class TiebaStream {
  public static EVENT = TIEBA_STREAM_EVENT;
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
    this.parser.onentry = (post) => {
      this.emit(TIEBA_STREAM_EVENT.ENTRY, post);
    }
    this.parser.onmetadata = (metadata) => {
      this.emit(TIEBA_STREAM_EVENT.METADATA, metadata);
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
