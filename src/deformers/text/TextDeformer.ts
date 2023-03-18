import {BaseDeformer} from "../BaseDeformer";

export enum TRANSFORM_TYPE {
    BOUNDS,
    LINE,
    WORD,
    GLYPH
}

export class TextDeformer extends BaseDeformer {
    _transformType = TRANSFORM_TYPE.BOUNDS;
    _weights = [];

    get transformType() {
        return this._transformType;
    }

    set transformType(value) {
        console.log('set transform type', value);
        this._transformType = value;
        this._resetState()
        this._dirty = true;
    }

    _updateProperties() {
        this._generateWeights();
        this._assignWeights();
    }

    _resetState() {
        const expectedLength = this._expectTransformsLength(1);
        this._resetStateOnProperties(expectedLength);
    }

    _resetStateOnProperties(length: number) {
        // abstract class
    }

    _validateData(value: number[], coordinateCount = 2) {
        const expectedLength = this._expectTransformsLength(coordinateCount);
        if (value.length !== expectedLength) {
            throw Error(`Invalid number of values, expected ${expectedLength} but got ${value.length}`);
        }
    }

    _expectTransformsLength(coordinateCount = 2) {
        let expectedLength = -1;
        switch (this.transformType) {
            case TRANSFORM_TYPE.BOUNDS:
                expectedLength = coordinateCount;
                break;
            case TRANSFORM_TYPE.LINE:
                expectedLength = this.parent.lines.length * coordinateCount;
                break;
            case TRANSFORM_TYPE.WORD:
                expectedLength = this.parent.words.length * coordinateCount;
                break;
            case TRANSFORM_TYPE.GLYPH:
                expectedLength = this.parent.glyph.length * coordinateCount;
                break;
        }
        return expectedLength;
    }

    _generateWeights() {
        let weights = [];
        switch (this.transformType) {
            case TRANSFORM_TYPE.BOUNDS:
                weights = this._generateBoundWeights(); break;
            case TRANSFORM_TYPE.LINE:
                weights = this._generateLineWeights(); break;
            case TRANSFORM_TYPE.WORD:
                weights = this._generateWordWeights(); break;
            case TRANSFORM_TYPE.GLYPH:
                weights = this._generateGlyphWeights(); break;
        }
        this._weights = weights;
    }

    _assignWeights() {
        console.log('weights', this._weights);
        const weightsAttribute = this.parent.geometry.getAttribute('aWeight');
        if (!weightsAttribute) {
            this.parent.geometry.addAttribute('aWeight', this._weights, 1)
            return;
        }
        const weightsBuffer = this.parent.geometry.getBuffer('aWeight');
        weightsBuffer.data = new Float32Array(this._weights);
    }

    _generateBoundWeights() {
        return this.parent.glyph.map((glyph, index) => [0, 0, 0, 0]).flat();
    }

    _generateLineWeights() {
        const weights:number[][] = [];
        const lineRanges = this.parent.lineGlyphRanges();
        for (let lineIndex = 0; lineIndex < lineRanges.length; lineIndex++) {
            const lineStart = lineRanges[lineIndex][0];
            const lineEnd = lineRanges[lineIndex][1];
            for (let i = lineStart; i <= lineEnd; i++) {
                // each glyph has 4 vertices so we need to provide a weight for each one
                weights.push([lineIndex, lineIndex, lineIndex, lineIndex])
            }
        }
        return (weights as any).flat();
    }

    /**
     * Each word is assigned a unique index and each glyph is assigned the same index as the word it belongs to.
     * For instance: "Hello World" would be [0, 0, 0, 0, 1, 1, 1, 1, 1, 1]
     */
    _generateWordWeights() {
        const weights:number[][] = [];
        const wordRanges = this.parent.words;
        let prevEnd = 0;
        for (let wordIndex = 0; wordIndex < wordRanges.length; wordIndex++) {
            const wordRange = wordRanges[wordIndex];
            const wordStart = wordRange[0];
            const wordEnd = wordRange[wordRange.length - 1];

            // generate weights for any spaces or new lines
            for (let i = prevEnd + 1; i < wordStart; i++) {
                weights.push([wordIndex, wordIndex, wordIndex, wordIndex])
            }

            // fill in the same weight for each glyph within a word
            for (let i = wordStart; i <= wordEnd; i++) {
                // each glyph has 4 vertices so we need to provide a weight for each one
                weights.push([wordIndex, wordIndex, wordIndex, wordIndex])
            }
            prevEnd = wordEnd;
        }
        return (weights as any).flat();
    }

    _generateGlyphWeights() {
        return this.parent.glyph.map((glyph, index) => [index, index, index, index]).flat();
    }
}