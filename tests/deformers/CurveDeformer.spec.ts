import { expect } from 'chai';
import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import {createRectangleApp} from "../utils";
import {CurveDeformer} from "../../src/deformers/CurveDeformer";
import {buildCurveData, createCurveTexture, getStraightLinePositions} from "../../src/curveDeformer";

describe('CurveDeformer', () => {
    it.only('can add deformer', async() => {
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

        // Assert
        expect(rectangle.deform.deformers.length).to.be.equal(1);

        // Cleanup
        app.destroy(true, true);
    });
})