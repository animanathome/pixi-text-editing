import * as PIXI from 'pixi.js';
import {BaseDeformer, DeformerType} from "./BaseDeformer";

export class VertexTransformDeformer extends BaseDeformer {
    offset: PIXI.Point = new PIXI.Point();

    constructor() {
        super();
        this._deformerType = DeformerType.VERTEX;
    }

    _uniforms(): {} {
        return {
            [`offset${this.index}`]: this.offset,
        }
    }

    _vertHead(): string {
        return `
        uniform vec2 offset${this.index};
        `
    }

    _vertBody() {
        return `
            vec3 getVertexPosition${this.index}(vec3 inputPosition) {
                // add offset to inputPosition
                return vec3(offset${this.index}.xy, 0) + inputPosition;
            }
        `;
    }
}