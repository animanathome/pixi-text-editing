import * as PIXI from 'pixi.js';
import {BaseDeformer} from "./BaseDeformer";
import {DEFORMER_MANIP_ENUM} from "../enums";

export class CenterScaleTransformDeformer extends BaseDeformer {
    _deformerType: DEFORMER_MANIP_ENUM[] = [DEFORMER_MANIP_ENUM.MATRIX];
    _scale: PIXI.Point = new PIXI.Point(1, 1);
    _scaleAnchor: PIXI.Point = new PIXI.Point(0, 0);

    get scaleX() {
        return this._scale.x;
    }

    set scaleX(value: number) {
        this._scale.x = value;
    }

    get scaleY() {
        return this._scale.y;
    }

    set scaleY(value: number) {
        this._scale.y = value;
    }

    get scaleAnchorX() {
        return this._scaleAnchor.x;
    }

    set scaleAnchorX(value: number) {
        this._scaleAnchor.x = value;
    }

    get scaleAnchorY() {
        return this._scaleAnchor.y;
    }

    set scaleAnchorY(value: number) {
        this._scaleAnchor.y = value;
    }

    _uniforms() {
        return {
            scale: [this.scaleX, this.scaleY],
            scaleAnchor: [this.scaleAnchorX, this.scaleAnchorY],
        };
    }

    _vertexHeader() {
        return `
        uniform vec2 scale;
        uniform vec2 scaleAnchor;
        `;
    }

    _vertBody() {
        return `
        mat3 getTranslationMatrix${this.index}() {    
            mat3 scaleMatrix = mat3(scale.x, 0, 0, 0, scale.y, 0, 0, 0, 1);
            mat3 scaleAnchorMatrix = mat3(1, 0, 0, 0, 1, 0, scaleAnchor.x, scaleAnchor.y, 1);
            mat3 invScaleAnchorMatrix = mat3(1, 0, 0, 0, 1, 0, -scaleAnchor.x, -scaleAnchor.y, 1);
            mat3 combinedMatrix = scaleAnchorMatrix * scaleMatrix * invScaleAnchorMatrix;
            return combinedMatrix;
        }`;
    }
}