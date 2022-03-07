const limit = Error.stackTraceLimit;

module.exports = class StacklessError extends Error {
   constructor(msg) {
      Error.stackTraceLimit = 0;
      super(msg);
      Error.stackTraceLimit = limit;
   }
};
