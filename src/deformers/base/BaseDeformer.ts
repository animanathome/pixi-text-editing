import {DeformerStack} from "../deformerStack";
import {DEFORMER_MANIP_ENUM} from "../enums";

export class BaseDeformer {
    _deformerStack: DeformerStack; // TODO: maybe we should pass this to the constructor? we can't do anything without it
    _deformerType: DEFORMER_MANIP_ENUM[] = [DEFORMER_MANIP_ENUM.MATRIX];
    _weights = [];
    _dirty = true;
    _enabled = true;

    public get animatableProperties() {
        return [];
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value) {
        this._enabled = value;
        this._dirty = true;
    }

    get dirty() {
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
        if (!this.canUpdate) {
            return
        }
        this._updateProperties();
        this._dirty = false;
        this.emitDeformerChanged();
    }

    /**
     * Returns true if the deformer can be updated. A deformer can be updated if it has a parent and that parent
     * has a geometry built.
     */
    get canUpdate() {
        if (!this.parent) {
            return false;
        }
        if (!this.parent.geometry) {
            return false;
        }
        return true;
    }

    _updateProperties() {
        // pass
    }

    emitDeformerChanged() {
        // @ts-ignore
        this._deformerStack.emit('deformerChanged');
    }
}