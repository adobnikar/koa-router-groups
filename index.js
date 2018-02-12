"use strict";

const isFunction = require("lodash.isfunction");
const isString = require("lodash.isstring");

function expandTheStack(stack) {
	let mw = [];
	for (let element of stack) {
		mw = mw.concat(element);
	}
	return mw;
}

function expandArray(array) {
	let arrayExpanded = [];
	for (let element of array) {
		if (element.constructor === Array)			{
			arrayExpanded = arrayExpanded.concat(element);
		}		else {
			arrayExpanded.push(element);
		}
	}
	return arrayExpanded;
}

function resolveRegisteredMiddleware(registry, mw) {
	let mwResolved = [];
	let mwNames = [];
	for (let element of mw) {
		if (isString(element)) {
			// Try to resolve this string to middleware.
			if (!registry.has(element))				{
				throw new Error('There is no middleware with name "' + element + '" registered.');
			}
			// Resolve
			mwResolved.push(registry.get(element));
			mwNames.push(element);
		} else if (isFunction(element)) {
			// Just copy.
			mwResolved.push(element);
			mwNames.push(element.name);
		} else {
			throw new Error("Expected a string or function as middleware.");
		}
	}

	return {
		mw: mwResolved,
		names: mwNames,
	};
}

function extend(router) {
	// All the data used by this extension will be stored in this object.
	router.koaRouterGorups = {};
	// Init an empty stack of middleware
	router.koaRouterGorups.stack = [];
	router.koaRouterGorups.namesStack = [];
	// Init the registry of middleware as an empty map.
	router.koaRouterGorups.registry = new Map();

	// Append the extension function to the router.

	// Function to group routes that have to pass the same middleware.
	router.group = function(...mw) {
		// The last element is the callback.
		let callback = mw.pop();

		// Check if the callback is a function.
		if (!isFunction(callback))			{
			throw new Error("Callback needs to be a function.");
		}

		// Resolve registered middleware.
		mw = expandArray(mw);
		let resolved = resolveRegisteredMiddleware(router.koaRouterGorups.registry, mw);

		// Push the middleware to the stack.
		let stack = router.koaRouterGorups.stack;
		let namesStack = router.koaRouterGorups.namesStack;
		stack.push(resolved.mw);
		namesStack.push(resolved.names);

		// Call the callback.
		callback();

		// Pop the middleware from the stack.
		stack.pop();
		namesStack.pop();
	};

	router.pushMiddleware = function(...mw) {
		// Resolve registered middleware.
		mw = expandArray(mw);
		let resolved = resolveRegisteredMiddleware(router.koaRouterGorups.registry, mw);

		// Push the middleware to the stack.
		let stack = router.koaRouterGorups.stack;
		let namesStack = router.koaRouterGorups.namesStack;
		stack.push(resolved.mw);
		namesStack.push(resolved.names);
	};

	router.popMiddleware = function() {
		// Pop the middleware from the stack.
		let stack = router.koaRouterGorups.stack;
		let namesStack = router.koaRouterGorups.namesStack;
		stack.pop();
		namesStack.pop();
	};

	// Function to register middleware.
	router.registerMiddleware = function(name, middleware) {
		if (!isString(name))			{
			throw new Error("Name needs to be a string.");
		}
		if (!isFunction(middleware))			{
			throw new Error("Middleware needs to be a function.");
		}
		let registry = router.koaRouterGorups.registry;
		if (registry.has(name))			{
			throw new Error('Name "' + name + '" already taken.');
		}
		registry.set(name, middleware);
	};

	// Override the original register function on the router.
	router.originalRegister = router.register;
	router.register = function(path, methods, middleware, opts) {
		// Inject the middleware from the stack.
		let mw = expandTheStack(router.koaRouterGorups.stack);
		middleware = mw.concat(middleware);
		let mwNames = expandTheStack(router.koaRouterGorups.namesStack);

		// Call the original "register" function;
		let route = router.originalRegister(path, methods, middleware, opts);
		route.namesStack = mwNames;
	};
}

/**
 * Exported functions.
 * @type {Object}
 */
module.exports = {
	extend,
};
