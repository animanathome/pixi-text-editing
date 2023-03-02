import * as PIXI from 'pixi.js';
import {BaseDeformer, DeformerType} from "./BaseDeformer";


export class TransformDeformer extends BaseDeformer {
    _deformerType: DeformerType[] = [DeformerType.MATRIX];
    _transform: PIXI.Transform;

    constructor() {
        super();
        this._transform = new PIXI.Transform();
    }

    _uniforms() {
        // NOTE: we should probably only do this when calling updateTransform()
        this._transform.updateLocalTransform()
        return {
            [`translationMatrix${this.index}`]: this._transform.localTransform.toArray(true)
        }
    }

    /* Vertex Shader Header definition */
    _vertHead() {
        return `uniform mat3 translationMatrix${this.index};`
    }

    /* Vertex Shader Body definition */
    _vertBody() {
        return `mat3 getTranslationMatrix${this.index}() {
            return translationMatrix${this.index};
        }
        `
    }

    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     */
    get position(): PIXI.ObservablePoint
    {
        return this._transform.position;
    }

    set position(value: PIXI.IPointData)
    {
        this._transform.position.copyFrom(value);
    }

    /**
     * The scale factors of this object along the local coordinate axes.
     * The default scale is (1, 1).
     */
    get scale(): PIXI.ObservablePoint
    {
        return this._transform.scale;
    }

    set scale(value: PIXI.IPointData)
    {
        this._transform.scale.copyFrom(value);
    }

    /**
     * The rotation of the object in radians.
     */
    get rotation(): number
    {
        return this._transform.rotation;
    }

    set rotation(value: number)
    {
        this._transform.rotation = value;
    }
}