# Phraseanet Production Client
[![Build Status](https://travis-ci.org/alchemy-fr/Phraseanet-production-client.svg?branch=master)](https://travis-ci.org/alchemy-fr/Phraseanet-production-client)
[![devDependency Status](https://david-dm.org/alchemy-fr/Phraseanet-production-client/dev-status.svg)](https://david-dm.org/alchemy-fr/Phraseanet-production-client#info=devDependencies)
[![Dependency Status](https://david-dm.org/alchemy-fr/Phraseanet-production-client.svg)](https://david-dm.org/alchemy-fr/Phraseanet-production-client)
[![Coverage Status](https://coveralls.io/repos/github/alchemy-fr/Phraseanet-production-client/badge.svg?branch=master)](https://coveralls.io/github/alchemy-fr/Phraseanet-production-client?branch=master)


## Requirements

Node `^5.0.0`.

## Installation and dev workflow

- clone the project and ``` npm install ```
- setup the dev workflow for [Phraseanet](https://github.com/alchemy-fr/Phraseanet/) with [npm link](https://docs.npmjs.com/cli/link):

	- go into the Phraseanet Production Client project directory
	- globally link the npm package with ``` npm link ```
	- go into the Phraseanet project directory
	- Register the linked package for Phraseanet with ``` npm link phraseanet-production-client ```

Once phraseanet-production-client package is linked:

 - go into the Phraseanet project directory
 - start watch mode with ```npm run dev```
 - go into the Phraseanet Production Client project directory:
 - start watch mode with ```npm run dev```

 Open `http://localhost:3000` to launch Phraseanet via Browser Sync

## Available commands

* `npm run production` - Build task that generate a minified script for production
* `npm run clean` - Remove the `dist` folder and it's files
* `npm run eslint:source` - Lint the source
* `npm run eslint:common` - Lint the unit tests shared by Karma and Mocha
* `npm run eslint:server` - Lint the unit tests for server
* `npm run eslint:browser` - Lint the unit tests for browser
* `npm run eslint:fix` - ESLint will try to fix as many issues as possible in your source files
* `npm run clean` - Remove the coverage report and the *dist* folder
* `npm run test` - Runs unit tests for both server and the browser
* `npm run test:browser` - Runs the unit tests for browser / client
* `npm run test:server` - Runs the unit tests on the server
* `npm run watch:server` - Run all unit tests for server & watch files for changes
* `npm run watch:browser` - Run all unit tests for browser & watch files for changes
* `npm run karma:firefox` - Run all unit tests with Karma & Firefox
* `npm run karma:chrome` - Run all unit tests with Karma & Chrome
* `npm run karma:ie` - Run all unit tests with Karma & Internet Explorer
* `npm run packages` - List installed packages
* `npm run package:purge` - Remove all dependencies
* `npm run package:reinstall` - Reinstall all dependencies
* `npm run package:check` - shows a list over dependencies with a higher version number then the current one - if any
* `npm run package:upgrade` - Automaticly upgrade all devDependencies & dependencies, and update package.json
* `npm run package:dev` - Automaticly upgrade all devDependencies and update package.json
* `npm run package:prod` - Automaticly upgrade all dependencies and update package.json
* `npm run asset-server` - starts a asset server with hot module replacement (WDS) on port 8080

## Credits

based on [Trolly](https://github.com/Kflash/trolly) an es6 boilerplate by [KFlash](https://github.com/kflash)
