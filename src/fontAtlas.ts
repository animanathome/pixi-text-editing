import * as PIXI from 'pixi.js';
import {difference, uniq} from 'lodash';
import {FontLoader} from "./fontLoader";
import {direction, forString} from "./Script";

const VERBOSE = false;

type FontAtlasSettings = {
    font?: FontLoader,
    fontSize?: number,
    resolution?: number,
    paddingInX?: number,
    paddingInY?: number,
    debugBounds?: boolean,
};

export class FontAtlas {
    font = undefined;
    fontSize = 48;
    resolution = 512;
    paddingInX = 6;
    paddingInY = 6;
    debugBounds = false;

    texture = [];
    textureId = 0;

    canvas:HTMLCanvasElement = undefined;
    context:CanvasRenderingContext2D = undefined;

    glyph = {};
    familyName = undefined;
    subfamilyName = undefined;
    scale = 1;
    ascent = 0;
    descent = 0;
    lineGap = 0;
    bbox = {
        minX: 0,
        maxX: 0,
        minY: 0,
        maxY: 0,
    }
    wordSpacing = 0;
    script = 'latn';
    direction = 'ltr';

    x = 0;
    y = 0;
    prevId = undefined;
    constructor(settings?: FontAtlasSettings) {
        this.font = settings.font ?? this.font;
        this.fontSize = settings.fontSize ?? this.fontSize;
        this.resolution = settings.resolution ?? this.resolution;
        this.paddingInX = settings.paddingInX ?? this.paddingInX;
        this.paddingInY = settings.paddingInY ?? this.paddingInY;
        this.debugBounds = settings.debugBounds ?? this.debugBounds;

        this._setupCanvas();
        this._setupAtlas();
    }

    _setupCanvas() {
        VERBOSE && console.log('_setupCanvas()');
        this.canvas = document.createElement('canvas') as HTMLCanvasElement;
        this.canvas.width = this.resolution;
        this.canvas.height = this.resolution;
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

        // background color
        // this.context.beginPath();
        // this.context.fillRect(0, 0, this.resolution, this.resolution);
        // this.context.fillStyle = "red";
        // this.context.fill();

        this.context.scale(1, -1);
    }

