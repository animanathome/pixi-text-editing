import {FontAtlasText} from "./fontAtlasText";
import {CARET_POSITION, FontAtlasTextCaret} from "./fontAtlasTextCaret";
import * as PIXI from 'pixi.js';
import {FontAtlasTextSelection} from "./fontAtlasTextSelection";

function insertCharacterAtIndex(string, character, index) {
    return string.substring(0, index) + character + string.substring(index, string.length)
}

function removeCharacterAtIndex(string, start, end) {
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
        this.caret.caretVisibleDuration = 0; // TEMP
        this.addChild(this.caret);

        this.drawSelection = new FontAtlasTextSelection(text);
        this.addChild(this.drawSelection);
    }

    select(glyphIndex, glyphPosition) {
        this.caret.glyphIndex = glyphIndex;
        this.caret.glyphPosition = glyphPosition;

        this._activeGlyph();
        this.drawSelection.resetSelection()
    }

    click(x : number, y : number, shiftKey : boolean) {
        const prevGlyphIndex = this.caret.glyphIndex;
        const [glyphIndex, glyphPosition] = this.text.closestGlyph(x, y);

        // when we don't have any text we want to default to 0
        this.caret.glyphIndex = Math.max(0, glyphIndex);
        this.caret.glyphPosition = glyphPosition;

        console.log('click', this.caret.glyphIndex, this.caret.glyphPosition);

        this._activeGlyph();
        this._glyphSelection(glyphIndex, prevGlyphIndex, shiftKey);
    }

    _activeGlyph() {
        // console.log('active glyph', this.text.text[this.caret.glyphIndex])
        return [this.caret.glyphIndex, this.caret.glyphPosition]
    }

    _glyphSelection(glyphIndex, prevGlyphIndex, shiftKey) {
        // if (shiftKey && this.drawSelection.selectionLength === 0) {
        //     this.drawSelection.extendSelection(prevGlyphIndex);
        // }
        this.drawSelection.extendSelection(prevGlyphIndex);
        if (!shiftKey) {
            this.drawSelection.resetSelection()
        }
    }

    arrowUp(shiftKey = false) {
        console.warn('arrowUp', this.caret.glyphIndex, this.caret.glyphPosition);
        const index = this.caret.glyphIndex;
        const [indexAbove, _] = this.text.getGlyphAbove(index);
        if (index === indexAbove) {
            this.caret.glyphPosition = CARET_POSITION.START;
            return;
        }
        this.caret.glyphIndex = indexAbove;
        this.caret.glyphPosition = CARET_POSITION.START;

        // @ts-ignore
        if (PIXI.TextMetrics.isNewline(this.text.text[indexAbove])) {
            this.caret.glyphPosition = CARET_POSITION.END;
        }

        this._glyphSelection(indexAbove, index, shiftKey);
        this._activeGlyph();
    }

    arrowDown(shiftKey = false) {
        console.warn('arrowDown', this.caret.glyphIndex, this.caret.glyphPosition);
        const index = this.caret.glyphIndex;
        let [indexBelow, positionBelow] = this.text.getGlyphBelow(index);
        this.caret.glyphIndex = indexBelow;
        this.caret.glyphPosition = positionBelow;

        this._glyphSelection(indexBelow, index, shiftKey);
        this._activeGlyph();
    }

    arrowLeft(shiftKey = false) {
        const index = this.caret.glyphIndex;
        const position = this.caret.glyphPosition;

        const [indexBefore, positionBefore] = this.text.getGlyphBefore(index, position);

        this.caret.glyphIndex = indexBefore;
        this.caret.glyphPosition = positionBefore;

        this._glyphSelection(indexBefore, index, shiftKey);
        this._activeGlyph();
    }

    arrowRight(shiftKey = false) {
        const index = this.caret.glyphIndex;
        const position = this.caret.glyphPosition;
        const lastIndex = this.text.text.length - 1;

        // last glyph
        if (index === lastIndex && position === CARET_POSITION.START) {
            this.caret.glyphPosition = CARET_POSITION.END;
            this._glyphSelection(index, index, shiftKey);
            this._activeGlyph();
            return;
        }

        const [indexAfter, positionAfter] = this.text.getGlyphAfter(index, position);

        // next glyph is a new line
        const tokenAfter = this.text.text[indexAfter]
        // @ts-ignore
        if (PIXI.TextMetrics.isNewline(tokenAfter) && position === CARET_POSITION.START) {
            this.caret.glyphPosition = CARET_POSITION.END;
            this._glyphSelection(index, index, shiftKey);
            this._activeGlyph();
            return;
        }
        this.caret.glyphIndex = indexAfter;
        // this.caret.glyphPosition = positionAfter;

        this._glyphSelection(indexAfter, index, shiftKey);
        this._activeGlyph();
    }

    onInput(character) {
        console.log('onInput', character)
        if (character === 'Enter') {
            character = '\n'
        }
        if (character === 'Tab') {
            character = '\t'
        }
        // add glyph to text
        const text = this.text.text;
        const insertIndex = this.caret.glyphPosition === CARET_POSITION.START
            ? this.caret.glyphIndex : this.caret.glyphIndex + 1;
        const newText = insertCharacterAtIndex(text, character, insertIndex);
        this.text.text = newText;

        // position caret
        const maxIndex = newText.length - 1;
        let nextIndex = insertIndex + 1 > maxIndex ? maxIndex : insertIndex + 1; // move the caret behind the newly added glyph
        let nextPosition = (CARET_POSITION.END && nextIndex === maxIndex) ? CARET_POSITION.END : CARET_POSITION.START

        // @ts-ignore
        if (PIXI.TextMetrics.isNewline(this.text.text[nextIndex])) {
            console.warn('-> new line')
            nextIndex -= 1;
            nextPosition = CARET_POSITION.END;
        }
        console.log(this.caret.glyphIndex, this.caret.glyphPosition, '->', nextIndex, nextPosition)

        this.caret.glyphIndex = nextIndex;
        this.caret.glyphPosition = nextPosition;

        this.drawSelection.resetSelection()
        console.log(`result "${this.text.text}"`);
    }

    onDelete() {
        console.warn('onDelete', this.caret.glyphIndex, this.caret.glyphPosition, this.text.text[this.caret.glyphIndex]);
        const text = this.text.text;

        // delete using caret
        let start, end, glyphIndex;
        switch (this.caret.glyphPosition) {
            case CARET_POSITION.START:
                start = this.caret.glyphIndex - 1;
                end = this.caret.glyphIndex - 1;
                glyphIndex = start;
                break;
            case CARET_POSITION.END:
                start = this.caret.glyphIndex;
                end = this.caret.glyphIndex;
                glyphIndex = start - 1;
                break;
            default:
                throw Error(`Unsupported value ${this.caret.glyphPosition}`);
                break;
        }

        // delete using selection
        if (!this.drawSelection.empty) {
            start = this.drawSelection.selection[0];
            end = this.drawSelection.selection[this.drawSelection.selection.length - 1];
            glyphIndex = start;
        }

        let newText;
        if (start < end) {
            newText = removeCharacterAtIndex(text, start, end);
        }
        else {
            newText = removeCharacterAtIndex(text, end, start);
        }
        console.log('delete', newText, Math.max(0, glyphIndex), newText.length);
        this.text.text = newText;
        this.caret.glyphIndex = Math.max(0, glyphIndex);
        if (newText.length === 0 || start === 0) {
            this.caret.glyphIndex = 0;
            this.caret.glyphPosition = CARET_POSITION.START;
        }
        this.drawSelection.resetSelection()
    }

    destroy() {
        this.text = null;
        this.caret = null;
    }
}