export interface TiebaParserError {
  code: number;
  message: string;
}

export enum TiebaParserErrorCode {
  THREAD_NOT_FOUND = 1,
  UNKNOWN
}

export const TiebaParserErrorMessage = {
  [TiebaParserErrorCode.THREAD_NOT_FOUND]: 'Thread not found'
};

export class TiebaParserException {
  public static threadNotFound(): TiebaParserError {
    return {
      code: TiebaParserErrorCode.THREAD_NOT_FOUND,
      message: TiebaParserErrorMessage[TiebaParserErrorCode.THREAD_NOT_FOUND]
    };
  }
}
