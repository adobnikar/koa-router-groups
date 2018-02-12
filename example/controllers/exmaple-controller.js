"use strict";

/**
 * Login function.
 */
async function login(ctx, next) {
	// Set the auth token.
	let opts = {
		overwrite: true,
		httpOnly: true,
		maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in miliseconds.
	};
	ctx.cookies.set("X-Auth-Token", "123456", opts);
	ctx.body = {message: "Login successful."};
}

/**
 * Logout function.
 */
async function logout(ctx, next) {
	// Delete the auth token.
	let opts = {
		overwrite: true,
		httpOnly: true,
		maxAge: 0, // 0 miliseconds.
	};
	ctx.cookies.set("X-Auth-Token", null, opts);
	ctx.body = {message: "Logout successful."};
}

/**
 * Get protected data.
 */
async function index(ctx, next) {
	ctx.body = {message: "You now have access to protected data."};
}

/**
 * Exported functions.
 * @type {Object}
 */
module.exports = {
	login,
	logout,
	index,
};