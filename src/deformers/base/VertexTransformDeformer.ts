import * as PIXI from 'pixi.js';
import {BaseDeformer} from "./BaseDeformer";
import {DEFORMER_MANIP_ENUM} from "../enums";

export class VertexTransformDeformer extends BaseDeformer {
    _deformerType: DEFORMER_MANIP_ENUM[] = [DEFORMER_MANIP_ENUM.VERTEX];
    offset: PIXI.Point = new PIXI.Point();

    _uniforms(): {} {
        return {
            [`offset${this.index}`]: this.offset,
        }
    }

    _vertexHeader(): string {
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