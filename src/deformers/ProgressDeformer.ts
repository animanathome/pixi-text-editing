import {BaseDeformer, DeformerType} from "./BaseDeformer";
import {TRANSFORM_TYPE} from "./TextDeformer";

export enum TRANSFORM_DIRECTION {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP
}

export class ProgressDeformer extends BaseDeformer {
    _deformerType: DeformerType = DeformerType.VERTEX;
    _progresses: number[] = [];
    _direction: TRANSFORM_DIRECTION = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
    _transformType = TRANSFORM_TYPE.BOUNDS;

    _indexArray: number[] = [];
    _uMinXArray: number[] = [];
    _uMaxXArray: number[] = [];
    _uMinYArray: number[] = [];
    _uMaxYArray: number[] = [];
    _uMinUArray: number[] = [];
    _uMaxUArray: number[] = [];
    _uMinVArray: number[] = [];
    _uMaxVArray: number[] = [];

    _uniforms(): {} {
        // when we change a value, does it sync up one uniform or all of them?
        // we could just copy over the min/max values as that's what we're using
        return {
            // uProgresses: this.progresses,
            // uMinXArray: this._uMinXArray,
            // uMaxXArray: this._uMaxXArray,
            // uMinYArray: this._uMinYArray,
            // uMaxYArray: this._uMaxYArray,
            // uMinUArray: this._uMinUArray,
            // uMaxUArray: this._uMaxUArray,
            // uMinVArray: this._uMinVArray,
            // uMaxVArray: this._uMaxVArray
        }
    }

    get progresses() {
        return this._progresses;
    }

    set progresses(value: number[]) {
        this._validateData(value, 1);
        this._progresses = value;
    }

    get direction() {
        return this._direction;
    }

    set direction(value: TRANSFORM_DIRECTION) {
        this._direction = value;
        // what does dirty do again? rebuild the shader? why do we need to do that?
        this._dirty = true;
    }

    get transformType() {
        return this._transformType;
    }

    set transformType(value) {
        console.log('set transform type', value);
        this._transformType = value;
        this._resetState()
        this._dirty = true;
    }

    // TODO: rename aWeight to aVertexWeight
    _vertHead(): string {
        // max 1024? or 128 glyphs
        // if only min/max we can render 512 characters
        const transformLength = this._progresses.length;
        const arrayLength = this._uMinXArray.length;

        return `
            // attribute float aWeight;
            attribute float aVertexIndex;
        `
    }

    _vertBody(): string {
        return `
            vec3 getVertexPosition${this.index}(vec3 inputPosition) {
                return inputPosition;
            }
        `;
    }

    update() {
        if (!this._dirty) {
            return
        }
        this._generateIndexArray();
        this._assignIndexArray();
        // this._generateWeights();
        // this._assignWeights();
        // this._generateMinMaxXYUVArrays();
        this._dirty = false;
    }

    _resetState() {
        const expectedLength = this._expectTransformsLength(1);
        this._progresses = new Array(expectedLength).fill(1.0);
    }

    _validateData(value: number[], coordinateCount = 2) {
        const expectedLength = this._expectTransformsLength(coordinateCount);
        if (value.length !== expectedLength) {
            throw Error(`Invalid number of values, expected ${expectedLength}`);
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

    // we could move this to the geometry build step
    // or maybe we don't actually need this? maybe we can count
    // vertices in the shader?
    _generateIndexArray() {
        console.log(this.parent.geometry);
        const indices = [];
        for (let i = 0; i < this.parent.glyph.length; i++) {
            indices.push(i, i, i, i);
        }
        console.log('_generateIndexArray', indices);
        this._indexArray = indices;
    }

    _assignIndexArray() {
        const attribute = this.parent.geometry.getAttribute('aVertexIndex');
        if (!attribute) {
            console.log('adding aVertexIndex', this._indexArray);
            this.parent.geometry.addAttribute('aVertexIndex', this._indexArray, 1)
            return;
        }
        console.log('updating aVertexIndex', this._indexArray);
        const buffer = this.parent.geometry.getBuffer('aVertexIndex');
        buffer.data = new Float32Array(this._indexArray);
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
        console.log('weights', weights);
        this._weights = weights;
    }

    _assignWeights() {
        const weightsAttribute = this.parent.geometry.getAttribute('aWeight');
        if (!weightsAttribute) {
            console.log('adding weights attribute')
            this.parent.geometry.addAttribute('aWeight', this._weights, 1)
            return;
        }
        console.log('updating weights attribute');
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

    _generateMinMaxXYUVArrays() {
        console.log('_generateMinMaxXYUVArray')
        const vertexArray = this.parent._fontAtlasTextGeometry._vertexArray;
        const uvArray = this.parent._fontAtlasTextGeometry._uvArray;

        this._uMinXArray = [];
        this._uMaxXArray = [];
        this._uMinYArray = [];
        this._uMaxYArray = [];
        this._uMinUArray = [];
        this._uMaxUArray = [];
        this._uMinVArray = [];
        this._uMaxVArray = [];
        for(let i = 0; i < vertexArray.length; i += 8) {
            const minX = vertexArray[i + 4];
            const maxX = vertexArray[i + 0];
            const minY = vertexArray[i + 5];
            const maxY = vertexArray[i + 1];
            this._uMinXArray.push(minX);
            this._uMaxXArray.push(maxX);
            this._uMinYArray.push(minY);
            this._uMaxYArray.push(maxY);

            const minU = uvArray[i + 4];
            const maxU = uvArray[i + 0];
            const minV = uvArray[i + 5];
            const maxV = uvArray[i + 1];
            this._uMinUArray.push(minU);
            this._uMaxUArray.push(maxU);
            this._uMinVArray.push(minV);
            this._uMaxVArray.push(maxV);
        }
    }
}