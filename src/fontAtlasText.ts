import * as PIXI from 'pixi.js';
import {DRAW_MODES, Geometry} from 'pixi.js';
import {FontAtlasTextGeometry, LEFT, RIGHT} from "./fontAtlasTextGeometry";
import {FontAtlas} from "./fontAtlas";
import {CARET_POSITION} from "./fontAtlasTextCaret";
import {deformVertexSrc, simpleVertexSrc, transformVertexSrc} from "./vertexShader";
import {textureFragmentSrc} from "./fragmentShader";
import {CurveData} from "./curveData";
import {MeshMixin} from "./meshMixin";
import {average} from "./utils";
import {DeformerStack} from "./deformerStack";

export enum TRANSFORM_TYPE {
    NONE,
    BOUNDS,
    LINE,
    WORD,
    GLYPH
}

// TODO: Look at PIXI.Mesh. This object has all the necessary properties to enable rendering
export class FontAtlasText extends MeshMixin(PIXI.Container) {
    _text = 'hello world!';
    _textMesh = null;
    _dirty = true; // should use PIXI update properties so as _transformID, see Mesh
    maxWidth = 512;
    maxHeight = 512;
    _atlas = undefined;
    _fontSize = 12;
    _lineHeight = 1;
    _fontFactor = 1;
    _tokenIndex = 0;

    // make this into a deformer!
    _transformType = TRANSFORM_TYPE.NONE;
    _transforms = [];
    _scales = [];

    // make this into a deformer!
    _curveTexture:PIXI.Texture= undefined;
    _curveData = undefined;
    _pathSegment = 1;
    _spineOffset = 0;
    _spineLength = 1;
    _pathOffset = 0;
    _flow = 1;

    _tokens = [];
    _lines = [];
    _words = [];
    // TODO: rename to GeometryBuilder instead?
    _fontAtlasTextGeometry = new FontAtlasTextGeometry();
    _deformerStack: DeformerStack;

    get deform() {
        return this._deformerStack;
    }

    set atlas(atlas: FontAtlas) {
        this._atlas = atlas;
        this._fontAtlasTextGeometry.atlasResolution = atlas.resolution;
        this._deformerStack = new DeformerStack(this);

        // NOTE: we should probably set this up during construction
        this._deformerStack.on('deformerAdded', () => {
            console.log('deformer added');
            this._buildShader();
        });
        this._deformerStack.on('deformerChanged', () => {
            console.log('deformer changed');
            this._buildShader();
        });
    }

    get atlas() {
        return this._atlas;
    }

    get glyph() {
        return this._fontAtlasTextGeometry._glyph;
    }

    set text(value) {
        if (value === this.text) {
            return;
        }
        this._text = value;
        this._dirty = true;
    }

    get text() {
        return this._text;
    }

    get fontSize() {
        return this._fontSize;
    }

    set fontSize(value) {
        if (value === this.fontSize) {
            return;
        }
        this._fontSize = value;
        this._dirty = true;
    }

    // TODO: adding wordSpacing

    get lineHeight() {
        return this._lineHeight;
    }

    set lineHeight(value) {
        if (value === this.lineHeight) {
            return;
        }
        this._lineHeight = value;
        this._dirty = true;
    }

    // @deprecated
    _setUniform(property, value) {
        if (!this._shader) {
            return
        }
        this._shader.uniforms[property] = value;
    }

    // @deprecated
    get transformType() {
        return this._transformType;
    }

    set transformType(value) {
        this._transformType = value;
        this._dirty = true;
    }

    // TODO: rename to translation
    // @deprecated
    get transforms() {
        return this._transforms;
    }

    set transforms(value: number[]) {
        this._validateTransforms(value);
        this._setUniform('transforms', value);
    }

    // individual scale values
    get scales() {
        return this._scales;
    }

    set scales(value: number[]) {
        this._validateTransforms(value);
        this._setUniform('scales', value);
    }

    // TODO: rename to _validateTransformValues
    _validateTransforms(value: number[]) {
        let coordinateCount = 2; // x and y - can be for translate or scale
        let expectedLength = -1;
        switch (this.transformType) {
            case TRANSFORM_TYPE.BOUNDS:
                expectedLength = coordinateCount;
                break;
            case TRANSFORM_TYPE.LINE:
                expectedLength = this.lines.length * coordinateCount;
                break;
            case TRANSFORM_TYPE.WORD:
                expectedLength = this.words.length * coordinateCount;
                break;
            case TRANSFORM_TYPE.GLYPH:
                expectedLength = this.glyph.length * coordinateCount;
                break;
        }
        if (value.length !== expectedLength) {
            throw Error(`Invalid number of values, expected ${expectedLength}`);
        }
    }

