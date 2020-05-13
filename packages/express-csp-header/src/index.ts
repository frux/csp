import crypto from 'crypto';

import { getCSP, CSPHeaderParams, nonce } from 'csp-header';
import { RequestHandler, Request, Response } from 'express';
import * as psl from 'psl';

import { NONCE, TLD } from './constants';

export * from './constants';

type ReportUriFunction = (req: Request, res: Response) => string;

export interface ParseOptions {
	customTlds?: string[] | RegExp;
}

export interface ExpressCSPParams extends Omit<CSPHeaderParams, 'reportUri'> {
    domainOptions?: ParseOptions,
    reportOnly?: boolean,
    reportUri?: string | ReportUriFunction,
}

export function expressCspHeader(params?: ExpressCSPParams): RequestHandler {
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
        let tld = parseDomain(req.hostname, domainOptions);

        if (!tld) {
            return cspString;
        }

        return cspString.replace(new RegExp(TLD, 'g'), tld);
    }

    return cspString;
}

function parseDomain(hostname: string, domainOptions?: ParseOptions): string | null {
	let customTlds = domainOptions?.customTlds;
	if (customTlds instanceof RegExp) {
		const tld = hostname.match(customTlds);
		if (tld !== null) {
			return tld[0].replace(/^\.+/, '');
		}
	}

	if (Array.isArray(customTlds)) {
		for (const tld of customTlds) {
			if (hostname.endsWith(`.${tld}`)) {
				return tld;
			}
		}
	}

	let domain = psl.parse(hostname);

	if (domain.error) {
		return null;
	}

	return domain.tld;
}

const CSP_HEADER = 'Content-Security-Policy';
const CSP_REPORT_ONLY_HEADER = 'Content-Security-Policy-Report-Only';

function setHeader(res: Response, cspString: string, params: ExpressCSPParams): void {
    let headerName = params.reportOnly ? CSP_REPORT_ONLY_HEADER : CSP_HEADER;
    res.set(headerName, cspString);
}
