import {FontAtlasText} from "./fontAtlasText";
import {CARET_POSITION, FontAtlasTextCaret} from "./fontAtlasTextCaret";
import * as PIXI from 'pixi.js';
import {FontAtlasTextSelection} from "./fontAtlasTextSelection";

function insertCharacterAtIndex(string, character, index) {
    return string.substring(0, index) + character + string.substring(index, string.length)
}

function removeCharacterAtIndex(string, start, end) {
    console.log('removeCharacterAtIndex', string, start, end);
    return string.substring(0, start) + string.substring(end + 1, string.length)
}

export class FontAtlasTextManipulator extends PIXI.Container {
    text = null;
    caret = null;
    drawSelection = null;

    constructor(text: FontAtlasText) {
        super();
        this.text = text;

        this.caret = new FontAtlasTextCaret(text);
        this.addChild(this.caret);

        this.drawSelection = new FontAtlasTextSelection(text);
        this.addChild(this.drawSelection);
    }

    click(x : number, y : number, shiftKey : boolean) {
        const prevGlyphIndex = this.caret.glyphIndex;
        const [glyphIndex, glyphPosition] = this.text.closestGlyph(x, y);
        this.caret.glyphIndex = glyphIndex;
        this.caret.glyphPosition = glyphPosition;

        this._activeGlyph();
        this._glyphSelection(glyphIndex, prevGlyphIndex, shiftKey);
    }

    _activeGlyph() {
        // console.log('active glyph', this.text.text[this.caret.glyphIndex])
    }

    _glyphSelection(glyphIndex, prevGlyphIndex, shiftKey) {
        if (shiftKey && this.drawSelection.selectionLength === 0) {
            this.drawSelection.extendSelection(prevGlyphIndex);
        }
        this.drawSelection.extendSelection(glyphIndex);
        if (!shiftKey) {
            this.drawSelection.resetSelection()
        }
    }

    arrowUp(shiftKey = false) {
        const index = this.caret.glyphIndex;
        const [indexAbove, _] = this.text.getGlyphAbove(index);
        this.caret.glyphIndex = indexAbove;

        this._glyphSelection(indexAbove, index, shiftKey);
        this._activeGlyph();
    }

    arrowDown(shiftKey = false) {
        const index = this.caret.glyphIndex;
        // console.log('arrowDown', index);
        const [indexBelow, _] = this.text.getGlyphBelow(index);
        // console.log('indexBelow', indexBelow);
        this.caret.glyphIndex = indexBelow;

        this._glyphSelection(indexBelow, index, shiftKey);
        this._activeGlyph();
    }

    arrowLeft(shiftKey = false) {
        const index = this.caret.glyphIndex;
        if (this.caret.glyphPosition === CARET_POSITION.END) {
            this.caret.glyphPosition = CARET_POSITION.START;

            this._glyphSelection(index, index, shiftKey);
            this._activeGlyph();
            return;
        }
        const indexBefore = this.text.getGlyphBefore(index);
        this.caret.glyphIndex = indexBefore;

        this._glyphSelection(indexBefore, index, shiftKey);
        this._activeGlyph();
    }

    arrowRight(shiftKey = false) {
        const index = this.caret.glyphIndex;
        if (this.caret.glyphPosition === CARET_POSITION.START) {
            this.caret.glyphPosition = CARET_POSITION.END;

            this._glyphSelection(index, index, shiftKey);
            this._activeGlyph();
            return;
        }
        const indexAfter = this.text.getGlyphAfter(index);
        this.caret.glyphIndex = indexAfter;

        this._glyphSelection(indexAfter, index, shiftKey);
        this._activeGlyph();
    }

    onInput(character) {
        console.log('onInput', character);
        const text = this.text.text;
        const index = this.caret.glyphPosition === CARET_POSITION.START
            ? this.caret.glyphIndex : this.caret.glyphIndex + 1;

        const newText = insertCharacterAtIndex(text, character, index);
        this.text.text = newText;

        this.caret.glyphIndex = index;
        this.drawSelection.resetSelection()
    }

    onDelete() {
        const text = this.text.text;
        let start = this.drawSelection.empty ? this.caret.glyphIndex : this.drawSelection.selection[0];
        let end = this.drawSelection.empty ? this.caret.glyphIndex : this.drawSelection.selection[this.drawSelection.selection.length - 1];
        let newText;
        if (start < end) {
            newText = removeCharacterAtIndex(text, start, end);
        }
        else {
            newText = removeCharacterAtIndex(text, end, start);
        }
        this.text.text = newText;
        this.caret.glyphIndex = start - 1;

        this.drawSelection.resetSelection()
    }

    destroy() {
        this.text = null;
        this.caret = null;
    }
}