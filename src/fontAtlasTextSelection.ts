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
        return this.text.closestWord(x, y);
    }

    getClosestLine(x: number, y: number) {
        return this.text.closestLine(x, y);
    }

    _lastGlyphIndex() {
        return this.text.glyph.length - 1;
    }

    getGlyphBefore(index) {
        return this.text.getGlyphBefore(index);
    }

    getGlyphAfter(index) {
        return this.text.getGlyphAfter(index);
    }

    getGlyphAbove(index) {
        return this.text.getGlyphAbove(index);
    }

    getGlyphBelow(index) {
        return this.text.getGlyphBelow(index);
    }
}