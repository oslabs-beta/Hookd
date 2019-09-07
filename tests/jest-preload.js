// got from stack overflow... file can be named anything as long as '/jest.config.js' points to it
// point of this file is to ignore console logs, but keep other console err/warns/etc
// file is setup by '../jest.config.js'
global.console = {
  log: jest.fn(), // console.log are ignored in tests

  // Keep native behaviour for other methods, use those to print out things in your own tests, not `console.log`
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};