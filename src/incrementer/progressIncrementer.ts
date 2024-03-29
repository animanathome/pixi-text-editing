import {InterpolationCache} from "../interpolationCache";

const VERBOSE = false;

/**
 * Incremental progress array generator
 */
export class ProgressIncrementer {
    _length: number;
    _progress: number = 0.0;
    _duration: number = 1.0;
    _offset: number = 0.5;
    _revert = false;

    _start: Float32Array;
    _end: Float32Array;
    _array: Float32Array;
    _interpolationCache: InterpolationCache | null;
    _valuesPerElement: number = 1; // WARNING: hardcoded to 1 or 2
    /**
     * True if the internal state has changed since the last query
     */
    _dirty = false;

    constructor(
        length: number = 1,
        interpolationCache: InterpolationCache | null = null,
        valuesPerElement: number = 1,
    ) {
        VERBOSE && console.log('create ProgressIncrementer', length);
        this._length = length;
        this._interpolationCache = interpolationCache;
        this._valuesPerElement = valuesPerElement;

        this._build();
    }

    get valuesPerElement() {
        return this._valuesPerElement;
    }

    /**
     * Whether the array should be reversed. Changing this property will rebuilt the internal state and set the object
     * as dirty.
     */
    set revert(value) {
        VERBOSE && console.log('setting revert from', this._revert, 'to', value);
        if (value === this._revert) {
            return;
        }
        this._revert = value;
        this._build();
    }

    get revert() {
        return this._revert;
    }

    /**
     * The length of the array to generate
     */
    set length(value) {
        VERBOSE && console.log('setting length from', this._length, 'to', value);
        if (value === this._length) {
            return;
        }
        this._length = value;
        this._build();
    }

    get length() {
        return this._length;
    }

    /**
     * The current progress of the incrementer
     */
    set progress(value) {
        if (value === this._progress) {
            return;
        }
        // console.log('set progress', value);
        this._progress = value;
        this._dirty = true;
    }

    get progress() {
        return this._progress;
    }

    /**
     * The offset of the incrementer
     */
    set offset(value) {
        if (value === this._offset) {
            return;
        }
        this._offset = value;
        this._build();
    }

    get offset() {
        return this._offset;
    }

    /**
     * The duration of the incrementer
     */
    set duration(value) {
        if (value === this._duration) {
            return;
        }
        this._duration = value;
        this._build();
    }

    get duration() {
        return this._duration;
    }

    /**
     * The array of values
     */
    get array() {
        return this._array;
    }

    /**
     * The start values of the array
     */
    get start() {
        return this._start;
    }

    /**
     * The end values of the array
     */
    get end() {
        return this._end;
    }

    _build() {
        VERBOSE && console.log('_build')
        this._buildArrays();
        this._calculateRange();
        this._dirty = true;
    }

    _buildArrays() {
        if (!this.array || this.array.length !== this.length * this.valuesPerElement) {
            this._array = new Float32Array(this.length * this.valuesPerElement);
            this._start = new Float32Array(this.length);
            this._end = new Float32Array(this.length);
        }
    }

    _calculateRange() {
        // console.log('calculate range', this.offset, this.duration);
        const start = this.start.map((_, index) => index * this.offset);
        const end = start.map(value => value + this.duration);
        const lastValue = end[end.length - 1];
        const normalizedStart = start.map(value => value / lastValue);
        const normalizedEnd = end.map(value => value / lastValue);
        if (this.revert) {
            normalizedStart.reverse();
            normalizedEnd.reverse();
        }
        this._start = normalizedStart;
        this._end = normalizedEnd;
    }
    update() {
        VERBOSE && console.log('update')
        if (!this._dirty) {
            return;
        }
        this._calculateProgress();
    }

    _calculateProgress() {
        // console.log('calculate progress', this.progress);
        for (let i = 0; i < this.start.length; i++) {
            let value = this._calculateProgressForIndex(i);
            if (this._interpolationCache) {
                value = this._interpolationCache.getCachedValue(value);
            }
            if (this.valuesPerElement === 1) {
                this.array[i] = value;
            }
            else if (this.valuesPerElement === 2) {
                this.array[(i * 2)] = value;
                this.array[(i * 2) + 1] = value;
            }
        }
        this._dirty = false;
    }

    _calculateProgressForIndex(index) {
        if (this.progress >= this._end[index]) {
            return 1.0;
        }
        else if (this.progress >= this._start[index] && this.progress <= this._end[index]) {
            const duration = this._end[index] - this._start[index];
            const localProgress = this.progress - this._start[index];
            return localProgress / duration;
        } else {
            return 0.0;
        }
    }
}