    // curve deform
    get pathOffset() {
        return this._pathOffset;
    }

    set pathOffset(value) {
        this._pathOffset = value;
        this._setUniform('pathOffset', value);
    }

    get pathSegment() {
        return this._pathSegment;
    }

    set pathSegment(value) {
        this._pathSegment = value;
        this._setUniform('pathSegment', value);
    }

    set flow(value) {
        this._flow = value;
        this._setUniform('flow', value);
    }

    get flow() {
        return this._flow;
    }

    get spineOffset() {
        return this._spineOffset;
    }

    set spineOffset(value) {
        this._spineOffset = value;
        this._setUniform('spineOffset', value);
    }

    get spineLength() {
        return this._spineLength;
    }

    set spineLength(value) {
        this._spineLength = value;
        this._setUniform('spineLength', value);
    }

    /**
     * The font atlas size can be different from this font size. Therefore, we have to come up with a value by which
     * we need to multiply our atlas font glyphs to get the requested font size.
     */
    _calculateFontFactor() {
        if (!this.atlas) {
            return;
        }
        this._fontFactor = this.fontSize / this.atlas.fontSize;
    }

    get glyphCount() {
        return this._fontAtlasTextGeometry.glyphCount
    }

    getGlyphVertexArray(index) {
        return this._fontAtlasTextGeometry._getGlyphVertexArray(index);
    }

    getGlyphCenter(index) {
        return this._fontAtlasTextGeometry.getGlyphCenter(index);
    }

    containsGlyph(x: number, y: number) {
        if (this._curveData) {
            ({x, y} = this._curveData.invertPosition(x, y));
        }
        const glyphCount = this._fontAtlasTextGeometry._glyph.length - 1;
        return this._fontAtlasTextGeometry.containsGlyph(x, y, {start: 0, end: glyphCount});
    }

    closestGlyph(x: number, y: number) {
        if (this._curveData) {
            ({x, y} = this._curveData.invertPosition(x, y));
        }
        const glyphCount = this._fontAtlasTextGeometry._glyph.length - 1;
        return this._fontAtlasTextGeometry.closestGlyph(x, y, {start: 0, end: glyphCount});
    }

    closestWord(x: number, y: number) {
        if (this._curveData) {
            ({x, y} = this._curveData.invertPosition(x, y));
        }
        const [index, _] = this.closestGlyph(x, y);
        return this.glyphWordIndex(index);
    }

    closestLine(x: number, y: number) {
        if (this._curveData) {
            ({x, y} = this._curveData.invertPosition(x, y));
        }
        const [index, _] = this.closestGlyph(x, y);
        return this.glyphLineIndex(index);
    }

    closestGlyphWithinRange(x: number, y: number, glyphRange: {start: number, end: number}) {
        return this._fontAtlasTextGeometry.closestGlyph(x, y, glyphRange);
    }

    getClosestGlyphOnLine(glyphIndex: number, lineIndex: number) {
        const [start, end] = this._getLineGlyphRange(lineIndex);
        const glyphCenter = this.getGlyphCenter(glyphIndex);
        const result = this.closestGlyphWithinRange(
            glyphCenter.x,
            glyphCenter.y,
            {start, end}
        );
        return result;
    }

    getGlyphBefore(index, position) {
        if (index === 0) {
            return [0, CARET_POSITION.START];
        }
        const indexBefore = index - 1;
        if (this.lastGlyphIndex < indexBefore) {
            return [this.lastGlyphIndex, position];
        }
        return [indexBefore, position];
    }

    getGlyphAfter(index, position) {
        if (index === this.lastGlyphIndex && position === LEFT) {
            return [index, RIGHT]
        }
        const nextIndex = index + 1;
        const nextToken = this.text[nextIndex]
        // @ts-ignore
        if (PIXI.TextMetrics.isNewline(nextToken) && position === LEFT) {
            return [index, RIGHT];
        }
        if (this.lastGlyphIndex < nextIndex) {
            return [this.lastGlyphIndex, position];
        }
        return [nextIndex, position];
    }

