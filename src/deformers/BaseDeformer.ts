import {DeformerStack} from "../deformerStack";

export enum DeformerType {
    VERTEX  , // returns a vec3 or vertex position
    MATRIX, // returns a mat3 or matrix
}

export class BaseDeformer {
    _deformerStack: DeformerStack;
    _deformerType: DeformerType = DeformerType.MATRIX;
    _hasWeights = false;

    get index() {
        return this._deformerStack.deformerIndex(this);
    }

    get hasWeights() {
        return this._hasWeights;
    }

    _generateWeights() {
        return [];
    }

    /**
     * The parent object we're deforming
     */
    get parent() {
        return this._deformerStack._parent
    }

    get deformerType() {
        return this._deformerType;
    }

    emitDeformerChanged() {
        this._deformerStack.emit('deformerChanged');
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