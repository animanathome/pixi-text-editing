require('../../chia/matchesSnapshot');
import {createFontAtlasTextApp, extractImageData} from "../../utils";

import { expect } from 'chai';
import {TEXT_TRANSFORM_ENUM} from "../../../src/deformers/enums";
import {TextColorDeformer} from "../../../src/deformers/text/TextColorDeformer";

describe('TextColorDeformer', () => {
    it('passes properties as uniforms to shader', async function() {
        // Assemble
        const displayText = 'AB WA KE';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);

        // Act
        const deformer = new TextColorDeformer();
        text.deform.addDeformer(deformer);
        deformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
        text.color = [0.0, 0.0, 0.0, 0.0];
        deformer.colorIndices = [0, 1, 2];
        app.ticker.update();

        // Assert
        const imageData = await extractImageData(app.view);
        expect(imageData).to.matchesSnapshot(this);

        // Cleanup
        app.destroy(true, true);
    });
})