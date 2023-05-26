export class OneByOneIncrementer {
    _length: number;
    _progress: number = 0.0;
    _duration: number = 1.0;
    _array: Float32Array;
    /**
     * Whether the progress array needs to be rebuilt
     */
    _dirty = false;

    constructor(
        length: number = 1,
    ) {
        console.log('create OneByOneIncrementer', length);
        this._length = length;
        this._build();
    }

    /**
     * The length of the array to generate
     */
    set length(value) {
        console.log('setting length', this._length, 'to', value);
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

    _build() {
        this._buildArrays();
    }

    _buildArrays() {
        if (!this.array || this.array.length === this.length) {
            this._array = new Float32Array(this.length);
        }
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

    update() {
        if (this._dirty) {
            return false;
        }
        this._calculateProgress();
    }

    _calculateProgress() {
        const increment = 1 / this.length;
        const activeIndex = Math.max(0, Math.round(this.progress / increment) - 1);
        for (let i = 0; i < this.length; i++) {
            this._array[i] = i === activeIndex ? 1 : 0;
        }
    }
}