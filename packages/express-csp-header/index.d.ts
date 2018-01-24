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

  interface Params {
    policies?: csp.Policies;
    extend?: csp.Policies;
    presets?: Array<csp.Policies | string> | Dictionary<csp.Policies | string>;
    reportOnly?: boolean;
    reportUri?: string | ReportUriFunc;
  }

  function expressCsp(params: Params): RequestHandler;

  export = expressCsp;
}
