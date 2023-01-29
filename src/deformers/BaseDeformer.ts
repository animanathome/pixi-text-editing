import * as PIXI from 'pixi.js';
import {DeformerStack} from "../deformerStack";

export enum DeformerType {
    VERTEX  , // returns a vec3 or vertex position
    MATRIX, // returns a mat3 or matrix
}

export class BaseDeformer {
    _deformerStack: DeformerStack;
    _geometry: PIXI.Geometry;
    _deformerType: DeformerType = DeformerType.MATRIX;

    get index() {
        return this._deformerStack.deformerIndex(this);
    }

    get deformerType() {
        return this._deformerType;
    }

    _uniforms() {
        return {};
    }

    _vertHead() {
        return '';
    }

    _vertBody() {
        return '';
    }
}