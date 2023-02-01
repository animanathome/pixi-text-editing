import {createRectangleApp} from "../utils";
import {VertexTransformDeformer} from "../../src/deformers/VertexTransformDeformer";
import {expect} from "chai";

describe.only('VertexTransformDeformer', () => {
   it('can add deformer', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        rectangle.width = 10;
        rectangle.height = 10;

        const vertexDeformer = new VertexTransformDeformer();
        vertexDeformer.offset.x = -10;
        vertexDeformer.offset.y = -10;
        rectangle.deform.addDeformer(vertexDeformer);

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
   });
});