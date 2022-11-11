import { expect } from 'chai';
import * as THREE from 'three';

import {buildCurveData} from "../src/curveDeformer";
import {CurveData} from "../src/curveData";

describe('curveData', () => {
    it('from curve', () => {
        // Assemble
        const points = [
            new THREE.Vector3( 0, 0, 0),
            new THREE.Vector3( 50, 0, 0),
            new THREE.Vector3( 100, 0, 0),
        ]

        // Act
        const curveData = CurveData.fromCurve(points, 2, false);

        // Assert
        expect(curveData.positions.length).to.equal(3);
        expect(curveData.tangents.length).to.equal(3);
        expect(curveData.normals.length).to.equal(3);
    })

    it('can get closest index', () => {
        // Assemble
        const points = [
            new THREE.Vector3( 0, 0, 0),
            new THREE.Vector3( 50, 0, 0),
            new THREE.Vector3( 100, 0, 0),
        ]
        const {positions, tangents, normals, length} = buildCurveData(points, 2, false);
        const curveData = new CurveData(positions, tangents, normals);

        // Assert
        expect(curveData.closestPositionIndex(0, 0)).to.equal(0);
        expect(curveData.closestPositionIndex(50, 0)).to.equal(1);
        expect(curveData.closestPositionIndex(100, 0)).to.equal(2);
    });

    it('can build matrix', () => {
        // Assemble
        const points = [
            new THREE.Vector3( 0, 0, 0),
            new THREE.Vector3( 50, 0, 0),
            new THREE.Vector3( 100, 0, 0),
        ]
        const {positions, tangents, normals, length} = buildCurveData(points, 2, false);
        const curveData = new CurveData(positions, tangents, normals);

        // Assert
        const identity = new THREE.Matrix4();
        expect(identity.equals(curveData.getMatrix(0))).to.be.true;
    })

    it('can invert position', () => {
        // Assemble
        const points = [
            new THREE.Vector3( 0, 10, 0),
            new THREE.Vector3( 50, 10, 0),
            new THREE.Vector3( 100, 10, 0),
        ]
        const {positions, tangents, normals, length} = buildCurveData(points, 2, false);
        const curveData = new CurveData(positions, tangents, normals);

        // Assert
        expect(curveData.invertPosition(0, 10).x).to.equal(0);
        expect(curveData.invertPosition(0, 10).y).to.equal(0);
    })
})