import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import { expect } from 'chai';
import {LOCALHOST} from "./utils";

describe('fontAtlas', () => {
    it('can render latin glyphs', async() => {
        // Arrange
        const fontLoader = new FontLoader();
        const url = LOCALHOST + 'Montserrat-Regular.ttf';
        fontLoader.sourceUrl = url;
        await fontLoader.load();

        // Act
        const atlas = new FontAtlas({
            font: fontLoader.font,
            resolution: 64,
            fontSize: 12,
        })
        // render and store glyph data for each character in the following string
        atlas.addGlyphsForString('abcd');
        atlas.addGlyphsForString('cdef');

        // Assert
        expect(atlas.texture.length).to.not.equal(0);
        expect(atlas._cachedIds()).to.eql([ 'a', 'b', 'c', 'd', 'e', 'f' ]);
        // we can parent the canvas to the document for viewing like: document.body.appendChild(atlas.canvas)
        document.body.appendChild(atlas.canvas);
        const pixels = atlas.context.getImageData(0, 0, atlas.canvas.width, atlas.canvas.height);
        expect(pixels.data.reduce((a, b) => a + b)).to.equal(26635);
    });
})