import {expect} from 'chai';
import {TransformDeformer} from "../src/deformers/TransformDeformer";
import {createFontAtlasTextApp, createRectangleApp} from "./utils";
import {VertexTransformDeformer} from "../src/deformers/VertexTransformDeformer";
import {TextProgressDeformer, TRANSFORM_DIRECTION} from "../src/deformers/text/TextProgressDeformer";
import {TRANSFORM_TYPE} from "../src/deformers/text/TextDeformer";
import {Renderer} from "pixi.js";
import {TextTransformDeformer} from "../src/deformers/text/TextTransformDeformer";
import {CenterScaleTransformDeformer} from "../src/deformers/CenterScaleTransformDeformer";
import * as PIXI from "pixi.js";
import {buildCurveData, createCurveTexture, getStraightLinePositions} from "../src/curveDeformer";
import {CurveDeformer} from "../src/deformers/CurveDeformer";

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

    describe.only('can mix multiple deformers of type', () => {
        it('MATRIX', async() => {
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

        it('VERTEX', async() => {
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

        it('VERTEX and MATRIX', async() => {
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
            // rectangle.deform.logAssembly();

            // this should not error
            // TODO: figure out how to catch the error
            rectangle._render(app.renderer as Renderer);

            // Cleanup
            app.destroy(true, true);
        });

        it('VERTEX AND UV', async() => {
            const { app, text } = await createFontAtlasTextApp({
                displayText: 'A\nB'
            });
            const progressDeformer = new TextProgressDeformer();
            text.deform.addDeformer(progressDeformer);
            progressDeformer.transformType = TRANSFORM_TYPE.LINE;
            progressDeformer.direction = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
            progressDeformer.progresses = [0.5, 0.5];

            text.deform.logAssembly();

            // text._render(app.renderer as Renderer);
            app.ticker.update();

            app.destroy(true, true);
        });

        it('VERTEX, VERTEX and UV', async() => {
            const { app, text } = await createFontAtlasTextApp({
                displayText: 'A\nCD'
            });
            const progressDeformer = new TextProgressDeformer();
            text.deform.addDeformer(progressDeformer);
            progressDeformer.transformType = TRANSFORM_TYPE.LINE;
            progressDeformer.direction = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
            progressDeformer.progresses = [0.5, 0.5];

            // TODO:
            //  currently we only support one transform type per shader/object
            //  currently we create one shader per geometry, we should figure out
            //  how we can reuse them
            const transformDeformer = new TextTransformDeformer();
            text.deform.addDeformer(transformDeformer);
            transformDeformer.transformType = TRANSFORM_TYPE.LINE;
            transformDeformer.transforms = [5.0, 0.0, 10.0, 0.0];

            text.deform.logAssembly();
            app.ticker.update();

            app.destroy(true, true);
        });

        it('MATRIX, VERTEX, VERTEX', async() => {
            const { app, text } = await createFontAtlasTextApp({
                displayText: 'HELLO'
            });

            const scaleDeformer = new CenterScaleTransformDeformer();
            text.deform.addDeformer(scaleDeformer);
            scaleDeformer.scaleX = 0.75;
            scaleDeformer.scaleY = 0.75;

            // vertex deformer
            const transformDeformer = new TextTransformDeformer();
            text.deform.addDeformer(transformDeformer);
            transformDeformer.transformType = TRANSFORM_TYPE.GLYPH;
            transformDeformer.transforms = [
                0.0, 5.0,
                0.0, -5.0,
                0.0, 5.0,
                0.0, -5.0,
                0.0, 5.0
            ];

            // vertex deformer
            const start = new PIXI.Point(-128, 32);
            const end = new PIXI.Point(128, -32);
            const points = getStraightLinePositions(start, end, 5);

            const {positions, tangents, normals, length} = buildCurveData({
                points,
                nSegments: 32,
                closed: false,
                normalOverride: new PIXI.Point(0, 1),
            });
            const dataTexture = createCurveTexture(positions, normals, tangents);

            const textCurveDeformer = new CurveDeformer();
            textCurveDeformer.texture = dataTexture;
            textCurveDeformer.spineLength = length;
            textCurveDeformer.pathOffset = 0.5;
            text.deform.addDeformer(textCurveDeformer);

            text.deform.logAssembly();
            app.ticker.update();

            app.destroy(true, true);
        });

        it('MATRIX, VERTEX and UV', async() => {
            const { app, text } = await createFontAtlasTextApp({
                displayText: 'A\nCD'
            });
            const transformDeformer = new CenterScaleTransformDeformer();
            text.deform.addDeformer(transformDeformer);
            transformDeformer.scaleX = 0.5;
            transformDeformer.scaleY = 0.5;

            const progressDeformer = new TextProgressDeformer();
            text.deform.addDeformer(progressDeformer);
            progressDeformer.transformType = TRANSFORM_TYPE.LINE;
            progressDeformer.direction = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
            progressDeformer.progresses = [0.5, 0.5];

            text.deform.logAssembly();
            app.ticker.update();

            app.destroy(true, true);
        });

        it.skip('COLOR', async() => {

        });

        it.skip('UV and COLOR', async() => {

        });
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