    getGlyphAbove(index) {
        if (index === 0) {
            return [0, LEFT];
        }
        const glyphLineIndex = this.glyphLineIndex(index);

        // if the glyph is on the first line
        if (!glyphLineIndex) {
            return [index, LEFT];
        }
        // get the closest glyph on the previous line
        const prevLineIndex = glyphLineIndex - 1;
        let [indexAbove, _] = this.getClosestGlyphOnLine(index, prevLineIndex);

        if (indexAbove === index) {
            return [indexAbove, LEFT];
        }

        // @ts-ignore
        if (PIXI.TextMetrics.isNewline(this.text[indexAbove])) {
            return [indexAbove, RIGHT]
        }

        return [indexAbove, LEFT]
    }

    getGlyphBelow(index) {
        const glyphLineIndex = this.glyphLineIndex(index);
        if (glyphLineIndex === this.lastGlyphLineIndex) {
            // @ts-ignore
            if (PIXI.TextMetrics.isNewline(this.text[this.lastGlyphIndex])) {
                return [this.lastGlyphIndex, RIGHT]
            }
            return [index, LEFT];
        }

        const nextLineIndex = glyphLineIndex + 1;
        let [indexBelow, _] = this.getClosestGlyphOnLine(index, nextLineIndex);

        if (indexBelow === index) {
            if (indexBelow + 1 > this.lastGlyphIndex) {
                return [indexBelow, LEFT]
            }
            else {
                indexBelow += 1;
                return [indexBelow, RIGHT]
            }
        }

        return [indexBelow, LEFT]
    }

    glyphWordIndex(index) {
        return this.words.findIndex(word => word.indexOf(index) !== -1)
    }

    glyphLineIndex(index) {
        for (let i = 0; i < this.lines.length; i++) {
            const [start, end] = this._getLineGlyphRange(i)
            if (index >= start && index <= end) {
                return i;
                break;
            }
        }
        return -1;
    }

    get lastGlyphIndex() {
        return this.glyph.length - 1;
    }

    get lastGlyphLineIndex() {
        return this._lines.length - 1;
    }

    get lines() {
        return this._lines;
    }

    get words() : number[][] {
        return this._words;
    }

    _build() {
        console.log('_build');
        if (!this._dirty) {
            return;
        }
        this._calculateFontFactor();
        this._deleteGeometry();
        this._buildGlyphs();
        this._layoutGlyphs();
        this._buildGeometry();
        this._buildShader();
        this._dirty = false;
    }

    _buildGlyphs() {
        this._tokens = [];
        this._lines = [];
        this._words = [];
        this._tokenIndex = 0;

        // @ts-ignore
        const tokens = PIXI.TextMetrics.tokenize(this.text);
        tokens.forEach(token => {
            // @ts-ignore
            if (PIXI.TextMetrics.isBreakingSpace(token)) {
                this._addWhitespace(token);
                return;
            }
            // @ts-ignore
            if (PIXI.TextMetrics.isNewline(token)) {
                this._addWhitespace(token);
                return;
            }
            this._addWord(token);
        });
    }

    _moveGlyphs(glyphRange, xOffset, yOffset) {
        for (let i = glyphRange[0]; i <= glyphRange[1]; i++) {
            this._fontAtlasTextGeometry.moveGlyph(i, xOffset, yOffset);
        }
    }

    // add space or new line
    _addWhitespace(token) {
        const width = this.atlas.wordSpacing * this._fontFactor;
        const height = this.atlas.fontSize * this._fontFactor;
        const glyphIndex = this._fontAtlasTextGeometry.addWhitespace(token, width, height);

        this._tokens.push({
            token,
            width,
            advanceHeight: height,
            glyphIndexBounds: [glyphIndex, glyphIndex],
        });
        this._tokenIndex++;
    }

