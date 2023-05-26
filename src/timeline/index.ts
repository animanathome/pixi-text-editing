import {PingPongTimeline} from "./PingPongTimeline";
import {ProgressTimeline} from "./ProgressTimeline";

export const PING_PONG_TIMELINE = "pingPong";
export const PROGRESS_TIMELINE = "progress";
export const TIMELINE_TYPES = [PING_PONG_TIMELINE, PROGRESS_TIMELINE];
export type TimelineType = typeof TIMELINE_TYPES[number];

export type Timeline = PingPongTimeline | ProgressTimeline;