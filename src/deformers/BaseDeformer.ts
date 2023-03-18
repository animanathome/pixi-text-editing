import {DeformerStack} from "../deformerStack";

export enum DeformerType {
    VERTEX  , // manipulates vertices
    MATRIX, // manipulates the transformation matrix
    UV  , // manipulates uvs
    COLOR = 4, // manipulates colors
}

export class BaseDeformer {
    _deformerStack: DeformerStack;
    _deformerType: DeformerType[] = [DeformerType.MATRIX];
    _weights = [];
    _dirty = true;
    _enabled = true;

    get enabled() {
        return this._enabled;
    }

    set enabled(value) {
        this._enabled = value;
        this._dirty = true;
    }

    get isDirty() {
        // console.log(this.constructor.name, 'isDirty', this._dirty);
        return this._dirty;
    }

    // TODO: there can be a difference in index between the vertex and fragment shader
    get index() {
        return this._deformerStack.deformerIndex(this) + 1;
    }

    get weights() {
        return this._weights;
    }

    _generateWeights() {
    }

    get stack() {
        if (!this._deformerStack) {
            throw new Error('Deformer is not linked to a stack');
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

    _uniforms() {
        return {};
    }

    _vertexHeader() {
        return '';
    }

    _vertBody() {
        return '';
    }

    _vertexMain() {
        return '';
    }

    _fragmentHeader() {
        return '';
    }

    _fragBody() {
        return '';
    }

    update() {
        if (!this._dirty) {
            return
        }
        this._updateProperties();
        this._dirty = false;
        this.emitDeformerChanged();
    }

    _updateProperties() {
        // pass
    }

    emitDeformerChanged() {
        // @ts-ignore
        this._deformerStack.emit('deformerChanged');
    }
}