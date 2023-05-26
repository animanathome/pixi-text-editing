import {createFontAtlasTextApp} from "../../utils";

import { expect } from 'chai';
import {TextOpacityDeformer} from "../../../src/deformers/text/TextOpacityDeformer";
import {TEXT_TRANSFORM_ENUM} from "../../../src/deformers/enums";
import {TextColorDeformer} from "../../../src/deformers/text/TextColorDeformer";

describe('TextColorDeformer', () => {
    it('passes properties as uniforms to shader', async() => {
        // Assemble
        const displayText = 'AB WA KE';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);

        // TODO: addDeformerOfType ... or something like that
        const deformer = new TextColorDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
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