import {
	expressCspHeader,
	type ExpressCSPParams,
} from "express-csp-header";
import type { Request } from "express";

const params: ExpressCSPParams = {};
declare const request: Request;

expressCspHeader(params);
request.nonce satisfies string;
