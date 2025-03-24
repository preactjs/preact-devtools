const { expect } = require("chai");
const sinon = require("sinon");
const { JSDOM } = require("jsdom");
const { performance } = require("perf_hooks");

const dom = new JSDOM(`
<!DOCTYPE html>
<html>
  <head></head>
  <body></body>
</html>
`);

global.expect = expect;
global.sinon = sinon;
global.document = dom.window.document;
global.window = dom.window;
global.performance = performance;

global.__DEBUG__ = false;
