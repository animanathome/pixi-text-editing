import {FONT_STATUS, FontLoader} from "../src/fontLoader";
import { expect } from 'chai';
describe('fontLoader', () => {
    it('can load font', async() => {
        const fontLoader = new FontLoader();
        const url = 'http://localhost:8000/resources/MontserratBold.ttf'
        fontLoader.sourceUrl = url;
        await fontLoader.load();
        expect(fontLoader.status).to.equal(FONT_STATUS.LOADED)
    });
})