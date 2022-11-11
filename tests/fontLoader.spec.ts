import {FONT_STATUS, FontLoader} from "../src/fontLoader";
import { expect } from 'chai';
import {LOCALHOST} from "./utils";
describe('fontLoader', () => {
    it('can load font', async() => {
        const fontLoader = new FontLoader();
        const url = LOCALHOST + 'Montserrat-Bold.ttf';
        fontLoader.sourceUrl = url;
        await fontLoader.load();
        expect(fontLoader.status).to.equal(FONT_STATUS.LOADED)
    });
})