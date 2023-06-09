type InterpolationType = 'bezier' | 'stepped' | 'tan' | 'sigmoid';

function normalizedSigmoid(z) {
    return sigmoid((z * 10) - 5);
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

function normalizedTanh(x) {
    const clampedValue = Math.min(tanh(x), 0.75)
    const normalizedValue = clampedValue * 1.3333;
    return normalizedValue;
}

function tanh(x) {
   const e = Math.exp(2*x);
   return (e - 1) / (e + 1) ;
}

export class InterpolationCache {
    _sampleCount: number;
    _interpolation: InterpolationType;
    _cache: Float32Array;
    _start = 0;
    _end = 1;

    constructor(
        samples: number = 10,
        interpolation: InterpolationType = 'sigmoid',
        start: number = 0,
        end: number = 1,
    ) {
        this._sampleCount = samples;
        this._interpolation = interpolation;
        this._cache = new Float32Array(this.sampleCount);
        this._start = start;
        this._end = end;
        this._generateCache();
    }

    get start() {
        return this._start;
    }

    get end() {
        return this._end;
    }

    get sampleCount() {
        return this._sampleCount;
    }

    get cache() {
        return this._cache;
    }

    getCachedValue(progress: number) {
        const sampleIndex = Math.floor(progress * (this.sampleCount - 1));
        if (sampleIndex < 0) {
            return this._cache[0];
        }
        if (sampleIndex >= this.sampleCount) {
            return this._cache[this.sampleCount - 1];
        }
        return this._cache[sampleIndex];
    }

    _generateCache() {
        switch (this._interpolation) {
            case 'stepped':
                return this._generateStepCache();
            case 'tan':
                return this._generateTanCache();
            case 'sigmoid':
                return this._generateSigmoidCache();
            default:
                throw new Error(`Unknown interpolation type: ${this._interpolation}`);
        }
    }

    remapValue(value) {
        return this.start + ((this.end - this.start) * value);
    }

    _generateStepCache() {
        for (let i = 0; i < this.sampleCount; i++) {
            const x = i / (this.sampleCount - 1);
            if (x <= 0.5) {
                this._cache[i] = this.remapValue(0);
            }
            else {
                this._cache[i] = this.remapValue(1);
            }
        }
    }

    _generateTanCache() {
        for (let i = 0; i < this.sampleCount; i++) {
            const x = i / (this.sampleCount - 1);
            this._cache[i] = this.remapValue(normalizedTanh(x));
        }
    }

    _generateSigmoidCache() {
        for (let i = 0; i < this.sampleCount; i++) {
            const x = i / (this.sampleCount - 1);
            this._cache[i] = this.remapValue(normalizedSigmoid(x));
        }
    }
}