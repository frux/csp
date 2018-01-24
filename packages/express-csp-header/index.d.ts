declare module 'express-csp-header' {
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

  // as soon as csp-header starts exposing TypeScript declarations,
  // use that instead of this insipid temporariness
  type Policies = Dictionary<string[] | boolean>;

  type ReportUriFunc = (req: Request, res: Response) => string;

  interface Params {
    policies?: Policies;
    extend?: Policies;
    presets?: Array<Policies | string> | Dictionary<Policies | string>;
    reportOnly?: boolean;
    reportUri?: string | ReportUriFunc;
  }

  function expressCsp(params: Params): RequestHandler;

  export = expressCsp;
}
