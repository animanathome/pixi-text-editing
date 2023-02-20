import { expect } from 'chai';
import * as PIXI from 'pixi.js';
import {createFontAtlasTextApp, createRectangleApp} from "../utils";
import {CurveDeformer} from "../../src/deformers/CurveDeformer";
import {buildCurveData, createCurveTexture, getStraightLinePositions} from "../../src/curveDeformer";
import {VertexTransformDeformer} from "../../src/deformers/VertexTransformDeformer";
import {TextDeformer, TRANSFORM_TYPE} from "../../src/deformers/TextDeformer";

describe.only('CurveDeformer', () => {
    it('can add deformer', async() => {
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

        rectangle.deform.printAssembly();

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
    });

    it.only('can be combined with text deformer', async() => {
        // Assemble
        const displayText = 'Hello World!';
        const {text, app} = await createFontAtlasTextApp({displayText});
        document.body.appendChild(app.view);

        const start = new PIXI.Point(-64, -64);
        const end = new PIXI.Point(64, 64);
        const points = getStraightLinePositions(start, end, 5);

        const {positions, tangents, normals, length} = buildCurveData({
            points,
            nSegments: 32,
            closed: false,
        });
        const dataTexture = createCurveTexture(positions, normals, tangents);

        const curveDeformer = new CurveDeformer();
        curveDeformer.texture = dataTexture;
        curveDeformer.spineLength = length;
        curveDeformer.pathOffset = 0.5;
        text.deform.addDeformer(curveDeformer);

        const textDeformer = new TextDeformer();
        text.deform.addDeformer(textDeformer);
        textDeformer.transformType = TRANSFORM_TYPE.WORD;
        textDeformer.scales = [1.2, 1.2, 0.8, 0.8];
        textDeformer.transforms = [0, 3, 0, 0];

        text.deform.printAssembly()

        app.ticker.update();
    });

    it('can be combined with vertex deformer', async() => {
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