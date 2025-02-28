import { randomBytes } from 'crypto';

import { getCSP, CSPHeaderParams, nonce } from 'csp-header';
import type { RequestHandler, Request, Response } from 'express';
import * as psl from 'psl';

import { NONCE, TLD } from './constants';

export * from './constants';

type ReportUriFunction = (req: Request, res: Response) => string;
type ReportToFunction = (req: Request, res: Response) => ReportTo[];

export interface ReportingEndpoint {
	name: string;
	uri: string;
}

export interface ReportTo {
	group: string;
	max_age: number;
	endpoints: { url: string }[];
	include_subdomains?: boolean;
}

export interface ParseOptions {
	customTlds?: string[] | RegExp;
}

export interface ExpressCSPParams extends Omit<CSPHeaderParams, 'reportUri'> {
	domainOptions?: ParseOptions,
	reportOnly?: boolean,
	reportTo?: ReportTo[] | ReportToFunction,
	reportUri?: string | ReportUriFunction,
	reportingEndpoints?: ReportingEndpoint[] | ((req: Request, res: Response) => ReportingEndpoint[]),
}

export function expressCspHeader(params?: ExpressCSPParams): RequestHandler {
	return function (req: Request, res: Response, next) {
		if (!params) {
			next();
			return;
		}

		const { domainOptions } = params;
		let cspString = getCspString(req, res, params);
		cspString = applyNonce(req, cspString);
		cspString = applyAutoTld(req, cspString, domainOptions);

		res.set(params.reportOnly ? CSP_REPORT_ONLY_HEADER : CSP_HEADER, cspString);

		const reportTo = typeof params.reportTo === 'function' ?
			params.reportTo(req, res) :
			params.reportTo;

		if (reportTo) {
			res.set(REPORT_TO_HEADER, reportTo.map(group => JSON.stringify(group)).join(','));
		}

		const reportingEndpoints = typeof params.reportingEndpoints === 'function' ?
			params.reportingEndpoints(req, res) :
			params.reportingEndpoints;

		if (reportingEndpoints) {
			const endpointsString = reportingEndpoints
				.map((endpoint) => `${endpoint.name}="${encodeURI(endpoint.uri)}"`)
				.join(', ');
			res.set(REPORTING_ENDPOINTS_HEADER, endpointsString);
		}

		next();
	};
}

function getCspString(req: Request, res: Response, params: ExpressCSPParams): string {
	const { directives, presets, reportUri } = params;
	const cspHeaderParams: CSPHeaderParams = {
		directives,
		presets,
		reportUri: typeof reportUri === 'function' ? reportUri(req, res) : reportUri
	};

	return getCSP(cspHeaderParams);
}

function applyNonce(req: Request, cspString: string): string {
	if (cspString.includes(NONCE)) {
		req.nonce = randomBytes(16).toString('base64');

		return cspString.replace(new RegExp(NONCE, 'g'), nonce(req.nonce));
	}

	return cspString;
}

function applyAutoTld(req: Request, cspString: string, domainOptions?: ParseOptions): string {
	if (cspString.includes(TLD)) {
		const tld = parseDomain(req.hostname, domainOptions);

		if (!tld) {
			return cspString;
		}

		return cspString.replace(new RegExp(TLD, 'g'), tld);
	}

	return cspString;
}

function parseDomain(hostname: string, domainOptions?: ParseOptions): string | null {
	const customTlds = domainOptions?.customTlds;
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

	const domain = psl.parse(hostname);

	if (domain.error) {
		return null;
	}

	return domain.tld;
}

const CSP_HEADER = 'Content-Security-Policy';
const CSP_REPORT_ONLY_HEADER = 'Content-Security-Policy-Report-Only';
const REPORT_TO_HEADER = 'Report-To';
const REPORTING_ENDPOINTS_HEADER = 'Reporting-Endpoints';
