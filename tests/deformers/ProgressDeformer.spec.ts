import {expect} from "chai";
import {createFontAtlasTextApp} from "../utils";
import {TRANSFORM_TYPE} from "../../src/deformers/TextDeformer";
import {ProgressDeformer} from "../../src/deformers/ProgressDeformer";

describe('ProgressDeformer', () => {
   it.only('can add deformer', async() => {
       // Assemble
        const displayText = 'AB';
        const {text, app} = await createFontAtlasTextApp({
            displayText,
            fontSize: 24,
            fontAtlasSize: 24,
            fontAtlasResolution: 256,
        });
        document.body.appendChild(app.view);

        const deformer = new ProgressDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TRANSFORM_TYPE.BOUNDS;
        deformer.progresses = [0.5]

        text.deform.logAssembly();
        app.ticker.update();
   });
});