    _clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, -this.canvas.height);
    }

     _setupAtlas() {
        VERBOSE && console.log('_setupAtlas()');
        const scale = this.fontSize / this.font.unitsPerEm;
        const ascent = this.font.ascent * scale;
        const descent = this.font.descent * scale;
        const lineGap = this.font.lineGap * scale;
        const minX = this.font.bbox.minX * scale;
        const minY = this.font.bbox.minY * scale;
        const maxX = this.font.bbox.maxX * scale;
        const maxY = this.font.bbox.maxY * scale;

        this.familyName = this.font.familyName;
        this.subfamilyName = this.font.subfamilyName;
        this.scale = scale;
        this.ascent = ascent;
        this.descent = descent;
        this.lineGap = lineGap;
        this.wordSpacing = this.fontSize * 0.25;
        this.bbox = {
            minX,
            minY,
            maxX,
            maxY
        }
    }

    /**
     * If we want to render (see) a glyph, we need a few things (data):
     * - rasterize a glyph into pixels so we can see it
     * - position data so we know how to position it
     * This method takes in a string and creates the necessary data for each character
     * @param string
     */
    addGlyphsForString(string) {
        // NOTE: we shouldn't be able to change this once this is set.
        this.script = forString(string);
        this.direction = direction(this.script);

        // Since Arabic uses ligatures, we can't save the individual glyphs since they appear different depending on the
        // neighbouring glyph; therefore, we're falling back to store the individual words.
        // TODO: try out some of the more common UNICODE_SCRIPTS to see if any other use ligatures
        // TODO: see if we can store out the individual glyphs. See Fontkit's layout.substitute.
        if (this.script === 'arab') {
            throw Error('Unsupported script "arab".');
        }
        else {
            string = string.replace(/\s+/g, '');
            let characters = [];
            for (let i = 0; i < string.length; i++) {
                characters.push(string.charAt(i));
            }
            characters = uniq(characters);
            this._addGlyphs(characters);
        }
    }

    _addGlyphs(string) {
        const missingGlyphs = this._missingGlyphs([...string]);
        if (missingGlyphs.length === 0) {
            return;
        }

        missingGlyphs.forEach(glyph => this._addGlyph(glyph));

        // eslint-disable-next-line
        this.texture[this.textureId] = PIXI.Texture.from(this.canvas);
    }

    _addGlyph(character) {
        const glyphId = this._glyphsForString(character);
        const glyph = this.font.getGlyph(glyphId);

        const bbox = glyph.bbox;
        const minX = bbox.minX * this.scale;
        const minY = bbox.minY * this.scale;
        const width = (bbox.maxX - bbox.minX) * this.scale;
        const height = (bbox.maxY - bbox.minY) * this.scale;

        const metrics = glyph._getMetrics();
        metrics.advanceWidth *= this.scale;
        metrics.advanceHeight *= this.scale;
        metrics.leftBearing *= this.scale;
        metrics.topBearing *= this.scale;

        this.context.save();
        if (this.prevId) {
            this.x += this.glyph[this.prevId].width + this.paddingInX;
            const nextPositionInX = this.x + width + this.paddingInX;
            // new line
            if (nextPositionInX > this.resolution) {
                this.x = this.paddingInX;
                this.y -= metrics.advanceHeight;
            }
            // new canvas/texture
            const nextPositionInY = this.y - metrics.advanceHeight;
            if (nextPositionInY < -this.resolution) {
                this.y = 0;
                this.textureId++;
                this._clearCanvas();
            }
        }

        const offsetX = -metrics.leftBearing + this.paddingInX + this.x;
        const offsetY = -metrics.advanceHeight + this.y;
        this.context.translate(offsetX, offsetY);
        this.context.beginPath();
        if (this.debugBounds) {
            this.context.rect(minX, minY, width, height);
            this.context.stroke();
        }
        glyph.render(this.context, this.fontSize);
        this.context.restore();

        this.prevId = character;
        this.glyph[character] = Object.assign({}, {
            x: offsetX + minX, // TODO: rename to u
            y: offsetY + minY, // TODO: rename to v
            width,
            height,
            textureId: this.textureId,
        }, metrics);
    }

     _glyphsForString(string) {
        // remove all whitespaces from string
        string = string.replace(/\s+/g, '');

        const glyphIds = [];
        const len = string.length;
        let idx = 0;
        let last = -1;
        let state = -1;

        while (idx <= len) {
            let code = 0;
            let nextState = 0;

            if (idx < len) {
                code = string.charCodeAt(idx++);
                if (code >= 0xd800 && code <= 0xdbff && idx < len) {
                    const next = string.charCodeAt(idx);
                    if (next >= 0xdc00 && next <= 0xdfff) {
                        idx++;
                        code = ((code & 0x3ff) << 10) + (next & 0x3ff) + 0x10000;
                    }
                }
                nextState = ((code >= 0xfe00 && code <= 0xfe0f) || (code >= 0xe0100 && code <= 0xe01ef)) ? 1 : 0;
            }
            else {
                idx++;
            }
            if (state === 0 && nextState === 1) {
                glyphIds.push(this.font._cmapProcessor.lookup(last, code));
            }
            else if (state === 0 && nextState === 0) {
                glyphIds.push(this.font._cmapProcessor.lookup(last));
            }

            last = code;
            state = nextState;
        }

        return glyphIds;
    }

     _missingGlyphs(glyphIds) {
        const necessaryIds = uniq(glyphIds);
        const storedIds = this._cachedIds();
        const missingIds = difference(necessaryIds, storedIds);
        return missingIds;
    }

    _cachedIds() {
        return Object.keys(this.glyph);
    }

    getGlyphsForWord(word) {
        let glyphs = [];
        if (this.script === 'arab') {
            glyphs = [word];
        }
        else {
            word = word.replace(/\s+/g, '');
            for (let i = 0; i < word.length; i++) {
                glyphs.push(word.charAt(i));
            }
        }
        const storedGlyphs = glyphs.filter(glyph => this.glyph.hasOwnProperty(glyph));
        return storedGlyphs;
    }

    clear() {
        this.texture.forEach(texture => texture.destroy(true));
        this.texture = [];
        this.textureId = 0;

        this._clearCanvas();

        this.glyph = {};
        this.familyName = undefined;
        this.subfamilyName = undefined;
        this.scale = 1;
        this.ascent = 0;
        this.descent = 0;
        this.wordSpacing = 0;
        this.script = 'latn';
        this.direction = 'ltr';

        this.x = 0;
        this.y = 0;
        this.prevId = undefined;
    }
}