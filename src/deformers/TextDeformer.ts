import {BaseDeformer} from "./BaseDeformer";
import {average} from "../utils";

export enum TRANSFORM_TYPE {
    BOUNDS,
    LINE,
    WORD,
    GLYPH
}

// rename to component deformer
export class TextDeformer extends BaseDeformer {
    _hasWeights = true;
    _transformType = TRANSFORM_TYPE.BOUNDS;
    _transforms = [0.0, 0.0];
    _scales = [1.0, 1.0];
    _scaleAnchors = [];
    _weights = [];

    _uniforms(): {} {
        return {
            transforms: this.transforms,
            scales: this.scales,
            scaleAnchors: this._scaleAnchors,
        }
    }

    _vertHead(): string {
        const transformCount = this.transforms.length / 2;

        return `
        attribute float aWeight;
        uniform vec2 transforms[${transformCount}];
        uniform vec2 scales[${transformCount}];
        uniform vec2 scaleAnchors[${transformCount}];
        `
    }

    _vertBody(): string {
        return `
        mat3 getTranslationMatrix${this.index}() {
            int transformIndex = int(aWeight);
            vec2 vertexOffset = transforms[transformIndex];            
            mat3 moveMatrix = mat3(1, 0, 0, 0, 1, 0, vertexOffset.x, vertexOffset.y, 1);
            
            // scale vertex from scale anchor position using scale value
            vec2 vertexScale = scales[transformIndex];
            mat3 scaleMatrix = mat3(vertexScale.x, 0, 0, 0, vertexScale.y, 0, 0, 0, 1);
            vec2 vertexScaleAnchor = scaleAnchors[transformIndex];
            mat3 scaleAnchorMatrix = mat3(1, 0, 0, 0, 1, 0, vertexScaleAnchor.x, vertexScaleAnchor.y, 1);
            mat3 invScaleAnchorMatrix = mat3(1, 0, 0, 0, 1, 0, -vertexScaleAnchor.x, -vertexScaleAnchor.y, 1);
            
            mat3 combinedMatrix = moveMatrix * scaleAnchorMatrix * scaleMatrix * invScaleAnchorMatrix;
            return combinedMatrix;
        }
        `
    }

    get transformType() {
        return this._transformType;
    }

    set transformType(value) {
        this._transformType = value;
        this._resetState()
        this._dirty = true;
    }

    /**
     * When the transform type changes, we need to reset the state of the deformer as we need all of our
     * internal data to match with the new transform type.
     */
    _resetState() {
        console.warn(`ressetting state, new state ${this.transformType}`);
        const expectedLength = this._expectTransformsLength();
        this._transforms = new Array(expectedLength).fill(0.0);
        console.log('transforms', this._transforms);
        this._scales = new Array(expectedLength).fill(1.0);
        console.log('scale', this._scales);
    }

    get transforms() {
        return this._transforms;
    }

    set transforms(value: number[]) {
        console.log('transforms', value);
        this._validateTransforms(value);
        this._transforms = value;
        this._dirty = true;
    }

    _hasData() {
        return this.parent.lines.length !== 0;
    }

    // TODO: rename to _validateTransformValues
    /**
     * Validates the number of values in the transforms array by comparing it to the geometry selection type.
     * This can be bounds, line, word, or glyph. Geometry needs to be build for validation to work.
     * @param value
     */
    _validateTransforms(value: number[]) {
        const expectedLength = this._expectTransformsLength();
        if (value.length !== expectedLength) {
            throw Error(`Invalid number of values, expected ${expectedLength}`);
        }
    }

    _expectTransformsLength() {
        const coordinateCount = 2; // x and y - can be for translate or scale
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

    get scales() {
        return this._scales;
    }

    set scales(value: number[]) {
        console.log('scales', value);
        this._validateTransforms(value);
        this._scales = value;
        this._dirty = true;
    }

    update() {
        if (!this._dirty) {
            return
        }
        console.warn('update text deformer')
        this._generateScaleAnchors();
        this._generateWeights();
        this._assignWeights();
        this._dirty = false;
        this.emitDeformerChanged();
    }

    _generateScaleAnchors() {
        let anchors = []
        switch (this.transformType) {
            case TRANSFORM_TYPE.BOUNDS:
                anchors = [this._generateBoundScaleAnchors()]; break;
            case TRANSFORM_TYPE.LINE:
                anchors = this._generateLineScaleAnchors(); break;
            case TRANSFORM_TYPE.WORD:
                anchors = this._generateWordScaleAnchors(); break;
            case TRANSFORM_TYPE.GLYPH:
                anchors = this._generateGlyphScaleAnchors(); break;
        }
        this._scaleAnchors = anchors.flatMap(item => [item.x, item.y]);
    }

    get scaleAnchors() {
        return this._scaleAnchors;
    }

    _generateBoundScaleAnchors() {
        const {x, y, width, height} = this.parent.getBounds();
        return {
            x: x + (width / 2),
            y: y + (height / 2),
        };
    }

    // TODO: specify type of position for anchor {x, y}
    _generateLineScaleAnchors() {
        let scaleAnchors = [];
        const lineRanges = this.parent.lineGlyphRanges();
        for (let lineIndex = 0; lineIndex < lineRanges.length; lineIndex++) {
            const lineStart = lineRanges[lineIndex][0];
            const lineEnd = lineRanges[lineIndex][1];
            const scaleAnchor = average(
                this.parent._fontAtlasTextGeometry._getGlyphCenter(lineStart),
                this.parent._fontAtlasTextGeometry._getGlyphCenter(lineEnd));
            scaleAnchors.push(scaleAnchor);
        }
        return scaleAnchors;
    }

    _generateWordScaleAnchors() {
        let scaleAnchors = [];
        const wordRanges = this.parent.words;
        for (let wordIndex = 0; wordIndex < wordRanges.length; wordIndex++) {
            const wordRange = wordRanges[wordIndex];
            const wordStart = wordRange[0];
            const wordEnd = wordRange[wordRange.length - 1];
            const scaleAnchor = average(
                this.parent._fontAtlasTextGeometry._getGlyphCenter(wordStart),
                this.parent._fontAtlasTextGeometry._getGlyphCenter(wordEnd));
            scaleAnchors.push(scaleAnchor);
        }
        return scaleAnchors;
    }

    _generateGlyphScaleAnchors() {
        return this.parent.glyph.map((glyph, index) => this.parent._fontAtlasTextGeometry.getGlyphCenter(index));
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