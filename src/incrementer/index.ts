import {OneByOneIncrementer} from "../incrementer/oneByOneIncrementer";
import {ProgressIncrementer} from "../incrementer/progressIncrementer";

export const ONE_BY_ONE_INCREMENTER = "oneByOne";
export const PROGRESS_INCREMENTER = "progress";

export type Incrementer = OneByOneIncrementer | ProgressIncrementer;