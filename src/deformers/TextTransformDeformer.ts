import {BaseDeformer, DeformerType} from "./BaseDeformer";
import {average} from "../utils";
import {TextDeformer} from "./TextDeformer";

export enum TRANSFORM_TYPE {
    BOUNDS,
    LINE,
    WORD,
    GLYPH
}

// TODO: rename to TextTransformDeformer
export class TextTransformDeformer extends TextDeformer {
    _deformerType: DeformerType = DeformerType.MATRIX;
    _opacities = [1.0];
    _transforms = [0.0, 0.0];
    _scales = [1.0, 1.0];
    _scaleAnchors = [];
    _weights = [];

    _uniforms(): {} {
        return {
            uOpacities: this.opacities,
            uTransforms: this.transforms,
            uScales: this.scales,
            uScaleAnchors: this._scaleAnchors,
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

    _vertMain(): string {
        return `
        int transformIndex = int(aWeight);
        vOpacity = uOpacities[transformIndex];
        `
    }

    _fragHead(): string {
        return `
        varying float vOpacity;
        `
    }

    /**
     * When the transform type changes, we need to reset the state of the deformer as we need all of our
     * internal data to match with the new transform type.
     */
    _resetStateOnProperties(expectedLength) {
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

    get transforms() {
        return this._transforms;
    }

    set transforms(value: number[]) {
        this._validateData(value, 2);
        this._transforms = value;
        // console.log(this.parent.shader.uniforms);
        // this.parent.shader.uniforms.uTransforms = value;
    }

    get scales() {
        return this._scales;
    }

    set scales(value: number[]) {
        this._validateData(value, 2);
        this._scales = value;
    }

    _updateProperties() {
        super._updateProperties();
        this._generateScaleAnchors();
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
}