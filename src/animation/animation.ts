import {Deformer} from "../deformers/deformerStack";
import {
    Incrementer,
    PROGRESS_INCREMENTER,
    ONE_BY_ONE_INCREMENTER,
} from "../incrementer";
import {
    Timeline,
    PING_PONG_TIMELINE,
    PROGRESS_TIMELINE, TimelineType
} from "../timeline";
import {OneByOneIncrementer} from "../incrementer/oneByOneIncrementer";
import {ProgressIncrementer} from "../incrementer/progressIncrementer";
import {PingPongTimeline} from "../timeline/PingPongTimeline";
import {ProgressTimeline} from "../timeline/ProgressTimeline";

const VERBOSE = false;
export class Animation {
    _dirty = true;
    _target: Deformer;
    _property: string;
    _interpolation: string;
    _incrementerType: string = PROGRESS_INCREMENTER;
    _timelineType: string = PROGRESS_TIMELINE;
    _incrementer: Incrementer;
    _timeline: Timeline;
    _time: number = 0;

    constructor(target: Deformer, property: string) {
        VERBOSE && console.log('create animation', target, property);
        this._target = target;
        this._property = property;

        this._createIncrementer();
        this._createTimeline();
        this._dirty = false;
    }

    get target() {
        return this._target;
    }

    get property() {
        return this._property;
    }

    get incrementerType() {
        return this._incrementerType;
    }

    set incrementerType(incrementerType: TimelineType) {
        if (incrementerType === this._incrementerType) {
            return;
        }
        this._incrementerType = incrementerType;
        this._createIncrementer();
    }

    get incrementer() {
        return this._incrementer;
    }

    /**
     * The length of the property we animate. This can change during its lifecycle.
     */
    _propertyLength() {
        return (typeof (this._target as any)._expectTransformsLength === 'function') ? (this._target as any)._expectTransformsLength(1) : 1;
    }

    _createIncrementer() {
        // TODO: we don't have a nice deformer vs text deformer type definition yet
        const count = this._propertyLength();

        switch (this.incrementerType) {
            case ONE_BY_ONE_INCREMENTER:
                this._incrementer = new OneByOneIncrementer(count); break;
            case PROGRESS_INCREMENTER:
                this._incrementer = new ProgressIncrementer(count); break;
            default:
                throw new Error(`Incrementer ${this.incrementerType} not found`);
        }
    }

    get timelineType() {
        return this._timelineType;
    }

    set timelineType(timelineType: TimelineType) {
        if (timelineType === this._timelineType) {
            return;
        }
        this._timelineType = timelineType;
        this._createTimeline();
    }

    _createTimeline() {
        switch (this.timelineType) {
            case PING_PONG_TIMELINE:
                this._timeline = new PingPongTimeline(); break;
            case PROGRESS_TIMELINE:
                this._timeline = new ProgressTimeline(); break;
            default:
                throw new Error(`Timeline ${this.timelineType} not found`);
        }
    }

    get timeline() {
        return this._timeline;
    }

    get interpolation() {
        return this._interpolation;
    }

    get dirty() {
        if (this.incrementer && this.incrementer.length !== this._propertyLength()) {
            VERBOSE && console.log('property length changed', this.incrementer.length, this._propertyLength());
            return true;
        }
        return this._dirty;
    }

    update() {
        VERBOSE && console.log('update', this.dirty);
        if (!this.dirty) {
            return;
        }
        VERBOSE && console.log('setting length to', this._propertyLength());
        this.incrementer.length = this._propertyLength();
        this._updateTimeValue();
        this._dirty = false;
    }

    set time(value: number) {
        VERBOSE && console.log('setting time from', this._time, 'to', value);
        if (value === this.time) {
            return;
        }
        this._time = value;
        this._updateTimeValue();
    }

    get time() {
        return this._time;
    }

    _updateTimeValue() {
        if (this._timeline === undefined) {
            throw new Error('Timeline not build yet');
        }
        if (this._incrementer === undefined) {
            throw new Error('Incrementer not build yet');
        }
        VERBOSE && console.log('timeline', this._timeline.start, this._timeline.end);
        const progress = this._timeline.value(this.time);
        VERBOSE && console.log('progress', progress);
        this._incrementer.progress = progress;
        this._incrementer.update();
        VERBOSE && console.log('setting', this._property, 'to', this._incrementer.array)
        this._target[this._property] = this._incrementer.array as any;
    }
}