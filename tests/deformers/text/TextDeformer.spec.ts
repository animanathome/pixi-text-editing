require('../../chia/matchesSnapshot');
import {expect} from "chai";
import {createFontAtlasTextApp, extractImageData} from "../../utils";
import {TEXT_TRANSFORM_ENUM} from "../../../src/deformers/enums";
import {TextOpacityDeformer} from "../../../src/deformers/text/TextOpacityDeformer";
import {TextProgressDeformer} from "../../../src/deformers/text/TextProgressDeformer";

describe('TextDeformer', () => {
   it('supports multiple transform types', async function()  {
        // Assemble
        const displayText = 'AB\nWA';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);

        // Act
        const opacityDeformer = new TextOpacityDeformer();
        text.deform.addDeformer(opacityDeformer);
        opacityDeformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
        opacityDeformer.opacities = [0.25, 1.0];

        const progressDeformer = new TextProgressDeformer();
        text.deform.addDeformer(progressDeformer);
        progressDeformer.transformType = TEXT_TRANSFORM_ENUM.LINE;
        progressDeformer.progresses = [0.5, 1.0];

        app.ticker.update();

        // Assert
        const imageData = await extractImageData(app.view);
        expect(imageData).to.matchesSnapshot(this);

        // Cleanup
        app.destroy(true, true);
   });
});