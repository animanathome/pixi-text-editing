import {FontAtlasText} from "./fontAtlasText";
import * as PIXI from "pixi.js";
import {LEFT} from "./fontAtlasTextGeometry";

// TODO: merge into fontAtlasText
export class FontAtlasTextSelection {
    text: FontAtlasText = undefined;
    constructor(fontAtlasText: FontAtlasText) {
        this.text = fontAtlasText;
    }

    getBounds(skipUpdate) {
        return this.text.getBounds(skipUpdate)
    }

    containsGlyph(x: number, y: number) {
        return this.text.containsGlyph(x, y)
    }

    getClosestGlyph(x: number, y: number) {
        return this.text.closestGlyph(x, y);
    }

    getClosestWord(x: number, y: number) {
        const index = this.getClosestGlyph(x, y);
        return this.text.glyphWordIndex(index);
    }

    getClosestLine(x: number, y: number) {
        const index = this.getClosestGlyph(x, y);
        return this.text.glyphLineIndex(index);
    }

    _lastGlyphIndex() {
        return this.text.glyph.length - 1;
    }

    getGlyphBefore(index) {
        if (index === 0) {
            return 0;
        }
        const indexBefore = index - 1;
        if (this._lastGlyphIndex() < indexBefore) {
            return this._lastGlyphIndex();
        }

        // @ts-ignore
        if (PIXI.TextMetrics.isNewline(this.text.glyph[indexBefore].id)) {
            return this.getGlyphBefore(indexBefore);
        }
        return indexBefore;
    }

    getGlyphAfter(index) {
        const nextIndex = index + 1;
        if (this._lastGlyphIndex() < nextIndex) {
            return this._lastGlyphIndex();
        }
        return nextIndex;
    }

    getGlyphAbove(index) {
        if (index === 0) {
            return [0, LEFT];
        }
        const glyphLineIndex = this.text.glyphLineIndex(index);

        // if the glyph is on the first line
        if (!glyphLineIndex) {
            return [index, LEFT];
        }
        // get the closest glyph on the previous line
        const prevLineIndex = glyphLineIndex - 1;
        return this.text.getClosestGlyphOnLine(index, prevLineIndex);
    }

    getGlyphBelow(index) {
        const glyphLineIndex = this.text.glyphLineIndex(index);
        // console.log('glyphLineIndex', glyphLineIndex);
        if (glyphLineIndex === this.text.lastGlyphLineIndex) {
            return [index, LEFT];
        }

        const nextLineIndex = glyphLineIndex + 1;
        return this.text.getClosestGlyphOnLine(index, nextLineIndex);
    }
}