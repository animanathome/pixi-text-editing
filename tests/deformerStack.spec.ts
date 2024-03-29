require('./chia/matchesSnapshot');
import {expect} from 'chai';
import {TransformDeformer} from "../src/deformers/base/TransformDeformer";
import {createFontAtlasTextApp, createRectangleApp, extractImageData} from "./utils";
import {VertexTransformDeformer} from "../src/deformers/base/VertexTransformDeformer";
import {TextProgressDeformer} from "../src/deformers/text/TextProgressDeformer";
import {TRANSFORM_DIRECTION, TEXT_TRANSFORM_ENUM} from "../src/deformers/enums";
import {TextTransformDeformer} from "../src/deformers/text/TextTransformDeformer";
import {CenterScaleTransformDeformer} from "../src/deformers/base/CenterScaleTransformDeformer";
import * as PIXI from "pixi.js";
import {buildCurveData, createCurveTexture, getStraightLinePositions} from "../src/curveDeformer";
import {CurveDeformer} from "../src/deformers/base/CurveDeformer";

describe('DeformerStack', () => {
    it('can add deformer', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();

        // Act
        rectangle.deform.addDeformer(new TransformDeformer());
        rectangle.deform.addDeformer(new TransformDeformer());
        app.ticker.update();

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

    describe('supports deformers', () => {
        it('matrix', async function() {
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

            app.ticker.update();

            // Assert
            expect(rectangle.deform.matrixDeformers.length).to.equal(2);
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });

        it('vertex', async function() {
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

            app.ticker.update();

            // Assert
            expect(rectangle.deform.vertexDeformers.length).to.equal(2);
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });

        it('vertex and matrix', async function() {
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

            app.ticker.update();

            // Assert
            expect(rectangle.deform.vertexDeformers.length).to.equal(2);
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });

        it('vertex and uv', async function() {
            // Assemble
            const { app, text } = await createFontAtlasTextApp({
                displayText: 'A\nB',
                width: 64,
                height: 64
            });

            // Act
            const progressDeformer = new TextProgressDeformer();
            text.deform.addDeformer(progressDeformer);
            progressDeformer.transformType = TEXT_TRANSFORM_ENUM.LINE;
            progressDeformer.direction = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
            progressDeformer.progresses = [0.5, 0.5];
            app.ticker.update();

            // Assert
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });

        it('vertex, vertex and uv', async function()  {
            // Assemble
            const { app, text } = await createFontAtlasTextApp({
                displayText: 'A\nCD',
                width: 64,
                height: 64
            });

            // Act
            const progressDeformer = new TextProgressDeformer();
            text.deform.addDeformer(progressDeformer);
            progressDeformer.transformType = TEXT_TRANSFORM_ENUM.LINE;
            progressDeformer.direction = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
            progressDeformer.progresses = [0.5, 0.5];

            const transformDeformer = new TextTransformDeformer();
            text.deform.addDeformer(transformDeformer);
            transformDeformer.transformType = TEXT_TRANSFORM_ENUM.LINE;
            transformDeformer.transforms = [5.0, 0.0, 10.0, 0.0];

            app.ticker.update();

            // Assert
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });

        it('matrix, vertex, vertex', async function() {
            // Assemble
            const { app, text } = await createFontAtlasTextApp({
                displayText: 'HELLO'
            });

            // Act
            const scaleDeformer = new CenterScaleTransformDeformer();
            text.deform.addDeformer(scaleDeformer);
            scaleDeformer.scaleX = 0.75;
            scaleDeformer.scaleY = 0.75;

            const transformDeformer = new TextTransformDeformer();
            text.deform.addDeformer(transformDeformer);
            transformDeformer.transformType = TEXT_TRANSFORM_ENUM.GLYPH;
            transformDeformer.transforms = [
                0.0, 5.0,
                0.0, -5.0,
                0.0, 5.0,
                0.0, -5.0,
                0.0, 5.0
            ];

            const start = new PIXI.Point(-96, 32);
            const end = new PIXI.Point(32, -32);
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
            app.ticker.update();

            // Assert
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });

        it('matrix, vertex and uv', async function() {
            // Assemble
            const { app, text } = await createFontAtlasTextApp({
                displayText: 'A\nCD'
            });

            // Act
            const transformDeformer = new CenterScaleTransformDeformer();
            text.deform.addDeformer(transformDeformer);
            transformDeformer.scaleX = 0.5;
            transformDeformer.scaleY = 0.5;

            const progressDeformer = new TextProgressDeformer();
            text.deform.addDeformer(progressDeformer);
            progressDeformer.transformType = TEXT_TRANSFORM_ENUM.LINE;
            progressDeformer.direction = TRANSFORM_DIRECTION.BOTTOM_TO_TOP;
            progressDeformer.progresses = [0.5, 0.5];
            app.ticker.update();

            // Assert
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });

        it.skip('color', async() => {

        });

        it.skip('uv and color', async() => {

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
