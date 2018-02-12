"use strict";

/**
 * Response time middleware.
 * Time the response and set the x-response-time response header.
 *
 * @reviewedBy TODO
 */
async function middleware(ctx, next) {
	const start = new Date();
	await next();
	const ms = new Date() - start;
	ctx.set("X-Response-Time", `${ms}ms`);
}

/**
 * Exported functions.
 * @type {Object}
 */
module.exports = middleware;
