import crypto from 'crypto';

import { getCSP, CSPHeaderParams, nonce } from 'csp-header';
import { RequestHandler, Request, Response } from 'express';
import parseDomain, { ParseOptions } from 'parse-domain';

import { NONCE, TLD } from './constants';

export * from './constants';

type ReportUriFunction = (req: Request, res: Response) => string;

export interface ExpressCSPParams extends Omit<CSPHeaderParams, 'reportUri'> {
    domainOptions?: ParseOptions,
    reportOnly?: boolean,
    reportUri?: string | ReportUriFunction,
}

export function expressCsp(params?: ExpressCSPParams): RequestHandler {
    return function (req, res, next) {
        if (!params) {
            next();
            return;
        }

        let { domainOptions } = params;
        let cspString = getCspString(req, res, params);
        cspString = applyNonce(req, cspString);
        cspString = applyAutoTld(req, cspString, domainOptions);

        setHeader(res, cspString, params);

        next();
    };
}

function getCspString(req: Request, res: Response, params: ExpressCSPParams): string {
    let { directives, presets, reportUri } = params;
    let cspHeaderParams: CSPHeaderParams = {
        directives,
        presets,
        reportUri: typeof reportUri === 'function' ? reportUri(req, res) : reportUri
    };
    
    return getCSP(cspHeaderParams);
}

function applyNonce(req: Request, cspString: string): string {
    if (cspString.includes(NONCE)) {
        req.nonce = crypto.randomBytes(16).toString('base64');

        return cspString.replace(new RegExp(NONCE, 'g'), nonce(req.nonce));
    }

    return cspString;
}

function applyAutoTld(req: Request, cspString: string, domainOptions?: ParseOptions): string {
    if (cspString.includes(TLD)) {
        let domain = parseDomain(req.hostname, domainOptions);

        if (!domain || !domain.tld) {
            return cspString;
        }

        return cspString.replace(new RegExp(TLD, 'g'), domain.tld);
    }

    return cspString;
}

const CSP_HEADER = 'Content-Security-Policy';
const CSP_REPORT_ONLY_HEADER = 'Content-Security-Policy-Report-Only';

function setHeader(res: Response, cspString: string, params: ExpressCSPParams): void {
    let headerName = params.reportOnly ? CSP_REPORT_ONLY_HEADER : CSP_HEADER;
    res.set(headerName, cspString);
}
