# Middleware groups for koa-router #

## Requirements ##

- requires **node v7.6.0** or higher for ES2015 and async function support

## Installation ##

Run the npm install command:
```bash

# Signapps
yarn add git+ssh://git@signapps.io:signapps/node-koa-router-groups.git
# or
npm i --save git+ssh://git@signapps.io:signapps/node-koa-router-groups.git

# Bitbucket (adobnikar)
yarn add git+ssh://git@bitbucket.org:adobnikar/node-koa-router-groups.git
# or
npm i --save git+ssh://git@bitbucket.org:adobnikar/node-koa-router-groups.git

```

## Example ##

A working example can be found in this repository. You can start it by running the `example/example.js` file.
If you want to read the source of the example you can download the [example.zip](./example.zip) and extract it to a folder. The most important file in the example are `example/example.js` and `example/example-routes.js`.

### Contents of `example/example.js` ###

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

### Contents of `example/example-routes.js` ###

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