    _addWord(word) {
        this.atlas.addGlyphsForString(word);
        const glyphIds = this.atlas.getGlyphsForWord(word);

        const width = glyphIds
                .map(glyphId => this.atlas.glyph[glyphId].advanceWidth * this._fontFactor)
                .reduce((a, b) => a + b);
        const advanceHeight = this.atlas.glyph[glyphIds[0]].advanceHeight * this._fontFactor;

        let xOffset = 0;
        const glyphIndexBounds = [];
        const wordIndices = []
        glyphIds.forEach((id, index) => {
            const metrics = this.atlas.glyph[id];
            const glyphIndex = this._fontAtlasTextGeometry.addGlyph(id, metrics, this._fontFactor);
            if (index === 0) {
                glyphIndexBounds.push(glyphIndex);
            }
            if (index === glyphIds.length - 1) {
                glyphIndexBounds.push(glyphIndex);
            }
            this._fontAtlasTextGeometry.moveGlyph(glyphIndex, xOffset, 0);
            xOffset += metrics.advanceWidth * this._fontFactor;

            wordIndices.push(this._tokenIndex++)
        });

        this._tokens.push({
            token: word,
            width,
            advanceHeight,
            glyphIndexBounds,
        });

        this._words.push(wordIndices);
    }

    _logGlyphs(array) {
        array.forEach((a, index) => {
            let info = `${index} ${a}: `
            if (a > 0) {
                info += `"${this.glyph[a - 1].id}"` + '<'
            }
            info += `"${this.glyph[a].id}"`
            if (this.glyphCount - 1 > a) {
                info += '>' + `"${this.glyph[a + 1].id}"`
            }
            console.log(info);
        })
    }

    _layoutGlyphs() {
        if (this.glyphCount === 0) {
            return;
        }
        let xOffset = 0;
        let yOffset = 0;
        let lineCount = 0;
        this._lines = [];
        let lines = new Set();

        const localLineHeight = (this.atlas.fontSize * this._fontFactor) * this._lineHeight;

        // console.log('max', this.maxWidth, this.maxHeight);
        // console.log(0, `${xOffset}, ${yOffset}`, this._tokens[0]);

        for (let i = 0; i < this._tokens.length - 1; i++) {
            xOffset += this._tokens[i].width;

            // @ts-ignore
            if (xOffset + this._tokens[i + 1].width > this.maxWidth && !PIXI.TextMetrics.isNewline(this._tokens[i + 1].token) && !PIXI.TextMetrics.isBreakingSpace(this._tokens[i + 1].token)) {
                xOffset = 0;
                yOffset += localLineHeight;
                // console.log('break')
                lines.add(lineCount);
            }
            // @ts-ignore
            else if (PIXI.TextMetrics.isNewline(this._tokens[i].token)) {
                xOffset = 0;
                yOffset += localLineHeight;
                // console.log('new line')
                lines.add(lineCount);
            }

            // console.log(i + 1, `${xOffset}, ${yOffset}`, this._tokens[i + 1]);
            lineCount += this._tokens[i].token.length;
            this._moveGlyphs(this._tokens[i + 1].glyphIndexBounds, xOffset, yOffset);
        }
        lineCount += this._tokens[this._tokens.length - 1].token.length;

        // console.log('glyphCount', this.glyphCount, lineCount)
        lines.add(this.glyphCount - 1)
        this._lines = Array.from(lines);
    }

    _deleteGeometry() {
        if (!this._geometry) {
            return;
        }
        this._fontAtlasTextGeometry.clear();
        // Question: is this expensive? We could re-use the same one...
        this._geometry.destroy();
        this._geometry = null;
    }

    set curveData(value: CurveData) {
        this._curveData = value;
        this._dirty = true;
    }

    set curveTexture(value: PIXI.Texture) {
        this._curveTexture = value;
        this._dirty = true;
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
        return anchors.flatMap(item => [item.x, item.y]);
    }

    _generateBoundScaleAnchors() {
        const {x, y, width, height} = this.getBounds();
        return {
            x: x + (width / 2),
            y: y + (height / 2),
        };
    }

    // TODO: specify type of position for anchor {x, y}
    _generateLineScaleAnchors() {
        let scaleAnchors = [];
        const lineRanges = this.lineGlyphRanges();
        for (let lineIndex = 0; lineIndex < lineRanges.length; lineIndex++) {
            const lineStart = lineRanges[lineIndex][0];
            const lineEnd = lineRanges[lineIndex][1];
            const scaleAnchor = average(
                this._fontAtlasTextGeometry._getGlyphCenter(lineStart),
                this._fontAtlasTextGeometry._getGlyphCenter(lineEnd));
            scaleAnchors.push(scaleAnchor);
        }
        return scaleAnchors;
    }

