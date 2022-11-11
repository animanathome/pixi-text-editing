import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import { expect } from 'chai';
import {LOCALHOST} from "./utils";

describe('fontAtlas', () => {
    it('can render latin text', async() => {
        // Arrange
        const fontLoader = new FontLoader();
        const url = LOCALHOST + 'Montserrat-Bold.ttf';
        fontLoader.sourceUrl = url;
        await fontLoader.load();

        // Act
        const atlas = new FontAtlas({
            font: fontLoader.font,
            resolution: 48,
            fontSize: 12,
        })
        atlas.addGlyphsForString('abcd');
        atlas.addGlyphsForString('cdef');

        // Assert
        const pixels = atlas.context.getImageData(0, 0, atlas.canvas.width, atlas.canvas.height);
        expect(pixels.data.reduce((a, b) => a + b)).to.equal(42862);
        expect(atlas.texture.length).to.not.equal(0);
        expect(atlas._cachedIds()).to.eql([ 'a', 'b', 'c', 'd', 'e', 'f' ]);
    });
})