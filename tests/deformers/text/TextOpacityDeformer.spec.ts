import {createFontAtlasTextApp} from "../../utils";

import { expect } from 'chai';
import {TextOpacityDeformer} from "../../../src/deformers/text/TextOpacityDeformer";
import {TEXT_TRANSFORM_ENUM} from "../../../src/deformers/enums";

describe.skip('TextOpacityDeformer', () => {
    it('passes properties as uniforms to shader', async() => {
        // Assemble
        const displayText = 'AB WA';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);

        const deformer = new TextOpacityDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;

        // Act
        deformer.opacities = [0.25, 0.75];
        // text.deform.logAssembly();
        app.ticker.update();

        // Assert
        expect(text.shader.uniforms.uOpacities).to.deep.equal([0.25, .75]);
        expect(deformer.weights).to.deep.equal([0, 0, 0, 0, 1, 1, 1, 1]);

        // Cleanup
        app.destroy(true, true);
    });
})