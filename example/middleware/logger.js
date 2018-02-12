"use strict";

/**
 * Logger middleware.
 * Log each request to the console.
 *
 * @reviewedBy TODO
 */
async function middleware(ctx, next) {
	const start = new Date();
	await next();
	const ms = new Date() - start;
	console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
}

/**
 * Exported functions.
 * @type {Object}
 */
module.exports = middleware;
