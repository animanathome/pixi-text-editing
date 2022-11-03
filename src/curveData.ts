import * as THREE from 'three';
import {dist} from "./utils";

export class CurveData {
    _positions = undefined;
    _tangents = undefined;
    _normals = undefined;
    constructor(positions, tangents, normals) {
        this._positions = positions;
        this._tangents = tangents;
        this._normals = normals;
    }

    getMatrix(index) {
        const rot = new THREE.Matrix3()
        const elements = [
            this._tangents[index].x, this._normals[index].x, 0,
            this._tangents[index].y, this._normals[index].y, 0,
            0, 0, 1
        ]
        rot.set(...elements)

        const pos = new THREE.Vector3()
        pos.set(this._positions[index].x, this._positions[index].y, 0);

        const mat = new THREE.Matrix4()
        mat.setFromMatrix3(rot);
        mat.setPosition(pos);

        return mat;
    }

    closestPositionIndex(x : number, y : number) {
        let closestIndex = 0;
        let closestDistance = Infinity;
        for (let i = 0; i < this._positions.length; i++) {
            const distance = dist({x, y}, this._positions[i]);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        }
        return closestIndex;
    }

    invertPosition(x: number, y: number) {
        const index = this.closestPositionIndex(x, y);
        const invMatrix = this.getMatrix(index).invert();
        const vec3 = new THREE.Vector3(x, y, 0).applyMatrix4(invMatrix);
        return {x: vec3.x, y: vec3.y};
    }
}
