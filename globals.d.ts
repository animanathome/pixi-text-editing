import {Context} from "mocha";

declare module Chai {
  interface Assertion {
    storeSnapshot(passedContext: Context): void;
  }
}
