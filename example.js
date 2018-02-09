"use strict";

const Lib = require("./index");

async function asyncWrapper() {
	// TODO
}

asyncWrapper().then(error => {
	console.log("Done.");
	process.exit(0);
}).catch(error => {
	console.error(error);
	console.error(error.stack);
	console.error("Exit.");
	process.exit(1);
});
