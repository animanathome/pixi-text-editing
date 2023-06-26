require('../../chia/matchesSnapshot');
import {expect} from "chai";
import {createFontAtlasTextApp, extractImageData} from "../../utils";
import {TEXT_TRANSFORM_ENUM, TRANSFORM_DIRECTION} from "../../../src/deformers/enums";
import {TextProgressDeformer} from "../../../src/deformers/text/TextProgressDeformer";

describe('TextProgressDeformer', () => {
   it('from bottom to top', async function() {
       // Assemble
       // TODO: fix me for lower case text. We seem to have an incorrect Y-offset
        const displayText = 'ABC';
        const {text, app} = await createFontAtlasTextApp({
            displayText,
            fontSize: 24,
            fontAtlasSize: 24,
            fontAtlasResolution: 256,
        });
        document.body.appendChild(app.view);

        // Act
        const deformer = new TextProgressDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.GLYPH;
        deformer.direction = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
        deformer.progresses = [0.5, 0.75, 1.0];
        app.ticker.update();

        // Assert
        const imageData = await extractImageData(app.view);
        expect(imageData).to.matchesSnapshot(this);

        // Cleanup
        app.destroy(true, true);
   });

   it('from top to bottom', async function() {
       // Assemble
        const displayText = 'abg';
        const {text, app} = await createFontAtlasTextApp({
            displayText,
            fontSize: 24,
            fontAtlasSize: 24,
            fontAtlasResolution: 256,
        });
        document.body.appendChild(app.view);

        // Act
        const deformer = new TextProgressDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.GLYPH;
        deformer.direction = TRANSFORM_DIRECTION.TOP_TO_BOTTOM;
        deformer.progresses = [0.5, 0.75, 1.0];
        app.ticker.update();

        // Assert
        const imageData = await extractImageData(app.view);
        expect(imageData).to.matchesSnapshot(this);

        // Cleanup
        app.destroy(true, true);
   });
});