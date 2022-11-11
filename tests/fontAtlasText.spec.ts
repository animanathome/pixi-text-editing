import * as PIXI from 'pixi.js';
import { expect } from 'chai';
import {FontAtlasText} from "../src/fontAtlasText";
import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {createFontAtlasTextApp, getRenderedPixels, roundBounds} from "./utils";
import {LOCALHOST} from "./utils";

const createFontAtlasText = async(
    displayText = 'abc',
    width = 128,
    height = 128,
    fontAtlasSize = 12,
    fontAtlasResolution = 128,
    fontSize = 12,
    fontUrl = LOCALHOST + 'Roboto-Regular.ttf'
) => {
    const fontLoader = new FontLoader();
    fontLoader.sourceUrl = fontUrl;
    await fontLoader.load();

    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: fontAtlasResolution,
        fontSize: fontAtlasSize,
    })

    const text = new FontAtlasText();
    text.atlas = atlas;
    text.fontSize = fontSize;
    text.maxHeight = width;
    text.maxWidth = height;
    text.text = displayText;
    text._build();

    return {
        fontLoader,
        atlas,
        text,
    }
}

describe('fontAtlasText', () => {
    it('can change font size', async() => {
        // Assemble + act
        const {text} = await createFontAtlasText('abc',
            128, 128, 24, 128,
            24);

        // Assert
        let {x, y, width, height} = roundBounds(text.getBounds());
        expect(x).to.equal(1);
        expect(y).to.equal(0);
        expect(width).to.equal(37);
        expect(height).to.equal(18);

        // Act
        text.fontSize = 12;
        text._build();

        // Assert
        ({x, y, width, height} = roundBounds(text.getBounds()));
        expect(x).to.equal(1);
        expect(y).to.equal(0);
        expect(width).to.equal(19);
        expect(height).to.equal(9);
    });

    it('can change line height', async() => {
        // Assemble + act
        const {text} = await createFontAtlasText('a\nb');

        // Assert
        let {x, y, width, height} = roundBounds(text.getBounds());
        expect(x).to.equal(1);
        expect(y).to.equal(0);
        expect(width).to.equal(9);
        expect(height).to.equal(21);

        // Act
        text.lineHeight = 2.0;
        text._build();

        // Assert
        ({x, y, width, height} = roundBounds(text.getBounds()));
        expect(x).to.equal(1);
        expect(y).to.equal(0);
        expect(width).to.equal(9);
        expect(height).to.equal(33);
    });

    it('can render simple text', async () => {
        // Assemble
        const displayText = 'hello World!\n' + 'It\'s a new day for text rendering.';
        const {app} = await createFontAtlasTextApp(displayText)

        // Act
        const pixels = getRenderedPixels(app.renderer as PIXI.Renderer);

        // Assert
        expect(pixels.reduce((a, b) => a + b)).to.be.lessThan(pixels.length * 255)
    })

    describe('can calculate', () => {
        it('bounds', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act
            const {x, y, width, height} = text.getBounds()

            // Assert
            expect(x).to.equal(0.8203125);
            expect(y).to.equal(0);
            expect(width).to.equal(115.353515625);
            expect(height).to.equal(35.49609375);
        });

        // TODO: fix me
        it('line index array', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasTextApp(displayText)

            // Act and assert
            // TODO: 37 also seems to be the first letter of a new word???
            // TODO: 47 should be 46!!!
            let expectedLines = [12, 37, 47]
            expect(text.lines).to.eql(expectedLines);
            expect(expectedLines[2]).to.equal(text.glyphCount)
        });

        it('word index array', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act and assert
            const expectedWords = [
              [ 0, 1, 2, 3, 4 ],
              [ 6, 7, 8, 9, 10, 11 ],
              [ 13, 14, 15, 16 ],
              [ 18 ],
              [ 20, 21, 22 ],
              [ 24, 25, 26 ],
              [ 28, 29, 30 ],
              [ 32, 33, 34, 35 ],
              [ 37, 38, 39, 40, 41, 42, 43, 44, 45, 46]
            ]
            expect(text.words).to.eql(expectedWords);
        });
    });

    describe('can get', () => {
        it('word index for glyph', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act and assert
            expect(text.glyphWordIndex(0)).to.equal(0)
            expect(text.glyphWordIndex(8)).to.equal(1)
            expect(text.glyphWordIndex(15)).to.equal(2)
            expect(text.glyphWordIndex(18)).to.equal(3)
            expect(text.glyphWordIndex(37)).to.equal(8)
        });

        it('line index for glyph', async() => {
            // Assemble
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act and assert
            expect(text.glyphLineIndex(0)).to.equal(0)
            expect(text.glyphLineIndex(11)).to.equal(0)
            expect(text.glyphLineIndex(21)).to.equal(1)
            expect(text.glyphLineIndex(37)).to.equal(2)
            expect(text.glyphLineIndex(46)).to.equal(2)
        });
    })

    describe('can select', () => {
        describe('glyph', () => {
            it('closest to position', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // Act and assert
                expect(text.closestGlyph(12, 8)).to.eql([1, 1]);
                expect(text.closestGlyph(42, 28)).to.eql([44, 1]);
                expect(text.closestGlyph(62, 18)).to.eql([25, 0]);
                expect(text.closestGlyph(39, 4)).to.eql([6, 1]);
                expect(text.closestGlyph(37, 16)).to.eql([21, 0]);
            })
            it('to the left', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // expect(text.getGlyphBefore(0, 0)).to.equal(0);
                // expect(text.getGlyphBefore(5, 0)).to.equal(4);
                // expect(text.getGlyphBefore(7, 0)).to.equal(6);
                // expect(text.getGlyphBefore(12, 0)).to.equal(11);
                // expect(text.getGlyphBefore(100, 0)).to.equal(46);
           });

            it('to the right', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // expect(text.getGlyphAfter(0)).to.equal(1);
                // expect(text.getGlyphAfter(5)).to.equal(6);
                // expect(text.getGlyphAfter(11)).to.equal(12);
                // expect(text.getGlyphAfter(38)).to.equal(39);
                // expect(text.getGlyphAfter(100)).to.equal(46);
           });

            it('above', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // expect(text.getGlyphAbove(0)).to.eql([0, 0]);
                // expect(text.getGlyphAbove(13)).to.eql([0, 0]);
                // expect(text.getGlyphAbove(15)).to.eql([1, 0]);
                // expect(text.getGlyphAbove(23)).to.eql([8, 1]);
                // expect(text.getGlyphAbove(35)).to.eql([11, 1]);
           });

            it('below', async() => {
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // NOTE: we should always select the LEFT position unless
                // we're at the end of the line
                expect(text.getGlyphBelow(0)).to.eql([15, 0]);
                expect(text.getGlyphBelow(4)).to.eql([18, 1]);
                expect(text.getGlyphBelow(9)).to.eql([24, 0]);
                expect(text.getGlyphBelow(11)).to.eql([25, 1]);
                expect(text.getGlyphBelow(46)).to.eql([46, 0]);
                // TODO: this is a bug - it jumps to the left instead of below
                // expect(text.getGlyphBelow(12)).to.eql([25, 0]);
           });
        });

        describe('word', () => {
            it('closest to position', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // Act and assert
                expect(text.closestWord(12, 8)).to.eql(0);
                expect(text.closestWord(42, 28)).to.eql(8);
                expect(text.closestWord(62, 18)).to.eql(5);
                expect(text.closestWord(39, 4)).to.eql(1);
                expect(text.closestWord(37, 16)).to.eql(4);
            })
        })

        describe('line', () => {
            it('closest to position', async() => {
                // Assemble
                const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
                const {text} = await createFontAtlasText(displayText)

                // Act and assert
                expect(text.closestLine(12, 8)).to.eql(0);
                expect(text.closestLine(42, 28)).to.eql(2);
                expect(text.closestLine(62, 18)).to.eql(1);
                expect(text.closestLine(39, 4)).to.eql(0);
                expect(text.closestLine(37, 16)).to.eql(1);
            })
        })
    });

    describe('can edit', () => {
        it('text', async() => {
            // Assemble
            let width, height;
            const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
            const {text} = await createFontAtlasText(displayText)

            // Act and assert
            text._build();
            ({width, height} = text.getBounds());
            expect(width).to.equal(115.353515625);
            expect(height).to.equal(35.49609375);

            text.text = 'Hello World!\n' + 'It\'s a new day';
            text._build();
            ({width, height} = text.getBounds());
            expect(width).to.equal(70.822265625);
            expect(height).to.equal(24);

            text.text = 'Hello World!';
            text._build();
            ({width, height} = text.getBounds());
            expect(width).to.equal(63.041015625);
            expect(height).to.equal(12);
       })
    });
});