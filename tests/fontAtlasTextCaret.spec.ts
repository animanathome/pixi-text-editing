import { expect } from 'chai';
import {CARET_POSITION, FontAtlasTextCaret} from "../src/fontAtlasTextCaret";

import {createFontAtlasTextApp, roundBounds} from '../tests/utils'

describe('FontAtlasTextCaret', () => {
    describe('can draw caret', () => {
        it('at the start', async() => {
            // Assemble
            const {app, text} = await createFontAtlasTextApp({
                displayText: 'hello',
                width: 28,
                height: 28
            })
            const caret = new FontAtlasTextCaret(text);
            caret.caretWidth = 1;
            app.stage.addChild(caret);

            // Act
            caret.glyphIndex = 0;
            caret.glyphPosition = CARET_POSITION.START;
            app.ticker.update();

            // Assert
            const roundedBounds = roundBounds(caret.getBounds());
            expect(caret._mesh.visible).to.be.true;
            expect(!!caret._mesh.geometry).to.be.true;
            expect(roundedBounds.x).to.equal(0)
            expect(roundedBounds.y).to.equal(0)
            expect(roundedBounds.width).to.equal(1)
            expect(roundedBounds.height).to.equal(12)
        })

        it('at the end', async() => {
            // Assemble
            const {app, text} = await createFontAtlasTextApp({
                displayText: "hello",
                width: 28,
                height: 28,
            })
            const caret = new FontAtlasTextCaret(text);
            caret.caretWidth = 2;
            app.stage.addChild(caret);

            // Act
            caret.glyphIndex = 4;
            caret.glyphPosition = CARET_POSITION.END;
            caret.caretVisibleDuration = 0;
            app.ticker.update();

            // Assert
            const roundedBounds = roundBounds(caret.getBounds());
            expect(caret._mesh.visible).to.be.true;
            expect(!!caret._mesh.geometry).to.be.true;
            expect(roundedBounds.x).to.equal(25)
            expect(roundedBounds.y).to.equal(0)
            expect(roundedBounds.width).to.equal(2)
            expect(roundedBounds.height).to.equal(12)
        })
    });
});