import {Context} from "mocha";

declare module Chai {
  interface Assertion {
    matchesSnapshot(passedContext: Context): void;
  }
}
