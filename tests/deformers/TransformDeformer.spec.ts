import {createRectangleApp} from "../utils";
import {TransformDeformer} from "../../src/deformers/TransformDeformer";
import {expect} from "chai";

describe('TransformDeformer', () => {
   it('can add deformer', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();

        const transformDeformer = new TransformDeformer();
        rectangle.deform.addDeformer(transformDeformer);

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
   });
});