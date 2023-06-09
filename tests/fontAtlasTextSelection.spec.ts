import { expect } from 'chai';
import {createFontAtlasTextApp, roundBounds} from '../tests/utils'
import {FontAtlasTextSelection} from "../src/fontAtlasTextSelection";

describe('FontAtlasTextSelection', () => {
    describe('can draw', () => {
        it('a single line selection', async() => {
            // Assemble
            const {app, text} = await createFontAtlasTextApp({
                displayText: 'hello',
                width: 28,
                height: 28,
            })
            const selection = new FontAtlasTextSelection(text);
            app.stage.addChild(selection);

            // Act
            selection.extendSelection(0)
            selection.extendSelection(1)
            selection.extendSelection(2)
            selection._update()
            app.ticker.update();

            // Assert
            const roundedBounds = roundBounds(selection.getBounds());
            expect(selection._mesh.visible).to.be.true;
            expect(!!selection._mesh.geometry).to.be.true;
            expect(roundedBounds.x).to.equal(1)
            expect(roundedBounds.y).to.equal(0)
            expect(roundedBounds.width).to.equal(14)
            expect(roundedBounds.height).to.equal(12)

            // Cleanup
            app.destroy(true, true);
        })

        it('a double line selection', async() => {
            // Assemble
            const {app, text} = await createFontAtlasTextApp({
                displayText: 'hello\nhello',
                width: 30,
                height: 30,
            })
            const selection = new FontAtlasTextSelection(text);
            app.stage.addChild(selection);

            // Act
            selection.extendSelection(4)
            selection.extendSelection(5)
            selection.extendSelection(6)
            selection.extendSelection(7)
            selection._update()
            app.ticker.update();

            // Assert
            const roundedBounds = roundBounds(selection.getBounds());
            expect(selection._mesh.visible).to.be.true;
            expect(!!selection._mesh.geometry).to.be.true;
            expect(roundedBounds.x).to.equal(1)
            expect(roundedBounds.y).to.equal(0)
            expect(roundedBounds.width).to.equal(28)
            expect(roundedBounds.height).to.equal(24)

            // Cleanup
            app.destroy(true, true);
        })

        it('a multi line selection', async() => {
            // Assemble
            const {app, text} = await createFontAtlasTextApp({
                displayText: 'hello\nhello\nhello',
                width: 36,
                height: 36,
            })
            const selection = new FontAtlasTextSelection(text);
            app.stage.addChild(selection);

            // Act
            selection.extendSelection(4)
            selection.extendSelection(5)
            selection.extendSelection(6)
            selection.extendSelection(7)
            selection.extendSelection(8)
            selection.extendSelection(9)
            selection.extendSelection(10)
            selection.extendSelection(11)
            selection.extendSelection(12)

            selection._update()
            app.ticker.update();

            // Assert
            const roundedBounds = roundBounds(selection.getBounds());
            expect(selection._mesh.visible).to.be.true;
            expect(!!selection._mesh.geometry).to.be.true;
            expect(roundedBounds.x).to.equal(1)
            expect(roundedBounds.y).to.equal(0)
            expect(roundedBounds.width).to.equal(28)
            expect(roundedBounds.height).to.equal(36)

            // Cleanup
            app.destroy(true, true);
        })
    })
})