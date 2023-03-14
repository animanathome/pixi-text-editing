import {InterpolationCache} from "./interpolationCache";

export class ProgressIncrementer {
    _length: number;
    _progress: number;
    _duration: number;
    _offset: number;
    _revert = false;

    _start: Float32Array;
    _end: Float32Array;
    _array: Float32Array;
    _interpolationCache: InterpolationCache | null;
    /**
     * Whether the progress array needs to be rebuilt
     */
    _dirty = false;
    /**
     * Whether the start and end array needs to be rebuilt
     */
    _rebuild = false;

    constructor(length: number = 1, interpolationCache: InterpolationCache | null = null) {
        console.log('ProgressIncrementer', length);
        this._length = length;
        this._progress = 0;
        this._duration = 1.0;
        this._offset = 0.5;
        this._interpolationCache = interpolationCache;

        this._rebuild = true;
        this._dirty = true;
    }

    /**
     * Whether the array should be reversed
     */
    set revert(value) {
        if (value === this._revert) {
            return;
        }
        console.log('set revert', value);
        this._revert = value;
        this._rebuild = true;
        this._dirty = true;
    }

    get revert() {
        return this._revert;
    }

    /**
     * The length of the array to generate
     */
    set length(value) {
        if (value === this._length) {
            return;
        }
        this._length = value;
        this._rebuild = true;
        this._dirty = true;
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
        this._rebuild = true;
        this._dirty = true;
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
        this._rebuild = true;
        this._dirty = true;
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
        this._buildArrays();
        this._calculateRange();
        this._rebuild = false;
    }

    _buildArrays() {
        if (!this.array || this.array.length === this.length) {
            this._array = new Float32Array(this.length);
            this._start = new Float32Array(this.length);
            this._end = new Float32Array(this.length);
        }
    }

    _calculateRange() {
        // console.log('calculate range', this.offset, this.duration);
        const start = this.array.map((_, index) => index * this.offset);
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

    _calculateProgress() {
        // console.log('calculate progress', this.progress);
        for (let i = 0; i < this.array.length; i++) {
            let value = this._calculateProgressForIndex(i);
            if (this._interpolationCache) {
                value = this._interpolationCache.getCachedValue(value);
            }
            this.array[i] = value;
        }
        this._dirty = false;
    }

    update() {
        if (this._rebuild) {
            this._build();
        }
        if (this._dirty) {
            this._calculateProgress();
        }
    }
}