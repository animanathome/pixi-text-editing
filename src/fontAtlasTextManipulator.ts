import {FontAtlasText} from "./fontAtlasText";
import {CARET_POSITION, FontAtlasTextCaret} from "./fontAtlasTextCaret";
import * as PIXI from 'pixi.js';
import {FontAtlasTextSelection} from "./fontAtlasTextSelection";
import {LEFT, RIGHT} from "./fontAtlasTextGeometry";

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

    select(glyphIndex, glyphPosition, shiftkey = false) {
        const index = this.caret.glyphIndex;
        const position = this.caret.glyphPosition;

        this.caret.glyphIndex = glyphIndex;
        this.caret.glyphPosition = glyphPosition;

        this._activeGlyph();
        this._glyphSelection(index, position, shiftkey)
        this._glyphSelection(glyphIndex, glyphPosition, shiftkey);
    }

    click(x : number, y : number, shiftKey : boolean) {
        // console.log('click', x, y, shiftKey);
        // localize position
        const worldMatrix = this.text.transform.worldTransform;
        const localPoint = worldMatrix.applyInverse(new PIXI.Point(x, y));

        const prevGlyphIndex = this.caret.glyphIndex;
        const prevGlyphPosition = this.caret.glyphPosition;

        const [glyphIndex, glyphPosition] = this.text.closestGlyph(localPoint.x, localPoint.y);
        this.caret.glyphIndex = Math.max(0, glyphIndex);
        this.caret.glyphPosition = glyphPosition;

        this._activeGlyph();
        this._glyphSelection(prevGlyphIndex, prevGlyphPosition, shiftKey);
        this._glyphSelection(glyphIndex, glyphPosition, shiftKey);
    }

    _activeGlyph() {
        // console.log('active glyph', this.text.text[this.caret.glyphIndex])
        return [this.caret.glyphIndex, this.caret.glyphPosition]
    }

    _glyphSelection(
        prevGlyphIndex : number,
        prevGlyphPosition : number,
        shiftKey : boolean
    ) {
        // console.log('_glyphSelection', prevGlyphIndex, prevGlyphPosition, shiftKey);
        // if (prevGlyphPosition === RIGHT) {
        //     prevGlyphIndex += 1;
        // }
        this.drawSelection.extendSelection(prevGlyphIndex);
        if (!shiftKey) {
            this.drawSelection.resetSelection()
        }
    }

    arrowUp(shiftKey = false) {
        const index = this.caret.glyphIndex;
        const position = this.caret.glyphPosition;
        const [indexAbove, positionAbove] = this.text.getGlyphAbove(index, position);
        this.caret.glyphIndex = indexAbove;
        this.caret.glyphPosition = positionAbove;

        this._glyphSelection(index, position, shiftKey);
        this._activeGlyph();
    }

    arrowDown(shiftKey = false) {
        const index = this.caret.glyphIndex;
        const position = this.caret.glyphPosition;
        let [indexBelow, positionBelow] = this.text.getGlyphBelow(index);
        this.caret.glyphIndex = indexBelow;
        this.caret.glyphPosition = positionBelow;

        this._glyphSelection(index, position, shiftKey);
        this._activeGlyph();
    }

    arrowLeft(shiftKey = false) {
        let index = this.caret.glyphIndex;
        const position = this.caret.glyphPosition;
        const [indexBefore, positionBefore] = this.text.getGlyphBefore(index, position);
        this.caret.glyphIndex = indexBefore;
        this.caret.glyphPosition = positionBefore;

        if (position === LEFT) {
            index -= 1;
        }
        this._glyphSelection(index, position, shiftKey);
        this._activeGlyph();
    }

    arrowRight(shiftKey = false) {
        let index = this.caret.glyphIndex;
        const position = this.caret.glyphPosition;

        const [indexAfter, positionAfter] = this.text.getGlyphAfter(index, position);

        this.caret.glyphIndex = indexAfter;
        this.caret.glyphPosition = positionAfter;

        if (position === RIGHT) {
            index += 1;
        }
        this._glyphSelection(index, position, shiftKey);
        this._activeGlyph();
    }

    onInput(character) {
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
            nextIndex -= 1;
            nextPosition = CARET_POSITION.END;
        }
        this.caret.glyphIndex = nextIndex;
        this.caret.glyphPosition = nextPosition;

        this.drawSelection.resetSelection()
    }

    onDelete() {
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