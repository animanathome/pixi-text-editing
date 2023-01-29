
import {BaseDeformer, DeformerType} from "./BaseDeformer";

export class VertexDeformer extends BaseDeformer {
    constructor() {
        super();
        this._deformerType = DeformerType.VERTEX;
    }

    _vertBody() {
        return `
            vec3 getVertexPosition${this.index}() {
            }
        `;
    }
}