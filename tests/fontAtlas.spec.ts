import {FontLoader} from "../src/fontLoader";
import {FontAtlas} from "../src/fontAtlas";
import chai, { expect } from 'chai';
// @ts-ignore
import chaiSnapshot from '../chia/mocha-chai-snapshot'
chai.use(chaiSnapshot);
import {extractImageData, LOCALHOST} from "./utils";


describe('fontAtlas', function() {
    it('can render latin glyphs', async function(){
        // Arrange
        const fontLoader = new FontLoader();
        const url = LOCALHOST + 'Montserrat-Regular.ttf';
        fontLoader.sourceUrl = url;
        await fontLoader.load();

        // Act
        const atlas = new FontAtlas({
            fontLoader: fontLoader.font,
            resolution: 64,
            fontSize: 12,
        })
        // render and store glyph data for each character in the following string
        atlas.addGlyphsForString('abcd');
        atlas.addGlyphsForString('cdef');

        // Assert
        const imageData = await extractImageData(atlas.canvas);
        expect(imageData).to.matchesSnapshot(this);
    });

    it('runs the next test', () => {
        expect(true).to.be.true;
    })
})