import {createFontAtlasTextApp} from "../../utils";
import {TextOpacityDeformer} from "../../../src/deformers/text/TextOpacityDeformer";
import {TRANSFORM_TYPE} from "../../../src/deformers/text/TextDeformer";
import {TextProgressDeformer} from "../../../src/deformers/text/TextProgressDeformer";

describe('TextDeformer', () => {
   it('shader can mix multiple transform types', async() => {
        // Assemble
        const displayText = 'AB\nWA';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);

        const opacityDeformer = new TextOpacityDeformer();
        text.deform.addDeformer(opacityDeformer);
        opacityDeformer.transformType = TRANSFORM_TYPE.WORD;
        opacityDeformer.opacities = [0.25, 1.0];

        const progressDeformer = new TextProgressDeformer();
        text.deform.addDeformer(progressDeformer);
        progressDeformer.transformType = TRANSFORM_TYPE.LINE;
        progressDeformer.progresses = [0.5, 1.0];

        app.ticker.update();
        text.deform.logAssembly();
   });
});