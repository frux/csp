declare module 'express-csp-header' {
  import csp = require('csp-header');
  import { Request, RequestHandler, Response } from 'express';

  namespace expressCsp {
    const SELF: string;
    const INLINE: string;
    const EVAL: string;
    const NONE: string;
    const NONCE: string;
    const TLD: string;
  }

  interface Dictionary<T> {
    [index: string]: T;
  }

  type ReportUriFunc = (req: Request, res: Response) => string;

  // https://github.com/peerigon/parse-domain#parseoptions
  interface ParseDomainOptions {
    customTlds?: RegExp | Array<string>;
    privateTlds?: boolean;
  }

  interface Params {
    policies?: csp.Policies;
    extend?: csp.Policies;
    presets?: Array<csp.Policies | string> | Dictionary<csp.Policies | string>;
    reportOnly?: boolean;
    reportUri?: string | ReportUriFunc;
    domainOptions?: ParseDomainOptions;
  }

  function expressCsp(params: Params): RequestHandler;

  export = expressCsp;
}