    _generateWordScaleAnchors() {
        let scaleAnchors = [];
        const wordRanges = this.words;
        for (let wordIndex = 0; wordIndex < wordRanges.length; wordIndex++) {
            const wordRange = wordRanges[wordIndex];
            const wordStart = wordRange[0];
            const wordEnd = wordRange[wordRange.length - 1];
            const scaleAnchor = average(
                this._fontAtlasTextGeometry._getGlyphCenter(wordStart),
                this._fontAtlasTextGeometry._getGlyphCenter(wordEnd));
            scaleAnchors.push(scaleAnchor);
        }
        return scaleAnchors;
    }

    _generateGlyphScaleAnchors() {
        return this.glyph.map((glyph, index) => this._fontAtlasTextGeometry.getGlyphCenter(index));
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
        return weights;
    }

    _generateBoundWeights() {
        return this.glyph.map((glyph, index) => [0, 0, 0, 0]).flat();
    }

    _generateLineWeights() {
        const weights:number[][] = [];
        const lineRanges = this.lineGlyphRanges();
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
        const wordRanges = this.words;
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
        return this.glyph.map((glyph, index) => [index, index, index, index]).flat();
    }

    _buildGeometry() {
        console.log('_buildGeometry')
        // NOTE: we need to rebuild our geometry when we add a new deformer
        const geometry = this._fontAtlasTextGeometry.build();
        this._geometry = geometry;
    }

    _buildShader() {
        console.log('_buildShader')
        // build shader
        // TODO: make into a property
        //  is this the same as tint?
        const color = [1.0, 0.0, 0.0, 1.0];

        let uniforms = Object.assign({
            uSampler2: this.atlas.texture[0],
            uColor: color,
        }, this.deform._combineUniforms())

        console.log('combined uniforms', uniforms);

        // const weights = this.deform._getWeights();
        // if (weights) {
        //     console.log('adding weights', weights)
        //     this._geometry.addAttribute('aWeight', weights, 1)
        // }

        const vertexShader = this.deform._buildVertexShader();
        console.log('build shader')
        const shader = PIXI.Shader.from(vertexShader, textureFragmentSrc, uniforms);

        // let shader;
        // // simple
        // // TODO: add transforms support - we should make this into a deformation stack so we only adds it in
        // //  when its necessary
        // if (!this._curveData || !this._curveTexture) {
        //     let uniforms = {
        //         uSampler2: this.atlas.texture[0],
        //         uColor: color,
        //     };
        //
        //     let vertexShader;
        //     if (this.transformType === TRANSFORM_TYPE.NONE) {
        //        vertexShader = simpleVertexSrc(true);
        //     }
        //     else {
        //         uniforms = Object.assign({}, uniforms, {
        //             transforms: this.transforms,
        //             scaleAnchors: this._generateScaleAnchors(),
        //             scales: this.scales,
        //         });
        //         vertexShader = transformVertexSrc(true, this.glyph.length);
        //     }
        //     // TODO: when the transform count changes, we need to rebuild this shader
        //     shader = PIXI.Shader.from(vertexShader, textureFragmentSrc, uniforms);
        // }
        // // deformed
        // else {
        //     const uniforms = {
        //         // color
        //         uSampler2: this.atlas.texture[0], // glyph texture
        //         uColor: color, // glyph color
        //
        //         // curve deform
        //         texture: this._curveTexture,
        //         pathOffset: this._pathOffset,
        //         pathSegment: this._pathSegment,
        //         spineOffset: this._spineOffset,
        //         spineLength: this._spineLength,
        //         flow: this._flow,
        //     };
        //     let vertexShader = deformVertexSrc(true);
        //     shader = PIXI.Shader.from(vertexShader, textureFragmentSrc, uniforms);
        // }


        this._shader = shader;
    }

    lineGlyphRanges() {
        const result = [];
        for (let i = 0; i < this.lines.length; i++) {
            result.push(this._getLineGlyphRange(i))
        }
        return result;
    }

    _getLineGlyphRange(index) {
        const start = index === 0 ? 0 : this._lines[index - 1] + 1;
        const end = this._lines[index];
        return [start, end];
    }

    _calculateBounds() {
        this._bounds.clear();
        this._bounds = this._fontAtlasTextGeometry.buildBounds();
    }

    center() {
        const bounds = this.getBounds()
        return {
            x: bounds.x + (bounds.width / 2),
            y: bounds.y + (bounds.height / 2)
        }
    }

    _render(renderer: PIXI.Renderer) {
        this._build();
        if (this.deform.isDirty) {
            this.deform.update();
            this._buildShader();
        }
        this._renderDefault(renderer);
    }
}