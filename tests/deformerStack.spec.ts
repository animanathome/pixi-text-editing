import { expect } from 'chai';
import {TransformDeformer} from "../src/deformers/TransformDeformer";
import {createRectangleApp} from "./utils";
import {VertexTransformDeformer} from "../src/deformers/VertexTransformDeformer";

describe('DeformerStack', () => {
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

    it('can add deformer at index', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        const tranformDeformer0 = new TransformDeformer();
        const tranformDeformer1 = new TransformDeformer();
        rectangle.deform.addDeformer(tranformDeformer0);

        // Act
        rectangle.deform.addDeformerAtIndex(tranformDeformer1, 0);

        // Assert
        expect(rectangle.deform.deformers[0]).to.eql(tranformDeformer1);
        expect(rectangle.deform.deformers[1]).to.eql(tranformDeformer0);

        // Cleanup
        app.destroy(true, true);
    });

    it('can add multiple deformers of type MATRIX', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        rectangle.width = 10;
        rectangle.height = 10;

        // Act
        const matrixDeformer0 = new TransformDeformer();
        matrixDeformer0.position.x = 50;
        rectangle.deform.addDeformer(matrixDeformer0);

        const matrixDeformer1 = new TransformDeformer();
        rectangle.deform.addDeformer(matrixDeformer1);
        matrixDeformer1.position.y = 10;

        // Assert
        expect(rectangle.deform.matrixDeformers.length).to.equal(2);

        // Cleanup
        app.destroy(true, true);
    });

    it('can add multiple deformers of type VERTEX', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        rectangle.width = 10;
        rectangle.height = 10;

        // Act
        const vertexDeformer0 = new VertexTransformDeformer();
        rectangle.deform.addDeformer(vertexDeformer0);
        vertexDeformer0.offset.x = 10;

        const vertexDeformer1 = new VertexTransformDeformer();
        rectangle.deform.addDeformer(vertexDeformer1);
        vertexDeformer1.offset.y = 10;

        // Assert
        expect(rectangle.deform.vertexDeformers.length).to.equal(2);

        // Cleanup
        app.destroy(true, true);
    });

    it('can add multiple deformers of type VERTEX and MATRIX', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        rectangle.width = 10;
        rectangle.height = 10;

        // Act
        const vertexDeformer0 = new VertexTransformDeformer();
        rectangle.deform.addDeformer(vertexDeformer0);
        vertexDeformer0.offset.x = 10;

        const matrixDeformer1 = new TransformDeformer();
        rectangle.deform.addDeformer(matrixDeformer1);
        matrixDeformer1.position.y = 10;

        const vertexDeformer2 = new VertexTransformDeformer();
        rectangle.deform.addDeformer(vertexDeformer2);
        vertexDeformer2.offset.y = 10;

        const matrixDeformer3 = new TransformDeformer();
        rectangle.deform.addDeformer(matrixDeformer3);
        matrixDeformer3.position.x = 10;

        // Assert
        expect(rectangle.deform.vertexDeformers.length).to.equal(2);

        // Cleanup
        app.destroy(true, true);
    });

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

    it('can move deformer to index', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        const tranformDeformer0 = new TransformDeformer();
        const tranformDeformer1 = new TransformDeformer();
        rectangle.deform.addDeformer(tranformDeformer0);
        rectangle.deform.addDeformer(tranformDeformer1);

        // Act
        rectangle.deform.moveDeformerToIndex(tranformDeformer0, 1);

        // Assert
        expect(rectangle.deform.deformers[0]).to.eql(tranformDeformer1);
        expect(rectangle.deform.deformers[1]).to.eql(tranformDeformer0);

        // Cleanup
        app.destroy(true, true);
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
