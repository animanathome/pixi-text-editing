import { expect } from 'chai';
import {TransformDeformer} from "../src/deformers/TransformDeformer";
import {createRectangleApp} from "./utils";

describe('deformerStack', () => {
    it('can add deformer', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();

        // Act
        rectangle.deform.addDeformer(new TransformDeformer());
        rectangle.deform.addDeformer(new TransformDeformer());

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(2);

        // Cleanup
        app.destroy(true, true);
    });

    it.skip("can add deformer of type VERTEX", async() => {

    })

    it.skip("can add deformer of type MATRIX", async() => {

    })

    it('can remove deformer', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        rectangle.deform.addDeformer(new TransformDeformer());
        rectangle.deform.addDeformer(new TransformDeformer());

        // Act
        const deformer = rectangle.deform.deformers[0];
        rectangle.deform.removeDeformer(deformer);

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
    });

    it.skip('can move deformer up in stack', async() => {

    })

    it.skip('can move deformer down in stack', async() => {

    })

    it('can remove all deformers', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        rectangle.deform.addDeformer(new TransformDeformer());
        rectangle.deform.addDeformer(new TransformDeformer());

        // Act
        rectangle.deform.removeAllDeformers();

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(0);

        // Cleanup
        app.destroy(true, true);
    });
})
