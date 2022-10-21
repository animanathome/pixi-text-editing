import * as PIXI from 'pixi.js';
import {FontAtlasTextGeometry, LEFT, RIGHT} from "./fontAtlasTextGeometry";
import {FontAtlas} from "./fontAtlas";
import {CARET_POSITION} from "./fontAtlasTextCaret";

const vertexSrc = `
    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;
    uniform mat3 projectionMatrix;
    uniform mat3 translationMatrix;
    
    varying vec2 vUvs;
    
    void main() {
        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
`;

const fragmentSrc = `
    varying vec2 vUvs;
    uniform sampler2D uSampler2;
    uniform vec4 uColor;

    void main() {
        gl_FragColor = texture2D(uSampler2, vUvs) * uColor;
    }
`;

export enum ALIGN_OPTION {
    LEFT,
    CENTER,
    RIGHT
}

export class FontAtlasText extends PIXI.Container {
    _text = 'hello world!';
    _textMesh = null;
    _dirty = true;
    maxWidth = 512;
    maxHeight = 512;
    _atlas = undefined;
    align = ALIGN_OPTION.LEFT;
    _tokenIndex = 0;
    _tokens = [];
    _lines = [];
    _words = [];
    _fontAtlasTextGeometry = new FontAtlasTextGeometry();

    set atlas(atlas: FontAtlas) {
        this._atlas = atlas;
        this._fontAtlasTextGeometry.atlasResolution = atlas.resolution;
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
        const glyphCount = this._fontAtlasTextGeometry._glyph.length - 1;
        return this._fontAtlasTextGeometry.containsGlyph(x, y, {start: 0, end: glyphCount});
    }

    closestGlyph(x: number, y: number) {
        const glyphCount = this._fontAtlasTextGeometry._glyph.length - 1;
        return this._fontAtlasTextGeometry.closestGlyph(x, y, {start: 0, end: glyphCount});
    }

    closestWord(x: number, y: number) {
        const [index, _] = this.closestGlyph(x, y);
        return this.glyphWordIndex(index);
    }

    closestLine(x: number, y: number) {
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

    getGlyphAbove(index, position) {
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

    get words() {
        return this._words;
    }

    _build() {
        if (!this._dirty) {
            return;
        }
        this._deleteMesh();
        this._buildGlyphs();
        this._layoutGlyphs();
        this._createMesh();
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

    _addWhitespace(token) {
        const width = this.atlas.wordSpacing;
        const height = this.atlas.fontSize;
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
                .map(glyphId => this.atlas.glyph[glyphId].advanceWidth)
                .reduce((a, b) => a + b);
        const advanceHeight = this.atlas.glyph[glyphIds[0]].advanceHeight;

        let xOffset = 0;
        const glyphIndexBounds = [];
        const wordIndices = []
        glyphIds.forEach((id, index) => {
            const metrics = this.atlas.glyph[id];
            const glyphIndex = this._fontAtlasTextGeometry.addGlyph(id, metrics);
            if (index === 0) {
                glyphIndexBounds.push(glyphIndex);
            }
            if (index === glyphIds.length - 1) {
                glyphIndexBounds.push(glyphIndex);
            }
            this._fontAtlasTextGeometry.moveGlyph(glyphIndex, xOffset, 0);
            xOffset += metrics.advanceWidth;

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

    _layoutGlyphs() {
        let xOffset = 0;
        let yOffset = 0;
        let lineCount = 0;
        this._lines = [];
        this._tokens.forEach(token => {

            if (xOffset + token.width > this.maxWidth) { // new line
                xOffset = 0;
                yOffset += this.atlas.fontSize;

                this._lines.push(lineCount);
            }

            if (yOffset > this.maxHeight) {
                // console.log('reached bottom edge');
                return;
            }

            // console.log(JSON.stringify(token), xOffset, yOffset);

            this._moveGlyphs(token.glyphIndexBounds, xOffset, yOffset);
            xOffset += token.width;

            // @ts-ignore
            if (PIXI.TextMetrics.isNewline(token.token)) { // new line
                xOffset = 0;
                yOffset += this.atlas.fontSize;

                this._lines.push(lineCount);
           }

            lineCount += token.token.length;
        });
        // this._lines.push(lineCount);
    }

    _deleteMesh() {
        if (!this._textMesh) {
            return;
        }
        this._fontAtlasTextGeometry.clear();
        this._textMesh.destroy(true);
        this._textMesh = null;
    }

    _createMesh() {
        const geometry = this._fontAtlasTextGeometry.build();
        const color = [1.0, 1.0, 1.0, 1.0];
        const uniforms = {
            uSampler2: this.atlas.texture[0],
            uColor: color,
        };
        const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
        const mesh = new PIXI.Mesh(geometry, shader);
        this._textMesh = mesh;
        this.addChild(mesh);
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
        const bounds = new PIXI.Rectangle();
        for (let i = 0; i < this._lines.length; i++) {
            const range = this._getLineGlyphRange(i);
            bounds.enlarge(this._fontAtlasTextGeometry.getBounds(range));
        }
        return bounds;
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
        super._render(renderer);
    }
}