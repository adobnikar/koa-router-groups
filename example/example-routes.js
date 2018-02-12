"use strict";

const KoaRouter = require("koa-router");
const KoaRouterGroups = require("../index");

// Require middlewares.
const mwBodyParser = require("koa-bodyparser");
const mwAuth = require("./middleware/auth");

// Require controllers.
const Controller = require("./controllers/exmaple-controller");

// Route definitions.
module.exports = function (app) {
	// Create Koa Router.
	let router = new KoaRouter();
	KoaRouterGroups.extend(router); // Extend the router with "group" and "registerMiddleware" functions.
	
	// Register middlewares.
	router.registerMiddleware("body", mwBodyParser({
		jsonLimit: '50mb',
		formLimit: '50mb',
		textLimit: '50mb',
	}));
	router.registerMiddleware("auth", mwAuth);

	// Push the middleware used by all routes to the stack.
	router.pushMiddleware("body");

	// Define API functions.
	router.get("auth.login", "/login", Controller.login);

	// Auth group. Any routes in this group need to pass the "AuthMiddleware.auth" middleware.
	router.group("auth", () => {
		// Logout route.
		router.get("auth.logout", "/logout", Controller.logout);

		// Get protected data.
		router.get("data.index", "/data", Controller.index);
	});

	// Apply the routes to the app.
	app.use(router.routes()).use(router.allowedMethods());

	return router;
};
