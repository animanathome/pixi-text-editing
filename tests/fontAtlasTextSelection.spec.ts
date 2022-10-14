import { expect } from 'chai';
import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import {FontAtlasText} from "../src/fontAtlasText";
import {FontAtlasTextSelection} from "../src/fontAtlasTextSelection";

const createFontAtlasText = async(displayText) => {
    const fontLoader = new FontLoader();
    const url = 'http://localhost:8000/resources/MontserratBold.ttf'
    fontLoader.sourceUrl = url;
    await fontLoader.load();

    const atlas = new FontAtlas({
        font: fontLoader.font,
        resolution: 128,
        fontSize: 12,
    })

    const text = new FontAtlasText();
    text.atlas = atlas;
    text.maxHeight = 128;
    text.maxWidth = 128;
    text.text = displayText;
    text._build();

    return {
        fontLoader,
        atlas,
        text,
    }
}

describe('fontAtlasTextSelection', () => {
    it('can get glyph left to glyph', async() => {
        const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
        const {text} = await createFontAtlasText(displayText);
        const selection = new FontAtlasTextSelection(text);

        expect(selection.getGlyphBefore(0)).to.equal(0);
        expect(selection.getGlyphBefore(5)).to.equal(4);
        expect(selection.getGlyphBefore(6)).to.equal(5);
        expect(selection.getGlyphBefore(7)).to.equal(6);
        expect(selection.getGlyphBefore(13)).to.equal(11);
        expect(selection.getGlyphBefore(12)).to.equal(11);
        expect(selection.getGlyphBefore(11)).to.equal(10);
        expect(selection.getGlyphBefore(100)).to.equal(46);
    });

    it('can get glyph right to glyph', async() => {
        const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
        const {text} = await createFontAtlasText(displayText);
        const selection = new FontAtlasTextSelection(text);

        expect(selection.getGlyphAfter(0)).to.equal(1);
        expect(selection.getGlyphAfter(5)).to.equal(6);
        expect(selection.getGlyphAfter(11)).to.equal(12);
        expect(selection.getGlyphAfter(38)).to.equal(38);
        expect(selection.getGlyphAfter(100)).to.equal(38);
    });

    it('can get glyph above glyph', async() => {
        const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
        const {text} = await createFontAtlasText(displayText);
        const selection = new FontAtlasTextSelection(text);

        expect(selection.getGlyphAbove(0)).to.equal(0);
        expect(selection.getGlyphAbove(8)).to.equal(8);
        expect(selection.getGlyphAbove(11)).to.equal(0);
        expect(selection.getGlyphAbove(24)).to.equal(10);
        expect(selection.getGlyphAbove(25)).to.equal(11);
        expect(selection.getGlyphAbove(38)).to.equal(23);
    });

    it('can get glyph below glyph', async() => {
        // Assemble
        const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
        const {text} = await createFontAtlasText(displayText);
        const selection = new FontAtlasTextSelection(text);

        // Act and assert
        expect(selection.getGlyphBelow(0)).to.equal(13);
        expect(selection.getGlyphBelow(10)).to.equal(20);
        expect(selection.getGlyphBelow(11)).to.equal(25);
        expect(selection.getGlyphBelow(24)).to.equal(38);
    });

    it('can get character at position', async() => {
        const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
        const {text} = await createFontAtlasText(displayText);
        const selection = new FontAtlasTextSelection(text);

        // Act and Assert
        const closestGlyph = selection.getClosestGlyph(0, 0);
        expect(closestGlyph).to.equal(0);
    });

    it('can get word at position', async() => {
        const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
        const {text} = await createFontAtlasText(displayText);
        const selection = new FontAtlasTextSelection(text);

        expect(selection.getClosestWord(0, 0)).to.equal(0);
        expect(selection.getClosestWord(50, 0)).to.equal(1);
        expect(selection.getClosestWord(0, 20)).to.equal(2);
    });

    it('can get line at position', async() => {
        const displayText = 'Hello World!\n' + 'It\'s a new day for text rendering.';
        const {text} = await createFontAtlasText(displayText);
        const selection = new FontAtlasTextSelection(text);

        expect(selection.getClosestLine(0, 0)).to.equal(0);
        expect(selection.getClosestLine(0, 20)).to.equal(1);
        expect(selection.getClosestLine(0, 40)).to.equal(2);
    });

    it('can get all text at position', async () => {
        const displayText = 'so me\nmo re'
        const {text} = await createFontAtlasText(displayText);
        const selection = new FontAtlasTextSelection(text);
    });
});