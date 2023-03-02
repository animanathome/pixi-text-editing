import { expect } from 'chai';
import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import {createFontAtlasTextApp, createRectangleApp} from "../utils";
import {CurveDeformer} from "../../src/deformers/CurveDeformer";
import {buildCurveData, createCurveTexture, getStraightLinePositions} from "../../src/curveDeformer";
import {VertexTransformDeformer} from "../../src/deformers/VertexTransformDeformer";
import {TextTransformDeformer, TRANSFORM_TYPE} from "../../src/deformers/text/TextDeformer";

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

        rectangle.deform.logAssembly();

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
    });

    describe('can be combined with', () => {
        it('text deformer', async() => {
            // Assemble
            const displayText = 'Hello World!';
            const {text, app} = await createFontAtlasTextApp({displayText});
            document.body.appendChild(app.view);

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
            textDeformer.transformType = TRANSFORM_TYPE.WORD;
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

            // Cleanup
            app.destroy(true, true);
        });

        it('vertex deformer', async() => {
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

            // Cleanup
            app.destroy(true, true);
        });
    })
})