import * as PIXI from 'pixi.js';
import {FontAtlasTextGeometry} from "./fontAtlasTextGeometry";
import {FontAtlas} from "./fontAtlas";

const vertexSrc = `
    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;
    uniform mat3 projectionMatrix;
    
    varying vec2 vUvs;
    
    void main() {
        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
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

    getGlyphVertexArray(index) {
        return this._fontAtlasTextGeometry._getGlyphVertexArray(index);
    }

    getGlyphCenter(index) {
        return this._fontAtlasTextGeometry.getGlyphCenter(index);
    }

    containsGlyph(x: number, y: number) {
        // console.log('containsGlyph', x, y);
        const glyphCount = this._fontAtlasTextGeometry._glyph.length - 1;
        return this._fontAtlasTextGeometry.containsGlyph(x, y, {start: 0, end: glyphCount});
    }

    closestGlyph(x: number, y: number) {
        // console.log('closestGlyph', x, y);
        const glyphCount = this._fontAtlasTextGeometry._glyph.length - 1;
        return this._fontAtlasTextGeometry.closestGlyph(x, y, {start: 0, end: glyphCount});
    }

    closestGlyphWithinRange(x: number, y: number, glyphRange: {start: number, end: number}) {
        return this._fontAtlasTextGeometry.closestGlyph(x, y, glyphRange);
    }

    getClosestGlyphOnLine(glyphIndex: number, lineIndex: number) {
        // console.log('getClosestGlyphOnLine', glyphIndex, lineIndex);
        const line = this.lines[lineIndex];
        const glyphCenter = this.getGlyphCenter(glyphIndex);
        const result = this.closestGlyphWithinRange(
            glyphCenter.x,
            glyphCenter.y,
            {start: line[0], end: line[line.length - 1]}
        );
        return result;
    }

    glyphWordIndex(index) {
        return this.words.findIndex(line => index >= line[0] && index <= line[1])
    }

    glyphLineIndex(index) {
        return this.lines.findIndex(line =>
            index >= line[0] && index <= line[line.length - 1]
        )
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
        // console.log('_buildGlyphs')
        this._tokens = [];
        this._tokenIndex = 0;

        // @ts-ignore
        const tokens = PIXI.TextMetrics.tokenize(this.text);
        tokens.forEach(token => {
            // @ts-ignore
            if (PIXI.TextMetrics.isBreakingSpace(token) || PIXI.TextMetrics.isNewline(token)) {
                this._addWhitespace(token);
                return;
            }
            this._addWord(token);
        });

        // console.log('tokens', this._tokens);
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
        // console.log('_layoutGlyphs')
        let xOffset = 0;
        let yOffset = 0;
        let wordCount = 0;
        let line = []
        this._tokens.forEach(token => {
            if (xOffset + token.width > this.maxWidth) { // new line
                xOffset = 0;
                yOffset += this.atlas.fontSize;
                this._lines.push(line.flat());
                line = [];
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
                this._lines.push(line.flat());
                line = [];
           }

            // @ts-ignore
            if (!PIXI.TextMetrics.isNewline(token.token) &&
                !PIXI.TextMetrics.isBreakingSpace(token.token))
            { // new line
                line.push(this._words[wordCount])
                wordCount++;
            }
        });
        this._lines.push(line.flat());
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

    _calculateBounds() {
        const bounds = new PIXI.Rectangle();
        // TODO: we should really just use the first and last word
        this._lines.forEach(line => bounds.enlarge(this._fontAtlasTextGeometry.getBounds(line)));
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