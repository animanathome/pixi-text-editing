import {createFontAtlasTextApp} from "../../utils";

import { expect } from 'chai';
import {TextOpacityDeformer} from "../../../src/deformers/text/TextOpacityDeformer";
import {TRANSFORM_TYPE} from "../../../src/deformers/text/TextDeformer";
import {TextColorDeformer} from "../../../src/deformers/text/TextColorDeformer";

describe('TextColorDeformer', () => {
    it.only('passes properties as uniforms to shader', async() => {
        // Assemble
        const displayText = 'AB WA KE';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);

        const deformer = new TextColorDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TRANSFORM_TYPE.WORD;
        text.color = [0.0, 0.0, 0.0, 0.0];
        deformer.colorIndices = [0, 1, 2];


        text.deform.logAssembly();
        console.log('render');
        app.ticker.update();

        // TODO: extend animation so we can match the requirement for fancy captions

        // Assert
        // expect(text.shader.uniforms.uOpacities).to.deep.equal([0.25, .75]);
        // expect(deformer.weights).to.deep.equal([0, 0, 0, 0, 1, 1, 1, 1]);

        // Cleanup
        // app.destroy(true, true);
    });
})