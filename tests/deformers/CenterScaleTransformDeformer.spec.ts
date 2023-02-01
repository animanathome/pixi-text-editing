import { expect } from 'chai';
import {createRectangleApp} from "../utils";
import {CenterScaleTransformDeformer} from "../../src/deformers/CenterScaleTransformDeformer";

describe.only('CenterScaleTransformDeformer', () => {
    it('can add deformer', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();

        // Act
        const scaleDeformer = new CenterScaleTransformDeformer();
        scaleDeformer.scaleAnchorX = 32;
        scaleDeformer.scaleAnchorY = 32;
        scaleDeformer.scaleX = 0.5;
        scaleDeformer.scaleY = 0.5;
        rectangle.deform.addDeformer(scaleDeformer);

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
    });
})