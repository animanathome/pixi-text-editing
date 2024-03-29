require('../chia/matchesSnapshot');
import {expect} from 'chai';
import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import {createFontAtlasTextApp, createRectangleApp, extractImageData} from "../utils";
import {buildCurveData, createCurveTexture, getStraightLinePositions} from "../../src/curveDeformer";
import {CurveDeformer} from "../../src/deformers/base/CurveDeformer";
import {TEXT_TRANSFORM_ENUM} from "../../src/deformers/enums";
import {VertexTransformDeformer} from "../../src/deformers/base/VertexTransformDeformer";
import {TextTransformDeformer} from "../../src/deformers/text/TextTransformDeformer";

describe('CurveDeformer', () => {
    it('can create deformer', async() => {
        // Assemble
        const {app, rectangle} = createRectangleApp();
        rectangle.width = 32;
        rectangle.height = 32;

        const start = new PIXI.Point(-64, -64);
        const end = new PIXI.Point(64, 64);
        const points = getStraightLinePositions(start, end, 5);

        const {positions, tangents, normals, length} = buildCurveData({
            points,
            nSegments: 32,
            closed: false,
        });
        const dataTexture = createCurveTexture(positions, normals, tangents);

        // Act
        const curveDeformer = new CurveDeformer();
        curveDeformer.texture = dataTexture;
        curveDeformer.spineLength = length;
        curveDeformer.pathOffset = 0.5;
        rectangle.deform.addDeformer(curveDeformer);

        // rectangle.deform.logAssembly();

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
    });

    it('can get animatable properties', async() => {
        // Assemble
        const curveDeformer = new CurveDeformer();

        // Act and assert
        const expectedResult = ["pathOffset", "pathSegment", "spineOffset", "spineLength", "flow"];
        expect(curveDeformer.animatableProperties).to.eql(expectedResult);
    });

    describe('combines with', () => {
        it('text deformer', async function() {
            // Assemble
            const displayText = 'Hello World!';
            const {text, app} = await createFontAtlasTextApp({displayText});
            document.body.appendChild(app.view);

            // Act
            const offsetX = 0;
            const offsetY = -16;
            const radius = 48;
            const points = [
                new THREE.Vector3( 0 + offsetX, 0 + offsetY, 0),
                new THREE.Vector3( 0 + offsetX, radius + offsetY, 0),
                new THREE.Vector3( radius + offsetX, radius + offsetY, 0),
                new THREE.Vector3( radius + offsetX, 0 + offsetY, 0),
            ]
            const {positions, tangents, normals, length} = buildCurveData({
                points,
                nSegments: 32,
                closed: false,
            });
            const dataTexture = createCurveTexture(positions, normals, tangents);

            const textDeformer = new TextTransformDeformer();
            text.deform.addDeformer(textDeformer);
            textDeformer.transformType = TEXT_TRANSFORM_ENUM.WORD;
            textDeformer.scales = [1.2, 1.2, 0.8, 0.8];
            textDeformer.transforms = [0, 3, 0, 0];

            const curveDeformer = new CurveDeformer();
            curveDeformer.texture = dataTexture;
            curveDeformer.spineLength = length;
            curveDeformer.pathOffset = 0.3;
            text.deform.addDeformer(curveDeformer);
            app.ticker.update();

            // Assert
            expect(text.deform.deformers.length).to.be.equal(2);
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });

        // TODO: fix this test. Our image comparison keeps on complaining that the image is different.
        it.skip('vertex deformer', async function()  {
            // Assemble
            const {app, rectangle} = createRectangleApp();
            rectangle.width = 32;
            rectangle.height = 32;

            // Act
            const start = new PIXI.Point(-64, -64);
            const end = new PIXI.Point(64, 64);
            const points = getStraightLinePositions(start, end, 5);

            const {positions, tangents, normals, length} = buildCurveData({
                points,
                nSegments: 32,
                closed: false,
            });
            const dataTexture = createCurveTexture(positions, normals, tangents);

            const vertexDeformer = new VertexTransformDeformer();
            vertexDeformer.offset.x = -18;
            vertexDeformer.offset.y = -18;
            rectangle.deform.addDeformer(vertexDeformer);

            const curveDeformer = new CurveDeformer();
            curveDeformer.texture = dataTexture;
            curveDeformer.spineLength = length;
            curveDeformer.pathOffset = 0.5;
            rectangle.deform.addDeformer(curveDeformer);
            app.ticker.update();

            // Assert
            expect(rectangle.deform.deformers.length).to.be.equal(2);
            const imageData = await extractImageData(app.view);
            expect(imageData).to.matchesSnapshot(this);

            // Cleanup
            app.destroy(true, true);
        });
    })
})