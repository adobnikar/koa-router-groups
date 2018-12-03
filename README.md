# Middleware groups for koa-router #

## Requirements ##

- requires **node v7.6.0** or higher for ES2015 and async function support

## Installation ##

Run the npm install command:
```bash

npm i koa-router-groups --save
# or
yarn add koa-router-groups

```

After installing koa-router-groups, all you need to do is extend an existing koa router instance with the extend function.
```javascript
const Koa = require("koa");
const KoaRouter = require("koa-router");
const KoaRouterGroups = require("koa-router-groups");

let koa = new Koa();
let koaRouter = new KoaRouter();
KoaRouterGroups.extend(koaRouter);
```

## Quick Example ##

```javascript

const Koa = require("koa");
const KoaRouter = require("koa-router");
const KoaRouterGroups = require("koa-router-groups");

let app = new Koa();
let router = new KoaRouter();
KoaRouterGroups.extend(router); // Extend the router with "registerMiddleware", "pushMiddleware", "popMiddleware" and "group" functions.

// Register some middleware functions.
router.registerMiddleware("logger", async (ctx, next) => { /* Middleware function. */ });
router.registerMiddleware("body", async (ctx, next) => { /* Middleware function. */ });
router.registerMiddleware("auth", async (ctx, next) => { /* Middleware function. */ });
router.registerMiddleware("auth.admin", async (ctx, next) => { /* Middleware function. */ });
router.registerMiddleware("auth.root", async (ctx, next) => { /* Middleware function. */ });

// Push 3 middleware functions that every route will use to the stack.
router.pushMiddleware("logger", async (ctx, next) => { /* Middleware function. */ }, "body");

router.group("auth", () => {

	// ... define routes here that need to pass "auth" middleware ...

	router.group("auth.admin", () => {
		// ... define routes here that need to pass "auth" and "auth.admin" middleware ...
	});

	router.group("auth.root", () => {
		// ... define routes here that need to pass "auth" and "auth.root" middleware ...
	});
});

// Remove the 3 middlewares that were pushed to the stack.
router.popMiddleware();

app.use(router.routes()).use(router.allowedMethods());

// Start the server.
let server = app.listen(process.env.SERVER_PORT || 3000);

// ...

```

## Functions ##

### .registerMiddleware(name, middleware) ###

```javascript
/**
 * Registers the middleware so that it can be called/used with the reference name string instead of directly using the function definition.
 * 
 * @param {string} name Middleware name for reference.
 * @param {function} middleware Middleware function.
 */
```

### .pushMiddleware(...middleware) ###

```javascript
/**
 * Push a batch of middleware functions to the top of the middleware stack.
 * 
 * @param {...function} ...middleware Batch of middleware functions.
 */
```

### .popMiddleware() ###

```javascript
/**
 * Pops the batch of middleware functions that is on top of the middleware stack.
 */
```

### .group(...middleware, callback) ###

```javascript
/**
 * Group routes that use the same middleware.
 * 
 * @param {...function} ...middleware Batch of middleware functions.
 * @param {function} callback Callback wrapper function. Any routes within this function will have to pass the batch of middleware function.
 */
```

## Full Example ##

A working example can be found in this repository. You can start it by running the `example/example.js` file.
If you want to read the source of the example you can download the [example.zip](./example.zip) and extract it to a folder. The most important files in the example are `example/example.js` and `example/example-routes.js`.

### Contents of `example/example.js` - this is the server file ###

```javascript

"use strict";

const Koa = require("koa");

// Require middlewares.
const mwResponseTime = require("./middleware/response-time");
const mwLogger = require("./middleware/logger");
const mwOptions = require("./middleware/options");
const mwErrorHandler = require("./middleware/error-handler");

// Require router.
const routes = require("./example-routes");

// Server setup.
let app = new Koa(); // Create a Koa server instance.
// Define which middleware every request will have to pass through:
app.use(mwResponseTime);
app.use(mwLogger);
app.use(mwOptions);
app.use(mwErrorHandler);

// Apply routes.
let router = routes(app);

// Start the server.
let server = app.listen(process.env.SERVER_PORT || 3000);
if (server.address() === null) {
	let errMsg = 'Error: Please select a different server port by configuring the ".env" file.';
	console.error(errMsg);
	process.exit(1);
}
console.log("Server: http://127.0.0.1:" + server.address().port);

```

### Contents of `example/example-routes.js` - this is the routes file ###

```javascript

"use strict";

const KoaRouter = require("koa-router");
const KoaRouterGroups = require("koa-router-groups");

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

```