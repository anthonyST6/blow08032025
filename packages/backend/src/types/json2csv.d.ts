declare module 'json2csv' {
  export interface Options<T> {
    fields?: Array<string | { label: string; value: string | ((row: T) => any) }>;
    delimiter?: string;
    quote?: string;
    escapedQuote?: string;
    header?: boolean;
    eol?: string;
    excelStrings?: boolean;
    includeEmptyRows?: boolean;
    withBOM?: boolean;
  }

  export class Parser<T = any> {
    constructor(opts?: Options<T>);
    parse(data: T | T[]): string;
  }

  export function parse<T = any>(data: T | T[], opts?: Options<T>): string;
  export function parseAsync<T = any>(data: T | T[], opts?: Options<T>): Promise<string>;
}