import {expect} from "chai";
import {createFontAtlasTextApp} from "../utils";
import {TRANSFORM_TYPE} from "../../src/deformers/TextDeformer";
import {ProgressDeformer, TRANSFORM_DIRECTION} from "../../src/deformers/ProgressDeformer";

describe('ProgressDeformer', () => {
   it.only('can add deformer', async() => {
       // Assemble
        const displayText = 'ABC';
        const {text, app} = await createFontAtlasTextApp({
            displayText,
            fontSize: 24,
            fontAtlasSize: 24,
            fontAtlasResolution: 256,
        });
        document.body.appendChild(app.view);

        const deformer = new ProgressDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TRANSFORM_TYPE.GLYPH;
        // deformer.direction = TRANSFORM_DIRECTION.TOP_TO_BOTTOM;
       deformer.direction = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
        deformer.progresses = [0.5, 0.75, 1.0];

        text.deform.logAssembly();
        app.ticker.update();
   });
});