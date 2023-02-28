import {DeformerStack} from "../deformerStack";

export enum DeformerType {
    VERTEX  , // manipulates vertices
    MATRIX, // manipulates the transformation matrix
    UV  , // manipulates uvs
    VERTEX_AND_UV// manipulates vertices and uvs
}

export class BaseDeformer {
    _deformerStack: DeformerStack;
    _deformerType: DeformerType = DeformerType.MATRIX;
    _hasWeights = false;
    _weights = [];
    _dirty = true;

    get isDirty() {
        return this._dirty;
    }

    get index() {
        return this._deformerStack.deformerIndex(this) + 1;
    }

    get hasWeights() {
        return this._hasWeights;
    }

    get weights() {
        return this._weights;
    }

    _generateWeights() {
    }

    get stack() {
        if (!this._deformerStack) {
            throw new Error('Deformer not added to stack');
        }
        return this._deformerStack;
    }

    /**
     * The parent object we're deforming
     */
    get parent() {
        return this.stack._parent
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

    _vertMain() {
        return '';
    }

    _fragHead() {
        return '';
    }

    _fragBody() {
        return '';
    }

    update() {
    }
}