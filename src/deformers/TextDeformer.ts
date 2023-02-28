import {BaseDeformer} from "./BaseDeformer";
import {average} from "../utils";

export enum TRANSFORM_TYPE {
    BOUNDS,
    LINE,
    WORD,
    GLYPH
}

export enum TRANSFORM_DIRECTION {
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    TOP_TO_BOTTOM,
    BOTTOM_TO_TOP
}

// rename to component deformer
export class TextDeformer extends BaseDeformer {
    _hasWeights = true;
    _transformType = TRANSFORM_TYPE.BOUNDS;
    _opacities = [1.0];
    _transforms = [0.0, 0.0];
    _scales = [1.0, 1.0];
    _scaleAnchors = [];
    _weights = [];

    _progresses = [1.0];
    _progressDirection = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
    _transformMinMax = [0.0, 1.0];

    _uniforms(): {} {
        return {
            uOpacities: this.opacities,
            uTransforms: this.transforms,
            uScales: this.scales,
            uScaleAnchors: this._scaleAnchors,
            uProgresses: this.progresses,
            uWeightMinMaxV: this._transformMinMax
        }
    }

    _vertHead(): string {
        const transformCount = this.transforms.length / 2;

        return `
        varying float vOpacity;
        attribute float aWeight;
        uniform vec2 uTransforms[${transformCount}];
        uniform vec2 uScales[${transformCount}];
        uniform vec2 uScaleAnchors[${transformCount}];
        uniform float uOpacities[${transformCount}];
        
        uniform vec2 uWeightMinMaxV[${transformCount}];
        uniform float uProgresses[${transformCount}];
        varying float vWeightMinV;
        varying float vWeightMaxV;
        varying float vProgress;
        `
    }

    _vertBody(): string {
        return `
        mat3 getTranslationMatrix${this.index}() {
            int transformIndex = int(aWeight);
            vec2 vertexOffset = uTransforms[transformIndex];            
            mat3 moveMatrix = mat3(1, 0, 0, 0, 1, 0, vertexOffset.x, vertexOffset.y, 1);
            
            // scale vertex from scale anchor position using scale value
            vec2 vertexScale = uScales[transformIndex];
            mat3 scaleMatrix = mat3(vertexScale.x, 0, 0, 0, vertexScale.y, 0, 0, 0, 1);
            vec2 vertexScaleAnchor = uScaleAnchors[transformIndex];
            mat3 scaleAnchorMatrix = mat3(1, 0, 0, 0, 1, 0, vertexScaleAnchor.x, vertexScaleAnchor.y, 1);
            mat3 invScaleAnchorMatrix = mat3(1, 0, 0, 0, 1, 0, -vertexScaleAnchor.x, -vertexScaleAnchor.y, 1);
            
            mat3 combinedMatrix = moveMatrix * scaleAnchorMatrix * scaleMatrix * invScaleAnchorMatrix;
            return combinedMatrix;
        }
        `
    }

    // rename to vertex
    _vertMain(): string {
        return `
        int transformIndex = int(aWeight);
        vOpacity = uOpacities[transformIndex];
        vec2 weightMinMaxV = uWeightMinMaxV[transformIndex];
        vWeightMinV = weightMinMaxV.x;
        vWeightMaxV = weightMinMaxV.y;
        vProgress = uProgresses[transformIndex];
        `
    }

    _fragHead(): string {
        return `
        varying float vOpacity;
        varying float vWeightMinV;
        varying float vWeightMaxV;
        varying float vProgress;
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
        const expectedLength = this._expectTransformsLength(1);
        this._opacities = new Array(expectedLength).fill(1.0);
        this._transforms = new Array(expectedLength * 2).fill(0.0);
        this._scales = new Array(expectedLength * 2).fill(1.0);
    }

    get opacities() {
        return this._opacities;
    }

    set opacities(value: number[]) {
        this._validateData(value, 1);
        this._opacities = value;
        this.parent.shader.uniforms.uOpacities = value;
    }

    _validateData(value: number[], coordinateCount = 2) {
        const expectedLength = this._expectTransformsLength(coordinateCount);
        if (value.length !== expectedLength) {
            throw Error(`Invalid number of values, expected ${expectedLength}`);
        }
    }

    get transforms() {
        return this._transforms;
    }

    set transforms(value: number[]) {
        this._validateData(value, 2);
        this._transforms = value;
    }

    // 1 for opacity
    // 2 for x and y, u and v
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

    get scales() {
        return this._scales;
    }

    set scales(value: number[]) {
        this._validateData(value, 2);
        this._scales = value;
    }

    get progresses() {
        return this._progresses
    }

    set progresses(value: number[]) {
        this._validateData(value, 1);
        this._progresses = value;
    }

    get progressDirection() {
        return this._progressDirection;
    }

    set progressDirection(value: TRANSFORM_DIRECTION) {
        this._progressDirection = value;
    }

    _generateProgressUVs() {
        console.log('_generateProgressUVs')
        // we should collect these while we're building the geometry. That would
        // avoid us having to iterate over all the data again
        // min max for each element
        if (this.progressDirection === TRANSFORM_DIRECTION.TOP_TO_BOTTOM
            || this.progressDirection === TRANSFORM_DIRECTION.BOTTOM_TO_TOP)
        {
            const uvAttr = this.parent.geometry.getBuffer('aUvs');
            const uvs = uvAttr.data;
            console.log('uvs', uvs);

            // glyph min/max
            const nGlyphs = this.weights.length / 4;
            let min, max;
            let weightGlyphIndex = 0;
            let uvGlyphIndex = 0;
            let prevWeightIndex = 0;
            let transformMinMax = [];
            let glyphMinMax = [];
            let transformMin = Infinity;
            let transformMax = -Infinity;
            for (let i = 0; i < nGlyphs; i++) {
                if (prevWeightIndex !== this.weights[weightGlyphIndex]) {
                    transformMinMax.push(transformMin, transformMax);
                    transformMin = Infinity;
                    transformMax = -Infinity;
                    prevWeightIndex = this.weights[weightGlyphIndex];
                }

                max = uvs[uvGlyphIndex + 1];
                min = uvs[uvGlyphIndex + 5];
                glyphMinMax.push(min, max);

                if (transformMin > min) {
                    transformMin = min;
                }
                if (transformMax < max) {
                    transformMax = max;
                }

                weightGlyphIndex += 4;
                uvGlyphIndex += 8;
            }
            transformMinMax.push(min, max);
            console.log('transform min max', transformMinMax);
            console.log('glyph min max', glyphMinMax);
            this._transformMinMax = transformMinMax;
        }
    }

    update() {
        if (!this._dirty) {
            return
        }
        this._generateScaleAnchors();
        this._generateWeights();
        this._assignWeights();
        this._generateProgressUVs();
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

    // TODO: optimize!!! don't create a new array every time
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
        return this.parent.glyph.map(() => [0, 0, 0, 0]).flat();
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