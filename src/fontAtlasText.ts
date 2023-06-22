import * as PIXI from 'pixi.js';
import {FontAtlasTextGeometry, LEFT, RIGHT} from "./fontAtlasTextGeometry";
import {FontAtlas} from "./fontAtlas";
import {CARET_POSITION} from "./fontAtlasTextCaret";
import {CurveData} from "./curveData";
import {MeshMixin} from "./meshMixin";
import {DeformerStack} from "./deformers/deformerStack";
import {AnimationStack} from "./animation/animationStack";

const VERBOSE = true;

// TODO: Look at PIXI.Mesh. This object has all the necessary properties to enable rendering
export class FontAtlasText extends MeshMixin(PIXI.Container) {
    // TODO: make into a property
    //  is this the same as tint?
    _color = [1.0, 0.0, 0.0, 1.0];
    _text = 'hello world!';
    _dirty = true; // should use PIXI update properties so as _transformID, see Mesh
    maxWidth = 512;
    maxHeight = 512;
    _atlas = undefined;
    _fontSize = 12;
    _lineHeight = 1;
    _fontFactor = 1;
    _tokenIndex = 0;

    _tokens = [];
    _lines = [];
    _words = [];
    // TODO: rename to GeometryBuilder instead?
    _fontAtlasTextGeometry = new FontAtlasTextGeometry();
    _deformerStack: DeformerStack; // shader stack? here we build  shader

    // _time = 0;
    _animationStack: AnimationStack; // here we really always animate shaders...

    get deform() {
        return this._deformerStack;
    }

    get anim() {
        return this._animationStack;
    }

    set atlas(atlas: FontAtlas) {
        VERBOSE && console.log('set atlas', atlas);

        this._atlas = atlas;
        this._fontAtlasTextGeometry.atlasResolution = atlas.resolution;
        this._deformerStack = new DeformerStack(this, {uvs: true});
        this._animationStack = new AnimationStack(this);

        // NOTE: we should probably set this up during construction
        // TODO: Do we still need this? This should just run during update no?
        // @ts-ignore
        this._deformerStack.on('deformerAdded', () => {
            VERBOSE && console.log('deformer added');
            this._buildShader();
        });
        // @ts-ignore
        this._deformerStack.on('deformerChanged', () => {
            VERBOSE && console.log('deformer changed');
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
            VERBOSE && console.log(`fontSize not changed: ${value}`);
            return;
        }
        VERBOSE && console.log('set fontSize', value);
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
        // TODO: refactor to use deformer stack
        // if (this._curveData) {
        //     ({x, y} = this._curveData.invertPosition(x, y));
        // }
        const glyphCount = this._fontAtlasTextGeometry._glyph.length - 1;
        return this._fontAtlasTextGeometry.containsGlyph(x, y, {start: 0, end: glyphCount});
    }

    closestGlyph(x: number, y: number) {
        // TODO: refactor to use deformer stack
        // if (this._curveData) {
        //     ({x, y} = this._curveData.invertPosition(x, y));
        // }
        const glyphCount = this._fontAtlasTextGeometry._glyph.length - 1;
        return this._fontAtlasTextGeometry.closestGlyph(x, y, {start: 0, end: glyphCount});
    }

    closestWord(x: number, y: number) {
        // TODO: refactor to use deformer stack
        // if (this._curveData) {
        //     ({x, y} = this._curveData.invertPosition(x, y));
        // }
        const [index, _] = this.closestGlyph(x, y);
        return this.glyphWordIndex(index);
    }

    closestLine(x: number, y: number) {
        // TODO: refactor to use deformer stack
        // if (this._curveData) {
        //     ({x, y} = this._curveData.invertPosition(x, y));
        // }
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

    /**
     * Determines if the text is dirty and needs any of its elements to be rebuilt. This includes the text,
     * deformation stack and animation. Note to be confused with _dirty.
     */
    get dirty() {
        if (this.anim.dirty) {
            return true;
        }
        if (this.deform.dirty) {
            return true;
        }
        return this._dirty;
    }

    /**
     * Here we update the internal state. We don't really build any new objects which the caller can interact with
     * separately.
     */
    _update() {
        VERBOSE && console.log('text build', this.dirty)
        if (!this._dirty && !this.deform.dirty && !this.anim.dirty) {
            // it's important that we keep evaluating this while the text hasn't been fully updated.
            // this will allow us to easily determine whether everything is up-to-date.
            VERBOSE && console.log('nothing to do')
            return;
        }
        if (!this.atlas.loaded) {
            VERBOSE && console.log('unable to build text, atlas not loaded')
            return;
        }
        if (this._dirty) {
            this._calculateFontFactor();
            this._deleteGeometry();
            this._buildGlyphs();
            this._layoutGlyphs();
            this._buildGeometry();
            this._buildShader();
        }
        if (this.deform.dirty) {
            this.deform.update();
            this._buildShader();
        }
        if (this.anim.dirty) {
            this.anim.update();
        }
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

    _buildGeometry() {
        const geometry = this._fontAtlasTextGeometry.build();
        this._geometry = geometry;
    }

    set color(value) {
        this._color = value;
    }

    get color() {
        return this._color;
    }

    _buildShader() {
        VERBOSE && console.log('build shader');
        let uniforms = Object.assign({
            uSampler2: this.atlas.texture[0],
            uColor: this.color,
        }, this.deform._combineUniforms())
        const vertexShader = this.deform._buildVertexShader();
        const fragmentShader = this.deform._buildFragmentShader();
        const shader = PIXI.Shader.from(vertexShader, fragmentShader, uniforms);
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
        VERBOSE && console.log('render')
        this._update();
        this._renderDefault(renderer);
    }
}