"use strict";

/**
 * Auth middleware.
 * Check if user logged in.
 */
async function auth(ctx, next) {
	// Try to find/get the auth token.
	let token = ctx.cookies.get("X-Auth-Token");

	// Check if token found and valid.
	if (token !== "123456") {
		ctx.throw(401, "Not authorized. Please login.");
	}

	await next();
}

/**
 * Exported functions.
 * @type {Object}
 */
module.exports = auth;
