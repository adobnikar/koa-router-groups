"use strict";

/**
 * Options middleware.
 * Send a 200 OK response to OPTIONS requests.
 *
 * @reviewedBy TODO
 */
async function middleware(ctx, next) {
	if (ctx.method === "OPTIONS") {
		ctx.status = 200;
	} else {
		await next();
	}
}

/**
 * Exported functions.
 * @type {Object}
 */
module.exports = middleware;
