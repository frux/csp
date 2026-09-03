import expressCsp = require("express-csp-header");
import type { Request } from "express";

const params: expressCsp.ExpressCSPParams = {};
declare const request: Request;

expressCsp.expressCspHeader(params);
request.nonce satisfies string;
