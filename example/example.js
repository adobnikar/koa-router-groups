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